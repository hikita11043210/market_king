import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShippingCalculatorForm } from "@/components/shipping-calclator/shipping-calclator-form";
import type { ShippingResult } from '@/lib/types/shipping-calculator';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { ebayApi, type EbayProductData } from '@/lib/api/endpoints/ebay';

const ebayListingSchema = z.object({
    title: z.string().min(1, "タイトルは必須です"),
    description: z.string().min(1, "説明は必須です"),
    price: z.string().min(1, "価格は必須です"),
    quantity: z.string().min(1, "数量は必須です"),
    condition: z.string().min(1, "商品の状態は必須です"),
    category: z.string().min(1, "カテゴリーは必須です"),
    returnPolicy: z.string().min(1, "返品ポリシーは必須です"),
});

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: {
        title: string;
        price: string;
        buy_now_price: string | null;
        image_url: string;
        shipping?: string;
    } | null;
}

export const RegisterModal = ({
    isOpen,
    onClose,
    selectedItem
}: RegisterModalProps) => {
    const [shippingResult, setShippingResult] = useState<ShippingResult | null>({
        success: true,
        base_rate: 0,
        surcharges: {},
        total_amount: 0,
        weight_used: 0,
        zone: 1,
        is_oversized: false,
    });
    const { toast } = useToast();
    const form = useForm<z.infer<typeof ebayListingSchema>>({
        resolver: zodResolver(ebayListingSchema),
        defaultValues: {
            title: selectedItem?.title || "aaaaa",
            description: "あああ",
            price: "1000",
            quantity: "1",
            condition: "1000",
            category: "1",
            returnPolicy: "14",
        },
    });

    const handleCalculate = (result: ShippingResult) => {
        setShippingResult(result);
    };

    const onSubmit = async (values: z.infer<typeof ebayListingSchema>) => {
        if (!shippingResult) {
            toast({
                title: "エラー",
                description: "送料の計算を行ってください",
                variant: "destructive",
            });
            return;
        }

        try {
            const productData: EbayProductData = {
                title: values.title,
                description: values.description,
                primaryCategory: {
                    categoryId: values.category,
                },
                startPrice: {
                    value: values.price,
                    currencyId: "JPY",
                },
                quantity: parseInt(values.quantity),
                listingDuration: "Days_7",
                listingType: "FixedPriceItem",
                country: "JP",
                currency: "JPY",
                paymentMethods: ["PayPal"],
                condition: {
                    conditionId: values.condition,
                },
                returnPolicy: {
                    returnsAccepted: true,
                    returnsPeriod: `Days_${values.returnPolicy}`,
                    returnsDescription: "返品可能",
                },
                shippingDetails: {
                    shippingServiceOptions: [{
                        shippingService: "JapanPostInternational",
                        shippingServiceCost: {
                            value: shippingResult.total_amount.toString(),
                            currencyId: "JPY",
                        },
                        freeShipping: false,
                    }],
                },
            };

            const response = await ebayApi.register(productData);

            if (response.success) {
                toast({
                    title: "商品を登録しました",
                    description: "eBayへの出品が完了しました",
                });
                onClose();
            } else {
                throw new Error(response.message || '商品の登録に失敗しました');
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: error instanceof Error ? error.message : "商品の登録に失敗しました",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>商品登録</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-[3fr,2fr] gap-8">
                    {/* 左側：商品情報 */}
                    <div className="space-y-6">
                        {/* 選択商品の情報 */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-6">
                                    <div className="w-[250px] h-[250px] relative">
                                        {selectedItem?.image_url && (
                                            <div
                                                className="w-full h-full bg-center bg-no-repeat bg-contain"
                                                style={{ backgroundImage: `url(${selectedItem.image_url})` }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">商品名（Yahoo!オークション）</div>
                                            <div className="text-base mt-1">{selectedItem?.title}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">現在価格</div>
                                                <div className="text-base mt-1">¥{Number(selectedItem?.price).toLocaleString()}</div>
                                            </div>
                                            {selectedItem?.buy_now_price && (
                                                <div>
                                                    <div className="text-sm font-medium text-muted-foreground">即決価格</div>
                                                    <div className="text-base mt-1">¥{Number(selectedItem.buy_now_price).toLocaleString()}</div>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">送料</div>
                                                <div className="text-base mt-1">{selectedItem?.shipping || '送料情報なし'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 商品登録フォーム */}
                        <Card>
                            <CardContent className="pt-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>タイトル（eBay）</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} className="h-11" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>価格（USD）</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="number" className="h-11" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="quantity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>数量</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="number" className="h-11" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>説明</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} className="min-h-[100px] resize-none" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-3 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="condition"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>商品の状態</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11">
                                                                    <SelectValue placeholder="商品の状態を選択" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="1000">新品</SelectItem>
                                                                <SelectItem value="2000">中古</SelectItem>
                                                                <SelectItem value="3000">未使用に近い</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>カテゴリー</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11">
                                                                    <SelectValue placeholder="カテゴリーを選択" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="1">カテゴリー1</SelectItem>
                                                                <SelectItem value="2">カテゴリー2</SelectItem>
                                                                <SelectItem value="3">カテゴリー3</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="returnPolicy"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>返品期間</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11">
                                                                    <SelectValue placeholder="返品期間を選択" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="14">14日</SelectItem>
                                                                <SelectItem value="30">30日</SelectItem>
                                                                <SelectItem value="60">60日</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 右側：送料設定 */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-4">送料設定</h3>
                                <div className="mb-4">
                                    <Button
                                        type="button"
                                        variant={!shippingResult ? "default" : "outline"}
                                        onClick={() => setShippingResult(null)}
                                        className="mr-2"
                                    >
                                        送料無料
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={shippingResult ? "default" : "outline"}
                                        onClick={() => {
                                            if (!shippingResult) {
                                                setShippingResult({
                                                    success: true,
                                                    base_rate: 0,
                                                    surcharges: {},
                                                    total_amount: 0,
                                                    weight_used: 0,
                                                    zone: 1,
                                                    is_oversized: false,
                                                });
                                            }
                                        }}
                                    >
                                        送料を設定
                                    </Button>
                                </div>
                                {(!shippingResult || shippingResult.total_amount > 0) && (
                                    <ShippingCalculatorForm onCalculate={handleCalculate} />
                                )}
                            </CardContent>
                        </Card>

                        {shippingResult && (
                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="text-lg font-semibold mb-2">送料計算結果</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">基本料金</div>
                                            <div className="text-base mt-1">¥{shippingResult.base_rate.toLocaleString()}</div>
                                        </div>
                                        {Object.entries(shippingResult.surcharges).map(([type, amount]) => (
                                            <div key={type}>
                                                <div className="text-sm font-medium text-muted-foreground">{type}</div>
                                                <div className="text-base mt-1">¥{amount.toLocaleString()}</div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t">
                                            <div className="text-sm font-medium text-muted-foreground">合計</div>
                                            <div className="text-lg font-bold mt-1">¥{shippingResult.total_amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose} className="h-11 px-8">
                                キャンセル
                            </Button>
                            <Button onClick={form.handleSubmit(onSubmit)} className="h-11 px-8">
                                登録
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 