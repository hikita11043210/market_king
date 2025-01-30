import { NextResponse } from 'next/server';
import { getShippingCalculatorData, calculateShipping } from '@/lib/api/endpoints/shipping-calculator';
import type { ShippingCalculatorParams } from '@/lib/types/shipping-calculator';
import type { ErrorResponse } from '@/lib/types/api';

export async function GET() {
    try {
        const response = await getShippingCalculatorData();
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : 'サービスの取得に失敗しました'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as ShippingCalculatorParams;
        const response = await calculateShipping(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : '送料の計算に失敗しました'
            },
            { status: 500 }
        );
    }
} 