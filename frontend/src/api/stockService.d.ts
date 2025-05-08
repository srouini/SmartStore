export interface Stock {
    id: number;
    product: number;
    product_name: string;
    product_code: string;
    quantity: number;
    last_updated: string;
}
export interface AddStockRequest {
    product_id: number;
    quantity: number;
}
declare const stockService: {
    getAllStock: (params?: Record<string, any>) => Promise<any>;
    getStockById: (id: number) => Promise<any>;
    getLowStock: (threshold?: number) => Promise<any>;
    getOutOfStock: () => Promise<any>;
    addStock: (data: AddStockRequest) => Promise<any>;
    getStockByProductType: (productType: "phone" | "accessory") => Promise<any>;
};
export default stockService;
