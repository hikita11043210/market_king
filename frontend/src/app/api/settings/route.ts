import { NextResponse } from 'next/server';
import { getSetting, updateSetting } from '@/lib/api/endpoints/setting';
import { settingSchema } from '@/lib/validations/setting';
import type { SettingFormData } from '@/lib/validations/setting';
import type { ErrorResponse } from '@/lib/types/api';

export async function GET() {
    try {
        const response = await getSetting();
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : '設定の取得に失敗しました'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as SettingFormData;

        // バリデーション
        const validation = settingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    message: validation.error.errors.map(err => err.message).join(', ')
                },
                { status: 400 }
            );
        }

        const response = await updateSetting(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : '設定の更新に失敗しました'
            },
            { status: 500 }
        );
    }
} 