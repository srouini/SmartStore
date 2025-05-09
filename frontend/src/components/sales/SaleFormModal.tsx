import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Sale, RecordSaleRequest } from '../../api/saleService';
import type { Phone } from '../../api/phoneService';
import type { Accessory } from '../../api/accessoryService';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  phones: Phone[];
  accessories: Accessory[];
  saleTypeOptions: Array<{ value: string; label: string }>;
}

const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  phones,
  accessories,
  saleTypeOptions
}) => {
  // Ensure arrays are always arrays
  const ensuredPhones = Array.isArray(phones) ? phones : [];
  const ensuredAccessories = Array.isArray(accessories) ? accessories : [];

  // Add a type assertion to handle the form properly
  type FormValues = Omit<RecordSaleRequest, 'items'> & {
    items: Array<{
      product_id: number | string;
      quantity: number;
      discount?: number;
    }>
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      sale_type: 'particular',
      customer_name: '',
      generate_invoice: false,
      items: [{ product_id: 0, quantity: 1, discount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchSaleType = watch('sale_type');

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    append({ product_id: 0, quantity: 1, discount: 0 });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const handleProductChange = (index: number, productId: string) => {
    if (!productId || productId === '0') return;
    
    const id = parseInt(productId);
    let product;
    
    // Try to find in phones first
    product = ensuredPhones.find(p => p.id === id);
    if (product) {
      return;
    }
    
    // If not found in phones, try accessories
    product = ensuredAccessories.find(a => a.id === id);
    if (product) {
      return;
    }
  };

  const getAllProducts = () => {
    const phoneProducts = ensuredPhones.map(phone => ({
      id: phone.id,
      name: phone.name,
      price: phone.selling_unite_price || 0,
      type: 'phone'
    }));
    
    const accessoryProducts = ensuredAccessories.map(accessory => ({
      id: accessory.id,
      name: accessory.name,
      price: accessory.selling_unite_price || 0,
      type: 'accessory'
    }));
    
    return [...phoneProducts, ...accessoryProducts];
  };

  const getPriceByType = (product: Phone | Accessory, saleType: string) => {
    switch (saleType) {
      case 'bulk':
        return product.selling_bulk_price || product.selling_unite_price || 0;
      case 'semi-bulk':
        return product.selling_semi_bulk_price || product.selling_unite_price || 0;
      case 'particular':
      default:
        return product.selling_unite_price || 0;
    }
  };

  const getProductPrice = (productId: number) => {
    if (!productId) return 0;
    
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return 0;
    
    if (product.type === 'phone') {
      const phone = ensuredPhones.find(p => p.id === productId);
      if (phone) {
        return getPriceByType(phone, watchSaleType);
      }
    } else if (product.type === 'accessory') {
      const accessory = ensuredAccessories.find(a => a.id === productId);
      if (accessory) {
        return getPriceByType(accessory, watchSaleType);
      }
    }
    
    return 0;
  };

  const calculateTotalAmount = () => {
    if (!watchItems || watchItems.length === 0) return 0;
    
    return watchItems.reduce((total, item) => {
      if (!item.product_id || item.product_id === 0) return total;
      
      const price = getProductPrice(parseInt(item.product_id.toString()));
      const discount = item.discount || 0;
      return total + ((price * item.quantity) - discount);
    }, 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Sale"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </>
      }
      size="4xl"
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sale Type*</span>
            </label>
            <select 
              className={`select select-bordered ${errors.sale_type ? 'select-error' : ''}`}
              {...register('sale_type', { required: 'Sale type is required' })}
            >
              {saleTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Customer Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              {...register('customer_name')}
              placeholder="Leave blank for walk-in customer"
            />
          </div>
        </div>

        <div className="flex justify-start my-2">
          <label className="label cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              {...register('generate_invoice')}
            />
            <span className="label-text">Generate Invoice</span>
          </label>
        </div>

        <div className="divider">Sale Items</div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Items</h3>
            <Button size="sm" onClick={(e) => handleAddItem(e)}>Add Item</Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="card bg-base-200 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Product*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        className={`select select-bordered w-full ${errors.items?.[index]?.product_id ? 'select-error' : ''}`}
                        {...register(`items.${index}.product_id`, { 
                          required: 'Required',
                          validate: value => value !== 0 && value !== '0' || 'Required'
                        })}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                      >
                        <option value="0">Select a product</option>
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
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity*</span>
                    </label>
                    <input
                      type="number"
                      className={`input input-bordered ${errors.items?.[index]?.quantity ? 'input-error' : ''}`}
                      {...register(`items.${index}.quantity`, { 
                        required: 'Required',
                        min: { value: 1, message: 'Min 1' },
                        valueAsNumber: true
                      })}
                      min="1"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Unit Price</span>
                    </label>
                    <div className="input input-bordered bg-base-100 flex items-center">
                      ${watchItems[index]?.product_id ? 
                        getProductPrice(parseInt(watchItems[index].product_id.toString())).toFixed(2) : 
                        '0.00'}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Discount</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`input input-bordered ${errors.items?.[index]?.discount ? 'input-error' : ''}`}
                      {...register(`items.${index}.discount`, { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Min 0' }
                      })}
                      defaultValue="0"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-lg">
                    <span className="font-medium">Total:</span> 
                    <span className="text-primary">
                      ${watchItems[index]?.product_id ? 
                        ((watchItems[index].quantity * getProductPrice(parseInt(watchItems[index].product_id.toString()))) - 
                        (watchItems[index].discount || 0)).toFixed(2) : 
                        '0.00'}
                    </span>
                  </div>
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

export default SaleFormModal;
