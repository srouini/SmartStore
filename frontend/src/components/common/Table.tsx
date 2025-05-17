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
  
  // Debug information
  console.log('Table component received:', { 
    columnsCount: columns.length, 
    dataProvided: data, 
    isArray: Array.isArray(data),
    tableDataLength: tableData.length,
    isLoading
  });
  
  if (tableData.length > 0) {
    console.log('First row data:', tableData[0]);
  }
  
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
        <p className="text-gray-500 text-center max-w-md mb-6">
          No records are currently available. Use the "Add" button to create a new entry.
        </p>
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
          {tableData.map((item, index) => {
            console.log(`Rendering row ${index}:`, item);
            return (
              <tr 
                key={index} 
                className={onRowClick ? "hover:bg-base-200 cursor-pointer" : ""}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, colIndex) => {
                  // Safely access the property using the accessor
                  const value = item && column.accessor in item ? item[column.accessor] : undefined;
                  console.log(`Row ${index}, Column ${colIndex} (${column.accessor}):`, { value, item });
                  
                  return (
                    <td key={colIndex}>
                      {column.render 
                        ? column.render(value, item) 
                        : (value !== undefined && value !== null ? value : '-')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
