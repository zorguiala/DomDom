import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';
import { Product } from '../entities/product.entity';
import { InventoryService } from '../inventory/inventory.service';
import { User } from '../entities/user.entity';
import { CreateBOMDto, UpdateBOMDto } from './dto/bom.dto';

interface MaterialRequirement {
  product: Product;
  requiredQuantity: number;
  unit: string;
}

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
    private inventoryService: InventoryService,
    private dataSource: DataSource
  ) {}

  async create(createBomDto: CreateBOMDto, user: User): Promise<BOM> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bom = this.bomRepository.create({
        name: createBomDto.name,
        description: createBomDto.description,
        outputQuantity: createBomDto.outputQuantity,
        outputUnit: createBomDto.outputUnit,
        createdBy: user,
      });

      const savedBom = await queryRunner.manager.save(bom);

      // Create BOM items
      const bomItems = createBomDto.items.map((item) =>
        this.bomItemRepository.create({
          bom: savedBom,
          product: { id: item.productId } as Product,
          quantity: item.quantity,
          unit: item.unit,
          wastagePercent: item.wastagePercent,
        })
      );

      await queryRunner.manager.save(BOMItem, bomItems);
      await queryRunner.commitTransaction();

      return this.findOne(savedBom.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(search?: string): Promise<BOM[]> {
    const query = this.bomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('bom.createdBy', 'createdBy');

    if (search) {
      query.where('bom.name ILIKE :search', { search: `%${search}%` });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<BOM> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'createdBy'],
    });

    if (!bom) {
      throw new BadRequestException('BOM not found');
    }

    return bom;
  }

  async update(id: string, updateBomDto: UpdateBOMDto): Promise<BOM> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bom = await this.findOne(id);

      // Update BOM details
      Object.assign(bom, {
        name: updateBomDto.name,
        description: updateBomDto.description,
        outputQuantity: updateBomDto.outputQuantity,
        outputUnit: updateBomDto.outputUnit,
      });

      await queryRunner.manager.save(bom);

      // Remove old items
      await queryRunner.manager.delete(BOMItem, { bom: { id } });

      // Create new items
      const bomItems = updateBomDto.items.map((item) =>
        this.bomItemRepository.create({
          bom,
          product: { id: item.productId } as Product,
          quantity: item.quantity,
          unit: item.unit,
          wastagePercent: item.wastagePercent,
        })
      );

      await queryRunner.manager.save(BOMItem, bomItems);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const bom = await this.findOne(id);
    await this.bomRepository.remove(bom);
  }

  async calculateMaterialRequirements(
    id: string,
    desiredQuantity: number
  ): Promise<MaterialRequirement[]> {
    const bom = await this.findOne(id);
    const scaleFactor = desiredQuantity / bom.outputQuantity;

    return bom.items.map((item) => {
      const requiredQuantity = item.quantity * scaleFactor * (1 + (item.wastagePercent || 0) / 100);
      return {
        product: item.product,
        requiredQuantity,
        unit: item.unit,
      };
    });
  }

  async checkAvailability(id: string, desiredQuantity: number): Promise<AvailabilityCheck> {
    const requirements = await this.calculateMaterialRequirements(id, desiredQuantity);
    const shortages: AvailabilityCheck['shortages'] = [];
    let isAvailable = true;

    for (const requirement of requirements) {
      const product = await this.productRepository.findOne({
        where: { id: requirement.product.id },
      });

      if (product.currentStock < requirement.requiredQuantity) {
        isAvailable = false;
        shortages.push({
          product: requirement.product,
          required: requirement.requiredQuantity,
          available: product.currentStock,
          shortage: requirement.requiredQuantity - product.currentStock,
          unit: requirement.unit,
        });
      }
    }

    return {
      isAvailable,
      shortages,
    };
  }

  async calculateProductionCost(id: string, desiredQuantity: number): Promise<ProductionCost> {
    const requirements = await this.calculateMaterialRequirements(id, desiredQuantity);
    let materialCost = 0;
    const costBreakdown: ProductionCost['costBreakdown'] = [];

    for (const requirement of requirements) {
      const product = await this.productRepository.findOne({
        where: { id: requirement.product.id },
      });

      const totalCost = requirement.requiredQuantity * product.price;
      materialCost += totalCost;

      costBreakdown.push({
        product: requirement.product,
        quantity: requirement.requiredQuantity,
        unit: requirement.unit,
        unitCost: product.price,
        totalCost,
      });
    }

    // For now, total cost is just material cost
    // Later we can add labor cost, overhead, etc.
    const totalCost = materialCost;

    return {
      materialCost,
      totalCost,
      costBreakdown,
    };
  }
}
