import { ShippingCalculatorParams } from '@/lib/types/shipping-calculator';

export const validateShippingCalculator = (params: ShippingCalculatorParams): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 重量のバリデーション
    if (params.weight <= 0) {
        errors.push('重量は0より大きい値を指定してください');
    }
    if (params.weight > 30) {
        errors.push('重量は30kg以下を指定してください');
    }

    // サイズのバリデーション
    const maxSize = 160; // cm
    if (params.length <= 0 || params.width <= 0 || params.height <= 0) {
        errors.push('サイズは0より大きい値を指定してください');
    }
    if (params.length > maxSize || params.width > maxSize || params.height > maxSize) {
        errors.push(`サイズは${maxSize}cm以下を指定してください`);
    }

    // 総サイズのバリデーション
    const totalSize = params.length + params.width + params.height;
    if (totalSize > 260) {
        errors.push('三辺の合計は260cm以下を指定してください');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}; 