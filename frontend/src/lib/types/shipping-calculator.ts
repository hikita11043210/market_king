export interface Service {
    id: number;
    service_name: string;
}

export interface Country {
    country_code: string;
    country_name: string;
    country_name_jp: string;
}

export interface ShippingCalculatorParams {
    service_id: number;
    country_code: string;
    length: number;
    width: number;
    height: number;
    weight: number;
}

export interface ShippingResult {
    success: boolean;
    base_rate: number;
    surcharges: Record<string, number>;
    total_amount: number;
    weight_used: number;
    zone: number;
    is_oversized: boolean;
}

export interface ShippingCalculatorData {
    services: Service[];
    countries: Country[];
}

export type ShippingService = {
    id: string;
    name: string;
    price: number;
    estimated_days: string;
    carrier: string;
};

export type ShippingCalculatorResult = {
    available_services: ShippingService[];
};

export interface ShippingServiceOption {
    shippingService: string;
    shippingServiceCost: {
        value: string;
        currencyId: string;
    };
    freeShipping?: boolean;
} 