import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BoxLoader from "../../looader/BoxLoader";
import BASE_URL from '../../../config';

const EmployeeForm = ({ mode = 'add' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('lalitkumar_choudhary') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'Male',
    date_of_birth: '',
    contact_number: '',
    email: '',
    address: '',
    role: 'worker',
    date_of_joining: '',
    salary: '',
    status: 'Active',
    aadhar_card_no: '',
    pan_card_no: '',
  });

  useEffect(() => {
    if (mode === 'update' && id) {
      fetchEmployeeData();
    }
  }, [mode, id]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/admin/employee/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const employeeData = response.data.employees[0];
      setFormData({
        ...employeeData,
        date_of_birth: new Date(employeeData.date_of_birth).toISOString().split('T')[0],
        date_of_joining: new Date(employeeData.date_of_joining).toISOString().split('T')[0],
      });
    } catch (err) {
      setError('Failed to fetch employee data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'update') {
        await axios.put(`${BASE_URL}/admin/employee/${id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.post(`${BASE_URL}/admin/employee`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      navigate('/home/staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLoading(true);
      try {
        await axios.delete(`${BASE_URL}/admin/employee/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        navigate('/home/staff');
      } catch (err) {
        setError('Failed to delete employee');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-6">
      <div className="bg-gradient-to-r from-theme-200 to-theme-100 rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {mode === 'update' ? 'Update Employee' : 'Add New Employee'}
        </h1>
        <p className="text-gray-600 text-lg">
          {mode === 'update' ? 'Update employee information' : 'Add a new employee to the system'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <BoxLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={formData.date_of_joining}
                  onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={mode === 'update'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                <input
                  value={formData.aadhar_card_no}
                  onChange={(e) => setFormData({ ...formData, aadhar_card_no: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
                <input
                  value={formData.pan_card_no}
                  onChange={(e) => setFormData({ ...formData, pan_card_no: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/home/staff')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode === 'update' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Employee
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-theme-600 text-white rounded-lg hover:bg-theme-700"
              disabled={loading}
            >
              {mode === 'update' ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmployeeForm;
