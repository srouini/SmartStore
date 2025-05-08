import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import brandService from '../api/brandService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';
const Brands = () => {
    const [brands, setBrands] = useState([]);
    // Ensure brands is always an array
    const ensuredBrands = Array.isArray(brands) ? brands : [];
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [error, setError] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    // Fetch brands on component mount
    useEffect(() => {
        fetchBrands();
    }, []);
    const fetchBrands = async () => {
        try {
            setIsLoading(true);
            const data = await brandService.getAllBrands();
            console.log('Brands API response:', data);
            
            // Check if data is an object with results property (paginated response)
            if (data && typeof data === 'object' && 'results' in data) {
                console.log('Setting brands from results array:', data.results);
                setBrands(data.results);
            } else if (Array.isArray(data)) {
                console.log('Setting brands from direct array:', data);
                setBrands(data);
            } else {
                console.error('Unexpected data format:', data);
                setBrands([]);
                setError('Received invalid data format from server');
            }
            
            setError(null);
        }
        catch (err) {
            console.error('Error fetching brands:', err);
            setError('Failed to load brands. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateBrand = () => {
        setEditingBrand(null);
        reset({
            name: '',
            origin_country: '',
            website: '',
            description: ''
        });
        setIsModalOpen(true);
    };
    const handleEditBrand = (brand) => {
        setEditingBrand(brand);
        reset({
            name: brand.name,
            origin_country: brand.origin_country || '',
            website: brand.website || '',
            description: brand.description || ''
        });
        setIsModalOpen(true);
    };
    const handleDeleteBrand = async (id) => {
        if (!window.confirm('Are you sure you want to delete this brand?'))
            return;
        try {
            await brandService.deleteBrand(id);
            setBrands(brands.filter(brand => brand.id !== id));
        }
        catch (err) {
            console.error('Error deleting brand:', err);
            setError('Failed to delete brand. Please try again.');
        }
    };
    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.origin_country) {
                formData.append('origin_country', data.origin_country);
            }
            if (data.website) {
                formData.append('website', data.website);
            }
            if (data.description) {
                formData.append('description', data.description);
            }
            if (data.picture && data.picture[0]) {
                formData.append('picture', data.picture[0]);
            }
            if (editingBrand) {
                await brandService.updateBrand(editingBrand.id, formData);
            }
            else {
                await brandService.createBrand(formData);
            }
            setIsModalOpen(false);
            fetchBrands();
        }
        catch (err) {
            console.error('Error saving brand:', err);
            setError('Failed to save brand. Please try again.');
        }
    };
    const columns = [
        { header: 'Name', accessor: 'name' },
        {
            header: 'Logo',
            accessor: 'picture',
            render: (value) => value ?
                _jsx("img", { src: value, alt: "Brand logo", className: "w-10 h-10 object-contain" }) :
                _jsx("div", { className: "w-10 h-10 bg-gray-200 flex items-center justify-center text-xs", children: "No logo" })
        },
        { header: 'Country', accessor: 'origin_country' },
        { header: 'Website', accessor: 'website' },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, item) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            handleEditBrand(item);
                        }, children: "Edit" }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-error", onClick: (e) => {
                            e.stopPropagation();
                            handleDeleteBrand(item.id);
                        }, children: "Delete" })] }))
        }
    ];
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Brands" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Brands are phone manufacturers (e.g., Apple, Samsung) that have multiple models" })] }), _jsx(Button, { onClick: handleCreateBrand, children: "Add Brand" })] }), error && (_jsx("div", { className: "alert alert-error mb-4", children: _jsx("span", { children: error }) })), _jsx(Card, { children: _jsx(Table, { columns: columns, data: ensuredBrands, isLoading: isLoading, onRowClick: handleEditBrand }) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: editingBrand ? 'Edit Brand' : 'Add Brand', footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmit(onSubmit), children: "Save" })] }), children: _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { className: "form-control", children: [_jsxs("label", { className: "label", children: [_jsx("span", { className: "label-text", children: "Brand Name*" }), _jsx("span", { className: "label-text-alt text-info", children: "e.g., Apple, Samsung, Xiaomi" })] }), _jsx("input", { type: "text", className: `input input-bordered ${errors.name ? 'input-error' : ''}`, ...register('name', { required: 'Brand name is required' }), placeholder: "Enter the manufacturer name" }), errors.name && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: errors.name.message }) }))] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Country of Origin" }) }), _jsx("input", { type: "text", className: "input input-bordered", ...register('origin_country') })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Website" }) }), _jsx("input", { type: "url", className: "input input-bordered", ...register('website') })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Description" }) }), _jsx("textarea", { className: "textarea textarea-bordered", rows: 3, ...register('description') })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Logo" }) }), _jsx("input", { type: "file", className: "file-input file-input-bordered w-full", accept: "image/*", ...register('picture') })] })] }) })] }));
};
export default Brands;
