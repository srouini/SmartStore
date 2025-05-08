export interface PurchaseItem {
    id: number;
    purchase: number;
    product_type: string;
    product_id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}
export interface Purchase {
    id: number;
    supplier_name: string;
    supplier_contact: string;
    reference_number: string;
    date: string;
    total_amount: number;
    payment_status: string;
    payment_status_display: string;
    payment_method: string;
    payment_method_display: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items: PurchaseItem[];
}
declare const purchaseService: {
    getAllPurchases: (params?: Record<string, any>) => Promise<any>;
    getPurchaseById: (id: number) => Promise<any>;
    createPurchase: (purchaseData: Record<string, any>) => Promise<any>;
    updatePurchase: (id: number, purchaseData: Record<string, any>) => Promise<any>;
    deletePurchase: (id: number) => Promise<any>;
    searchByReferenceNumber: (referenceNumber: string) => Promise<any>;
    getByDateRange: (startDate: string, endDate: string) => Promise<any>;
    getByPaymentStatus: (status: string) => Promise<any>;
    getBySupplier: (supplierName: string) => Promise<any>;
};
export default purchaseService;
