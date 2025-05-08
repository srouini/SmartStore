import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import modelService from '../api/modelService';
import brandService from '../api/brandService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';
const Models = () => {
    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);
    // Ensure arrays are always arrays
    const ensuredBrands = Array.isArray(brands) ? brands : [];
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [error, setError] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    // Fetch models and brands on component mount
    useEffect(() => {
        fetchModels();
        fetchBrands();
    }, []);
    // Fetch models filtered by brand if selectedBrand changes
    useEffect(() => {
        if (selectedBrand) {
            fetchModelsByBrand(selectedBrand);
        }
        else {
            fetchModels();
        }
    }, [selectedBrand]);
    const fetchModels = async () => {
        try {
            setIsLoading(true);
            const data = await modelService.getAllModels();
            setModels(data);
            setError(null);
        }
        catch (err) {
            console.error('Error fetching models:', err);
            setError('Failed to load models. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchModelsByBrand = async (brandId) => {
        try {
            setIsLoading(true);
            const data = await modelService.getModelsByBrand(brandId);
            setModels(data);
            setError(null);
        }
        catch (err) {
            console.error('Error fetching models by brand:', err);
            setError('Failed to load models. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchBrands = async () => {
        try {
            const data = await brandService.getAllBrands();
            setBrands(data);
        }
        catch (err) {
            console.error('Error fetching brands:', err);
        }
    };
    const handleCreateModel = () => {
        setEditingModel(null);
        reset({
            name: '',
            brand: selectedBrand || undefined,
            description: '',
            release_date: ''
        });
        setIsModalOpen(true);
    };
    const handleEditModel = (model) => {
        setEditingModel(model);
        reset({
            name: model.name,
            brand: model.brand,
            description: model.description || '',
            release_date: model.release_date ? model.release_date.split('T')[0] : ''
        });
        setIsModalOpen(true);
    };
    const handleDeleteModel = async (id) => {
        if (!window.confirm('Are you sure you want to delete this model?'))
            return;
        try {
            await modelService.deleteModel(id);
            setModels(models.filter(model => model.id !== id));
        }
        catch (err) {
            console.error('Error deleting model:', err);
            setError('Failed to delete model. Please try again.');
        }
    };
    const onSubmit = async (data) => {
        try {
            if (editingModel) {
                await modelService.updateModel(editingModel.id, data);
            }
            else {
                await modelService.createModel(data);
            }
            setIsModalOpen(false);
            if (selectedBrand) {
                fetchModelsByBrand(selectedBrand);
            }
            else {
                fetchModels();
            }
        }
        catch (err) {
            console.error('Error saving model:', err);
            setError('Failed to save model. Please try again.');
        }
    };
    const handleBrandChange = (e) => {
        const value = e.target.value;
        setSelectedBrand(value ? parseInt(value) : null);
    };
    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Brand', accessor: 'brand_name' },
        {
            header: 'Release Date',
            accessor: 'release_date',
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        },
        { header: 'Description', accessor: 'description' },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, item) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            handleEditModel(item);
                        }, children: "Edit" }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-error", onClick: (e) => {
                            e.stopPropagation();
                            handleDeleteModel(item.id);
                        }, children: "Delete" })] }))
        }
    ];
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Phone Models" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Models represent specific product lines (e.g., iPhone 14, Galaxy S23) under a brand" })] }), _jsx(Button, { onClick: handleCreateModel, children: "Add Model" })] }), error && (_jsx("div", { className: "alert alert-error mb-4", children: _jsx("span", { children: error }) })), _jsx("div", { className: "mb-4", children: _jsxs("div", { className: "form-control w-full max-w-xs", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Filter by Brand" }) }), _jsxs("select", { className: "select select-bordered", value: selectedBrand || '', onChange: handleBrandChange, children: [_jsx("option", { value: "", children: "All Brands" }), ensuredBrands.map(brand => (_jsx("option", { value: brand.id, children: brand.name }, brand.id)))] })] }) }), _jsx(Card, { children: _jsx(Table, { columns: columns, data: models, isLoading: isLoading, onRowClick: handleEditModel }) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: editingModel ? 'Edit Model' : 'Add Model', footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmit(onSubmit), children: "Save" })] }), children: _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Brand*" }) }), _jsxs("select", { className: `select select-bordered ${errors.brand ? 'select-error' : ''}`, ...register('brand', { required: 'Brand is required' }), children: [_jsx("option", { value: "", children: "Select a brand" }), ensuredBrands.map(brand => (_jsx("option", { value: brand.id, children: brand.name }, brand.id)))] }), errors.brand && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: errors.brand.message }) }))] }), _jsxs("div", { className: "form-control", children: [_jsxs("label", { className: "label", children: [_jsx("span", { className: "label-text", children: "Model Name*" }), _jsx("span", { className: "label-text-alt text-info", children: "e.g., iPhone 14, Galaxy S23" })] }), _jsx("input", { type: "text", className: `input input-bordered ${errors.name ? 'input-error' : ''}`, ...register('name', { required: 'Model name is required' }), placeholder: "Enter the model name without variant details" }), errors.name && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: errors.name.message }) }))] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Release Date" }) }), _jsx("input", { type: "date", className: "input input-bordered", ...register('release_date') })] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Description" }) }), _jsx("textarea", { className: "textarea textarea-bordered", rows: 3, ...register('description') })] })] }) })] }));
};
export default Models;
