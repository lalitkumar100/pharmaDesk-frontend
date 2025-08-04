import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, X, ChevronLeft, ChevronRight, Trash2, Plus, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BoxLoader from '../../looader/BoxLoader';

// --- MOCK DATA ---
const initialWholesalers = [
    {
        id: 'WHS-101',
        name: 'MedSupply Co. Ltd.',
        gstNo: 'GSTIN12345ABC',
        address: '123 Pharma Lane, Health City, 560001',
        contactNo: '9876543210',
        email: 'contact@medsupply.com',
        stockImport: 750000.00,
        unpaidAmount: 5000.00,
        invoices: [
            { invoiceNo: 'INV-2024001', totalAmount: 1500.75, date: '2024-08-02T10:30:00Z' },
            { invoiceNo: 'INV-2024010', totalAmount: 3200.50, date: '2024-07-25T15:45:00Z' },
        ],
    },
    {
        id: 'WHS-102',
        name: 'Global Pharma Distributors',
        gstNo: 'GSTIN67890DEF',
        address: '456 Wellness Avenue, Medtown, 560002',
        contactNo: '9988776655',
        email: 'info@globalpharma.net',
        stockImport: 1200000.00,
        unpaidAmount: 25000.00,
        invoices: [
            { invoiceNo: 'INV-2024002', totalAmount: 2300.00, date: '2024-08-01T14:00:00Z' },
            { invoiceNo: 'INV-2024012', totalAmount: 15000.00, date: '2024-07-28T11:00:00Z' },
        ],
    },
    {
        id: 'WHS-103',
        name: 'HealthBridge Wholesalers',
        gstNo: 'GSTIN13579GHI',
        address: '789 Care Street, Pharmacy Plaza, 560003',
        contactNo: '9123456789',
        email: 'sales@healthbridge.co',
        stockImport: 450000.00,
        unpaidAmount: 850.50,
        invoices: [
            { invoiceNo: 'INV-2024003', totalAmount: 850.50, date: '2024-07-30T09:15:00Z' },
        ],
    },
    {
        id: 'WHS-104',
        name: 'Apex Drug House',
        gstNo: 'GSTIN24680JKL',
        address: '101 Lifeline Road, Metro Pharma, 560004',
        contactNo: '9000111222',
        email: 'support@apexdrug.com',
        stockImport: 950000.00,
        unpaidAmount: 0.00,
        invoices: [
            { invoiceNo: 'INV-2024004', totalAmount: 3200.00, date: '2024-07-22T17:15:00Z' },
        ],
    },
    {
        id: 'WHS-105',
        name: 'Prime Medical Supplies',
        gstNo: 'GSTIN11223MNO',
        address: '202 Cure Center, Pharma Park, 560005',
        contactNo: '8899776655',
        email: 'info@prime-med.org',
        stockImport: 600000.00,
        unpaidAmount: 6000.00,
        invoices: [
            { invoiceNo: 'INV-2024005', totalAmount: 1100.00, date: '2024-07-20T11:45:00Z' },
        ],
    },
];

// --- HELPER COMPONENTS ---
const WholesalerDetailsModal = ({ wholesaler, onClose, onDelete }) => {
    if (!wholesaler) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-sans">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Wholesaler Details</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Detailed information about this wholesaler.</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">ID</p>
                            <p className="font-semibold text-gray-800">{wholesaler.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Wholesaler Name</p>
                            <p className="font-semibold text-gray-800">{wholesaler.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">GST No</p>
                            <p className="font-semibold text-gray-800">{wholesaler.gstNo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Contact No</p>
                            <p className="font-semibold text-gray-800">{wholesaler.contactNo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="font-semibold text-gray-800">{wholesaler.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-semibold text-gray-800">{wholesaler.address}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Stock Import</p>
                            <p className="font-bold text-lg text-gray-900">₹{wholesaler.stockImport.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Unpaid Amount</p>
                            <p className="font-bold text-lg text-red-600">₹{wholesaler.unpaidAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoices from this Wholesaler</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-theme-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Invoice No</th>
                                        <th scope="col" className="px-6 py-3 text-right">Total Amount</th>
                                        <th scope="col" className="px-6 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wholesaler.invoices.map((invoice, index) => (
                                        <tr key={index} className="bg-white border-b">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {invoice.invoiceNo}
                                            </th>
                                            <td className="px-6 py-4 text-right">₹{invoice.totalAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">{formatDate(invoice.date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end items-center gap-4 sticky bottom-0 bg-white z-10">
                    <button
                        onClick={() => onDelete(wholesaler.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={16} />
                        Delete Wholesaler
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddWholesalerModal = ({ isOpen, onClose, onAddWholesaler }) => {
    const [formData, setFormData] = useState({
        name: '',
        gstNo: '',
        address: '',
        contactNo: '',
        email: '',
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddWholesaler(formData);
        setFormData({
            name: '',
            gstNo: '',
            address: '',
            contactNo: '',
            email: '',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto font-sans">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Add New Wholesaler</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">GST No</label>
                        <input
                            type="text"
                            name="gstNo"
                            value={formData.gstNo}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact No</label>
                        <input
                            type="tel"
                            name="contactNo"
                            value={formData.contactNo}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-xl"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors"
                        >
                            Add Wholesaler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
function Wholesaler() {
    const [wholesalers, setWholesalers] = useState(initialWholesalers);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('Stock Import High to Low');
    const [selectedWholesaler, setSelectedWholesaler] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    const handleViewDetails = (wholesaler) => {
        setSelectedWholesaler(wholesaler);
    };

    const handleCloseModal = () => {
        setSelectedWholesaler(null);
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleAddWholesaler = (newWholesaler) => {
        // Simulate a network request
        setIsLoading(true);
        setTimeout(() => {
            const newId = `WHS-${Math.floor(Math.random() * 1000)}`;
            setWholesalers(prev => [{ ...newWholesaler, id: newId, stockImport: 0, unpaidAmount: 0, invoices: [] }, ...prev]);
            setIsLoading(false);
            alert('Wholesaler added successfully!');
        }, 1000);
    };

    const handleDeleteWholesaler = (wholesalerId) => {
        if (window.confirm('Are you sure you want to delete this wholesaler?')) {
            setIsLoading(true);
            setTimeout(() => {
                setWholesalers(prev => prev.filter(whs => whs.id !== wholesalerId));
                setIsLoading(false);
                handleCloseModal();
            }, 500);
        }
    };

    const handleGoBack = () => {
        navigate('/home/reports');
    };

    const handleExport = () => {
        alert('Export to Excel functionality coming soon!');
        // Implement your export logic here, e.g., using a library like 'xlsx'
    };

    const filteredAndSortedWholesalers = useMemo(() => {
        let processedWholesalers = [...wholesalers];

        if (searchTerm) {
            processedWholesalers = processedWholesalers.filter(wholesaler =>
                wholesaler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wholesaler.gstNo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortOption) {
            case 'Stock Import High to Low':
                processedWholesalers.sort((a, b) => b.stockImport - a.stockImport);
                break;
            case 'Stock Import Low to High':
                processedWholesalers.sort((a, b) => a.stockImport - b.stockImport);
                break;
            case 'Unpaid Amount High to Low':
                processedWholesalers.sort((a, b) => b.unpaidAmount - a.unpaidAmount);
                break;
            case 'Unpaid Amount Low to High':
                processedWholesalers.sort((a, b) => a.unpaidAmount - b.unpaidAmount);
                break;
            default:
                break;
        }

        return processedWholesalers;
    }, [wholesalers, searchTerm, sortOption]);

    const totalItems = filteredAndSortedWholesalers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedWholesalers = filteredAndSortedWholesalers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="bg-theme-70 min-h-screen overflow-y-auto font-sans">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
                    <BoxLoader />
                </div>
            )}
            <div className={`container mx-auto p-4 md:p-8 ${isLoading ? 'blur-sm' : ''}`}>
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-gray-200">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Wholesalers</h1>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <button
                            onClick={handleExport}
                            className="w-full md:w-auto flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <FileSpreadsheet size={20} />
                            Export to Excel
                        </button>
                        <button
                            onClick={handleOpenAddModal}
                            className="w-full md:w-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add Wholesaler
                        </button>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by wholesaler name or GST no..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={sortOption}
                            onChange={(e) => {
                                setSortOption(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-theme-500"
                        >
                            <option>Stock Import High to Low</option>
                            <option>Stock Import Low to High</option>
                            <option>Unpaid Amount High to Low</option>
                            <option>Unpaid Amount Low to High</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <thead className="bg-theme-200 border-b border-theme-200">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">S.No</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Wholesaler Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">GST No</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Stock Import</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Unpaid Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedWholesalers.map((wholesaler, index) => (
                                    <tr key={wholesaler.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="p-4 font-medium text-gray-800">{wholesaler.name}</td>
                                        <td className="p-4 text-gray-600">{wholesaler.gstNo}</td>
                                        <td className="p-4 font-semibold text-gray-800">₹{wholesaler.stockImport.toLocaleString('en-IN')}</td>
                                        <td className="p-4 font-semibold text-red-600">₹{wholesaler.unpaidAmount.toLocaleString('en-IN')}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewDetails(wholesaler)}
                                                className="bg-theme-500 text-white px-4 py-2 rounded-lg hover:bg-theme-600 transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        <div className="bg-theme-50 p-4 text-center font-semibold text-theme-800">Wholesaler List</div>
                        {paginatedWholesalers.map((wholesaler) => (
                            <div key={wholesaler.id} className="border-b last:border-b-0 p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-gray-800">{wholesaler.name}</p>
                                        <p className="text-gray-600 text-sm">GST No: {wholesaler.gstNo}</p>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(wholesaler)}
                                        className="bg-theme-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-theme-700 transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Stock Import</p>
                                        <p className="font-semibold text-gray-800">₹{wholesaler.stockImport.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 text-right">Unpaid</p>
                                        <p className="font-semibold text-red-600">₹{wholesaler.unpaidAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white border-t">
                        <p className="text-sm text-gray-600 mb-2 md:mb-0">
                            Page {currentPage} of {totalPages} ({totalItems} total items)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-theme-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-theme-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <WholesalerDetailsModal
                wholesaler={selectedWholesaler}
                onClose={handleCloseModal}
                onDelete={handleDeleteWholesaler}
            />
            <AddWholesalerModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onAddWholesaler={handleAddWholesaler}
            />
        </div>
    );
}

export default Wholesaler;