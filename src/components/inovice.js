import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// Inline SVG icons for ArrowLeft and Search.
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-gray-500">
    <path d="M19 12H5"></path>
    <path d="M12 19l-7-7 7-7"></path>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

// Mock data to simulate fetching from an API.
const mockInvoices = [
  {
    sNo: 1,
    invoiceNo: 'INV-2024001',
    wholesaler: 'MedSupply Co. Ltd.',
    totalAmount: 1500.75,
    paidAmount: 1500.75,
    status: 'Paid',
    createdAt: '7/25/2024 4:00:00 PM',
    medicines: [
      { medicine: 'Paracetamol 500mg', qty: 100, price: 15.00 },
      { medicine: 'Amoxicillin 250mg', qty: 50, price: 30.00 },
    ],
  },
  {
    sNo: 2,
    invoiceNo: 'INV-2024002',
    wholesaler: 'Global Pharma Distributors',
    totalAmount: 2300.00,
    paidAmount: 1500.00,
    status: 'Partial',
    createdAt: '7/24/2024 3:30:00 PM',
    medicines: [
      { medicine: 'Aspirin 81mg', qty: 200, price: 5.00 },
      { medicine: 'Ibuprofen 400mg', qty: 100, price: 13.00 },
    ],
  },
  {
    sNo: 3,
    invoiceNo: 'INV-2024003',
    wholesaler: 'HealthBridge Wholesalers',
    totalAmount: 850.50,
    paidAmount: 0,
    status: 'Unpaid',
    createdAt: '7/23/2024 10:00:00 AM',
    medicines: [
      { medicine: 'Lisinopril 10mg', qty: 50, price: 17.01 },
    ],
  },
  {
    sNo: 4,
    invoiceNo: 'INV-2024004',
    wholesaler: 'Apex Drug House',
    totalAmount: 3200.00,
    paidAmount: 3200.00,
    status: 'Paid',
    createdAt: '7/22/2024 5:00:00 PM',
    medicines: [
      { medicine: 'Metformin 500mg', qty: 300, price: 10.67 },
    ],
  },
  {
    sNo: 5,
    invoiceNo: 'INV-2024005',
    wholesaler: 'Prime Medical Supplies',
    totalAmount: 1100.00,
    paidAmount: 500.00,
    status: 'Partial',
    createdAt: '7/21/2024 2:15:00 PM',
    medicines: [
      { medicine: 'Atorvastatin 20mg', qty: 100, price: 11.00 },
    ],
  },
];

// Component for the invoice details modal
const InvoiceDetailsModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  // Determine the tag style based on the payment status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-xl font-bold">Invoice Details</h3>
            <p className="text-sm text-gray-500">Detailed information about this invoice.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        {/* Invoice Details Grid */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <div className="text-sm text-gray-500">Invoice No</div>
            <div className="font-medium">{invoice.invoiceNo}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Wholesaler</div>
            <div className="font-medium">{invoice.wholesaler}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created At</div>
            <div className="font-medium">{invoice.createdAt}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="font-medium">₹{invoice.totalAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Paid Amount</div>
            <div className="font-medium">₹{invoice.paidAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Payment Status</div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="pt-4">
          <h4 className="text-lg font-semibold mb-2">Medicines in this Invoice</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Medicine</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {invoice.medicines.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.medicine}</td>
                  <td className="py-2">{item.qty}</td>
                  <td className="py-2">₹{item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end space-x-2">
          <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
            Delete Invoice
          </button>
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// This component contains the main invoice list page logic
const InvoiceListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Recent to Oldest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Get the style for the status tag
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort the invoices based on state
  const sortedInvoices = useMemo(() => {
    let filtered = mockInvoices.filter(invoice =>
      invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.wholesaler.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort based on the selected option
    switch (sortOption) {
      case 'Recent to Oldest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'Oldest to Recent':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'Total Amount Low to High':
        return filtered.sort((a, b) => a.totalAmount - b.totalAmount);
      case 'Total Amount High to Low':
        return filtered.sort((a, b) => b.totalAmount - a.totalAmount);
      default:
        return filtered;
    }
  }, [searchQuery, sortOption]);

  const handleViewClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="flex items-center py-4 md:py-6">
          <ArrowLeftIcon />
          <h1 className="ml-4 text-2xl font-bold">Invoice List</h1>
        </header>

        {/* Filter and Search Section */}
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice no or wholesaler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-auto"
            >
              <option>Recent to Oldest</option>
              <option>Oldest to Recent</option>
              <option>Total Amount Low to High</option>
              <option>Total Amount High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto rounded-lg bg-white shadow-md md:block">
          <h2 className="bg-green-50 p-4 text-lg font-semibold text-gray-800">Invoice List</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  S.No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Invoice No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Wholesaler
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Paid
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedInvoices.map((invoice, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{invoice.sNo}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{invoice.invoiceNo}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{invoice.wholesaler}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">₹{invoice.totalAmount.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleViewClick(invoice)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden">
          <h2 className="mb-4 bg-green-50 p-4 text-lg font-semibold text-gray-800 rounded-t-lg">Invoice List</h2>
          <div className="flex flex-col space-y-4">
            {sortedInvoices.map((invoice, index) => (
              <div key={index} className="rounded-lg bg-white p-4 shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800">{invoice.invoiceNo}</div>
                    <div className="text-sm text-gray-500">{invoice.wholesaler}</div>
                    <div className="mt-1 text-base font-semibold text-gray-700">Total: ₹{invoice.totalAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                    <button
                      onClick={() => handleViewClick(invoice)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Section */}
        <div className="mt-6 flex flex-col items-center justify-between space-y-2 md:flex-row">
          <div className="flex space-x-2">
            <button className="rounded-lg border px-4 py-2 text-gray-500 hover:bg-gray-100">Prev</button>
            <button className="rounded-lg border px-4 py-2 text-gray-500 hover:bg-gray-100">Next</button>
          </div>
          <span className="text-sm text-gray-500">
            Page 1 of 1 ({sortedInvoices.length} total items)
          </span>
        </div>
      </div>

      {/* Render the modal if isModalOpen is true */}
      <InvoiceDetailsModal invoice={selectedInvoice} onClose={handleCloseModal} />
    </div>
  );
};


