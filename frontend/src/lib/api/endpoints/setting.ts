import type { ApiResponse } from '@/lib/types/api';
import type { Setting, SettingResponse } from '@/lib/types/setting';
import { apiClient } from '@/lib/api/client';

export const settingEndpoints = {
    get: 'setting/',
    update: 'setting/',
} as const;

export const settingApi = {
    get: async (): Promise<SettingResponse> => {
        const { data } = await apiClient.get(settingEndpoints.get);
        return data;
    },
    update: async (params: Setting): Promise<SettingResponse> => {
        const { data } = await apiClient.put(settingEndpoints.update, params);
        return data;
    },
}; 