import { NextResponse } from 'next/server';
import { registerProduct } from '@/lib/api/endpoints/product-register';
import type { ProductRegisterParams } from '@/lib/types/product-register';
import type { ErrorResponse } from '@/lib/types/api';

export async function POST(request: Request) {
    try {
        const body = await request.json() as ProductRegisterParams;
        const response = await registerProduct(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : 'リクエストの処理に失敗しました'
            },
            { status: 500 }
        );
    }
} 