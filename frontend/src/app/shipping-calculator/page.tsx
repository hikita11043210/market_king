'use client';

import { useState } from 'react';
import { ShippingCalculatorForm } from "@/components/shipping-calclator/shipping-calclator-form";
import type { ShippingResult } from '@/lib/api/endpoints/shipping-calculator';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ShippingCalculatorPage(): React.JSX.Element {
    const [result, setResult] = useState<ShippingResult | null>(null);

    const handleCalculate = (calculationResult: ShippingResult) => {
        setResult(calculationResult);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
    };

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">送料計算</h1>

            <ShippingCalculatorForm onCalculate={handleCalculate} />

            {result && (
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">計算結果</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold">基本料金:</span> {formatPrice(result.base_rate)}
                            </div>

                            {result.surcharges && Object.entries(result.surcharges).length > 0 && (
                                <div>
                                    <span className="font-semibold">追加料金:</span>
                                    <ul className="list-none pl-4 mt-2 space-y-1">
                                        {Object.entries(result.surcharges).map(([type, amount]) => (
                                            <li key={type}>
                                                {type}: {formatPrice(amount)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.is_oversized && (
                                <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>この荷物はサイズ制限を超えています</AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <span className="font-semibold">計算重量:</span> {result.weight_used}kg
                            </div>

                            <div>
                                <span className="font-semibold">配送ゾーン:</span> {result.zone}
                            </div>

                            <div className="pt-4 border-t">
                                <div className="text-2xl font-bold">
                                    合計金額: {formatPrice(result.total_amount)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 