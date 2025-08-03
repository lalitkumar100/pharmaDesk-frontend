import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Filter, X, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import BoxLoader from './BoxLoader';

// --- API Configuration ---
const BASE_URL = 'http://localhost:4000';
const BEARER_TOKEN = localStorage.getItem("token") || "";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

// --- Helper Functions ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const isExpired = (expiryDateString) => {
    const expiryDate = new Date(expiryDateString);
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    // Return a status string: 'expired', 'near', or 'ok'
    if (expiryDate < now) {
        return 'expired';
    } else if (expiryDate < threeMonthsFromNow) {
        return 'near';
    }
    return 'ok';
};


const sortData = (data, sortOption) => {
    const sorted = [...data];
    switch (sortOption) {
        case 'A-Z':
            return sorted.sort((a, b) => a.medicine_name.localeCompare(b.medicine_name));
        case 'Z-A':
            return sorted.sort((a, b) => b.medicine_name.localeCompare(a.medicine_name));
        case 'Price High to Low':
            return sorted.sort((a, b) => parseFloat(b.mrp) - parseFloat(a.mrp));
        case 'Price Low to High':
            return sorted.sort((a, b) => parseFloat(a.mrp) - parseFloat(b.mrp));
        case 'Quantity High to Low':
            return sorted.sort((a, b) => b.quantity - a.quantity);
        case 'Quantity Low to High':
            return sorted.sort((a, b) => a.quantity - b.quantity);
        case 'Near to Expiry':
            return sorted.sort((a, b) => {
                const dateA = new Date(a.expiry_date);
                const dateB = new Date(b.expiry_date);
                return dateA.getTime() - dateB.getTime();
            });
        default:
            return data;
    }
};

// --- Dropdown Components (Kept as is) ---
const SortDropdown = ({ sortOption, setSortOption }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
        'A-Z', 'Z-A', 'Price Low to High', 'Price High to Low',
        'Quantity Low to High', 'Quantity High to Low', 'Near to Expiry',
    ];
    const handleSelect = (option) => {
        setSortOption(option);
        setIsOpen(false);
    };
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
                <span className="hidden md:inline">{sortOption}</span>
                <ChevronDown className="h-4 w-4" />
            </button>
            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-900">Sort by</div>
                        <hr className="my-1 border-gray-100" />
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchDropdown = ({ searchField, setSearchField }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
        { label: 'Medicine', value: 'medicine_name' },
        { label: 'Wholesaler', value: 'wholesaler' },
        { label: 'Invoice No', value: 'invoice_no' },
        { label: 'Batch No', value: 'batch_no' },
    ];
    const handleSelect = (option) => {
        setSearchField(option.value);
        setIsOpen(false);
    };
    const currentLabel = options.find(opt => opt.value === searchField)?.label || 'Search Field';
    return (
        <div className="relative w-full max-w-[120px] md:max-w-[150px]">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between space-x-2 rounded-l-full border border-gray-300 bg-gray-100 py-2 pl-4 pr-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
                <span>{currentLabel}</span>
                <ChevronDown className="h-4 w-4" />
            </button>
            {isOpen && (
                <div className="absolute left-0 z-20 mt-1 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Modal Component (Kept as is) ---
const MedicineModal = ({ isOpen, onClose, medicine, onUpdate, onDelete, setLoading }) => {
    const [formData, setFormData] = useState(medicine || {});
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (medicine) {
            setFormData(medicine);
            setMessage('');
            setIsEditing(false); // Reset editing state when modal opens
        }
    }, [medicine]);

    if (!isOpen || !medicine) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        // First click: Enable editing
        if (!isEditing) {
            setIsEditing(true);
            setMessage('You can now edit the form. Click "Confirm Update" to save.');
            return;
        }

        // Second click: Send PUT request
        setLoading(true);
        try {
            const updatedData = { ...formData };
            delete updatedData.created_at;
            delete updatedData.id;
            console.log(medicine.id);

            const response = await api.put(`/admin/medicine_stock/${medicine.id}`, updatedData);
            onUpdate(response.data);
            setMessage('Update successful!');
        } catch (err) {
            setMessage('Failed to update.');
            console.error('Update error:', err);
        } finally {
            setLoading(false);
            setIsEditing(false); // Reset after request
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        setLoading(true);
        try {
            await api.delete(`/admin/medicine_stock/${medicine.id}`);
            onDelete(medicine.id);
            setMessage('Deletion successful!');
        } catch (err) {
            setMessage('Failed to delete.');
            console.error('Delete error:', err);
        } finally {
            setLoading(false);
            setIsEditing(false);
        }
    };

    const formFields = Object.keys(formData).filter(key => key !== 'created_at');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-bold">Update Medicine Stock</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>
                <form className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
                    {formFields.map((key) => {
                        const isNonEditable = key === 'id'; // Keep id non-editable
                        const isDate = key.includes('date');
                        return (
                            <div key={key}>
                                <label className="font-semibold">{key.replace(/_/g, ' ')}</label>
                                <input
                                    type={isDate ? 'date' : 'text'}
                                    name={key}
                                    value={isDate ? (formData[key] ? new Date(formData[key]).toISOString().split('T')[0] : '') : formData[key] || ''}
                                    onChange={isNonEditable ? null : handleChange}
                                    className={`w-full rounded-md border border-gray-300 p-2 ${isNonEditable || !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-blue-500 focus:outline-none'}`}
                                    disabled={isNonEditable || !isEditing}
                                />
                            </div>
                        );
                    })}
                </form>
                {message && (
                    <div className={`mt-4 text-center font-semibold ${message.includes('successful') ? 'text-green-600' : message.includes('edit') ? 'text-blue-600' : 'text-red-600'}`}>
                        <p>{message}</p>
                    </div>
                )}
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        onClick={handleDelete}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                        Delete
                    </button>
                    <button
                        onClick={handleUpdate}
                        className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors 
                            ${isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isEditing ? 'Confirm Update' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function Expiry() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('medicine_name');
    const [sortOption, setSortOption] = useState('Near to Expiry'); // Changed initial sort
    const [viewMode, setViewMode] = useState('table');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [medicineData, setMedicineData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExpired, setShowExpired] = useState(false); // New state to filter by expiry

    const fetchMedicineData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/medicine_stock');
            setMedicineData(response.data.rows);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error('API fetch error:', err);
            setMedicineData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicineData();
    }, []);

    const handleUpdate = (updatedMedicine) => {
        setMedicineData((prevData) =>
            prevData.map((med) => (med.id === updatedMedicine.id ? updatedMedicine : med))
        );
        setSelectedMedicine(updatedMedicine);
    };

    const handleDelete = (deletedId) => {
        setMedicineData((prevData) => prevData.filter((med) => med.id !== deletedId));
        setIsModalOpen(false);
    };

    // Filter logic now includes the showExpired toggle
    const filteredData = medicineData.filter(medicine => {
        const value = medicine[searchField];
        const matchesSearchTerm = value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());

        if (showExpired) {
            return matchesSearchTerm && (isExpired(medicine.expiry_date) === 'expired' || isExpired(medicine.expiry_date) === 'near');
        }
        return matchesSearchTerm;
    });


    const sortedData = sortData(filteredData, sortOption);
    const itemsPerPage = 4;
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleViewDetails = (medicine) => {
        setSelectedMedicine(medicine);
        setIsModalOpen(true);
    };

    const getPlaceholder = () => {
        switch (searchField) {
            case 'wholesaler': return 'Search by wholesaler...';
            case 'invoice_no': return 'Search by invoice number...';
            case 'batch_no': return 'Search by batch number...';
            case 'medicine_name': default: return 'Search by medicine name...';
        }
    };

    const handleExportToCSV = () => {
        if (sortedData.length === 0) {
            alert('No data to export.');
            return;
        }

        const headers = [
            "S.No",
            "Wholesaler",
            "Medicine Name",
            "Brand",
            "Batch No",
            "Invoice No",
            "Purchase Date",
            "MRP",
            "Rate",
            "Quantity",
            "Expiry Date"
        ].join(',');

        const rows = sortedData.map((item, index) =>
            [
                index + 1,
                item.wholesaler,
                `"${item.medicine_name.replace(/"/g, '""')}"`, // Handle quotes in medicine names
                `"${item.brand.replace(/"/g, '""')}"`,
                item.batch_no,
                item.invoice_no,
                formatDate(item.purchase_date),
                item.mrp,
                item.rate,
                item.quantity,
                formatDate(item.expiry_date),
            ].join(',')
        );

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'expiry_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 antialiased">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
                    <BoxLoader />
                </div>
            )}

            <div className={`container mx-auto px-4 py-8 md:px-6 lg:px-8 ${isLoading ? 'blur-sm' : ''}`}>
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Go back icon */}
                        <button
                            onClick={() => window.history.back()}
                            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-200"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        {/* Heading */}
                        <h1 className="text-3xl font-bold text-gray-900">Expiry Reports</h1>
                    </div>
                    <button
                        onClick={handleExportToCSV}
                        className="flex items-center space-x-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-orange-600"
                    >
                        <FileSpreadsheet size={20} />
                        <span>Excel Report</span>
                    </button>
                </div>

                <header className="flex flex-col items-center space-y-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:space-y-0 md:space-x-4 md:p-6">
                    {/* Search Dropdown - A separate, full-width element on mobile */}
                    <div className="w-full md:w-auto">
                        <SearchDropdown searchField={searchField} setSearchField={setSearchField} />
                    </div>

                    {/* Search Input - A full-width element with the search icon inside */}
                    <div className="relative w-full flex-grow md:max-w-md">
                        <input
                            type="text"
                            placeholder={getPlaceholder()}
                            className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400" size={18} />
                    </div>

                    {/* Control Buttons - Align to the right on desktop, spaced out on mobile */}
                    <div className="flex w-full justify-between space-x-4 md:w-auto md:justify-end">
                        <button
                            onClick={() => setShowExpired(!showExpired)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${showExpired ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            title="Show only expiring medicines"
                        >
                            {showExpired ? 'Show All' : 'Show Expiring'}
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                            className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200"
                            title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                        <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
                    </div>
                </header>

                <main className="mt-8">
                    <h2 className="mb-4 text-center text-2xl font-bold text-blue-600">
                        {showExpired ? 'Expiring Medicines' : 'Medicine List'}
                    </h2>
                    {error ? (
                        <div className="text-center text-lg text-red-500">{error}</div>
                    ) : (
                        <>
                            {viewMode === 'table' ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">S.No</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">Wholesaler</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">Medicine</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">Brand</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">Batch</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">Quantity</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">Expiry</th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium">MRP</th>
                                                <th scope="col" className="px-4 py-3 text-center font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((medicine, index) => {
                                                    const expiryStatus = isExpired(medicine.expiry_date);
                                                    const rowClass = expiryStatus === 'expired' ? 'bg-red-50' : expiryStatus === 'near' ? 'bg-yellow-50' : '';
                                                    return (
                                                        <tr key={medicine.id} className={`text-sm ${rowClass}`}>
                                                            <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">{startIndex + index + 1}</td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.wholesaler}</td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.medicine_name}</td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.brand}</td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.batch_no}</td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${medicine.quantity < 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                    {medicine.quantity}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4 font-semibold">
                                                                <span className={expiryStatus === 'expired' ? 'text-red-600' : expiryStatus === 'near' ? 'text-yellow-600' : 'text-gray-700'}>
                                                                    {formatDate(medicine.expiry_date)}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">₹{parseFloat(medicine.mrp).toFixed(2)}</td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                                <button
                                                                    onClick={() => handleViewDetails(medicine)}
                                                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="px-4 py-4 text-center text-gray-500">No medicines found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((medicine) => {
                                            const expiryStatus = isExpired(medicine.expiry_date);
                                            const cardClass = expiryStatus === 'expired' ? 'border-red-300 bg-red-50' : expiryStatus === 'near' ? 'border-yellow-300 bg-yellow-50' : '';
                                            return (
                                                <div key={medicine.id} className={`flex items-center rounded-xl border p-4 shadow-sm ${cardClass}`}>
                                                    <div className="flex-grow">
                                                        <h3 className="text-lg font-semibold text-gray-900">{medicine.medicine_name}</h3>
                                                        <p className="text-sm text-gray-500">{medicine.brand}</p>
                                                        <p className="text-sm text-gray-500">Wholesaler: {medicine.wholesaler}</p>
                                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                                            <p>
                                                                <span className="font-medium">Batch:</span> {medicine.batch_no}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Quantity:</span>{' '}
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${medicine.quantity < 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                    {medicine.quantity}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto text-right">
                                                        <p className="text-lg font-bold text-gray-900">₹{parseFloat(medicine.mrp).toFixed(2)}</p>
                                                        <p className="text-sm">
                                                            Expiry:{' '}
                                                            <span className={`font-semibold ${expiryStatus === 'expired' ? 'text-red-600' : expiryStatus === 'near' ? 'text-yellow-600' : 'text-gray-700'}`}>
                                                                {formatDate(medicine.expiry_date)}
                                                            </span>
                                                        </p>
                                                        <button
                                                            onClick={() => handleViewDetails(medicine)}
                                                            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-center text-gray-500">No medicines found.</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>

                <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Prev
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span> ({totalItems} total items)
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, pageIndex) => (
                                    <button
                                        key={pageIndex}
                                        onClick={() => handlePageChange(pageIndex + 1)}
                                        aria-current={currentPage === pageIndex + 1 ? 'page' : undefined}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${currentPage === pageIndex + 1 ? 'z-10 bg-blue-600 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {pageIndex + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <MedicineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                medicine={selectedMedicine}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                setLoading={setIsLoading} // Pass the global loading state setter
            />
        </div>
    );
}