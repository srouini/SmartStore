import React, { useState } from 'react';

type WithdrawalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, description: string) => Promise<boolean | undefined>;
  maxAmount: number;
};

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onWithdraw,
  maxAmount
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (parsedAmount > maxAmount) {
      setError('Withdrawal amount exceeds current balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onWithdraw(parsedAmount, description);
      if (success) {
        resetForm();
        onClose();
      }
    } catch (err) {
      setError('Failed to withdraw funds. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
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
        <h3 className="font-bold text-lg mb-4">Withdraw Funds</h3>
        
        {error && <div className="alert alert-error mb-4">{error}</div>}
        
        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Amount (max: ${maxAmount.toFixed(2)})</span>
          </label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            max={maxAmount}
            className="input input-bordered" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Description (optional)</span>
          </label>
          <input 
            type="text" 
            className="input input-bordered" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>
        
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};
