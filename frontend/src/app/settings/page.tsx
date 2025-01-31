'use client';

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { settingApi } from "@/lib/api/endpoints/setting";
import type { Setting } from "@/lib/types/setting";

const settingSchema = z.object({
    ebay_client_id: z.string().min(1, "eBay Client IDは必須です"),
    ebay_client_secret: z.string().min(1, "eBay Client Secretは必須です"),
    ebay_dev_id: z.string().min(1, "eBay Dev IDは必須です"),
    yahoo_client_id: z.string().min(1, "Yahoo Client IDは必須です"),
    yahoo_client_secret: z.string().min(1, "Yahoo Client Secretは必須です"),
});

export default function SettingPage() {
    const { toast } = useToast();
    const [setting, setSetting] = useState<Setting>();

    const form = useForm<z.infer<typeof settingSchema>>({
        resolver: zodResolver(settingSchema),
        defaultValues: {
            ebay_client_id: "",
            ebay_client_secret: "",
            ebay_dev_id: "",
            yahoo_client_id: "",
            yahoo_client_secret: "",
        },
    });

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const response = await settingApi.get();
                if (response.success && response.data) {
                    setSetting(response.data);
                    // フォームの値を更新
                    form.reset(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast({
                    title: "エラー",
                    description: "設定の取得に失敗しました",
                    variant: "destructive",
                });
            }
        };

        fetchSetting();
    }, [form, toast]);

    const onSubmit = async (values: z.infer<typeof settingSchema>) => {
        try {
            const response = await settingApi.update(values);
            if (response.success) {
                toast({
                    title: "設定を更新しました",
                    description: "変更が保存されました",
                    variant: "default",
                });
            } else {
                throw new Error(response.message || "設定の更新に失敗しました");
            }
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast({
                title: "エラー",
                description: error instanceof Error ? error.message : "設定の更新に失敗しました",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">各種設定</h2>
                <p className="text-muted-foreground">APIの認証情報などを設定します</p>
            </div>
            <div className="max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">eBay設定</h3>
                                <FormField
                                    control={form.control}
                                    name="ebay_client_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="text" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ebay_client_secret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client Secret</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ebay_dev_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dev ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="text" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Yahoo!オークション設定</h3>
                                <FormField
                                    control={form.control}
                                    name="yahoo_client_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="text" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yahoo_client_secret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client Secret</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">保存</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
} 