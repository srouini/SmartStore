import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Purchase, PurchaseItem } from '../../api/purchaseService';
import type { Phone } from '../../api/phoneService';
import type { Accessory } from '../../api/accessoryService';
import type { Supplier } from '../../api/purchaseService';

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingPurchase: Purchase | null;
  phones: Phone[];
  accessories: Accessory[];
  suppliers: Supplier[];
  paymentStatusOptions: Array<{ value: string; label: string }>;
  paymentMethodOptions: Array<{ value: string; label: string }>;
}

const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPurchase,
  phones,
  accessories,
  suppliers,
  paymentStatusOptions,
  paymentMethodOptions
}) => {
  // Ensure arrays are always arrays
  const ensuredPhones = Array.isArray(phones) ? phones : [];
  const ensuredAccessories = Array.isArray(accessories) ? accessories : [];
  const ensuredSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: {
      supplier_id: editingPurchase?.supplier || '',
      reference_number: editingPurchase?.reference_number || '',
      date: editingPurchase?.date || format(new Date(), 'yyyy-MM-dd'),
      payment_status: editingPurchase?.payment_status || 'PENDING',
      payment_method: editingPurchase?.payment_method || 'CASH',
      notes: editingPurchase?.notes || '',
      soumis_tva: editingPurchase?.soumis_tva !== undefined ? editingPurchase.soumis_tva : true,
      discount: editingPurchase?.discount || 0,
      items: editingPurchase?.items?.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0
      })) || [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, discount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    append({ product_id: '', product_name: '', quantity: 1, unit_price: 0, discount: 0 });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const handleProductChange = (index: number, productId: string) => {
    if (!productId) return;
    
    const id = parseInt(productId);
    let product;
    
    // Try to find in phones first
    product = ensuredPhones.find(p => p.id === id);
    if (product) {
      setValue(`items.${index}.unit_price`, product.cost_price);
      setValue(`items.${index}.product_name`, product.name);
      return;
    }
    
    // If not found in phones, try accessories
    product = ensuredAccessories.find(a => a.id === id);
    if (product) {
      setValue(`items.${index}.unit_price`, product.cost_price);
      setValue(`items.${index}.product_name`, product.name);
    }
  };

  const calculateTotalAmount = () => {
    if (!watchItems) return 0;
    
    return watchItems.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.unit_price),
      0
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPurchase ? 'Edit Purchase' : 'Add Purchase'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </>
      }
      size="xl"
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Supplier*</span>
            </label>
            <select
              className={`select select-bordered ${errors.supplier_id ? 'select-error' : ''}`}
              {...register('supplier_id', { required: 'Supplier is required' })}
            >
              <option value="">Select a supplier</option>
              {ensuredSuppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            {errors.supplier_id && (
              <label className="label">
                <span className="label-text-alt text-error">{String(errors.supplier_id.message)}</span>
              </label>
            )}
            <div className="mt-2 text-right">
              <a href="/suppliers" target="_blank" className="text-sm text-primary hover:underline">
                Manage Suppliers
              </a>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Reference Number*</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.reference_number ? 'input-error' : ''}`}
              {...register('reference_number', { required: 'Reference number is required' })}
            />
            {errors.reference_number && (
              <label className="label">
                <span className="label-text-alt text-error">{String(errors.reference_number.message)}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date*</span>
            </label>
            <input
              type="date"
              className={`input input-bordered ${errors.date ? 'input-error' : ''}`}
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <label className="label">
                <span className="label-text-alt text-error">{String(errors.date.message)}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Payment Status*</span>
            </label>
            <select
              className={`select select-bordered ${errors.payment_status ? 'select-error' : ''}`}
              {...register('payment_status', { required: 'Payment status is required' })}
            >
              {paymentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.payment_status && (
              <label className="label">
                <span className="label-text-alt text-error">{String(errors.payment_status.message)}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Payment Method*</span>
            </label>
            <select
              className={`select select-bordered ${errors.payment_method ? 'select-error' : ''}`}
              {...register('payment_method', { required: 'Payment method is required' })}
            >
              {paymentMethodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.payment_method && (
              <label className="label">
                <span className="label-text-alt text-error">{String(errors.payment_method.message)}</span>
              </label>
            )}
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Soumis TVA</span>
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="checkbox"
                {...register('soumis_tva')}
              />
              <span className="ml-2">Apply TVA to this purchase</span>
            </div>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Discount</span>
            </label>
            <input
              type="number"
              step="0.01"
              className={`input input-bordered ${errors.discount ? 'input-error' : ''}`}
              {...register('discount', { 
                valueAsNumber: true,
                validate: value => (value >= 0) || 'Must be non-negative'
              })}
            />
            <label className="label">
              <span className="label-text-alt">Enter percentage (1-100) or absolute amount (greater than 100)</span>
            </label>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text">Notes</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              {...register('notes')}
            ></textarea>
          </div>
        </div>

        <div className="divider"></div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Items</h3>
            <Button type="button" size="sm" onClick={handleAddItem}>Add Item</Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Product*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        className={`select select-bordered w-1/3 ${errors.items && errors.items[index]?.product_id ? 'select-error' : ''}`}
                        {...register(`items.${index}.product_id`, { required: 'Required' })}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                      >
                        <option value="">Select a product</option>
                        <optgroup label="Phones">
                          {ensuredPhones.map(phone => (
                            <option key={`phone-${phone.id}`} value={phone.id}>{phone.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Accessories">
                          {ensuredAccessories.map(accessory => (
                            <option key={`accessory-${accessory.id}`} value={accessory.id}>{accessory.name}</option>
                          ))}
                        </optgroup>
                      </select>
                      <input
                        type="text"
                        className="input input-bordered w-2/3"
                        placeholder="Product name"
                        {...register(`items.${index}.product_name`)}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity*</span>
                    </label>
                    <input
                      type="number"
                      className={`input input-bordered ${errors.items && errors.items[index]?.quantity ? 'input-error' : ''}`}
                      {...register(`items.${index}.quantity`, { 
                        required: 'Required',
                        valueAsNumber: true,
                        min: { value: 1, message: 'Min 1' }
                      })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Unit Price*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`input input-bordered ${errors.items && errors.items[index]?.unit_price ? 'input-error' : ''}`}
                      {...register(`items.${index}.unit_price`, { 
                        required: 'Required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Min 0' }
                      })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Discount</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`input input-bordered ${errors.items && errors.items[index]?.discount ? 'input-error' : ''}`}
                      {...register(`items.${index}.discount`, { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Min 0' }
                      })}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <Button 
                    variant="ghost" 
                    className="text-error" 
                    onClick={() => handleRemoveItem(index)}
                    disabled={fields.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Amount</div>
                <div className="stat-value text-primary">${calculateTotalAmount().toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseFormModal;
