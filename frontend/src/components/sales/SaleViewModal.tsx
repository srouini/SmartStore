import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Table from '../common/Table';
import type { Sale, SaleItem } from '../../api/saleService';

interface SaleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleViewModal: React.FC<SaleViewModalProps> = ({
  isOpen,
  onClose,
  sale
}) => {
  const itemColumns = [
    { header: 'Product Type', accessor: 'product_type' },
    { header: 'Product', accessor: 'product_name' },
    { header: 'Code', accessor: 'product_code' },
    { 
      header: 'Quantity', 
      accessor: 'quantity_sold' 
    },
    { 
      header: 'Unit Price', 
      accessor: 'price_per_item',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Discount', 
      accessor: 'discount',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
    },
    { 
      header: 'Total', 
      accessor: 'total',
      render: (_: any, item: SaleItem) => {
        const subtotal = item.quantity_sold * item.price_per_item;
        const discount = item.discount || 0;
        return `$${(subtotal - discount).toFixed(2)}`;
      }
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Details"
      footer={
        <Button onClick={onClose}>Close</Button>
      }
      size="lg"
    >
      {sale && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold">Sale ID</h3>
              <p>{sale.id}</p>
            </div>
            <div>
              <h3 className="font-bold">Date</h3>
              <p>{new Date(sale.sale_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-bold">Sale Type</h3>
              <p>{sale.sale_type_display}</p>
            </div>
            <div>
              <h3 className="font-bold">Customer</h3>
              <p>{sale.customer_name || 'Walk-in Customer'}</p>
            </div>
            <div>
              <h3 className="font-bold">Invoice</h3>
              <p>
                {sale.has_invoice ? 
                  <span className="badge badge-success">Yes</span> : 
                  <span className="badge badge-ghost">No</span>}
              </p>
            </div>
            <div>
              <h3 className="font-bold">Sold By</h3>
              <p>{sale.sold_by_username || 'System'}</p>
            </div>
          </div>

          <div className="divider">Items</div>

          <Table 
            columns={itemColumns} 
            data={sale.items || []} 
            isLoading={false}
          />

          <div className="flex justify-end">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Amount</div>
                <div className="stat-value text-primary">${sale.total_amount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SaleViewModal;
