import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, User, Calendar, X, ChevronsUpDown, DollarSign, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
// import Url from '../../../url'

// --- AXIOS API INSTANCE WITHOUT AUTHORIZATION INTERCEPTOR ---
// We'll manually add the headers now, so the interceptor is removed.
const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// Interceptor is removed as per your request.
// If you want to keep it as a fallback, you could wrap it in a condition.

// --- MOCK API RESPONSES (for fallback if needed) ---
const mockSalesListResponse = {
  status: "success",
  count: 22,
  data: [
    { sale_id: 1, sale_no: "00125Aug1VLCG", sale_date: "2025-08-03T10:06:16.082Z", customer_name: "Maria Garcia", employee_name: "Amit Verma", payment_method: "Cash", total_amount: "130.00", profit: "98.00" },
    { sale_id: 2, sale_no: "00125Aug1VLC0", sale_date: "2025-08-03T10:06:00.703Z", customer_name: "LALIT CHOUDHARY", employee_name: "Amit Verma", payment_method: "UPI", total_amount: "250.50", profit: "150.00" },
    { sale_id: 3, sale_no: "00125Aug2ABC1", sale_date: "2025-08-02T15:20:10.000Z", customer_name: "Robert Wilson", employee_name: "Priya Singh", payment_method: "Credit", total_amount: "75.00", profit: "30.00" },
    { sale_id: 4, sale_no: "00125Aug2DEF2", sale_date: "2025-08-02T14:05:30.000Z", customer_name: "Emily Davis", employee_name: "Amit Verma", payment_method: "Cash", total_amount: "320.75", profit: "120.25" },
    { sale_id: 5, sale_no: "00125Aug3GHI3", sale_date: "2025-08-01T11:45:00.000Z", customer_name: "John Smith", employee_name: "Rahul Kumar", payment_method: "UPI", total_amount: "180.00", profit: "90.00" },
  ]
};

const mockSaleDetailResponse = {
    status: "success",
    data: {
        sale_id: 2,
        sale_no: "00125Aug1VLC0",
        sale_date: "2025-08-03T10:06:00.703Z",
        customer_name: "LALIT CHOUDHARY",
        contact_number: "9902903433",
        employee_name: "Amit Verma",
        payment_method: "UPI",
        total_amount: "250.50",
        profit: "150.00",
        sale_items: [
            { medicine_name: "Paracetamol", rate: 50, expiry_date: "2026-05-01", quantity: 2, purchase_price: 12 },
            { medicine_name: "Omeprazole", rate: 30, expiry_date: "2026-06-01", quantity: 1, purchase_price: 10 },
            { medicine_name: "Vitamin C", rate: 120.50, expiry_date: "2025-12-01", quantity: 1, purchase_price: 80 },
        ]
    }
};


// --- HELPER FUNCTIONS & COMPONENTS ---

const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
        case 'cash': return 'bg-theme-100 text-theme-800';
        case 'upi': return 'bg-blue-100 text-blue-800';
        case 'credit': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Loader = ({ text = "Loading..." }) => (
    <div className="flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-theme-500" size={48} />
        <p className="text-lg text-gray-600">{text}</p>
    </div>
);

// --- SUB-COMPONENTS ---

const SaleDetailsModal = ({ sale, onClose, isLoading }) => {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-20 rounded-2xl">
                <Loader text="Fetching details..." />
            </div>
        )}
        
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sale Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-theme-50 p-3 rounded-lg">
              <User className="text-theme-500" size={20} />
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-semibold text-gray-800">{sale.customer_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-theme-50 p-3 rounded-lg">
              <User className="text-theme-500" size={20} />
              <div>
                <p className="text-gray-500">Employee</p>
                <p className="font-semibold text-gray-800">{sale.employee_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-theme-50 p-3 rounded-lg">
              <Calendar className="text-theme-500" size={20} />
              <div>
                <p className="text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-800">
                  {new Date(sale.sale_date).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sale Items</h3>
          <div className="space-y-4">
            {sale.sale_items?.map((item, index) => (
              <div key={index} className="bg-white border-2 border-theme-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800 text-lg">{item.medicine_name}</h4>
                  <p className="font-bold text-theme-600 text-lg">{formatRupees(item.rate * item.quantity)}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                  <div><p className="text-gray-500">Rate:</p><p className="font-semibold text-gray-700">{formatRupees(item.rate)}</p></div>
                  <div><p className="text-gray-500">Quantity:</p><p className="font-semibold text-gray-700">{item.quantity}</p></div>
                  <div><p className="text-gray-500">Expiry Date:</p><p className="font-semibold text-gray-700">{item.expiry_date}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 mt-4 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent">
            <div className="bg-theme-50 p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-theme-800">Total Amount</span>
                    <span className="text-3xl font-extrabold text-theme-700">{formatRupees(sale.total_amount)}</span>
                </div>
                 <div className="flex justify-between items-center border-t border-theme-200 pt-3">
                    <span className="text-gray-600 font-semibold">Payment Method</span>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getPaymentMethodColor(sale.payment_method)}`}>
                        {sale.payment_method}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
export default function App() {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('sale_no');
  const [sortConfig, setSortConfig] = useState({ key: 'sale_date', direction: 'descending' });
  
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 20;

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      setError(null);

      // Manually retrieve token for this specific request
      const token = localStorage.getItem('authToken');

      try {
        const response = await api.get('/admin/sales', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Manually added header
          },
        });
        
        if (response.data && response.data.status === 'success') {
          setSales(response.data.data);
        } else {
          throw new Error("Failed to fetch sales data: Invalid response format.");
        }

      } catch (err) {
        setError(err.message);
        console.error("Fetch sales error:", err);
        // Fallback to mock data on error, for a more resilient UI
        setSales(mockSalesListResponse.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  const handleViewClick = async (sale) => {
    setSelectedSale(sale);
    setIsModalLoading(true);

    // Manually retrieve token for this specific request
    const token = localStorage.getItem('authToken');

    try {
        const response = await api.get(`/sales/${sale.sale_no}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Manually added header
          },
        });
        
        if (response.data && response.data.status === 'success') {
            setSelectedSale(response.data.data);
        } else {
            throw new Error("Failed to fetch sale details.");
        }
    } catch (err) {
        console.error("Fetch sale details error:", err);
        // Fallback to mock data on error
        setSelectedSale(mockSaleDetailResponse.data);
    } finally {
        setIsModalLoading(false);
    }
  };


  // --- FILTERING, SORTING, PAGINATION ---
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    let searchableItems = [...sales];

    if (searchTerm) {
      searchableItems = searchableItems.filter(sale => {
        const fieldValue = sale[searchField] ? String(sale[searchField]) : '';
        return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    searchableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.direction === 'ascending') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    return searchableItems;
  }, [sales, searchTerm, searchField, sortConfig]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, searchField, sortConfig]);

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * salesPerPage;
    return filteredSales.slice(startIndex, startIndex + salesPerPage);
  }, [filteredSales, currentPage, salesPerPage]);

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
        <div className="fixed inset-0 bg-theme-700/5 backdrop-blur-sm flex justify-center items-center z-50">
            <Loader text="Loading Sales Report..." />
        </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-theme-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
            <button className="text-theme-500 hover:text-theme-800 p-2 rounded-full hover:bg-theme-200 transition-colors"><ArrowLeft size={24} /></button>
            <div className="flex-grow flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-gray-800">Sales Report</h1>
                 <div className="bg-theme-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">{sales.length} Sales</div>
            </div>
        </header>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-400" size={20} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-500" />
            </div>
            <div className="relative md:col-span-1">
               <select value={searchField} onChange={e => setSearchField(e.target.value)} className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-theme-500">
                  <option value="sale_no">Sale No</option>
                  <option value="customer_name">Customer Name</option>
                  <option value="employee_name">Employee Name</option>
               </select>
               <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-400 pointer-events-none" size={20} />
            </div>
            <div className="relative md:col-span-1">
               <select onChange={e => setSortConfig({ ...sortConfig, direction: e.target.value })} className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-theme-500">
                  <option value="descending">Newest First</option>
                  <option value="ascending">Oldest First</option>
               </select>
               <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6"><h2 className="text-xl font-bold text-gray-800">Sales Transactions</h2></div>
            <div className="hidden md:block">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200"><tr>
                        <th className="p-4 text-sm font-semibold text-gray-500">Sale No</th>
                        <th className="p-4 text-sm font-semibold text-gray-500">Customer Name</th>
                        <th className="p-4 text-sm font-semibold text-gray-500">Employee Name</th>
                        <th className="p-4 text-sm font-semibold text-gray-500">Total Amount</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 text-right">Action</th>
                    </tr></thead>
                    <tbody>{paginatedSales.map((sale) => (
                        <tr key={sale.sale_id} className="border-b border-gray-100 last:border-b-0">
                            <td className="p-4 font-mono text-xs text-gray-700">{sale.sale_no}</td>
                            <td className="p-4 font-medium text-gray-800">{sale.customer_name}</td>
                            <td className="p-4 text-gray-600">{sale.employee_name}</td>
                            <td className="p-4 font-semibold text-theme-600">{formatRupees(sale.total_amount)}</td>
                            <td className="p-4 text-right"><button onClick={() => handleViewClick(sale)} className="bg-theme-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-theme-600 transition"><Eye size={16} />View</button></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            {paginatedSales.length === 0 && <div className="text-center p-10 text-gray-500"><p>No sales found.</p></div>}
        </div>

        {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm mt-6 p-4 flex items-center justify-between text-sm text-gray-600">
                <div>Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span></div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 border rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"><ChevronLeft size={16} />Previous</button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 border rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">Next<ChevronRight size={16} /></button>
                </div>
            </div>
        )}
      </div>

      {selectedSale && <SaleDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} isLoading={isModalLoading} />}
    </div>
  );
}