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
declare const Table: React.FC<TableProps>;
export default Table;
