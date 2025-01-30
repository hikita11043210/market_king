export interface SettingData {
    id: number;
    yahoo_client_id: string | null;
    yahoo_client_secret: string | null;
    ebay_client_id: string | null;
    ebay_client_secret: string | null;
    created_at: string;
    updated_at: string;
}

export interface SettingUpdateParams {
    yahoo_client_id?: string;
    yahoo_client_secret?: string;
    ebay_client_id?: string;
    ebay_client_secret?: string;
} 