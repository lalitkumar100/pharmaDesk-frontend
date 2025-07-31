import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, Search, ChevronDown, Eye, X, Edit, Save, Trash2, RotateCcw } from 'lucide-react';

const API_BASE_URL = 'https://your-api-base-url.com';

const StockManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchField, setSearchField] = useState('medicine');
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [sortBy, setSortBy] = useState('A-Z');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [modalData, setModalData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  const searchInputRef = useRef(null);

  const searchFields = [
    { value: 'medicine', label: 'Medicine' },
    { value: 'brand', label: 'Brand' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'invoiceNo', label: 'Invoice No' },
    { value: 'batchNo', label: 'Batch No' }
  ];

  const sortOptions = [
    { value: 'A-Z', label: 'A-Z' },
    { value: 'Z-A', label: 'Z-A' },
    { value: 'price-low-high', label: 'Price Low to High' },
    { value: 'price-high-low', label: 'Price High to Low' },
    { value: 'quantity-high-low', label: 'Quantity High to Low' },
    { value: 'quantity-low-high', label: 'Quantity Low to High' }
  ];

  const getPlaceholderText = () => {
    const field = searchFields.find(f => f.value === searchField);
    return `Search by ${field?.label || 'Medicine'}...`;
  };

  const fetchSuggestions = async (field, value) => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      let endpoint = '';
      switch (field) {
        case 'medicine':
          endpoint = `${API_BASE_URL}/admin/medicines/recommendation2?medicine=${encodeURIComponent(value)}`;
          break;
        case 'wholesaler':
          endpoint = `${API_BASE_URL}/admin/wholesaler/recommendation?wholesaler=${encodeURIComponent(value)}`;
          break;
        case 'brand':
          endpoint = `${API_BASE_URL}/admin/brand/recommendation?brand=${encodeURIComponent(value)}`;
          break;
        default:
          return;
      }

      const response = await axios.get(endpoint);
      if (response.data.status === 'success') {
        setSuggestions(response.data.recommendations || []);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (['medicine', 'brand', 'wholesaler'].includes(searchField)) {
        fetchSuggestions(searchField, searchValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchField]);

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/MedicineSerach?${searchField}=${encodeURIComponent(searchValue)}`);
      
      if (response.data.status === 'success') {
        setMedicines(response.data.data.medicines || []);
        setTotalItems(response.data.data.total_items || 0);
      } else {
        setError('Failed to fetch medicines');
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to fetch medicines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMedicines();
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const getSortedMedicines = () => {
    const sorted = [...medicines];
    
    switch (sortBy) {
      case 'A-Z':
        return sorted.sort((a, b) => a.medicineName?.localeCompare(b.medicineName));
      case 'Z-A':
        return sorted.sort((a, b) => b.medicineName?.localeCompare(a.medicineName));
      case 'price-low-high':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high-low':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'quantity-high-low':
        return sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      case 'quantity-low-high':
        return sorted.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
      default:
        return sorted;
    }
  };

  const getPaginatedMedicines = () => {
    const sorted = getSortedMedicines();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  };

  const getQuantityColor = (quantity) => {
    if (quantity > 200) return 'bg-green-100 text-green-800';
    if (quantity > 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const fetchMedicineDetails = async (medicineId) => {
    setModalLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/medicne_info/${medicineId}`);
      if (response.data.status === 'success') {
        setModalData(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching medicine details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setModalMode('view');
    setShowModal(true);
    fetchMedicineDetails(medicine.medicine_id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
    setModalData({});
    setModalMode('view');
  };

  const handleUpdateToggle = () => {
    setModalMode(modalMode === 'view' ? 'edit' : 'view');
  };

  const handleSaveMedicine = async () => {
    try {
      await axios.put(`${API_BASE_URL}/admin/medicne_Stock/${selectedMedicine.medicine_id}`, modalData);
      handleCloseModal();
      fetchMedicines();
    } catch (error) {
      console.error('Error updating medicine:', error);
    }
  };

  const handlePurchaseReturn = async () => {
    try {
      await axios.get(`${API_BASE_URL}/admin/medicne_return/${selectedMedicine.medicine_id}`);
      handleCloseModal();
      fetchMedicines();
    } catch (error) {
      console.error('Error processing purchase return:', error);
    }
  };

  const handleDeleteMedicine = async () => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/medicne_stock/${selectedMedicine.medicine_id}`);
        handleCloseModal();
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const handleModalDataChange = (field, value) => {
    setModalData(prev => ({ ...prev, [field]: value }));
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="hover:text-gray-900">/home</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-900 font-medium">Stock Management</span>
          </nav>
        </div>
      </header>

      {/* Sticky Control Section */}
      <div className="sticky top-16 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex flex-col lg:flex-row gap-3">
              <div className="relative">
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {searchFields.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholderText()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">S.No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Medicine</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-medium">Brand</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-medium">Batch</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-medium">Expiry</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getPaginatedMedicines().map((medicine, index) => (
                    <tr key={medicine.medicine_id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {medicine.medicineName}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                        {medicine.brand}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-600">
                        {medicine.batchNo}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuantityColor(medicine.quantity)}`}>
                          {medicine.quantity}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-600">
                        {medicine.expiryDate}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                        ₹{medicine.price}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewMedicine(medicine)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getPaginatedMedicines().length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No medicines found</p>
              </div>
            )}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} ({totalItems} total items)
            </div>
          </div>
        )}
      </div>

      {/* Medicine Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {modalMode === 'view' ? 'Medicine Details' : 'Edit Medicine'}
                  </h3>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                {modalLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { field: 'id', label: 'ID', disabled: true },
                      { field: 'medicineName', label: 'Medicine Name' },
                      { field: 'brand', label: 'Brand' },
                      { field: 'batchNo', label: 'Batch No' },
                      { field: 'quantity', label: 'Quantity', type: 'number' },
                      { field: 'expiryDate', label: 'Expiry Date', type: 'date' },
                      { field: 'price', label: 'Price', type: 'number' },
                      { field: 'mrp', label: 'MRP', type: 'number' },
                      { field: 'purchasePrice', label: 'Purchase Price', type: 'number' },
                      { field: 'invoiceNo', label: 'Invoice No' },
                      { field: 'wholesaler', label: 'Wholesaler' },
                      { field: 'packedType', label: 'Packed Type', fullWidth: true }
                    ].map(({ field, label, type = 'text', disabled = false, fullWidth = false }) => (
                      <div key={field} className={fullWidth ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type={type}
                          value={modalData[field] || ''}
                          onChange={(e) => handleModalDataChange(field, e.target.value)}
                          disabled={modalMode === 'view' || disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                {modalMode === 'view' ? (
                  <>
                    <button
                      onClick={handlePurchaseReturn}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Purchase Return
                    </button>
                    <button
                      onClick={handleDeleteMedicine}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                    <button
                      onClick={handleUpdateToggle}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateToggle}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMedicine}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement; 