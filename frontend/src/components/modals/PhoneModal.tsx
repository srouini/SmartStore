import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import brandService from '../../api/brandService';
import type { Brand } from '../../api/brandService';
import type { Phone, PhoneFormData } from '../../api/phoneService';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PhoneFormData) => void;
  editingPhone: Phone | null;
}

const PhoneModal: React.FC<PhoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPhone
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(editingPhone?.brand?.id || null);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PhoneFormData>({
    defaultValues: {
      name: editingPhone?.name || '',
      brand: editingPhone?.brand?.id || undefined,
      model: editingPhone?.model?.id || undefined,
      cost_price: editingPhone?.cost_price || 0,
      selling_unite_price: editingPhone?.selling_unite_price || 0,
      selling_semi_bulk_price: editingPhone?.selling_semi_bulk_price || 0,
      selling_bulk_price: editingPhone?.selling_bulk_price || 0,
      description: editingPhone?.description || '',
      condition: editingPhone?.condition || 'new',
      version: editingPhone?.version || 'global',
      storage_gb: editingPhone?.storage_gb || 0,
      ram_gb: editingPhone?.ram_gb || 0,
      color: editingPhone?.color || '',
      phone_type: editingPhone?.phone_type || 'ordinary',
      screen_type: editingPhone?.screen_type || 'lcd',
    }
  });

  const watchBrand = watch('brand');

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const data = await brandService.getAllBrands();
        if (Array.isArray(data)) {
          setBrands(data);
        } else if (data && typeof data === 'object' && 'results' in data) {
          setBrands(data.results);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (watchBrand) {
      const fetchModels = async () => {
        try {
          // This would be replaced with your actual API call to get models for a brand
          // const data = await modelService.getModelsByBrand(watchBrand);
          // setModels(data);
          
          // For now, we're just setting an empty array
          setModels([]);
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      };

      fetchModels();
    }
  }, [watchBrand]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPhone ? 'Edit Phone' : 'Add Phone'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </>
      }
    >
      <form className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone Name*</span>
          </label>
          <input
            type="text"
            className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
            {...register('name', { required: 'Phone name is required' })}
            placeholder="Enter the phone name"
          />
          {errors.name && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.name.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Brand*</span>
          </label>
          <select
            className={`select select-bordered ${errors.brand ? 'select-error' : ''}`}
            {...register('brand', { required: 'Brand is required' })}
            onChange={(e) => {
              setValue('brand', parseInt(e.target.value));
              setValue('model', undefined); // Reset model when brand changes
            }}
            disabled={isLoadingBrands}
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brand && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.brand.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Model</span>
          </label>
          <select
            className="select select-bordered"
            {...register('model')}
            disabled={!watchBrand || models.length === 0}
          >
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Cost Price*</span>
            </label>
            <input
              type="number"
              className={`input input-bordered ${errors.cost_price ? 'input-error' : ''}`}
              {...register('cost_price', { required: 'Cost price is required', min: 0 })}
              step="0.01"
            />
            {errors.cost_price && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.cost_price.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Selling Price (Unit)*</span>
            </label>
            <input
              type="number"
              className={`input input-bordered ${errors.selling_unite_price ? 'input-error' : ''}`}
              {...register('selling_unite_price', { required: 'Selling price is required', min: 0 })}
              step="0.01"
            />
            {errors.selling_unite_price && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.selling_unite_price.message}</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Semi-Bulk Price</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              {...register('selling_semi_bulk_price')}
              step="0.01"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Bulk Price</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              {...register('selling_bulk_price')}
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Condition*</span>
            </label>
            <select
              className={`select select-bordered ${errors.condition ? 'select-error' : ''}`}
              {...register('condition', { required: 'Condition is required' })}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
              <option value="open_box">Open Box</option>
            </select>
            {errors.condition && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.condition.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Version*</span>
            </label>
            <select
              className={`select select-bordered ${errors.version ? 'select-error' : ''}`}
              {...register('version', { required: 'Version is required' })}
            >
              <option value="global">Global</option>
              <option value="chinese">Chinese</option>
              <option value="indian">Indian</option>
              <option value="european">European</option>
              <option value="us">US</option>
              <option value="other">Other</option>
            </select>
            {errors.version && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.version.message}</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Storage (GB)*</span>
            </label>
            <input
              type="number"
              className={`input input-bordered ${errors.storage_gb ? 'input-error' : ''}`}
              {...register('storage_gb', { required: 'Storage is required', min: 0 })}
            />
            {errors.storage_gb && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.storage_gb.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">RAM (GB)*</span>
            </label>
            <input
              type="number"
              className={`input input-bordered ${errors.ram_gb ? 'input-error' : ''}`}
              {...register('ram_gb', { required: 'RAM is required', min: 0 })}
            />
            {errors.ram_gb && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.ram_gb.message}</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Color</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            {...register('color')}
            placeholder="e.g., Black, White, Blue"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Phone Type*</span>
            </label>
            <select
              className={`select select-bordered ${errors.phone_type ? 'select-error' : ''}`}
              {...register('phone_type', { required: 'Phone type is required' })}
            >
              <option value="ordinary">Ordinary</option>
              <option value="smartphone">Smartphone</option>
              <option value="feature_phone">Feature Phone</option>
              <option value="flip_phone">Flip Phone</option>
              <option value="slider">Slider</option>
              <option value="gaming">Gaming Phone</option>
              <option value="rugged">Rugged Phone</option>
              <option value="other">Other</option>
            </select>
            {errors.phone_type && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.phone_type.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Screen Type*</span>
            </label>
            <select
              className={`select select-bordered ${errors.screen_type ? 'select-error' : ''}`}
              {...register('screen_type', { required: 'Screen type is required' })}
            >
              <option value="lcd">LCD</option>
              <option value="oled">OLED</option>
              <option value="amoled">AMOLED</option>
              <option value="super_amoled">Super AMOLED</option>
              <option value="ips_lcd">IPS LCD</option>
              <option value="tft_lcd">TFT LCD</option>
              <option value="other">Other</option>
            </select>
            {errors.screen_type && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.screen_type.message}</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered"
            rows={3}
            {...register('description')}
          ></textarea>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Photo</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            accept="image/*"
            {...register('photo')}
          />
        </div>
      </form>
    </Modal>
  );
};

export default PhoneModal;
