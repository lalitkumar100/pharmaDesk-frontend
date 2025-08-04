import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, X, ChevronLeft, ChevronRight, Trash2, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BoxLoader from '../../looader/BoxLoader';

// IMPORTANT: Replace with your actual API base URL and Bearer token
import BASE_URL from '../../../config'; // adjust path if file is deeper

const BEARER_TOKEN =localStorage.getItem('lalitkumar_choudhary'); 

// This is a simple mock loader component that fulfills the user's request

// This is a simple modal for displaying sale details
const SalesDetailsModal = ({ sale, onClose }) => {
    if (!sale) return null;

    // Mapping API fields to display names
    const saleDetails = [
        { label: 'Sale No', value: sale.sale_no },
        { label: 'Sale Date', value: new Date(sale.sale_date).toLocaleString() },
        { label: 'Customer Name', value: sale.customer_name || 'N/A' },
        { label: 'Contact Number', value: sale.contact_number || 'N/A' },
        { label: 'Employee Name', value: sale.employee_name },
        { label: 'Payment Method', value: sale.payment_method },
        { label: 'Total Amount', value: `₹${parseFloat(sale.total_amount).toLocaleString('en-IN')}` },
        { label: 'Profit', value: `₹${parseFloat(sale.profit).toLocaleString('en-IN')}` }
    ];

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
                    {saleDetails.map((item, index) => (
                        <div key={index}>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="font-semibold text-gray-800">{item.value}</p>
                        </div>
                    ))}
                </div>
                {sale.sale_items && sale.sale_items.length > 0 && (
                    <div className="p-6 border-t">
                        <h3 className="text-lg font-semibold mb-4">Sale Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 min-w-[500px]">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2">Medicine Name</th>
                                        <th className="px-4 py-2 text-right">Rate</th>
                                        <th className="px-4 py-2 text-right">Quantity</th>
                                        <th className="px-4 py-2 text-right">Purchase Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.sale_items.map((item, idx) => (
                                        <tr key={idx} className="bg-white border-b last:border-b-0">
                                            <td className="px-4 py-2 font-medium text-gray-900">{item.medicine_name}</td>
                                            <td className="px-4 py-2 text-right">₹{item.rate}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">₹{item.purchase_price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <div className="p-6 border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

const paymentBadgeColor = {
    Cash: 'bg-yellow-100 text-yellow-800',
    'UPI': 'bg-blue-100 text-blue-700',
    'Card': 'bg-green-100 text-green-700',
    'Credit Card': 'bg-green-100 text-green-700'
};

function SalesPage() {
    const [sales, setSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('Recent Sales');
    const [selectedSale, setSelectedSale] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    // Axios client instance with authorization header
    const api = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    });

    // Function to fetch all sales data
    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/sales');
            if (response.data && response.data.status === 'success') {
                // Assuming the API provides a sale_id or similar unique key
                const formattedSales = response.data.data.map((sale, index) => ({
                    ...sale,
                    // The mock data doesn't have sale_id, so we'll use a sequential ID for a unique key
                    sale_id: index + 1,
                }));
                setSales(formattedSales);
            }
        } catch (error) {
            console.error('Failed to fetch sales data:', error);
            // Handle error, e.g., show a toast message
        } finally {
            setLoading(false);
        }
    };

    // Use a useEffect hook to fetch data on component mount
    useEffect(() => {
        fetchSales();
    }, []);

    // Function to handle the Excel report download
    const handleExcelReport = async () => {
        setLoading(true);
        try {
            // The API response for this is likely a file, we won't process it here
            await api.get('/admin/export/excel?table=sales', {
                responseType: 'blob' // Important for handling binary data like files
            });
            // You can optionally create a URL and download the file here
            // const url = window.URL.createObjectURL(new Blob([response.data]));
            // const link = document.createElement('a');
            // link.href = url;
            // link.setAttribute('download', 'sales_report.xlsx');
            // document.body.appendChild(link);
            // link.click();
            console.log('Excel report requested successfully.');
        } catch (error) {
            console.error('Failed to export sales to Excel:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch a single sale's details and open the modal
    const handleViewSale = async (saleId) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/sales/${saleId}`);
            if (response.data && response.data.status === 'success') {
                setSelectedSale(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch sale details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the deletion of a sale
    const handleDeleteSale = async (saleId) => {
        if (!window.confirm("Are you sure you want to delete this sale?")) {
            return;
        }
        setLoading(true);
        try {
            await api.delete(`/admin/sales/${saleId}`);
            console.log(`Sale with ID ${saleId} deleted successfully.`);
            // After successful deletion, refresh the sales list
            await fetchSales();
        } catch (error) {
            console.error('Failed to delete sale:', error);
        } finally {
            setLoading(false);
        }
    };

    // Memoized filtering and sorting logic
    const filteredSales = useMemo(() => {
        let data = [...sales];
        if (searchTerm) {
            data = data.filter(s =>
                s.sale_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        switch (sortOption) {
            case 'Recent Sales': return data.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
            case 'Old Sales': return data.sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));
            case 'High Sales': return data.sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount));
            case 'Low Sales': return data.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
            default: return data;
        }
    }, [sales, searchTerm, sortOption]);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-gray-100 min-h-screen p-4 font-sans">
            {/* Conditional loader rendering */}
            {loading && <BoxLoader />}

            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/home/reports')} className="p-2 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
                </div>
                <button
                    onClick={handleExcelReport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
                >
                    <FileSpreadsheet size={20} />
                    Export Excel Report
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by sale no or employee name..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700"
                >
                    <option>Recent Sales</option>
                    <option>Old Sales</option>
                    <option>High Sales</option>
                    <option>Low Sales</option>
                </select>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">S.No</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Sale No</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Employee Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Total Amount</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Payment Method</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSales.length > 0 ? (
                                paginatedSales.map((sale, index) => (
                                    <tr key={sale.sale_no} className="border-b last:border-b-0 hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="p-4 font-medium text-gray-800">{sale.sale_no}</td>
                                        <td className="p-4 text-gray-600">{sale.employee_name}</td>
                                        <td className="p-4 font-semibold text-gray-800">₹{parseFloat(sale.total_amount).toLocaleString('en-IN')}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${paymentBadgeColor[sale.payment_method]}`}>{sale.payment_method}</span>
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            <button onClick={() => handleViewSale(sale.sale_id)} className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition-colors">View</button>
                                            <button onClick={() => handleDeleteSale(sale.sale_id)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-gray-500">No sales found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="flex justify-between items-center p-4 border-t">
                    <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100">
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <SalesDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
        </div>
    );
}

export default SalesPage;
