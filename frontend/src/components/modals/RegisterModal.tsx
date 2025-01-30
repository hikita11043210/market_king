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
    const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);

    const handleRegister = () => {
        // TODO: 登録処理を実装
        onClose();
    };

    const handleCalculate = (result: ShippingResult) => {
        setShippingResult(result);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>商品登録</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-[1fr,300px] gap-6">
                        {/* 左側：商品情報 */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-[200px] h-[200px] relative">
                                    {selectedItem?.image_url && (
                                        <div
                                            className="w-full h-full bg-center bg-no-repeat bg-contain"
                                            style={{ backgroundImage: `url(${selectedItem.image_url})` }}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-sm font-medium">商品名</label>
                                        <p className="text-sm">{selectedItem?.title}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">現在価格</label>
                                        <p className="text-sm">¥{Number(selectedItem?.price).toLocaleString()}</p>
                                    </div>
                                    {selectedItem?.buy_now_price && (
                                        <div>
                                            <label className="text-sm font-medium">即決価格</label>
                                            <p className="text-sm">¥{Number(selectedItem.buy_now_price).toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium">送料</label>
                                        <p className="text-sm">{selectedItem?.shipping || '送料情報なし'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 送料計算結果 */}
                            {shippingResult && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">送料計算結果</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">基本料金:</span>
                                            ¥{shippingResult.base_rate.toLocaleString()}
                                        </p>
                                        {Object.entries(shippingResult.surcharges).map(([type, amount]) => (
                                            <p key={type} className="text-sm">
                                                <span className="font-medium">{type}:</span>
                                                ¥{amount.toLocaleString()}
                                            </p>
                                        ))}
                                        <p className="text-lg font-bold mt-2">
                                            合計: ¥{shippingResult.total_amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 右側：送料計算フォーム */}
                        <div className="border-l pl-6">
                            <h3 className="text-lg font-semibold mb-4">送料計算</h3>
                            <ShippingCalculatorForm onCalculate={handleCalculate} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            キャンセル
                        </Button>
                        <Button onClick={handleRegister}>
                            登録
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 