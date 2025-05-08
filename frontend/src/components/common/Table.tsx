import React from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  onRowClick?: (item: any) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, isLoading = false, onRowClick }) => {
  // Ensure data is an array
  const tableData = Array.isArray(data) ? data : [];
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                {columns.map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="h-4 bg-base-300 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, index) => (
            <tr 
              key={index} 
              className={onRowClick ? "hover:bg-base-200 cursor-pointer" : ""}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render 
                    ? column.render(item[column.accessor], item) 
                    : item[column.accessor] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
