import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, X, ChevronLeft, ChevronRight, Trash2, FileSpreadsheet } from 'lucide-react'; // Import FileSpreadsheet icon
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
const initialInvoices = [
    {
        id: 'INV-2024001',
        wholesaler: 'MedSupply Co. Ltd.',
        createdAt: '2024-08-02T10:30:00Z',
        totalAmount: 1500.75,
        paidAmount: 1500.75,
        status: 'Paid',
        medicines: [
            { name: 'Atorvastatin 10mg', qty: 70, price: 15.00 },
            { name: 'Lisinopril 5mg', qty: 50, price: 9.015 },
        ],
    },
    {
        id: 'INV-2024002',
        wholesaler: 'Global Pharma Distributors',
        createdAt: '2024-08-01T14:00:00Z',
        totalAmount: 2300.00,
        paidAmount: 1000.00,
        status: 'Partial',
        medicines: [
            { name: 'Metformin 500mg', qty: 100, price: 12.00 },
            { name: 'Amlodipine 5mg', qty: 100, price: 11.00 },
        ],
    },
    {
        id: 'INV-2024003',
        wholesaler: 'HealthBridge Wholesalers',
        createdAt: '2024-07-30T09:15:00Z',
        totalAmount: 850.50,
        paidAmount: 0,
        status: 'Unpaid',
        medicines: [
            { name: 'Losartan 50mg', qty: 120, price: 7.0875 },
        ],
    },
    {
        id: 'INV-2024004',
        wholesaler: 'Apex Drug House',
        createdAt: '2024-07-22T17:15:00Z',
        totalAmount: 3200.00,
        paidAmount: 3200.00,
        status: 'Paid',
        medicines: [
            { name: 'Atorvastatin 10mg', qty: 70, price: 20.00 },
            { name: 'Losartan 50mg', qty: 120, price: 10.00 },
            { name: 'Amlodipine 5mg', qty: 90, price: 11.11 },
        ],
    },
    {
        id: 'INV-2024005',
        wholesaler: 'Prime Medical Supplies',
        createdAt: '2024-07-20T11:45:00Z',
        totalAmount: 1100.00,
        paidAmount: 500.00,
        status: 'Partial',
        medicines: [
            { name: 'Simvastatin 20mg', qty: 80, price: 13.75 },
        ],
    },
];

// --- HELPER COMPONENTS ---

// Component for status badges (Paid, Unpaid, Partial)
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
        Paid: "bg-green-100 text-green-800",
        Unpaid: "bg-red-100 text-red-800",
        Partial: "bg-yellow-100 text-yellow-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

// Component for the Invoice Details Modal
const InvoiceDetailsModal = ({ invoice, onClose, onDelete }) => {
    if (!invoice) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Invoice Details</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Detailed information about this invoice.</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Invoice No</p>
                            <p className="font-semibold text-gray-800">{invoice.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Wholesaler</p>
                            <p className="font-semibold text-gray-800">{invoice.wholesaler}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Created At</p>
                            <p className="font-semibold text-gray-800">{formatDate(invoice.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-bold text-lg text-gray-900">₹{invoice.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Paid Amount</p>
                            <p className="font-semibold text-gray-800">₹{invoice.paidAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <StatusBadge status={invoice.status} />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Medicines in this Invoice</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Medicine</th>
                                        <th scope="col" className="px-6 py-3 text-right">Qty</th>
                                        <th scope="col" className="px-6 py-3 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.medicines.map((med, index) => (
                                        <tr key={index} className="bg-white border-b">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {med.name}
                                            </th>
                                            <td className="px-6 py-4 text-right">{med.qty}</td>
                                            <td className="px-6 py-4 text-right">₹{med.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end items-center gap-4 sticky bottom-0 bg-white z-10">
                    <button
                        onClick={() => onDelete(invoice.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={16} />
                        Delete Invoice
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

// --- MAIN APP COMPONENT ---
function Invoice() {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('Recent to Oldest');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    const handleViewDetails = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const handleCloseModal = () => {
        setSelectedInvoice(null);
    };

    const handleDeleteInvoice = (invoiceId) => {
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
        handleCloseModal();
    };

    const handleGoBack = () => {
        navigate('/home/reports');
    };
    
    // Function to handle the Excel export
    const handleExportToExcel = () => {
        console.log('Exporting report to Excel...');
        // In a real application, you would implement the logic here
        // to convert `filteredAndSortedInvoices` data into an Excel file.
    };

    const filteredAndSortedInvoices = useMemo(() => {
        let processedInvoices = [...invoices];

        // Filtering
        if (searchTerm) {
            processedInvoices = processedInvoices.filter(invoice =>
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.wholesaler.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting
        switch (sortOption) {
            case 'Recent to Oldest':
                processedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'Oldest to Recent':
                processedInvoices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'Total Amount Low to High':
                processedInvoices.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            case 'Total Amount High to Low':
                processedInvoices.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            default:
                break;
        }

        return processedInvoices;
    }, [invoices, searchTerm, sortOption]);

    // Pagination Logic
    const totalItems = filteredAndSortedInvoices.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedInvoices = filteredAndSortedInvoices.slice(
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
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 md:p-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-gray-200 mr-4">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Invoice List</h1>
                    </div>
                    {/* Excel Report Button */}
                    <button
                        onClick={handleExportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                    >
                        <FileSpreadsheet size={20} />
                        Excel Report
                    </button>
                </header>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by invoice no or wholesaler..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={sortOption}
                            onChange={(e) => {
                                setSortOption(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Recent to Oldest</option>
                            <option>Oldest to Recent</option>
                            <option>Total Amount Low to High</option>
                            <option>Total Amount High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <thead className="bg-cyan-50 border-b border-cyan-200">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">S.No</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Invoice No</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Wholesaler</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Total Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedInvoices.map((invoice, index) => (
                                    <tr key={invoice.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="p-4 font-medium text-gray-800">{invoice.id}</td>
                                        <td className="p-4 text-gray-600">{invoice.wholesaler}</td>
                                        <td className="p-4 font-semibold text-gray-800">₹{invoice.totalAmount.toFixed(2)}</td>
                                        <td className="p-4"><StatusBadge status={invoice.status} /></td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewDetails(invoice)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
                        <div className="bg-cyan-50 p-4 text-center font-semibold text-cyan-800">Invoice List</div>
                        {paginatedInvoices.map((invoice) => (
                            <div key={invoice.id} className="border-b p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-gray-800">{invoice.id}</p>
                                        <p className="text-gray-600">{invoice.wholesaler}</p>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(invoice)}
                                        className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm"
                                    >
                                        View
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="font-semibold text-gray-800">₹{invoice.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 text-right">Status</p>
                                        <StatusBadge status={invoice.status} />
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
                                className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <InvoiceDetailsModal
                invoice={selectedInvoice}
                onClose={handleCloseModal}
                onDelete={handleDeleteInvoice}
            />
        </div>
    );
}

export default Invoice;