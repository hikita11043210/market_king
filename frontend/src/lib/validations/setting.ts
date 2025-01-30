import { z } from 'zod';

export const settingSchema = z.object({
    yahoo_client_id: z.string().min(1, { message: 'Yahoo Client IDは必須です' }).optional(),
    yahoo_client_secret: z.string().min(1, { message: 'Yahoo Client Secretは必須です' }).optional(),
    ebay_client_id: z.string().min(1, { message: 'eBay Client IDは必須です' }).optional(),
    ebay_client_secret: z.string().min(1, { message: 'eBay Client Secretは必須です' }).optional()
});

export type SettingFormData = z.infer<typeof settingSchema>; 