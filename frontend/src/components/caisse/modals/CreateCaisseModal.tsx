import React, { useState } from 'react';

type CreateCaisseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<boolean>;
};

export const CreateCaisseModal: React.FC<CreateCaisseModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the cash register');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onCreate(name);
      if (success) {
        resetForm();
        onClose();
      }
    } catch (err) {
      setError('Failed to create cash register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Cash Register</h3>
        
        {error && <div className="alert alert-error mb-4">{error}</div>}
        
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Cash Register Name</span>
          </label>
          <input 
            type="text" 
            className="input input-bordered" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
