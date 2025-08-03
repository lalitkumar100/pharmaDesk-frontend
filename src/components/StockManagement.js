import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Menu, X, Filter } from 'lucide-react';

// Helper function to sort data
const sortData = (data, sortOption) => {
  switch (sortOption) {
    case 'A-Z':
      return [...data].sort((a, b) => a.name.localeCompare(b.name));
    case 'Z-A':
      return [...data].sort((a, b) => b.name.localeCompare(a.name));
    case 'Price High to Low':
      return [...data].sort((a, b) => b.price - a.price);
    case 'Price Low to High':
      return [...data].sort((a, b) => a.price - b.price);
    case 'Quantity High to Low':
      return [...data].sort((a, b) => b.quantity - a.quantity);
    case 'Quantity Low to High':
      return [...data].sort((a, b) => a.quantity - b.quantity);
    default:
      return data;
  }
};

const mockData = [
  {
    id: 1,
    sno: 1,
    name: 'Alprazolam 0.5mg',
    brand: 'Xanax',
    batch: 'ALP026',
    quantity: 50,
    expiry: '08/12/2025',
    price: 55.00,
    mrp: 55.00,
    purchasePrice: 48.00,
    invoiceNo: 'INV-001',
    wholesaler: 'MedSupply Co. Ltd.',
    mfgDate: '08/01/2024',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '50 units available',
    packedType: 'Strip of 10 tablets',
  },
  {
    id: 2,
    sno: 2,
    name: 'Amlodipine 5mg',
    brand: 'Norvasc',
    batch: 'AML009',
    quantity: 95,
    expiry: '08/02/2026',
    price: 38.00,
    mrp: 40.00,
    purchasePrice: 32.00,
    invoiceNo: 'INV-002',
    wholesaler: 'PharmaDistributors Inc.',
    mfgDate: '07/15/2024',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '95 units available',
    packedType: 'Strip of 14 tablets',
  },
  {
    id: 3,
    sno: 3,
    name: 'Amoxicillin 250mg',
    brand: 'Amoxil',
    batch: 'AMX002',
    quantity: 75,
    expiry: '08/15/2025',
    price: 45.00,
    mrp: 45.00,
    purchasePrice: 36.00,
    invoiceNo: 'INV-003',
    wholesaler: 'MedSupply Co. Ltd.',
    mfgDate: '08/01/2024',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '75 units available',
    packedType: 'Strip of 10 tablets',
  },
  {
    id: 4,
    sno: 4,
    name: 'Aspirin 75mg',
    brand: 'Disprin',
    batch: 'ASP011',
    quantity: 250,
    expiry: '04/15/2026',
    price: 15.75,
    mrp: 16.00,
    purchasePrice: 12.50,
    invoiceNo: 'INV-004',
    wholesaler: 'PharmaDistributors Inc.',
    mfgDate: '03/01/2025',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '250 units available',
    packedType: 'Bottle of 100 tablets',
  },
  {
    id: 5,
    sno: 5,
    name: 'Atorvastatin 10mg',
    brand: 'Lipitor',
    batch: 'ATO007',
    quantity: 65,
    expiry: '07/18/2025',
    price: 65.25,
    mrp: 68.00,
    purchasePrice: 58.00,
    invoiceNo: 'INV-005',
    wholesaler: 'MedSupply Co. Ltd.',
    mfgDate: '06/20/2024',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '65 units available',
    packedType: 'Strip of 10 tablets',
  },
  {
    id: 6,
    sno: 6,
    name: 'Cetirizine 10mg',
    brand: 'Zyrtec',
    batch: 'CET001',
    quantity: 150,
    expiry: '01/20/2026',
    price: 18.25,
    mrp: 19.00,
    purchasePrice: 15.00,
    invoiceNo: 'INV-006',
    wholesaler: 'PharmaDistributors Inc.',
    mfgDate: '12/01/2024',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '150 units available',
    packedType: 'Strip of 10 tablets',
  },
  {
    id: 7,
    sno: 7,
    name: 'Ciprofloxacin 500mg',
    brand: 'Cipro',
    batch: 'CIP001',
    quantity: 120,
    expiry: '02/25/2026',
    price: 58.50,
    mrp: 60.00,
    purchasePrice: 50.00,
    invoiceNo: 'INV-007',
    wholesaler: 'MedSupply Co. Ltd.',
    mfgDate: '01/10/2025',
    createdDate: '08/02/2025 9:33:19 PM',
    currentStock: '120 units available',
    packedType: 'Strip of 10 tablets',
  },
];

const Modal = ({ isOpen, onClose, medicine }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Medicine Details</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold">Medicine Name</p>
            <p className="font-normal">{medicine.name}</p>
          </div>
          <div>
            <p className="font-semibold">Brand</p>
            <p className="font-normal">{medicine.brand}</p>
          </div>
          <div>
            <p className="font-semibold">Batch No</p>
            <p className="font-normal">{medicine.batch}</p>
          </div>
          <div>
            <p className="font-semibold">Quantity</p>
            <p className="font-normal">{medicine.quantity} units</p>
          </div>
          <div>
            <p className="font-semibold">MRP</p>
            <p className="font-normal">₹{medicine.mrp.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Purchase Price</p>
            <p className="font-normal">₹{medicine.purchasePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold">Invoice No</p>
            <p className="font-normal">{medicine.invoiceNo}</p>
          </div>
          <div>
            <p className="font-semibold">Expiry Date</p>
            <p className="font-normal">{medicine.expiry}</p>
          </div>
          <div>
            <p className="font-semibold">Wholesaler</p>
            <p className="font-normal">{medicine.wholesaler}</p>
          </div>
          <div>
            <p className="font-semibold">Packed Type</p>
            <p className="font-normal">{medicine.packedType}</p>
          </div>
          <div>
            <p className="font-semibold">MFG Date</p>
            <p className="font-normal">{medicine.mfgDate}</p>
          </div>
          <div>
            <p className="font-semibold">Created At</p>
            <p className="font-normal">{medicine.createdDate}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold">Current Stock</p>
            <p className="font-normal">{medicine.currentStock}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 transition-colors hover:bg-gray-50">
            Purchase Return
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Dropdown component to replace shadcn
const SortDropdown = ({ sortOption, setSortOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['A-Z', 'Z-A', 'Price Low to High', 'Price High to Low', 'Quantity Low to High', 'Quantity High to Low'];

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


// Main App component
export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('A-Z');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort the data based on state
  const filteredData = mockData.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 antialiased">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header Section */}
        <header className="flex items-center space-x-2 rounded-xl bg-white p-4 shadow-sm md:p-6">
        
          <div className="ml-auto flex flex-grow items-center justify-end space-x-4">
            {/* Filter and Search Section */}
            <div className="relative flex-grow max-w-sm">
              <input
                type="text"
                placeholder="Search by medicine..."
                className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" size={18} />
            </div>
            {/* View Mode Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200"
              title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
            >
              <Filter className="h-5 w-5" />
            </button>
            {/* Custom Sort Dropdown Component */}
            <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mt-8">
          <h2 className="mb-4 text-center text-2xl font-bold text-blue-600">Medicine List</h2>

          {/* Conditional Rendering based on viewMode */}
          {viewMode === 'table' ? (
            // Table View
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium">S.No</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Medicine</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Brand</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Batch</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Quantity</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Expiry</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Price</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((medicine, index) => (
                      <tr key={medicine.id} className="text-sm">
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">{startIndex + index + 1}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.name}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.brand}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.batch}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${medicine.quantity < 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {medicine.quantity}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">{medicine.expiry}</td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">₹{medicine.price.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-center">
                          <button
                            onClick={() => handleViewDetails(medicine)}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-4 text-center text-gray-500">No medicines found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Card View
            <div className="space-y-4">
              {paginatedData.length > 0 ? (
                paginatedData.map((medicine) => (
                  <div key={medicine.id} className="flex items-center rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                      <p className="text-sm text-gray-500">{medicine.brand}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Batch:</span> {medicine.batch}
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
                      <p className="text-lg font-bold text-gray-900">₹{medicine.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Expiry: {medicine.expiry}
                      </p>
                      <button
                        onClick={() => handleViewDetails(medicine)}
                        className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No medicines found.</p>
              )}
            </div>
          )}
        </main>

        {/* Pagination */}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} medicine={selectedMedicine} />
    </div>
  );
}
