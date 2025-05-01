/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { ProductionOrder } from '../../entities/production-order.entity';
import { User } from '../../entities/user.entity';
import { BOMService } from '../../bom/bom.service';
import { InventoryService } from '../../inventory/inventory.service';
import { TransactionType } from '../../entities/inventory-transaction.entity';

/**
 * Service responsible for managing material consumption during production
 */
@Injectable()
export class MaterialConsumptionService {
  constructor(
    private bomService: BOMService,
    private inventoryService: InventoryService
  ) {}

  /**
   * Consume materials for a production order
   */
  async consumeProductionMaterials(
    order: ProductionOrder,
    user: User,
    queryRunner: any
  ): Promise<void> {
    // Calculate material requirements
    const requirements = await this.bomService.calculateMaterialRequirements(
      order.bom.id,
      order.quantity
    );

    // Consume each material from inventory
    for (const requirement of Object.values(requirements)) {
      await this.inventoryService.recordTransaction(
        requirement.product.id,
        TransactionType.PRODUCTION_OUT,
        -requirement.requiredQuantity,
        requirement.product.price,
        user,
        `Production order ${order.id}`,
        queryRunner
      );
    }
  }

  /**
   * Add finished products to inventory after production
   */
  async addFinishedProductToInventory(
    order: ProductionOrder,
    quantity: number,
    user: User,
    queryRunner: any
  ): Promise<void> {
    // Find the output product (non-raw material) in the BOM
    const outputProduct = order.bom.items.find((item) => !item.product.isRawMaterial);

    if (outputProduct) {
      await this.inventoryService.recordTransaction(
        outputProduct.product.id,
        TransactionType.PRODUCTION_IN,
        quantity,
        outputProduct.product.price,
        user,
        `Production order ${order.id}`,
        queryRunner
      );
    }
  }
}
