export interface Setting {
    ebay_client_id: string;
    ebay_client_secret: string;
    ebay_dev_id: string;
    yahoo_client_id: string;
    yahoo_client_secret: string;
}

export interface SettingResponse {
    success: boolean;
    message?: string;
    data?: Setting;
} 