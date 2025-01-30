import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';

export interface Service {
    id: number;
    service_name: string;
}

export interface Country {
    country_code: string;
    country_name: string;
    country_name_jp: string;
}

export interface ShippingResult {
    success: boolean;
    base_rate: number;
    surcharges: { [key: string]: number };
    total_amount: number;
    weight_used: number;
    zone: string;
    is_oversized: boolean;
}

export interface ShippingCalculatorParams {
    service_id: number;
    country_code: string;
    length: number;
    width: number;
    height: number;
    weight: number;
}

export interface ShippingCalculatorInitialData {
    services: Service[];
    countries: Country[];
}

export const getShippingCalculatorData = async (): Promise<ApiResponse<ShippingCalculatorInitialData>> => {
    const response = await apiClient.get('shipping-calculator/');
    return response.data;
};

export const calculateShipping = async (params: ShippingCalculatorParams): Promise<ApiResponse<ShippingResult>> => {
    const response = await apiClient.post('shipping-calculator/', params);
    return response.data;
}; 