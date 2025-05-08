import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import saleService from '../api/saleService';
import phoneService from '../api/phoneService';
import accessoryService from '../api/accessoryService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm, useFieldArray } from 'react-hook-form';
// import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
const Sales = () => {
    const {} = useAuth();
    const [sales, setSales] = useState([]);
    const [phones, setPhones] = useState([]);
    const [accessories, setAccessories] = useState([]);
    // Ensure arrays are always arrays
    const ensuredSales = Array.isArray(sales) ? sales : [];
    const ensuredPhones = Array.isArray(phones) ? phones : [];
    const ensuredAccessories = Array.isArray(accessories) ? accessories : [];
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingSale, setViewingSale] = useState(null);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [saleType, setSaleType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            sale_type: 'particular',
            customer_name: '',
            generate_invoice: false,
            items: [{ product_id: 0, quantity: 1 }]
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });
    const watchItems = watch('items');
    const watchSaleType = watch('sale_type');
    // Sale type options
    const saleTypeOptions = [
        { value: 'particular', label: 'Particular (Retail)' },
        { value: 'semi-bulk', label: 'Semi-Bulk' },
        { value: 'bulk', label: 'Bulk (Wholesale)' }
    ];
    // Fetch sales, phones, and accessories on component mount
    useEffect(() => {
        fetchSales();
        fetchPhones();
        fetchAccessories();
    }, []);
    const fetchSales = async (params) => {
        try {
            setIsLoading(true);
            const data = await saleService.getAllSales(params);
            setSales(data);
            setError(null);
        }
        catch (err) {
            console.error('Error fetching sales:', err);
            setError('Failed to load sales. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchPhones = async () => {
        try {
            const data = await phoneService.getAllPhones();
            setPhones(data);
        }
        catch (err) {
            console.error('Error fetching phones:', err);
        }
    };
    const fetchAccessories = async () => {
        try {
            const data = await accessoryService.getAllAccessories();
            setAccessories(data);
        }
        catch (err) {
            console.error('Error fetching accessories:', err);
        }
    };
    const handleCreateSale = () => {
        reset({
            sale_type: 'particular',
            customer_name: '',
            generate_invoice: false,
            items: [{ product_id: 0, quantity: 1 }]
        });
        setIsModalOpen(true);
    };
    const handleViewSale = (sale) => {
        setViewingSale(sale);
        setViewModalOpen(true);
    };
    const onSubmit = async (data) => {
        try {
            // Format the data correctly
            const formattedData = {
                ...data,
                items: data.items.map((item) => ({
                    product_id: typeof item.product_id === 'string' ? parseInt(item.product_id) : item.product_id,
                    quantity: item.quantity
                }))
            };
            await saleService.recordSale(formattedData);
            setIsModalOpen(false);
            fetchSales();
        }
        catch (err) {
            console.error('Error recording sale:', err);
            setError('Failed to record sale. Please try again.');
        }
    };
    const handleDateFilter = () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }
        saleService.getSalesByDateRange(startDate, endDate)
            .then(data => {
            setSales(data);
            setError(null);
        })
            .catch(err => {
            console.error('Error filtering sales by date:', err);
            setError('Date filter failed. Please try again.');
        });
    };
    const handleTypeFilterChange = (e) => {
        const value = e.target.value;
        setSaleType(value);
        if (value) {
            saleService.getSalesByType(value)
                .then(data => {
                setSales(data);
                setError(null);
            })
                .catch(err => {
                console.error('Error filtering sales by type:', err);
                setError('Type filter failed. Please try again.');
            });
        }
        else {
            fetchSales();
        }
    };
    const handleCustomerSearch = () => {
        if (!searchQuery) {
            fetchSales();
            return;
        }
        saleService.getSalesByCustomer(searchQuery)
            .then(data => {
            setSales(data);
            setError(null);
        })
            .catch(err => {
            console.error('Error searching sales by customer:', err);
            setError('Search failed. Please try again.');
        });
    };
    const handleAddItem = () => {
        append({ product_id: '', quantity: 1 });
    };
    const handleRemoveItem = (index) => {
        remove(index);
    };
    const getAllProducts = () => {
        const phoneOptions = ensuredPhones.map(phone => ({
            id: phone.id,
            name: `${phone.name} (${phone.code})`,
            price: getPriceByType(phone, watchSaleType),
            type: 'phone'
        }));
        const accessoryOptions = ensuredAccessories.map(accessory => ({
            id: accessory.id,
            name: `${accessory.name} (${accessory.code})`,
            price: getPriceByType(accessory, watchSaleType),
            type: 'accessory'
        }));
        return [...phoneOptions, ...accessoryOptions];
    };
    const getPriceByType = (product, saleType) => {
        if (saleType === 'bulk' && product.selling_bulk_price) {
            return product.selling_bulk_price;
        }
        else if (saleType === 'semi-bulk' && product.selling_semi_bulk_price) {
            return product.selling_semi_bulk_price;
        }
        else {
            return product.selling_unite_price;
        }
    };
    const handleProductChange = (index, productId) => {
        if (!productId)
            return;
        const id = parseInt(productId);
        const allProducts = getAllProducts();
        const selectedProduct = allProducts.find(p => p.id === id);
        if (selectedProduct) {
            setValue(`items.${index}.product_id`, id);
        }
    };
    const calculateTotalAmount = () => {
        if (!watchItems)
            return 0;
        return watchItems.reduce((sum, item) => {
            if (!item.product_id)
                return sum;
            const id = parseInt(item.product_id.toString());
            const allProducts = getAllProducts();
            const product = allProducts.find(p => p.id === id);
            if (product) {
                return sum + (item.quantity * product.price);
            }
            return sum;
        }, 0);
    };
    const getProductPrice = (productId) => {
        const allProducts = getAllProducts();
        const product = allProducts.find(p => p.id === productId);
        return product ? product.price : 0;
    };
    const columns = [
        {
            header: 'ID',
            accessor: 'id'
        },
        {
            header: 'Date',
            accessor: 'sale_date',
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            header: 'Type',
            accessor: 'sale_type_display'
        },
        {
            header: 'Customer',
            accessor: 'customer_name',
            render: (value) => value || 'Walk-in Customer'
        },
        {
            header: 'Total Amount',
            accessor: 'total_amount',
            render: (value) => `$${value.toFixed(2)}`
        },
        {
            header: 'Invoice',
            accessor: 'has_invoice',
            render: (value) => value ?
                _jsx("span", { className: "badge badge-success", children: "Yes" }) :
                _jsx("span", { className: "badge badge-ghost", children: "No" })
        },
        {
            header: 'Sold By',
            accessor: 'sold_by_username',
            render: (value) => value || 'System'
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, item) => (_jsx("div", { className: "flex gap-2", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                        e.stopPropagation();
                        handleViewSale(item);
                    }, children: "View" }) }))
        }
    ];
    const itemColumns = [
        { header: 'Product Type', accessor: 'product_type' },
        { header: 'Product', accessor: 'product_name' },
        { header: 'Code', accessor: 'product_code' },
        {
            header: 'Quantity',
            accessor: 'quantity_sold'
        },
        {
            header: 'Unit Price',
            accessor: 'price_per_item',
            render: (value) => `$${value.toFixed(2)}`
        },
        {
            header: 'Total',
            accessor: 'total',
            render: (_, item) => `$${(item.quantity_sold * item.price_per_item).toFixed(2)}`
        }
    ];
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Sales" }), _jsx(Button, { onClick: handleCreateSale, children: "Record Sale" })] }), error && (_jsx("div", { className: "alert alert-error mb-4", children: _jsx("span", { children: error }) })), _jsxs("div", { className: "mb-4 flex flex-wrap gap-4", children: [_jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Filter by Sale Type" }) }), _jsxs("select", { className: "select select-bordered", value: saleType, onChange: handleTypeFilterChange, children: [_jsx("option", { value: "", children: "All Types" }), saleTypeOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), _jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Filter by Date Range" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "date", className: "input input-bordered w-full", value: startDate, onChange: (e) => setStartDate(e.target.value) }), _jsx("span", { className: "self-center", children: "to" }), _jsx("input", { type: "date", className: "input input-bordered w-full", value: endDate, onChange: (e) => setEndDate(e.target.value) }), _jsx(Button, { className: "ml-2", onClick: handleDateFilter, children: "Apply" })] })] }), _jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Search by Customer" }) }), _jsxs("div", { className: "flex", children: [_jsx("input", { type: "text", className: "input input-bordered w-full", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Enter customer name" }), _jsx(Button, { className: "ml-2", onClick: handleCustomerSearch, children: "Search" })] })] })] }), _jsx(Card, { children: _jsx(Table, { columns: columns, data: ensuredSales, isLoading: isLoading, onRowClick: handleViewSale }) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: "Record Sale", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmit(onSubmit), children: "Save" })] }), size: "xl", children: _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Sale Type*" }) }), _jsx("select", { className: `select select-bordered ${errors.sale_type ? 'select-error' : ''}`, ...register('sale_type', { required: 'Sale type is required' }), children: saleTypeOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Customer Name" }) }), _jsx("input", { type: "text", className: "input input-bordered", ...register('customer_name'), placeholder: "Leave blank for walk-in customer" })] }), _jsx("div", { className: "form-control md:col-span-2", children: _jsxs("label", { className: "label cursor-pointer justify-start gap-2", children: [_jsx("input", { type: "checkbox", className: "checkbox", ...register('generate_invoice') }), _jsx("span", { className: "label-text", children: "Generate Invoice" })] }) })] }), _jsx("div", { className: "divider", children: "Sale Items" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Items" }), _jsx(Button, { size: "sm", onClick: handleAddItem, children: "Add Item" })] }), fields.map((field, index) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-2 rounded-md", children: [_jsxs("div", { className: "form-control md:col-span-6", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Product*" }) }), _jsxs("select", { className: `select select-bordered ${errors.items?.[index]?.product_id ? 'select-error' : ''}`, ...register(`items.${index}.product_id`, { required: 'Product is required' }), onChange: (e) => handleProductChange(index, e.target.value), children: [_jsx("option", { value: "", children: "Select a product" }), getAllProducts().map(product => (_jsxs("option", { value: product.id, children: [product.name, " - $", product.price.toFixed(2)] }, `${product.type}-${product.id}`)))] })] }), _jsxs("div", { className: "form-control md:col-span-2", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Quantity*" }) }), _jsx("input", { type: "number", className: `input input-bordered ${errors.items?.[index]?.quantity ? 'input-error' : ''}`, ...register(`items.${index}.quantity`, {
                                                        required: 'Required',
                                                        min: { value: 1, message: 'Min 1' }
                                                    }), min: "1" })] }), _jsxs("div", { className: "form-control md:col-span-3", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Total" }) }), _jsxs("div", { className: "input input-bordered bg-base-200 flex items-center", children: ["$", watchItems[index]?.product_id ?
                                                            (watchItems[index].quantity * getProductPrice(parseInt(watchItems[index].product_id.toString()))).toFixed(2) :
                                                            '0.00'] })] }), _jsx("div", { className: "form-control md:col-span-1", children: _jsx(Button, { variant: "ghost", className: "text-error", onClick: () => handleRemoveItem(index), disabled: fields.length <= 1, children: "Remove" }) })] }, field.id))), _jsx("div", { className: "flex justify-end", children: _jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Total Amount" }), _jsxs("div", { className: "stat-value text-primary", children: ["$", calculateTotalAmount().toFixed(2)] })] }) }) })] })] }) }), _jsx(Modal, { isOpen: viewModalOpen, onClose: () => setViewModalOpen(false), title: "Sale Details", footer: _jsx(Button, { onClick: () => setViewModalOpen(false), children: "Close" }), size: "lg", children: viewingSale && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Sale ID" }), _jsx("p", { children: viewingSale.id })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Date" }), _jsx("p", { children: new Date(viewingSale.sale_date).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Sale Type" }), _jsx("p", { children: viewingSale.sale_type_display })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Customer" }), _jsx("p", { children: viewingSale.customer_name || 'Walk-in Customer' })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Invoice" }), _jsx("p", { children: viewingSale.has_invoice ?
                                                _jsx("span", { className: "badge badge-success", children: "Yes" }) :
                                                _jsx("span", { className: "badge badge-ghost", children: "No" }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Sold By" }), _jsx("p", { children: viewingSale.sold_by_username || 'System' })] })] }), _jsx("div", { className: "divider", children: "Items" }), _jsx(Table, { columns: itemColumns, data: viewingSale.items || [], isLoading: false }), _jsx("div", { className: "flex justify-end", children: _jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Total Amount" }), _jsxs("div", { className: "stat-value text-primary", children: ["$", viewingSale.total_amount.toFixed(2)] })] }) }) })] })) })] }));
};
export default Sales;
