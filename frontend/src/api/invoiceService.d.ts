import type { Sale } from './saleService';
export interface Invoice {
    id: number;
    sale: number;
    sale_info: Sale;
    invoice_date: string;
    invoice_number: string;
    customer_info: string | null;
    total_amount: number;
}
declare const invoiceService: {
    getAllInvoices: (params?: Record<string, any>) => Promise<any>;
    getInvoiceById: (id: number) => Promise<any>;
    getInvoicesByDateRange: (startDate: string, endDate: string) => Promise<any>;
    getInvoiceByNumber: (invoiceNumber: string) => Promise<any>;
    getInvoicesByCustomer: (customerInfo: string) => Promise<any>;
};
export default invoiceService;
