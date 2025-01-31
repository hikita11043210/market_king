import type { ApiResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';
import { ShippingServiceOption } from '@/lib/types/shipping-calculator';

export interface EbayProductData {
    title: string;
    description: string;
    primaryCategory: {
        categoryId: string;
    };
    startPrice: {
        value: string;
        currencyId: string;
    };
    quantity: number;
    listingDuration: string;
    listingType: string;
    country: string;
    currency: string;
    paymentMethods: string[];
    condition: {
        conditionId: string;
    };
    returnPolicy: {
        returnsAccepted: boolean;
        returnsPeriod: string;
        returnsDescription: string;
    };
    shippingDetails: {
        shippingServiceOptions: ShippingServiceOption[];
    };
}

export interface EbayRegisterResponse {
    itemId: string;
    fees: {
        fee: {
            name: string;
            amount: {
                value: string;
                currencyId: string;
            };
        }[];
    };
}

export const ebayEndpoints = {
    register: 'ebay/register/',
} as const;

export const ebayApi = {
    register: async (data: EbayProductData): Promise<ApiResponse<EbayRegisterResponse>> => {
        const { data: responseData } = await apiClient.post(ebayEndpoints.register, data);
        return responseData;
    },
}; 