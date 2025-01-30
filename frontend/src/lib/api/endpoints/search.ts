import { apiClient } from '../client';
import { ItemSearchParams, CategorySearchParams, SearchResult, CategoryResult } from '@/lib/types/search';
import { ApiResponse } from '@/lib/types/api';

export const searchYahooAuctionItems = async (params: ItemSearchParams): Promise<ApiResponse<SearchResult[]>> => {
    const response = await apiClient.get('search/yahoo-auction/items/', {
        params: {
            ...params,
            platform: 'yahoo'
        }
    });
    return response.data;
};

export const searchYahooAuctionCategories = async (params: CategorySearchParams): Promise<ApiResponse<CategoryResult[]>> => {
    const response = await apiClient.get('search/yahoo-auction/categories/', {
        params: {
            ...params,
            platform: 'yahoo'
        }
    });
    return response.data;
}; 