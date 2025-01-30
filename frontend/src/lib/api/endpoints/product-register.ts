import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';
import type { ProductRegisterParams, ProductData } from '@/lib/types/product-register';

export const registerProduct = async (params: ProductRegisterParams): Promise<ApiResponse<ProductData>> => {
    const response = await apiClient.post('product-register/', params);
    return response.data;
}; 