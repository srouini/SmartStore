import React from 'react';

type OperationsFilterProps = {
  filterOperationType: string;
  setFilterOperationType: (value: string) => void;
  filterAmountGreaterThan: string;
  setFilterAmountGreaterThan: (value: string) => void;
  filterAmountLessThan: string;
  setFilterAmountLessThan: (value: string) => void;
  filterPerformedBy: string;
  setFilterPerformedBy: (value: string) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
};

export const OperationsFilter: React.FC<OperationsFilterProps> = ({
  filterOperationType,
  setFilterOperationType,
  filterAmountGreaterThan,
  setFilterAmountGreaterThan,
  filterAmountLessThan,
  setFilterAmountLessThan,
  filterPerformedBy,
  setFilterPerformedBy,
  filterDate,
  setFilterDate,
  applyFilters,
  resetFilters
}) => {
  return (
    <form
      className="flex flex-wrap gap-4 mb-4 items-end p-4 rounded-lg"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
    >
      <div className="form-control">
        <label className="label">
          <span className="label-text">Operation Type</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={filterOperationType}
          onChange={(e) => setFilterOperationType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="WITHDRAWAL">Withdrawal</option>
          <option value="SALE">Sale</option>
          <option value="PURCHASE_PAYMENT">Purchase Payment</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Performed By</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          placeholder="Username"
          value={filterPerformedBy}
          onChange={(e) => setFilterPerformedBy(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Date</span>
        </label>
        <input
          type="date"
          className="input input-bordered w-full max-w-xs"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Filter
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-2"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
    </form>
  );
};
