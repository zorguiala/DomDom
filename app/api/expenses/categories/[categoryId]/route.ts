
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const category = await db.expenseCategory.findUnique({
      where: {
        id: params.categoryId,
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
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const body = await req.json();
    const { name, description } = categorySchema.parse(body);

    const category = await db.expenseCategory.update({
      where: {
        id: params.categoryId,
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
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    // Check if any expenses are using this category
    const existingExpenses = await db.expense.findFirst({
      where: {
        categoryId: params.categoryId,
      },
    });

    if (existingExpenses) {
      return new NextResponse(
        'Cannot delete category. It is currently assigned to one or more expenses.',
        { status: 409 }
      );
    }

    const category = await db.expenseCategory.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[EXPENSE_CATEGORY_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
