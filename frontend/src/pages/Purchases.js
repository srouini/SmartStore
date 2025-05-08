import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import purchaseService from '../api/purchaseService';
import phoneService from '../api/phoneService';
import accessoryService from '../api/accessoryService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [phones, setPhones] = useState([]);
    const [accessories, setAccessories] = useState([]);
    // Ensure arrays are always arrays
    const ensuredPurchases = Array.isArray(purchases) ? purchases : [];
    const ensuredPhones = Array.isArray(phones) ? phones : [];
    const ensuredAccessories = Array.isArray(accessories) ? accessories : [];
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [viewingPurchase, setViewingPurchase] = useState(null);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            supplier_name: '',
            supplier_contact: '',
            reference_number: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            payment_status: 'PENDING',
            payment_method: 'CASH',
            notes: '',
            items: [{ product_type: 'PHONE', product_id: '', quantity: 1, unit_price: 0 }]
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });
    const watchItems = watch('items');
    const watchProductTypes = watchItems?.map((item) => item.product_type);
    // Payment status options
    const paymentStatusOptions = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'PARTIAL', label: 'Partial' },
        { value: 'PAID', label: 'Paid' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];
    // Payment method options
    const paymentMethodOptions = [
        { value: 'CASH', label: 'Cash' },
        { value: 'CREDIT_CARD', label: 'Credit Card' },
        { value: 'DEBIT_CARD', label: 'Debit Card' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { value: 'CHECK', label: 'Check' },
        { value: 'MOBILE_PAYMENT', label: 'Mobile Payment' },
        { value: 'OTHER', label: 'Other' }
    ];
    // Fetch purchases, phones, and accessories on component mount
    useEffect(() => {
        fetchPurchases();
        fetchPhones();
        fetchAccessories();
    }, []);
    const fetchPurchases = async (params) => {
        try {
            setIsLoading(true);
            const data = await purchaseService.getAllPurchases(params);
            setPurchases(data);
            setError(null);
        }
        catch (err) {
            console.error('Error fetching purchases:', err);
            setError('Failed to load purchases. Please try again.');
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
    const handleCreatePurchase = () => {
        setEditingPurchase(null);
        reset({
            supplier_name: '',
            supplier_contact: '',
            reference_number: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            payment_status: 'PENDING',
            payment_method: 'CASH',
            notes: '',
            items: [{ product_type: 'PHONE', product_id: '', quantity: 1, unit_price: 0 }]
        });
        setIsModalOpen(true);
    };
    const handleEditPurchase = (purchase) => {
        setEditingPurchase(purchase);
        // Format items for the form
        const formattedItems = purchase.items.map(item => ({
            product_type: item.product_type,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));
        reset({
            supplier_name: purchase.supplier_name,
            supplier_contact: purchase.supplier_contact,
            reference_number: purchase.reference_number,
            date: purchase.date,
            payment_status: purchase.payment_status,
            payment_method: purchase.payment_method,
            notes: purchase.notes || '',
            items: formattedItems
        });
        setIsModalOpen(true);
    };
    const handleViewPurchase = (purchase) => {
        setViewingPurchase(purchase);
        setViewModalOpen(true);
    };
    const handleDeletePurchase = async (id) => {
        if (!window.confirm('Are you sure you want to delete this purchase?'))
            return;
        try {
            await purchaseService.deletePurchase(id);
            setPurchases(purchases.filter(purchase => purchase.id !== id));
        }
        catch (err) {
            console.error('Error deleting purchase:', err);
            setError('Failed to delete purchase. Please try again.');
        }
    };
    const onSubmit = async (data) => {
        try {
            // Calculate total amount
            const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
            const purchaseData = {
                ...data,
                total_amount: totalAmount
            };
            if (editingPurchase) {
                await purchaseService.updatePurchase(editingPurchase.id, purchaseData);
            }
            else {
                await purchaseService.createPurchase(purchaseData);
            }
            setIsModalOpen(false);
            fetchPurchases();
        }
        catch (err) {
            console.error('Error saving purchase:', err);
            setError('Failed to save purchase. Please try again.');
        }
    };
    const handleSearch = () => {
        if (!searchQuery) {
            fetchPurchases();
            return;
        }
        purchaseService.searchByReferenceNumber(searchQuery)
            .then(data => {
            setPurchases(data);
            setError(null);
        })
            .catch(err => {
            console.error('Error searching purchases:', err);
            setError('Search failed. Please try again.');
        });
    };
    const handleDateFilter = () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }
        purchaseService.getByDateRange(startDate, endDate)
            .then(data => {
            setPurchases(data);
            setError(null);
        })
            .catch(err => {
            console.error('Error filtering purchases by date:', err);
            setError('Date filter failed. Please try again.');
        });
    };
    const handleStatusFilterChange = (e) => {
        const value = e.target.value;
        setPaymentStatus(value);
        if (value) {
            purchaseService.getByPaymentStatus(value)
                .then(data => {
                setPurchases(data);
                setError(null);
            })
                .catch(err => {
                console.error('Error filtering purchases by status:', err);
                setError('Status filter failed. Please try again.');
            });
        }
        else {
            fetchPurchases();
        }
    };
    const handleAddItem = () => {
        append({ product_type: 'PHONE', product_id: '', quantity: 1, unit_price: 0 });
    };
    const handleRemoveItem = (index) => {
        remove(index);
    };
    const getProductOptions = (productType) => {
        if (productType === 'PHONE') {
            return ensuredPhones.map(phone => (_jsxs("option", { value: phone.id, children: [phone.name, " (", phone.code, ") - $", phone.cost_price] }, phone.id)));
        }
        else if (productType === 'ACCESSORY') {
            return ensuredAccessories.map(accessory => (_jsxs("option", { value: accessory.id, children: [accessory.name, " (", accessory.code, ") - $", accessory.cost_price] }, accessory.id)));
        }
        return null;
    };
    const handleProductChange = (index, productId, productType) => {
        if (!productId)
            return;
        const id = parseInt(productId);
        let product;
        if (productType === 'PHONE') {
            product = phones.find(p => p.id === id);
            if (product) {
                setValue(`items.${index}.unit_price`, product.cost_price);
            }
        }
        else if (productType === 'ACCESSORY') {
            product = accessories.find(a => a.id === id);
            if (product) {
                setValue(`items.${index}.unit_price`, product.cost_price);
            }
        }
    };
    const calculateTotalAmount = () => {
        if (!watchItems)
            return 0;
        return watchItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };
    const columns = [
        {
            header: 'Reference #',
            accessor: 'reference_number'
        },
        {
            header: 'Date',
            accessor: 'date',
            render: (value) => new Date(value).toLocaleDateString()
        },
        { header: 'Supplier', accessor: 'supplier_name' },
        {
            header: 'Total Amount',
            accessor: 'total_amount',
            render: (value) => `$${value.toFixed(2)}`
        },
        {
            header: 'Payment Status',
            accessor: 'payment_status_display',
            render: (value, item) => (_jsx("span", { className: `badge ${item.payment_status === 'PAID' ? 'badge-success' :
                    item.payment_status === 'PARTIAL' ? 'badge-warning' :
                        item.payment_status === 'CANCELLED' ? 'badge-error' :
                            'badge-ghost'}`, children: value }))
        },
        { header: 'Payment Method', accessor: 'payment_method_display' },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, item) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            handleViewPurchase(item);
                        }, children: "View" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            handleEditPurchase(item);
                        }, children: "Edit" }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-error", onClick: (e) => {
                            e.stopPropagation();
                            handleDeletePurchase(item.id);
                        }, children: "Delete" })] }))
        }
    ];
    const itemColumns = [
        { header: 'Product Type', accessor: 'product_type' },
        { header: 'Product', accessor: 'product_name' },
        { header: 'Code', accessor: 'product_code' },
        {
            header: 'Quantity',
            accessor: 'quantity'
        },
        {
            header: 'Unit Price',
            accessor: 'unit_price',
            render: (value) => `$${value.toFixed(2)}`
        },
        {
            header: 'Total',
            accessor: 'total_price',
            render: (value) => `$${value.toFixed(2)}`
        }
    ];
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Purchases" }), _jsx(Button, { onClick: handleCreatePurchase, children: "Add Purchase" })] }), error && (_jsx("div", { className: "alert alert-error mb-4", children: _jsx("span", { children: error }) })), _jsxs("div", { className: "mb-4 flex flex-wrap gap-4", children: [_jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Filter by Payment Status" }) }), _jsxs("select", { className: "select select-bordered", value: paymentStatus, onChange: handleStatusFilterChange, children: [_jsx("option", { value: "", children: "All Statuses" }), paymentStatusOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), _jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Filter by Date Range" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "date", className: "input input-bordered w-full", value: startDate, onChange: (e) => setStartDate(e.target.value) }), _jsx("span", { className: "self-center", children: "to" }), _jsx("input", { type: "date", className: "input input-bordered w-full", value: endDate, onChange: (e) => setEndDate(e.target.value) }), _jsx(Button, { className: "ml-2", onClick: handleDateFilter, children: "Apply" })] })] }), _jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Search by Reference #" }) }), _jsxs("div", { className: "flex", children: [_jsx("input", { type: "text", className: "input input-bordered w-full", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Enter reference number" }), _jsx(Button, { className: "ml-2", onClick: handleSearch, children: "Search" })] })] })] }), _jsx(Card, { children: _jsx(Table, { columns: columns, data: ensuredPurchases, isLoading: isLoading, onRowClick: handleViewPurchase }) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: editingPurchase ? 'Edit Purchase' : 'Add Purchase', footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmit(onSubmit), children: "Save" })] }), size: "xl", children: _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Supplier Name*" }) }), _jsx("input", { type: "text", className: `input input-bordered ${errors.supplier_name ? 'input-error' : ''}`, ...register('supplier_name', { required: 'Supplier name is required' }) }), errors.supplier_name && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: String(errors.supplier_name.message) }) }))] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Supplier Contact" }) }), _jsx("input", { type: "text", className: "input input-bordered", ...register('supplier_contact') })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Reference Number*" }) }), _jsx("input", { type: "text", className: `input input-bordered ${errors.reference_number ? 'input-error' : ''}`, ...register('reference_number', { required: 'Reference number is required' }) }), errors.reference_number && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: String(errors.reference_number.message) }) }))] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Date*" }) }), _jsx("input", { type: "date", className: `input input-bordered ${errors.date ? 'input-error' : ''}`, ...register('date', { required: 'Date is required' }) }), errors.date && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: String(errors.date.message) }) }))] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Payment Status*" }) }), _jsx("select", { className: `select select-bordered ${errors.payment_status ? 'select-error' : ''}`, ...register('payment_status', { required: 'Payment status is required' }), children: paymentStatusOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Payment Method*" }) }), _jsx("select", { className: `select select-bordered ${errors.payment_method ? 'select-error' : ''}`, ...register('payment_method', { required: 'Payment method is required' }), children: paymentMethodOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { className: "form-control md:col-span-2", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Notes" }) }), _jsx("textarea", { className: "textarea textarea-bordered", rows: 2, ...register('notes') })] })] }), _jsx("div", { className: "divider", children: "Purchase Items" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Items" }), _jsx(Button, { size: "sm", onClick: handleAddItem, children: "Add Item" })] }), fields.map((field, index) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-2 rounded-md", children: [_jsxs("div", { className: "form-control md:col-span-2", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Type*" }) }), _jsxs("select", { className: `select select-bordered ${errors.items && errors.items[index]?.product_type ? 'select-error' : ''}`, ...register(`items.${index}.product_type`, { required: 'Required' }), children: [_jsx("option", { value: "PHONE", children: "Phone" }), _jsx("option", { value: "ACCESSORY", children: "Accessory" })] })] }), _jsxs("div", { className: "form-control md:col-span-3", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Product*" }) }), _jsxs("select", { className: `select select-bordered ${errors.items && errors.items[index]?.product_id ? 'select-error' : ''}`, ...register(`items.${index}.product_id`, { required: 'Required' }), onChange: (e) => handleProductChange(index, e.target.value, watchProductTypes[index]), children: [_jsx("option", { value: "", children: "Select a product" }), getProductOptions(watchProductTypes?.[index] || '')] })] }), _jsxs("div", { className: "form-control md:col-span-2", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Quantity*" }) }), _jsx("input", { type: "number", className: `input input-bordered ${errors.items && errors.items[index]?.quantity ? 'input-error' : ''}`, ...register(`items.${index}.quantity`, {
                                                        required: 'Required',
                                                        min: { value: 1, message: 'Min 1' }
                                                    }), min: "1" })] }), _jsxs("div", { className: "form-control md:col-span-2", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Unit Price*" }) }), _jsx("input", { type: "number", step: "0.01", className: `input input-bordered ${errors.items && errors.items[index]?.unit_price ? 'input-error' : ''}`, ...register(`items.${index}.unit_price`, {
                                                        required: 'Required',
                                                        min: { value: 0, message: 'Min 0' }
                                                    }), min: "0" })] }), _jsxs("div", { className: "form-control md:col-span-2", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Total" }) }), _jsxs("div", { className: "input input-bordered bg-base-200 flex items-center", children: ["$", (watchItems[index]?.quantity * watchItems[index]?.unit_price || 0).toFixed(2)] })] }), _jsx("div", { className: "form-control md:col-span-1", children: _jsx(Button, { variant: "ghost", className: "text-error", onClick: () => handleRemoveItem(index), disabled: fields.length <= 1, children: "Remove" }) })] }, field.id))), _jsx("div", { className: "flex justify-end", children: _jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Total Amount" }), _jsxs("div", { className: "stat-value text-primary", children: ["$", calculateTotalAmount().toFixed(2)] })] }) }) })] })] }) }), _jsx(Modal, { isOpen: viewModalOpen, onClose: () => setViewModalOpen(false), title: "Purchase Details", footer: _jsx(Button, { onClick: () => setViewModalOpen(false), children: "Close" }), size: "lg", children: viewingPurchase && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Reference Number" }), _jsx("p", { children: viewingPurchase.reference_number })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Date" }), _jsx("p", { children: new Date(viewingPurchase.date).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Supplier" }), _jsx("p", { children: viewingPurchase.supplier_name })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Supplier Contact" }), _jsx("p", { children: viewingPurchase.supplier_contact || 'N/A' })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Payment Status" }), _jsx("p", { children: _jsx("span", { className: `badge ${viewingPurchase.payment_status === 'PAID' ? 'badge-success' :
                                                    viewingPurchase.payment_status === 'PARTIAL' ? 'badge-warning' :
                                                        viewingPurchase.payment_status === 'CANCELLED' ? 'badge-error' :
                                                            'badge-ghost'}`, children: viewingPurchase.payment_status_display }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: "Payment Method" }), _jsx("p", { children: viewingPurchase.payment_method_display })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("h3", { className: "font-bold", children: "Notes" }), _jsx("p", { children: viewingPurchase.notes || 'N/A' })] })] }), _jsx("div", { className: "divider", children: "Items" }), _jsx(Table, { columns: itemColumns, data: viewingPurchase.items || [], isLoading: false }), _jsx("div", { className: "flex justify-end", children: _jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Total Amount" }), _jsxs("div", { className: "stat-value text-primary", children: ["$", viewingPurchase.total_amount.toFixed(2)] })] }) }) })] })) })] }));
};
export default Purchases;
