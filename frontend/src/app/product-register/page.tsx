'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { registerProduct } from '@/lib/api/endpoints/product-register';
import { productRegisterSchema, type ProductRegisterFormData } from '@/lib/validations/product-register';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

// 開発用のデフォルト値（TODO: 本番環境では削除）
const DEFAULT_VALUES: ProductRegisterFormData = {
    source: 'yahoo_auction',
    url: 'https://page.auctions.yahoo.co.jp/jp/auction/c1170741264',
    categoryId: '1234'
};

export default function NewRequest() {
    const router = useRouter();
    const [formData, setFormData] = useState<ProductRegisterFormData>(DEFAULT_VALUES);
    const [errors, setErrors] = useState<{ [key in keyof ProductRegisterFormData]?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const validatedData = productRegisterSchema.parse(formData);
            const response = await registerProduct(validatedData);

            if (response.success) {
                router.push('/request-list');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages: { [key in keyof ProductRegisterFormData]?: string } = {};
                error.errors.forEach((err) => {
                    const path = err.path[0];
                    if (path) {
                        errorMessages[path as keyof ProductRegisterFormData] = err.message;
                    }
                });
                setErrors(errorMessages);
            } else {
                setErrors({
                    url: 'データの取得に失敗しました。もう一度お試しください。'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof ProductRegisterFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">新規リクエスト登録</h1>
                <p className="text-muted-foreground mt-2">商品データ取得のための新規リクエストを登録します。</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>リクエスト情報</CardTitle>
                    <CardDescription>
                        取得したい商品の情報を入力してください。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="source">
                                仕入れ元
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Select
                                value={formData.source}
                                onValueChange={(value) => handleChange('source', value)}
                            >
                                <SelectTrigger className={errors.source ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yahoo_auction">ヤフオク</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.source && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.source}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">
                                取得ページURL
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="url"
                                type="url"
                                value={formData.url}
                                onChange={(e) => handleChange('url', e.target.value)}
                                placeholder="https://page.auctions.yahoo.co.jp/jp/auction/..."
                                className={errors.url ? 'border-red-500' : ''}
                            />
                            {errors.url && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.url}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">
                                ebayカテゴリID
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="categoryId"
                                type="text"
                                value={formData.categoryId}
                                onChange={(e) => handleChange('categoryId', e.target.value)}
                                placeholder="1234"
                                className={errors.categoryId ? 'border-red-500' : ''}
                            />
                            {errors.categoryId && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.categoryId}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? '登録中...' : '登録する'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}