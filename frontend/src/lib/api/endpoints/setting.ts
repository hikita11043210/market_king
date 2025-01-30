import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';
import type { SettingData, SettingUpdateParams } from '@/lib/types/setting';

export const getSetting = async (): Promise<ApiResponse<SettingData>> => {
    const response = await apiClient.get('setting/');
    return response.data;
};

export const updateSetting = async (params: SettingUpdateParams): Promise<ApiResponse<SettingData>> => {
    const response = await apiClient.put('setting/', params);
    return response.data;
}; 