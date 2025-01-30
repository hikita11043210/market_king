import { z } from 'zod';

export const productRegisterSchema = z.object({
    source: z.string().min(1, { message: '仕入れ元を選択してください' }),
    url: z.string().url({ message: '有効なURLを入力してください' }),
    categoryId: z.string().regex(/^\d+$/, { message: '数字のみ入力可能です' })
});

export type ProductRegisterFormData = z.infer<typeof productRegisterSchema>; 