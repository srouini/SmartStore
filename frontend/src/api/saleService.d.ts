export interface SaleItem {
    id: number;
    sale: number;
    product: number;
    product_name: string;
    product_code: string;
    product_type: string;
    quantity_sold: number;
    price_per_item: number;
}
export interface Sale {
    id: number;
    sale_date: string;
    sale_type: string;
    sale_type_display: string;
    total_amount: number;
    sold_by: number | null;
    sold_by_username: string | null;
    has_invoice: boolean;
    customer_name: string | null;
    items: SaleItem[];
}
export interface RecordSaleItem {
    product_id: number;
    quantity: number;
}
export interface RecordSaleRequest {
    sale_type: 'bulk' | 'semi-bulk' | 'particular';
    customer_name?: string;
    generate_invoice: boolean;
    items: RecordSaleItem[];
}
declare const saleService: {
    getAllSales: (params?: Record<string, any>) => Promise<any>;
    getSaleById: (id: number) => Promise<any>;
    recordSale: (saleData: RecordSaleRequest) => Promise<any>;
    getSalesByDateRange: (startDate: string, endDate: string) => Promise<any>;
    getSalesByType: (saleType: "bulk" | "semi-bulk" | "particular") => Promise<any>;
    getSalesByUser: (userId: number) => Promise<any>;
    getSalesWithInvoices: () => Promise<any>;
    getSalesByCustomer: (customerName: string) => Promise<any>;
};
export default saleService;
