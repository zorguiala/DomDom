import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { InventoryStockService } from '../services/inventory-stock.service';
import { Product } from '../../entities/product.entity';
import { NotFoundException } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/ban-types
type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getRawMany: jest.fn(),
  }),
});

describe('InventoryStockService', () => {
  let service: InventoryStockService;
  let productRepository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryStockService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<InventoryStockService>(InventoryStockService);
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLowStockProducts', () => {
    it('should return products with stock below threshold when threshold is provided', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', currentStock: 3, minimumStock: 10, isActive: true, sku: 'P1', price: 10, unit: 'kg' },
        { id: '2', name: 'Product 2', currentStock: 2, minimumStock: 5, isActive: true, sku: 'P2', price: 20, unit: 'pcs' },
      ] as Product[];
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };
      
      productRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);
      
      // Act
      const result = await service.getLowStockProducts(5);
      
      // Assert
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('product.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.currentStock <= :threshold', { threshold: 5 });
      expect(result).toEqual(mockProducts);
    });

    it('should use default threshold logic when no threshold is provided', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', currentStock: 3, minimumStock: 10, isActive: true, sku: 'P1', price: 10, unit: 'kg' },
      ] as Product[];
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };
      
      productRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);
      
      // Act
      const result = await service.getLowStockProducts();
      
      // Assert
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('product.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(product.minimumStock > 0 AND product.currentStock <= product.minimumStock) OR ' +
        '(product.minimumStock = 0 AND product.currentStock <= 5)'
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getLowStockAlerts', () => {
    it('should return low stock alerts with products, totalValue, and criticalItems', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', currentStock: 8, minimumStock: 10, lastPurchasePrice: 10, isActive: true, sku: 'P1', price: 15, unit: 'kg' },
        { id: '2', name: 'Product 2', currentStock: 2, minimumStock: 10, lastPurchasePrice: 20, isActive: true, sku: 'P2', price: 25, unit: 'pcs' },
        { id: '3', name: 'Product 3', currentStock: 1, minimumStock: 5, lastPurchasePrice: 15, isActive: true, sku: 'P3', price: 20, unit: 'l' },
      ] as unknown as Product[];
      
      // Mock getLowStockProducts to return our test products
      jest.spyOn(service, 'getLowStockProducts').mockResolvedValue(mockProducts);
      
      // Act
      const result = await service.getLowStockAlerts();
      
      // Assert
      expect(service.getLowStockProducts).toHaveBeenCalled();
      expect(result.products).toEqual(mockProducts);
      expect(result.totalValue).toEqual((8 * 10) + (2 * 20) + (1 * 15)); // 115
      expect(result.criticalItems).toEqual([
        { id: '2', name: 'Product 2', currentStock: 2, minimumStock: 10, lastPurchasePrice: 20, isActive: true, sku: 'P2', price: 25, unit: 'pcs' },
        { id: '3', name: 'Product 3', currentStock: 1, minimumStock: 5, lastPurchasePrice: 15, isActive: true, sku: 'P3', price: 20, unit: 'l' },
      ]);
    });

    it('should handle products with no lastPurchasePrice', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', currentStock: 8, minimumStock: 10, lastPurchasePrice: null, isActive: true, sku: 'P1', price: 15, unit: 'kg' },
        { id: '2', name: 'Product 2', currentStock: 2, minimumStock: 10, lastPurchasePrice: 20, isActive: true, sku: 'P2', price: 25, unit: 'pcs' },
      ] as unknown as Product[];
      
      // Mock getLowStockProducts to return our test products
      jest.spyOn(service, 'getLowStockProducts').mockResolvedValue(mockProducts);
      
      // Act
      const result = await service.getLowStockAlerts();
      
      // Assert
      expect(result.products).toEqual(mockProducts);
      expect(result.totalValue).toEqual((8 * 0) + (2 * 20)); // 40
      expect(result.criticalItems).toEqual([
        { id: '2', name: 'Product 2', currentStock: 2, minimumStock: 10, lastPurchasePrice: 20, isActive: true, sku: 'P2', price: 25, unit: 'pcs' },
      ]);
    });
  });

  describe('checkLowStockAlert', () => {
    it('should return correct alert data when product exists', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        currentStock: 3,
        minimumStock: 10,
        sku: 'TP1',
        price: 10,
        unit: 'kg',
        isActive: true,
      } as Product;
      
      productRepository.findOne!.mockResolvedValue(mockProduct);
      
      // Act
      const result = await service.checkLowStockAlert(productId);
      
      // Assert
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual({
        isLow: true,
        currentStock: 3,
        minimumStock: 10,
        product: mockProduct,
      });
    });

    it('should use default minimum stock if not defined', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        currentStock: 3,
        minimumStock: undefined, // undefined minimum stock
        sku: 'TP1',
        price: 10,
        unit: 'kg',
        isActive: true,
      } as unknown as Product;
      
      productRepository.findOne!.mockResolvedValue(mockProduct);
      
      // Act
      const result = await service.checkLowStockAlert(productId);
      
      // Assert
      expect(result).toEqual({
        isLow: true, // 3 <= (undefined || 5)
        currentStock: 3,
        minimumStock: undefined,
        product: mockProduct,
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 'non-existent-id';
      productRepository.findOne!.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.checkLowStockAlert(productId)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('getInventoryStatus', () => {
    it('should return status for all active products', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Low Stock', currentStock: 5, minimumStock: 10 },
        { id: '2', name: 'Normal Stock', currentStock: 30, minimumStock: 20 },
        { id: '3', name: 'High Stock', currentStock: 100, minimumStock: 30 },
      ] as Product[];
      
      productRepository.find!.mockResolvedValue(mockProducts);
      
      // Act
      const result = await service.getInventoryStatus();
      
      // Assert
      expect(productRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'currentStock', 'minimumStock'],
        where: { isActive: true },
      });
      expect(result).toEqual([
        { productId: '1', productName: 'Low Stock', currentStock: 5, status: 'LOW' },
        { productId: '2', productName: 'Normal Stock', currentStock: 30, status: 'NORMAL' },
        { productId: '3', productName: 'High Stock', currentStock: 100, status: 'HIGH' },
      ]);
    });
  });

  describe('getStockLevels', () => {
    it('should return stock levels for all products when no IDs are provided', async () => {
      // Arrange
      const mockRawProducts = [
        { productId: '1', productName: 'Product 1', currentQuantity: '5', minimumQuantity: '10', unit: 'kg', costPrice: '10.5' },
        { productId: '2', productName: 'Product 2', currentQuantity: '30', minimumQuantity: '20', unit: 'pcs', costPrice: '5.25' },
      ];
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawProducts),
      };
      
      productRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);
      
      // Act
      const result = await service.getStockLevels();
      
      // Assert
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          productId: '1',
          productName: 'Product 1',
          currentQuantity: 5,
          currentStock: 5,
          minimumQuantity: 10,
          minimumStock: 10,
          unit: 'kg',
          costPrice: 10.5,
          status: 'LOW',
        },
        {
          productId: '2',
          productName: 'Product 2',
          currentQuantity: 30,
          currentStock: 30,
          minimumQuantity: 20,
          minimumStock: 20,
          unit: 'pcs',
          costPrice: 5.25,
          status: 'NORMAL',
        },
      ]);
    });

    it('should filter products by IDs when provided', async () => {
      // Arrange
      const productIds = ['1', '3'];
      const mockRawProducts = [
        { productId: '1', productName: 'Product 1', currentQuantity: '5', minimumQuantity: '10', unit: 'kg', costPrice: '10.5' },
      ];
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawProducts),
      };
      
      productRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);
      
      // Act
      const result = await service.getStockLevels(productIds);
      
      // Assert
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('product.id IN (:...productIds)', { productIds });
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(result).toEqual([
        {
          productId: '1',
          productName: 'Product 1',
          currentQuantity: 5,
          currentStock: 5,
          minimumQuantity: 10,
          minimumStock: 10,
          unit: 'kg',
          costPrice: 10.5,
          status: 'LOW',
        },
      ]);
    });
  });
}); 