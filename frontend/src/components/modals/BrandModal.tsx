import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Brand } from '../../api/brandService';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingBrand: Brand | null;
}

const BrandModal: React.FC<BrandModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingBrand 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Brand>({
    defaultValues: {
      name: editingBrand?.name || '',
      origin_country: editingBrand?.origin_country || '',
      website: editingBrand?.website || '',
      description: editingBrand?.description || ''
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBrand ? 'Edit Brand' : 'Add Brand'}
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
            <span className="label-text">Brand Name*</span>
            <span className="label-text-alt text-info">e.g., Apple, Samsung, Xiaomi</span>
          </label>
          <input
            type="text"
            className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
            {...register('name', { required: 'Brand name is required' })}
            placeholder="Enter the manufacturer name"
          />
          {errors.name && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.name.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Country of Origin</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            {...register('origin_country')}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Website</span>
          </label>
          <input
            type="url"
            className="input input-bordered"
            {...register('website')}
          />
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
            <span className="label-text">Logo</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            accept="image/*"
            {...register('picture')}
          />
        </div>
      </form>
    </Modal>
  );
};

export default BrandModal;
