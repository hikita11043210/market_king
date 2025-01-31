'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { getSetting, updateSetting } from '@/lib/api/endpoints/setting';
import type { SettingData } from '@/lib/types/setting';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function Settings() {
    const [settings, setSettings] = useState<SettingData | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getSetting();
            if (response.success && response.data) {
                setSettings(response.data);
            } else {
                showToast.error({
                    description: response.message || '設定の取得に失敗しました'
                });
            }
        } catch (err) {
            showToast.error({
                description: '設定の取得に失敗しました'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!settings) return;

        setIsSaving(true);

        try {
            const updateParams = {
                yahoo_client_id: settings.yahoo_client_id || undefined,
                yahoo_client_secret: settings.yahoo_client_secret || undefined,
                ebay_client_id: settings.ebay_client_id || undefined,
                ebay_client_secret: settings.ebay_client_secret || undefined,
            };
            const response = await updateSetting(updateParams);
            if (!response.success) {
                throw new Error(response.message || '登録に失敗しました');
            }

            showToast.success({
                description: "登録が完了しました"
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        errorMessages[err.path[0]] = err.message;
                    }
                });
                setErrors(errorMessages);
                showToast.warning({
                    description: "入力内容を確認してください"
                });
            } else {
                showToast.error({
                    description: error instanceof Error ? error.message : '登録に失敗しました'
                });
            }
            console.error('Registration Error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">読み込み中...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">各種設定</h1>
                <p className="text-muted-foreground mt-2">各種設定値を管理します。</p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Yahoo API設定 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Yahoo API</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="yahoo_client_id">Client ID</Label>
                                        <Input
                                            id="yahoo_client_id"
                                            type="password"
                                            value={settings?.yahoo_client_id || ''}
                                            onChange={(e) => setSettings(prev => prev ? { ...prev, yahoo_client_id: e.target.value } : null)}
                                            className={errors.yahoo_client_id ? 'border-red-500' : ''}
                                            disabled={isSaving}
                                        />
                                        {errors.yahoo_client_id && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.yahoo_client_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yahoo_client_secret">Client Secret</Label>
                                        <Input
                                            id="yahoo_client_secret"
                                            type="password"
                                            value={settings?.yahoo_client_secret || ''}
                                            onChange={(e) => setSettings(prev => prev ? { ...prev, yahoo_client_secret: e.target.value } : null)}
                                            className={errors.yahoo_client_secret ? 'border-red-500' : ''}
                                            disabled={isSaving}
                                        />
                                        {errors.yahoo_client_secret && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.yahoo_client_secret}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* eBay API設定 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">eBay API</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ebay_client_id">Client ID</Label>
                                        <Input
                                            id="ebay_client_id"
                                            type="password"
                                            value={settings?.ebay_client_id || ''}
                                            onChange={(e) => setSettings(prev => prev ? { ...prev, ebay_client_id: e.target.value } : null)}
                                            className={errors.ebay_client_id ? 'border-red-500' : ''}
                                            disabled={isSaving}
                                        />
                                        {errors.ebay_client_id && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.ebay_client_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ebay_client_secret">Client Secret</Label>
                                        <Input
                                            id="ebay_client_secret"
                                            type="password"
                                            value={settings?.ebay_client_secret || ''}
                                            onChange={(e) => setSettings(prev => prev ? { ...prev, ebay_client_secret: e.target.value } : null)}
                                            className={errors.ebay_client_secret ? 'border-red-500' : ''}
                                            disabled={isSaving}
                                        />
                                        {errors.ebay_client_secret && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.ebay_client_secret}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 登録ボタン */}
                            <div className="pt-4">
                                <Button
                                    onClick={handleRegister}
                                    disabled={isSaving || !settings?.yahoo_client_id || !settings?.yahoo_client_secret || !settings?.ebay_client_id || !settings?.ebay_client_secret}
                                    className="w-full"
                                >
                                    {isSaving ? '登録中...' : '登録'}
                                </Button>
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    ※ 全ての認証情報を入力してから登録してください
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 