// 商品検索用のパラメータ
export type ItemSearchParams = {
    p: string;
    max?: string;
    auccat?: string;
    va?: string;
    aucmax_bidorbuy_price?: string;
    price_type?: string;
    istatus?: string;
    new?: string;
    is_postage_mode?: string;
    dest_pref_code?: string;
    abatch?: string;
    exflg?: string;
    b?: string;
    n?: string;
};

// カテゴリ検索用のパラメータ
export type CategorySearchParams = {
    category_id?: string;
    parent_id?: string;
    depth?: number;
};

// 検索結果の型定義
export type SearchResult = {
    id: string;
    title: string;
    price: number;
    image_url: string;
    auction_url: string;
    end_time: string;
};

// カテゴリ情報の型定義
export type CategoryResult = {
    id: string;
    name: string;
    parent_id?: string;
    children?: CategoryResult[];
    item_count?: number;
}; 