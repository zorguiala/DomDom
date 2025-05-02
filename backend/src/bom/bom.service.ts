import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateBOMDto, UpdateBOMDto } from './dto/bom.dto';
import {
  MaterialRequirementsDto,
  MaterialRequirementItemDto,
  MaterialCostDto,
  MaterialCostItemDto,
} from '../types/bomCalculation.dto';

// Removed unused MaterialRequirement interface

interface AvailabilityCheck {
  isAvailable: boolean;
  shortages: Array<{
    product: Product;
    required: number;
    available: number;
    shortage: number;
    unit: string;
  }>;
}

interface ProductionCost {
  materialCost: number;
  totalCost: number;
  costBreakdown: Array<{
    product: Product;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }>;
}

@Injectable()
export class BOMService {
  constructor(
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
    @InjectRepository(BOMItem)
    private bomItemRepository: Repository<BOMItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource
  ) {}

  async create(createBomDto: CreateBOMDto, user: User): Promise<BOM> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Collect all product IDs for validation
      const productIds = createBomDto.items.map((item) => item.productId);

      // Add outputProductId for validation if it exists
      if (createBomDto.outputProductId) {
        productIds.push(createBomDto.outputProductId);
      }

      // Validate all products exist
      await this.validateProducts(productIds);

      // Create BOM
      const bom = new BOM();
      bom.name = createBomDto.name || '';
      bom.description = createBomDto.description || '';
      bom.outputQuantity = createBomDto.outputQuantity;
      bom.outputUnit = createBomDto.outputUnit || '';
      bom.isActive = createBomDto.isActive ?? true;
      bom.createdBy = user;

      // Set output product if provided
      if (createBomDto.outputProductId) {
        const outputProduct = await this.productRepository.findOne({
          where: { id: createBomDto.outputProductId },
        });

        if (!outputProduct) {
          throw new NotFoundException(
            `Output product with ID ${createBomDto.outputProductId} not found`
          );
        }

        bom.outputProduct = outputProduct;
      }

      // Save BOM
      const savedBom = await queryRunner.manager.save(bom);

      // Create BOM items
      await this.createBOMItems(queryRunner, savedBom, createBomDto.items);

      await queryRunner.commitTransaction();

      return this.findOne(savedBom.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw this.handleError(error) as Error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(search?: string): Promise<BOM[]> {
    const query = this.bomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('bom.createdBy', 'createdBy')
      .where('bom.isActive = :isActive', { isActive: true });

    if (search) {
      query.andWhere('(bom.name ILIKE :search OR bom.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<BOM> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'createdBy'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    return bom;
  }

  async update(id: string, updateBomDto: UpdateBOMDto): Promise<BOM> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bom = await this.bomRepository.findOne({
        where: { id },
        relations: ['items', 'items.product'],
      });

      if (!bom) {
        throw new NotFoundException(`BOM with ID ${id} not found`);
      }

      // Collect all product IDs that need validation
      const productIds = updateBomDto.items?.map((item) => item.productId) || [];

      // Add outputProductId for validation if it exists in the DTO
      if (updateBomDto.outputProductId) {
        productIds.push(updateBomDto.outputProductId);
      }

      // Validate all products exist if we have products to validate
      if (productIds.length > 0) {
        await this.validateProducts(productIds);
      }

      // Update basic properties
      if (updateBomDto.name) bom.name = updateBomDto.name;
      if (updateBomDto.description) bom.description = updateBomDto.description;
      if (updateBomDto.outputQuantity) bom.outputQuantity = updateBomDto.outputQuantity;
      if (updateBomDto.outputUnit) bom.outputUnit = updateBomDto.outputUnit;
      if (updateBomDto.isActive !== undefined) bom.isActive = updateBomDto.isActive;

      // Update output product if provided
      if (updateBomDto.outputProductId) {
        const outputProduct = await this.productRepository.findOne({
          where: { id: updateBomDto.outputProductId },
        });

        if (!outputProduct) {
          throw new NotFoundException(
            `Output product with ID ${updateBomDto.outputProductId} not found`
          );
        }

        bom.outputProduct = outputProduct;
      }

      // Update bom items if provided
      if (updateBomDto.items) {
        // Delete existing bom items
        await queryRunner.manager.delete(BOMItem, { bom: { id } });

        // Create new bom items
        await this.createBOMItems(queryRunner, bom, updateBomDto.items);
      }

      await queryRunner.manager.save(BOM, bom);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw this.handleError(error) as Error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const bom = await this.findOne(id);
    // Soft delete by setting isActive to false
    bom.isActive = false;
    await this.bomRepository.save(bom);
  }

  async calculateMaterialRequirements(
    id: string,
    desiredQuantity: number
  ): Promise<MaterialRequirementsDto> {
    const bom = await this.findOne(id);
    const scaleFactor = desiredQuantity / bom.outputQuantity;
    const items: MaterialRequirementItemDto[] = bom.items.map((item) => {
      const requiredQuantity = item.quantity * scaleFactor * (1 + (item.wastagePercent || 0) / 100);
      return {
        materialId: item.product.id,
        materialName: item.product.name,
        requiredQuantity,
        unit: item.unit,
      };
    });
    return { items };
  }

  async calculateMaterialCost(id: string, desiredQuantity: number): Promise<MaterialCostDto> {
    const bom = await this.findOne(id);
    const scaleFactor = desiredQuantity / bom.outputQuantity;
    let totalCost = 0;
    const items: MaterialCostItemDto[] = await Promise.all(
      bom.items.map((item) => {
        const requiredQuantity =
          item.quantity * scaleFactor * (1 + (item.wastagePercent || 0) / 100);
        const unitCost = item.product.price || 0;
        const cost = requiredQuantity * unitCost;
        totalCost += cost;
        return {
          materialId: item.product.id,
          materialName: item.product.name,
          requiredQuantity,
          unit: item.unit,
          unitCost,
          totalCost: cost,
        };
      })
    );
    return { items, totalCost };
  }

  async checkAvailability(id: string, desiredQuantity: number): Promise<AvailabilityCheck> {
    const requirements = await this.calculateMaterialRequirements(id, desiredQuantity);
    const shortages: AvailabilityCheck['shortages'] = [];
    let isAvailable = true;

    for (const requirement of requirements.items) {
      const product = await this.productRepository.findOne({
        where: { id: requirement.materialId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${requirement.materialId} not found`);
      }

      if (product.currentStock < requirement.requiredQuantity) {
        isAvailable = false;
        shortages.push({
          product: product,
          required: requirement.requiredQuantity,
          available: product.currentStock,
          shortage: requirement.requiredQuantity - product.currentStock,
          unit: requirement.unit,
        });
      }
    }

    return { isAvailable, shortages };
  }

  async calculateProductionCost(id: string, desiredQuantity: number): Promise<ProductionCost> {
    const requirements = await this.calculateMaterialRequirements(id, desiredQuantity);
    let materialCost = 0;
    const costBreakdown: ProductionCost['costBreakdown'] = [];

    for (const requirement of requirements.items) {
      const product = await this.productRepository.findOne({
        where: { id: requirement.materialId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${requirement.materialId} not found`);
      }

      const totalCost = requirement.requiredQuantity * product.price;
      materialCost += totalCost;

      costBreakdown.push({
        product: product,
        quantity: requirement.requiredQuantity,
        unit: requirement.unit,
        unitCost: product.price,
        totalCost,
      });
    }

    const totalCost = materialCost;

    return {
      materialCost,
      totalCost,
      costBreakdown,
    };
  }

  private async validateProducts(productIds: string[]): Promise<void> {
    for (const productId of productIds) {
      const product = await this.productRepository.findOne({
        where: { id: productId, isActive: true },
      });

      if (!product) {
        throw new BadRequestException(`Product with ID ${productId} not found or inactive`);
      }
    }
  }

  private async createBOMItems(
    queryRunner: QueryRunner,
    bom: BOM,
    items: CreateBOMDto['items']
  ): Promise<BOMItem[]> {
    const bomItems = items.map((item) =>
      this.bomItemRepository.create({
        bom,
        product: { id: item.productId } as Product,
        quantity: item.quantity,
        unit: item.unit,
        wastagePercent: item.wastagePercent || 0,
      })
    );

    return await queryRunner.manager.save(BOMItem, bomItems);
  }

  private handleError(error: unknown): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new BadRequestException('A BOM with this name already exists');
    }

    throw new BadRequestException('Failed to process BOM operation');
  }
}
