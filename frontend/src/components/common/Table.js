import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Table = ({ columns, data, isLoading = false, onRowClick }) => {
    // Ensure data is an array
    const tableData = Array.isArray(data) ? data : [];
    if (isLoading) {
        return (_jsx("div", { className: "w-full overflow-x-auto", children: _jsxs("table", { className: "table w-full", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((column, index) => (_jsx("th", { children: column.header }, index))) }) }), _jsx("tbody", { children: [...Array(5)].map((_, index) => (_jsx("tr", { className: "animate-pulse", children: columns.map((_, colIndex) => (_jsx("td", { children: _jsx("div", { className: "h-4 bg-base-300 rounded w-full" }) }, colIndex))) }, index))) })] }) }));
    }
    if (tableData.length === 0) {
        return (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "No data available" }) }));
    }
    return (_jsx("div", { className: "w-full overflow-x-auto", children: _jsxs("table", { className: "table w-full", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((column, index) => (_jsx("th", { children: column.header }, index))) }) }), _jsx("tbody", { children: tableData.map((item, index) => (_jsx("tr", { className: onRowClick ? "hover:bg-base-200 cursor-pointer" : "", onClick: onRowClick ? () => onRowClick(item) : undefined, children: columns.map((column, colIndex) => (_jsx("td", { children: column.render
                                ? column.render(item[column.accessor], item)
                                : item[column.accessor] || '-' }, colIndex))) }, index))) })] }) }));
};
export default Table;
