export type ProductRegisterParams = {
    source: string;
    url: string;
    categoryId: string;
};

export type ProductData = {
    id: string;
    title: string;
    description: string;
    price: number;
    source: string;
    sourceUrl: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
};

export interface GetRequestDataParams {
    source: string;
    url: string;
    categoryId: string;
} 