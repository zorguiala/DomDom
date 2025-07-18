
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const paramValues = await params;
    if (!paramValues.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const category = await prisma.expenseCategory.findUnique({
      where: {
        id: paramValues.categoryId,
      },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('[EXPENSE_CATEGORY_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const paramValues = await params;
    if (!paramValues.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const body = await req.json();
    const { name, description } = categorySchema.parse(body);

    const category = await prisma.expenseCategory.update({
      where: {
        id: paramValues.categoryId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error('[EXPENSE_CATEGORY_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const paramValues = await params;
    if (!paramValues.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    // Check if any expenses are using this category
    const existingExpenses = await prisma.expense.findFirst({
      where: {
        categoryId: paramValues.categoryId,
      },
    });

    if (existingExpenses) {
      return new NextResponse(
        'Cannot delete category. It is currently assigned to one or more expenses.',
        { status: 409 }
      );
    }

    const category = await prisma.expenseCategory.delete({
      where: {
        id: paramValues.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[EXPENSE_CATEGORY_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
