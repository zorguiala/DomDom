import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all expenses with optional filtering
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ExpenseWhereUniqueInput;
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [items, count] = await Promise.all([
      this.prisma.expense.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy: orderBy || { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items,
      count,
      skip: skip || 0,
      take: take || count,
    };
  }

  /**
   * Get a single expense by ID
   */
  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  /**
   * Create a new expense
   */
  async create(data: Prisma.ExpenseCreateInput) {
    if (data.amount <= 0) {
      throw new BadRequestException('Expense amount must be greater than 0');
    }

    return this.prisma.expense.create({
      data,
    });
  }

  /**
   * Update an existing expense
   */
  async update(id: string, data: Prisma.ExpenseUpdateInput) {
    try {
      if (typeof data.amount !== 'undefined' && data.amount <= 0) {
        throw new BadRequestException('Expense amount must be greater than 0');
      }

      return await this.prisma.expense.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete an expense
   */
  async remove(id: string) {
    try {
      return await this.prisma.expense.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Get expense statistics
   */
  async getStatistics(params: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }) {
    const { startDate, endDate, category } = params;
    
    const whereClause: Prisma.ExpenseWhereInput = {};
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }
    
    if (category) {
      whereClause.category = category;
    }

    // Get total expenses
    const totalExpenses = await this.prisma.expense.count({
      where: whereClause,
    });

    // Get total amount
    const totalAmountResult = await this.prisma.expense.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });
    
    const totalAmount = totalAmountResult._sum.amount || 0;

    // Get expenses by category
    const expensesByCategory = await this.prisma.expense.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Get expenses by payment method
    const expensesByPaymentMethod = await this.prisma.expense.groupBy({
      by: ['paymentMethod'],
      where: whereClause,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get expenses trend (by month)
    const expensesTrend = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "date") as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM "Expense"
      WHERE 
        ${whereClause.date ? 
          `"date" >= ${startDate} ${endDate ? `AND "date" <= ${endDate}` : ''}` 
          : 'TRUE'}
        ${category ? `AND "category" = ${category}` : ''}
      GROUP BY DATE_TRUNC('month', "date")
      ORDER BY month ASC
    `;

    return {
      totalExpenses,
      totalAmount,
      expensesByCategory,
      expensesByPaymentMethod,
      expensesTrend,
    };
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(params: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const { startDate, endDate } = params;
    
    const whereClause: Prisma.ExpenseWhereInput = {};
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    return this.prisma.expense.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });
  }

  /**
   * Get monthly expense report
   */
  async getMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenses = await this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const expensesByCategory = {};
    expenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = {
          category: expense.category,
          amount: 0,
          count: 0,
        };
      }
      expensesByCategory[expense.category].amount += Number(expense.amount);
      expensesByCategory[expense.category].count += 1;
    });

    return {
      year,
      month,
      startDate,
      endDate,
      expenses,
      totalAmount,
      expensesByCategory: Object.values(expensesByCategory),
      totalCount: expenses.length,
    };
  }

  /**
   * Get expenses by date range
   */
  async getExpensesByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
