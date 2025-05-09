import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Purchase } from '../../api/purchaseService';

interface PurchaseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

const PurchaseViewModal: React.FC<PurchaseViewModalProps> = ({
  isOpen,
  onClose,
  purchase
}) => {
  if (!purchase) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Details"
      footer={
        <Button onClick={onClose}>Close</Button>
      }
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold">Reference Number</h3>
            <p>{purchase.reference_number}</p>
          </div>
          <div>
            <h3 className="font-bold">Date</h3>
            <p>{new Date(purchase.date).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-bold">Supplier</h3>
            <p>{purchase.supplier_details?.name || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-bold">Payment Status</h3>
            <p>{purchase.payment_status_display}</p>
          </div>
          <div>
            <h3 className="font-bold">Payment Method</h3>
            <p>{purchase.payment_method_display}</p>
          </div>
          <div>
            <h3 className="font-bold">Soumis TVA</h3>
            <p>{purchase.soumis_tva ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3 className="font-bold">Discount</h3>
            <p>
              {purchase.discount > 0 
                ? (purchase.discount <= 100 
                  ? `${purchase.discount}%` 
                  : `$${purchase.discount.toFixed(2)}`) 
                : 'None'}
            </p>
          </div>
          <div>
            <h3 className="font-bold">Notes</h3>
            <p>{purchase.notes || 'No notes'}</p>
          </div>
        </div>

        <div className="divider"></div>
        
        <h3 className="text-lg font-bold">Items</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>HT</th>
                <th>TVA</th>
                <th>TTC</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.product_code}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>
                    {item.discount > 0 
                      ? (item.discount <= 100 
                        ? `${item.discount}%` 
                        : `$${item.discount.toFixed(2)}`) 
                      : '-'}
                  </td>
                  <td>${item.ht.toFixed(2)}</td>
                  <td>${item.tva.toFixed(2)}</td>
                  <td>${item.ttc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-right font-bold">Totals:</td>
                <td className="font-bold">${purchase.ht.toFixed(2)}</td>
                <td className="font-bold">${purchase.tva.toFixed(2)}</td>
                <td className="font-bold">${purchase.ttc.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default PurchaseViewModal;
