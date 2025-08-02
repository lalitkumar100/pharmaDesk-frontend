import React, { useState, useEffect } from 'react';
import {
  User,
  Edit,
  Lock,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import RandomColorLoader from './RandomColorLoader'; // Import the new loader component
import BoxLoader  from './BoxLoader';
import BoxLoader from "./BoxLoader";
const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    email: '',
    role: '',
    address: '',
    aadharNumber: '',
    panCard: '',
    accountNumber: '',
    salary: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    console.log('Profile component mounted'); // Debug log
    console.log('Current localStorage token:', localStorage.getItem('token')); // Debug log
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug log

      if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      const response = await axios.get('http://localhost:4000/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data); // Debug log

      // Map the API response to our component state
      if (response.data.status === 'success') {
        const apiData = response.data.data;
        setUserData({
          firstName: apiData.first_name || '',
          lastName: apiData.last_name || '',
          phoneNumber: apiData.contact_number || '',
          dateOfBirth: apiData.date_of_birth ? apiData.date_of_birth.split('T')[0] : '',
          email: apiData.email || '',
          role: apiData.role || '',
          address: apiData.address || '',
          aadharNumber: apiData.aadhar_card_no || '',
          panCard: apiData.pan_card_no || '',
          accountNumber: apiData.account_no || '',
          salary: apiData.salary ? `₹${parseFloat(apiData.salary).toLocaleString()}` : ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('Error response:', error.response); // Debug log

      if (error.response?.status === 401) {
        console.log('401 Unauthorized, redirecting to login');
        // Redirect to login if unauthorized
        window.location.href = '/login';
        return;
      }
      // Set mock data for demonstration
      setUserData({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+91 98765 43210',
        dateOfBirth: '1990-05-15',
        email: 'john.doe@pharmadesk.com',
        role: 'Senior Pharmacist',
        address: '123 Pharmacy Street, Medical District, City - 123456',
        aadharNumber: '1234-5678-9012',
        panCard: 'ABCDE1234F',
        accountNumber: '1234567890',
        salary: '₹75,000'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Save changes - Token:', token); // Debug log

      if (!token) {
        console.log('No token found for save changes, redirecting to login');
        window.location.href = '/login';
        return;
      }

      // Map our component state back to API format
      const apiData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        contact_number: userData.phoneNumber,
        date_of_birth: userData.dateOfBirth,
        address: userData.address,
        aadhar_card_no: userData.aadharNumber,
        pan_card_no: userData.panCard,
        account_no: userData.accountNumber
      };

      console.log('Sending data to API:', apiData); // Debug log

      const response = await axios.put('http://localhost:4000/profile', apiData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Save response:', response.data); // Debug log

      if (response.status === 200) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        // Reload the page after successful update
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Save changes error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log

      if (error.response?.status === 401) {
        console.log('401 Unauthorized for save changes, redirecting to login');
        // Redirect to login if unauthorized
        window.location.href = '/login';
        return;
      }
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }


    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await axios.put('http://localhost:4000/profile/changePassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setMessage('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
        return;
      }
      setMessage(error.response?.data?.message || 'Failed to change password');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Replaced the old spinner with the new RandomColorLoader */}
        <BoxLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Card */}
      <div className="bg-theme-50 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 bg-theme-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-theme-600 font-medium">{userData.role}</p>
              <p className="text-gray-600 text-sm">{userData.email}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEditProfile}
              disabled={isEditing}
              className="flex items-center space-x-2 bg-theme-500 text-white px-4 py-2 rounded-lg hover:bg-theme-600 transition-colors duration-200 disabled:opacity-50"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-2 border border-theme-500 text-theme-500 px-4 py-2 rounded-lg hover:bg-theme-50 transition-colors duration-200"
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
          <p className="text-gray-600 text-sm">View your personal information</p>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={userData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              readOnly={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={userData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              readOnly={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={userData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              readOnly={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={userData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              readOnly={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value={userData.role}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={userData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              readOnly={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
              <input
                type="text"
                value={userData.aadharNumber}
                onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card</label>
              <input
                type="text"
                value={userData.panCard}
                onChange={(e) => handleInputChange('panCard', e.target.value)}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={userData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
              <input
                type="text"
                value={userData.salary}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Salary cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-theme-500 text-white px-6 py-2 rounded-lg hover:bg-theme-600 transition-colors duration-200 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('successfully') || message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Debug Section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Debug Information</h4>
          <p className="text-sm text-gray-600 mb-2">
            Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </p>
          <button
            onClick={() => {
              console.log('Manual API test');
              fetchUserData();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
          >
            Test API Call
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                  <li>• One special character</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 bg-theme-500 text-white px-4 py-2 rounded-lg hover:bg-theme-600 transition-colors duration-200"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
