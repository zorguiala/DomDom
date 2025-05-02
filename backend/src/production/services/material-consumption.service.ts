import { Injectable } from '@nestjs/common';
import { ProductionOrder } from '../../entities/production-order.entity';
import { User } from '../../entities/user.entity';
import { BOMService } from '../../bom/bom.service';
import { InventoryTransactionService } from '../../inventory/services/inventory-transaction.service';
import { TransactionType } from '../../entities/inventory-transaction.entity';
import { MaterialRequirement } from '../../types/materialRequirement';

/**
 * Service responsible for managing material consumption during production
 */
@Injectable()
export class MaterialConsumptionService {
  constructor(
    private bomService: BOMService,
    private inventoryTransactionService: InventoryTransactionService
  ) {}

  /**
   * Consume materials for a production order
   */
  async consumeProductionMaterials(order: ProductionOrder, user: User): Promise<void> {
    // Calculate material requirements
    const requirementsDto = await this.bomService.calculateMaterialRequirements(
      order.bom.id,
      order.quantity
    );
    const requirements: MaterialRequirement[] = requirementsDto.items.map((item) => ({
      productId: item.materialId,
      requiredQuantity: item.requiredQuantity,
      unit: item.unit,
      productName: item.materialName,
    }));

    // Consume each material from inventory
    for (const requirement of requirements) {
      await this.inventoryTransactionService.create(
        {
          productId: requirement.productId,
          type: TransactionType.PRODUCTION_OUT,
          quantity: -requirement.requiredQuantity,
          unitPrice: 0, // Set to 0 or fetch actual price if needed
          reference: order.id,
          notes: `Production order ${order.id}`,
        },
        user
      );
    }
  }

  /**
   * Add finished products to inventory after production
   */
  async addFinishedProductToInventory(
    order: ProductionOrder,
    quantity: number,
    user: User
  ): Promise<void> {
    // Find the output product (non-raw material) in the BOM
    const outputProduct = order.bom.items.find((item) => !item.product.isRawMaterial);

    if (outputProduct) {
      await this.inventoryTransactionService.create(
        {
          productId: outputProduct.product.id,
          type: TransactionType.PRODUCTION_IN,
          quantity: quantity,
          unitPrice: outputProduct.product.price,
          reference: order.id,
          notes: `Production order ${order.id}`,
        },
        user
      );
    }
  }
}
