import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, UserCircle, Mail, Phone, Building2,
  Calendar, DollarSign, CreditCard, MapPin, X, Plus
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffDirectory = () => {
  // State management
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('first_name'); // Changed default to 'first_name' to match new filter option
  const [searchValue, setSearchValue] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('token') || "";

  // Filter options
  const filterOptions = [
    { value: 'first_name', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'email', label: 'Email' },
    { value: 'contact_number', label: 'Phone' }
  ];

  const sortOptions = [
    { value: 'first_name-asc', label: 'Name (A-Z)' },
    { value: 'first_name-desc', label: 'Name (Z-A)' },
    { value: 'role-asc', label: 'Role (A-Z)' },
    { value: 'role-desc', label: 'Role (Z-A)' }
  ];

  // Function to fetch employee details
  const fetchEmployeeDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/admin/employee/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSelectedEmployee(response.data.employees[0]);
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for View Details button
  const handleViewDetails = async (employeeId) => {
    setIsModalOpen(true);
    await fetchEmployeeDetails(employeeId);
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/admin/allEmployee', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setEmployees(response.data.employees);
  
    } catch (err) {
      setError('Failed to fetch employees. Please try again later.');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      setLoading(true);
      setError(null);
      try {
       const response = await axios.get(`http://localhost:4000/admin/employeeSearch?${query}=${searchValue}`, {
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
          }
        });
        console.log(response);
        setEmployees(response.data.employees);
      } catch (err) {
        setError('Search failed. Please try again.');
        console.error('Error searching employees:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Sort employees based on current sortOrder
  const sortedEmployees = [...employees].sort((a, b) => {
    const [field, direction] = sortOrder.split('-');
    const aValue = field === 'name' ? `${a.first_name} ${a.last_name}` : a[field];
    const bValue = field === 'name' ? `${b.first_name} ${b.last_name}` : b[field];

    if (direction === 'asc') {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
  });

  return (
    <div className="min-h-full bg-theme-50 p-6 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-theme-50 to-theme-100 rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Staff Directory</h1>
        <p className="text-gray-600 text-lg">
          View and manage your pharmacy staff members
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/staff/add')}
          className="flex items-center gap-2 bg-theme-500 hover:bg-theme-600 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filter Dropdown */}
          <div className="relative flex-1">
            <select
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-8 text-gray-700 focus:outline-none focus:border-theme-500 focus:ring-1 focus:ring-theme-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Search by {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearch}
              placeholder={`Search by ${query}...`}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-gray-700 focus:outline-none focus:border-theme-500 focus:ring-1 focus:ring-theme-500"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-8 text-gray-700 focus:outline-none focus:border-theme-500 focus:ring-1 focus:ring-theme-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div className="text-center text-gray-600">Loading employees...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedEmployees.map((employee) => (
            <div
              key={employee.employee_id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl 
                transition-all duration-300 ease-in-out hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-theme-100 rounded-full flex items-center justify-center mb-4">
                  <UserCircle className="w-12 h-12 text-theme-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {employee.first_name} {employee.last_name}
                </h3>
                <span className="text-theme-600 mb-4">{employee.role}</span>
                <div className="flex items-center text-gray-600 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{employee.contact_number}</span>
                </div>
                <button
                  onClick={() => handleViewDetails(employee.employee_id)}
                  className="bg-theme-600 text-white rounded-lg px-4 py-2 hover:bg-theme-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Staff Member Details</h2>
                  <p className="text-gray-600">Comprehensive information about this staff member</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading employee details...</p>
              </div>
            ) : selectedEmployee ? (
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column - Photo and Basic Info */}
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="w-40 h-40 bg-theme-100 rounded-full flex items-center justify-center mb-4">
                      <UserCircle className="w-24 h-24 text-theme-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-center">
                      {`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                    </h3>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium mt-2
                      ${selectedEmployee.role === 'Active' ? 'text-green-700 bg-green-100' :
                        selectedEmployee.role === 'Suspended' ? 'text-red-700 bg-red-100' :
                        'text-theme-700 bg-theme-100'}
                    `}>
                      {selectedEmployee.role}
                    </span>
                  </div>

                  {/* Right Column - Details */}
                  <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900">{selectedEmployee.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{selectedEmployee.contact_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-gray-900">
                          {new Date(selectedEmployee.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Salary</p>
                        <p className="text-gray-900">₹{selectedEmployee.salary}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Aadhar</p>
                        <p className="text-gray-900">{selectedEmployee.aadhar_card_no}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">PAN</p>
                        <p className="text-gray-900">{selectedEmployee.pan_card_no}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{selectedEmployee.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">No employee data available</div>
            )}

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/staff/update/${selectedEmployee.employee_id}`)}
                className="px-4 py-2 bg-theme-600 text-white rounded-lg hover:bg-theme-700"
              >
                Update Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;
