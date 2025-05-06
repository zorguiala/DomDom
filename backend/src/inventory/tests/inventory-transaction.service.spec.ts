import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { InventoryTransactionService } from '../inventory-transaction.service';
import { InventoryTransaction, TransactionType } from '../../entities/inventory-transaction.entity';
import { Product } from '../../entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateInventoryTransactionDto } from '../dto/create-inventory-transaction.dto';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends ObjectLiteral>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  }),
});

describe('InventoryTransactionService', () => {
  let service: InventoryTransactionService;
  let transactionRepository: MockRepository<InventoryTransaction>;
  let productRepository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryTransactionService,
        {
          provide: getRepositoryToken(InventoryTransaction),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<InventoryTransactionService>(InventoryTransactionService);
    transactionRepository = module.get(getRepositoryToken(InventoryTransaction));
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new inventory transaction and update product stock on IN transactions', async () => {
      // Arrange
      const productId = 'test-product-id';
      const dto: CreateInventoryTransactionDto = {
        productId,
        type: TransactionType.PURCHASE,
        quantity: 10,
        unitPrice: 5.99,
        reference: 'PO-12345',
        notes: 'Test purchase',
      };

      const mockProduct = {
        id: productId,
        name: 'Test Product',
        currentStock: 5,
        sku: 'TP001',
        price: 9.99,
      };

      const mockTransaction = {
        id: 'test-transaction-id',
        ...dto,
        product: mockProduct,
      };

      productRepository.findOne!.mockResolvedValue(mockProduct);
      transactionRepository.create!.mockReturnValue(mockTransaction);
      transactionRepository.save!.mockResolvedValue(mockTransaction);
      productRepository.save!.mockResolvedValue({
        ...mockProduct,
        currentStock: 15, // 5 + 10
      });

      // Act
      const result = await service.create(dto);

      // Assert
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(transactionRepository.create).toHaveBeenCalledWith({
        ...dto,
        product: mockProduct,
      });
      expect(productRepository.save).toHaveBeenCalledWith({
        ...mockProduct,
        currentStock: 15,
      });
      expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockTransaction);
    });

    it('should create a new inventory transaction and update product stock on OUT transactions', async () => {
      // Arrange
      const productId = 'test-product-id';
      const dto: CreateInventoryTransactionDto = {
        productId,
        type: TransactionType.SALE,
        quantity: 3,
        unitPrice: 12.99,
        reference: 'SO-12345',
        notes: 'Test sale',
      };

      const mockProduct = {
        id: productId,
        name: 'Test Product',
        currentStock: 5,
        sku: 'TP001',
        price: 9.99,
      };

      const mockTransaction = {
        id: 'test-transaction-id',
        ...dto,
        product: mockProduct,
      };

      productRepository.findOne!.mockResolvedValue(mockProduct);
      transactionRepository.create!.mockReturnValue(mockTransaction);
      transactionRepository.save!.mockResolvedValue(mockTransaction);
      productRepository.save!.mockResolvedValue({
        ...mockProduct,
        currentStock: 2, // 5 - 3
      });

      // Act
      const result = await service.create(dto);

      // Assert
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(transactionRepository.create).toHaveBeenCalledWith({
        ...dto,
        product: mockProduct,
      });
      expect(productRepository.save).toHaveBeenCalledWith({
        ...mockProduct,
        currentStock: 2,
      });
      expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Arrange
      const dto: CreateInventoryTransactionDto = {
        productId: 'non-existent-id',
        type: TransactionType.PURCHASE,
        quantity: 10,
        unitPrice: 5.99,
        reference: 'PO-12345',
        notes: 'Test purchase',
      };

      productRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(productRepository.save).not.toHaveBeenCalled();
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw Error if stock is insufficient for OUT transactions', async () => {
      // Arrange
      const productId = 'test-product-id';
      const dto: CreateInventoryTransactionDto = {
        productId,
        type: TransactionType.SALE,
        quantity: 10,
        unitPrice: 12.99,
        reference: 'SO-12345',
        notes: 'Test sale with insufficient stock',
      };

      const mockProduct = {
        id: productId,
        name: 'Test Product',
        currentStock: 5,
        sku: 'TP001',
        price: 9.99,
      };

      productRepository.findOne!.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow('Insufficient stock');
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(productRepository.save).not.toHaveBeenCalled();
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all transactions when no filters are provided', async () => {
      // Arrange
      const mockTransactions = [
        { id: 'tx1', type: TransactionType.PURCHASE },
        { id: 'tx2', type: TransactionType.SALE },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTransactions),
      };

      transactionRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll();

      // Assert
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'transaction.product',
        'product'
      );
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const mockTransactions = [{ id: 'tx1', type: TransactionType.PURCHASE }];
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const type = TransactionType.PURCHASE;
      const productId = 'test-product-id';

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTransactions),
      };

      transactionRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(startDate, endDate, type, productId);

      // Assert
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'transaction.product',
        'product'
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.createdAt >= :startDate',
        { startDate }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.createdAt <= :endDate', {
        endDate,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.type = :type', { type });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.productId = :productId', {
        productId,
      });
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findOne', () => {
    it('should return a transaction if it exists', async () => {
      // Arrange
      const id = 'test-transaction-id';
      const mockTransaction = {
        id,
        type: TransactionType.PURCHASE,
        product: { id: 'product-id', name: 'Test Product' },
      };

      transactionRepository.findOne!.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['product'],
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      transactionRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['product'],
      });
    });
  });
});
