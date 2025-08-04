import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, X, ChevronLeft, ChevronRight, Trash2, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialSales = [
    {
        id: 'SAL-1001',
        customer: 'John Doe',
        saleNo: 'SALE001',
        contactNo: '9876543210',
        employee: 'Amit Sharma',
        totalAmount: 2300,
        paymentMode: 'UPI',
        medicines: [
            { name: 'Paracetamol', batch: 'B101', rate: 15, quantity: 20 },
            { name: 'Ibuprofen', batch: 'B102', rate: 25, quantity: 10 }
        ]
    },
    {
        id: 'SAL-1002',
        customer: 'Anjali Mehta',
        saleNo: 'SALE002',
        contactNo: '9988776655',
        employee: 'Raj Verma',
        totalAmount: 1500,
        paymentMode: 'Cash',
        medicines: [
            { name: 'Cetrizine', batch: 'B201', rate: 10, quantity: 30 }
        ]
    }
];

const paymentBadgeColor = {
    UPI: 'bg-green-100 text-green-700',
    Cash: 'bg-yellow-100 text-yellow-800',
    'Credit Card': 'bg-blue-100 text-blue-700'
};

const SalesDetailsModal = ({ sale, onClose }) => {
    if (!sale) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-sans">
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Sale Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><p className="text-sm text-gray-500">Sale ID</p><p className="font-semibold text-gray-800">{sale.id}</p></div>
                    <div><p className="text-sm text-gray-500">Customer Name</p><p className="font-semibold text-gray-800">{sale.customer}</p></div>
                    <div><p className="text-sm text-gray-500">Sale No</p><p className="font-semibold text-gray-800">{sale.saleNo}</p></div>
                    <div><p className="text-sm text-gray-500">Contact No</p><p className="font-semibold text-gray-800">{sale.contactNo}</p></div>
                    <div><p className="text-sm text-gray-500">Employee Name</p><p className="font-semibold text-gray-800">{sale.employee}</p></div>
                    <div><p className="text-sm text-gray-500">Total Amount</p><p className="font-bold text-lg text-gray-900">₹{sale.totalAmount.toLocaleString('en-IN')}</p></div>
                    <div><p className="text-sm text-gray-500">Payment Mode</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${paymentBadgeColor[sale.paymentMode]}`}>{sale.paymentMode}</span></div>
                </div>
                <div className="p-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Medicines</h3>
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-2">Medicine (Batch)</th>
                                <th className="px-4 py-2 text-right">Rate</th>
                                <th className="px-4 py-2 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.medicines.map((med, idx) => (
                                <tr key={idx} className="bg-white border-b">
                                    <td className="px-4 py-2 font-medium text-gray-900">{med.name} ({med.batch})</td>
                                    <td className="px-4 py-2 text-right">₹{med.rate}</td>
                                    <td className="px-4 py-2 text-right">{med.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

function SalesPage() {
    const [sales, setSales] = useState(initialSales);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('Recent Sales');
    const [selectedSale, setSelectedSale] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const filteredSales = useMemo(() => {
        let data = [...sales];
        if (searchTerm) {
            data = data.filter(s =>
                s.saleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.customer.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        switch (sortOption) {
            case 'Recent Sales': return data.reverse();
            case 'Old Sales': return data;
            case 'High Sales': return data.sort((a, b) => b.totalAmount - a.totalAmount);
            case 'Low Sales': return data.sort((a, b) => a.totalAmount - b.totalAmount);
            default: return data;
        }
    }, [sales, searchTerm, sortOption]);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-theme-70 min-h-screen p-4 font-sans">
            <div className="mb-6 flex items-center gap-2">
                <button onClick={() => navigate('/home/reports')} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by sale no or customer name..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
                    />
                </div>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2.5"
                >
                    <option>Recent Sales</option>
                    <option>Old Sales</option>
                    <option>High Sales</option>
                    <option>Low Sales</option>
                </select>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-theme-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600">S.No</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Customer Name</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Sale No</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Total Amount</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Payment Mode</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSales.map((sale, index) => (
                            <tr key={sale.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="p-4 text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td className="p-4 font-medium text-gray-800">{sale.customer}</td>
                                <td className="p-4 text-gray-600">{sale.saleNo}</td>
                                <td className="p-4 font-semibold text-gray-800">₹{sale.totalAmount.toLocaleString('en-IN')}</td>
                                <td className="p-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${paymentBadgeColor[sale.paymentMode]}`}>{sale.paymentMode}</span>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => setSelectedSale(sale)} className="bg-theme-500 text-white px-4 py-2 rounded-lg hover:bg-theme-600">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center p-4 border-t">
                    <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 border rounded-lg disabled:opacity-50"> <ChevronLeft size={16} /> Prev </button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 border rounded-lg disabled:opacity-50"> Next <ChevronRight size={16} /> </button>
                    </div>
                </div>
            </div>
            <SalesDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
        </div>
    );
}

export default SalesPage;
