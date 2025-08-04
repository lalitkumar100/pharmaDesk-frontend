import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import BoxLoader from "./looader/BoxLoader";
import { Import } from 'lucide-react';


// Base URL: replace with your actual API domain

import BASE_URL from '../config';
// Axios instance factory (adds bearer token)
const getToken = () => localStorage.getItem("lalitkumar_choudhary") || "";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request helper with simple retry logic
const requestWithRetry = async (config, retries = 2, backoff = 500) => {
    try {
        const token = getToken();
        if (!config.headers) config.headers = {};
        config.headers.Authorization = `Bearer ${token}`;
        return await axiosInstance.request(config);
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return requestWithRetry(config, retries - 1, backoff * 2);
        }
        throw err;
    }
};

// API functions
const api = {
    fetchSuggestions: async (query) => {
        try {
            const response = await requestWithRetry({
                method: 'GET',
                url: `/admin/medicines/recommendation`,
                params: { query },
            });
            // expecting response.data.recommendations[]
            return { status: 'success', recommendations: response.data.recommendations || [] };
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            return { status: 'error', message: 'Failed to fetch suggestions.', recommendations: [] };
        }
    },
    fetchMedicineDetails: async (medicineId) => {
        try {
            const response = await requestWithRetry({
                method: 'GET',
                url: `/admin/medicne_info/${medicineId}`,
            });
            // assuming full medicine info in response.data (or array)
            return { status: 'success', medicine: response.data };
        } catch (error) {
            console.error("Error fetching medicine details:", error);
            return { status: 'error', message: 'Failed to fetch medicine details.', medicine: null };
        }
    },
    generateBill: async (billPayload) => {
        try {
            const response = await requestWithRetry({
                method: 'POST',
                url: `/admin/sales`,
                data: billPayload,
            });
            return { status: 'success', message: response.data.message || 'Bill generated successfully.' };
        } catch (error) {
            console.error("Error generating bill:", error);
            const msg = error?.response?.data?.message || 'Failed to generate bill.';
            return { status: 'error', message: msg };
        }
    }
};

// Debounce util
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const Modal = ({ children, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
};

const AlertModal = ({ message, onClose }) => {
    return (
        <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center p-4 z-50 rounded-xl">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p className="text-lg font-semibold text-red-600 mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default function Billing() {
    // Theme definitions for each bill
    const billThemes = [
        {
            bg: 'bg-purple-100',
            btnBg: 'bg-purple-600',
            btnText: 'text-purple-700',
            btnHoverBg: 'hover:bg-purple-700',
            activeNav: 'bg-purple-600 text-white',
            inactiveNavBg: 'bg-purple-100',
            inactiveNavText: 'text-purple-700',
        },
        {
            bg: 'bg-green-100',
            btnBg: 'bg-green-600',
            btnText: 'text-green-700',
            btnHoverBg: 'hover:bg-green-700',
            activeNav: 'bg-green-600 text-white',
            inactiveNavBg: 'bg-green-100',
            inactiveNavText: 'text-green-700',
        },
        {
            bg: 'bg-blue-100',
            btnBg: 'bg-blue-600',
            btnText: 'text-blue-700',
            btnHoverBg: 'hover:bg-blue-700',
            activeNav: 'bg-blue-600 text-white',
            inactiveNavBg: 'bg-blue-100',
            inactiveNavText: 'text-blue-700',
        },
    ];

    // State
    const [bills, setBills] = useState([
        { customerName: '', contactNumber: '', paymentMethod: 'Cash', medicines: [] },
        { customerName: '', contactNumber: '', paymentMethod: 'Cash', medicines: [] },
        { customerName: '', contactNumber: '', paymentMethod: 'Cash', medicines: [] },
    ]);
    const [activeBillIndex, setActiveBillIndex] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [modalForm, setModalForm] = useState({
        medicineName: '',
        purchasePrice: '',
        stockQuantity: '',
        quantity: 1,
        sellPrice: '',
        medicineId: null,
        batchNo: '',
    });
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [modalAlert, setModalAlert] = useState({ show: false, message: '' });
    const [isGeneratingBill, setIsGeneratingBill] = useState(false);
    const [billMessage, setBillMessage] = useState({ show: false, message: '', type: '' });

    const activeBill = bills[activeBillIndex];

    // Ref for autofocus
    const medicineInputRef = useRef(null);

    // Handlers
    const handleBillChange = (index) => {
        setActiveBillIndex(index);
    };

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        const newBills = [...bills];
        newBills[activeBillIndex] = { ...newBills[activeBillIndex], [name]: value };
        setBills(newBills);
    };

    const handleModalFormChange = (e) => {
        const { name, value } = e.target;
        setModalForm(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        setModalForm({
            medicineName: '',
            purchasePrice: '',
            stockQuantity: '',
            quantity: 1,
            sellPrice: '',
            medicineId: null,
            batchNo: '',
        });
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        setModalAlert({ show: false, message: '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        setModalAlert({ show: false, message: '' });
    };

    // Auto-focus when modal opens
    useEffect(() => {
        if (showModal && medicineInputRef.current) {
            medicineInputRef.current.focus();
        }
    }, [showModal]);

    // Debounced fetch
    const debouncedFetchSuggestions = useCallback(
        debounce(async (query) => {
            if (query.trim().length > 1) {
                setSuggestionLoading(true);
                try {
                    const response = await api.fetchSuggestions(query);
                    if (response.status === "success") {
                        setSuggestions(response.recommendations || []);
                    }
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                } finally {
                    setSuggestionLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300),
        []
    );

    const handleMedicineNameChange = (e) => {
        const value = e.target.value;
        setModalForm(prev => ({ ...prev, medicineName: value, medicineId: null, batchNo: '' }));
        debouncedFetchSuggestions(value);
        setSelectedSuggestionIndex(-1);
    };

    const handleSuggestionSelect = useCallback(async (suggestion) => {
        try {
            const response = await api.fetchMedicineDetails(suggestion.medicine_id);
            if (response.status === "success" && response.medicine) {
                    console.log(response);
                const medicine = response.medicine.medicine[0];
                    console.log(medicine);
                    
                setModalForm({
                    medicineName: `${medicine.medicine_name} (${medicine.batch_no})`,
                    purchasePrice: medicine.purchase_price,
                    stockQuantity: medicine.stock_quantity,
                    quantity: 1,
                    sellPrice: medicine.mrp,
                    medicineId: medicine.medicine_id,
                    batchNo: medicine.batch_no,
                });
                setSuggestions([]);
                setSelectedSuggestionIndex(-1);
            } else {
                setModalAlert({ show: true, message: "Could not load medicine details." });
            }
        } catch (error) {
            console.error("Error fetching medicine details:", error);
            setModalAlert({ show: true, message: "Failed to fetch medicine details." });
        }
    }, []);

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' && selectedSuggestionIndex !== -1) {
            e.preventDefault();
            handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
    };

    const handleAddToBill = () => {
        const { quantity, stockQuantity, sellPrice, purchasePrice, medicineName, medicineId, batchNo } = modalForm;

        if (parseFloat(sellPrice) < parseFloat(purchasePrice)) {
            setModalAlert({ show: true, message: "Sell Price is less than Purchase Price!" });
            return;
        }

        if (parseInt(quantity, 10) > parseInt(stockQuantity, 10)) {
            setModalAlert({ show: true, message: "Quantity is more than available stock!" });
            return;
        }

        if (!medicineId) {
            setModalAlert({ show: true, message: "Please select a medicine from the suggestions." });
            return;
        }

        const newMedicine = {
            medicine_id: medicineId,
            medicine_name: medicineName.split('(')[0].trim(),
            batch_no: batchNo,
            quantity: parseInt(quantity, 10),
            price_per_unit: parseFloat(sellPrice),
            total: parseFloat(sellPrice) * parseInt(quantity, 10),
        };

        const newBills = [...bills];
        newBills[activeBillIndex] = {
            ...newBills[activeBillIndex],
            medicines: [...newBills[activeBillIndex].medicines, newMedicine],
        };
        setBills(newBills);
        handleCloseModal();
    };

    const totalAmount = useMemo(() => {
        return activeBill.medicines.reduce((acc, med) => acc + med.total, 0);
    }, [activeBill.medicines]);

    const handleGenerateBill = async () => {
        setIsGeneratingBill(true);
        const billPayload = {
            customer_name: activeBill.customerName,
            contact_number: activeBill.contactNumber,
            employee_id: 3, // Hardcoded per earlier
            payment_method: activeBill.paymentMethod,
            medicines: activeBill.medicines.map(med => ({
                medicine_id: med.medicine_id,
                quantity: med.quantity,
                rate: String(med.price_per_unit),
            })),
        };

        try {
            const response = await api.generateBill(billPayload);
            if (response.status === "success") {
                setBillMessage({ show: true, message: response.message, type: 'success' });
                // Reset current bill
                const newBills = [...bills];
                newBills[activeBillIndex] = {
                    customerName: '',
                    contactNumber: '',
                    paymentMethod: 'Cash',
                    medicines: [],
                };
                setBills(newBills);
            } else {
                setBillMessage({ show: true, message: response.message || "Failed to generate bill.", type: 'error' });
            }
        } catch (error) {
            console.error("Error generating bill:", error);
            setBillMessage({ show: true, message: "Failed to generate bill.", type: 'error' });
        } finally {
            setIsGeneratingBill(false);
            setTimeout(() => setBillMessage({ show: false, message: '', type: '' }), 3000);
        }
    };

    return (
        <div className={`min-h-screen bg-white text-gray-800 p-4 font-sans flex items-start justify-center`}>
            {/* Main Billing Container */}
            <div className={`w-full max-w-5xl ${billThemes[activeBillIndex].bg}  rounded-2xl shadow-xl p-6 lg:p-10 my-8`}>

                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => console.log('Go back')}
                        className={`${
                            billThemes[activeBillIndex].btnText
                        } hover:opacity-80 transition-colors p-2`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className={`text-2xl font-bold ${billThemes[activeBillIndex].btnText}`}>Medicine Billing</h1>
                </div>

                {/* Customer Details & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col">
                        <label htmlFor="customerName" className="text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            value={activeBill.customerName}
                            onChange={handleCustomerChange}
                            placeholder="Enter customer name"
                            className="bg-gray-100 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="contactNumber" className="text-sm font-medium text-gray-600 mb-1">Contact No.</label>
                        <input
                            type="text"
                            id="contactNumber"
                            name="contactNumber"
                            value={activeBill.contactNumber}
                            onChange={handleCustomerChange}
                            placeholder="Enter contact number"
                            className="bg-gray-100 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-600 mb-1">Payment Method</label>
                        <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={activeBill.paymentMethod}
                            onChange={handleCustomerChange}
                            className="bg-gray-100 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleOpenModal}
                        className={`${billThemes[activeBillIndex].btnBg} text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors ${billThemes[activeBillIndex].btnHoverBg}`}
                    >
                        Add Medicine
                    </button>
                </div>

                {/* Medicine Table */}
                <div className="overflow-x-auto rounded-xl shadow-inner mb-6">
                    <table className="min-w-full bg-white">
                        <thead className="bg-green-100 border-b-2 border-green-200">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Medicine</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Batch No.</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price/Unit</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeBill.medicines.length > 0 ? (
                                activeBill.medicines.map((med, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-700">{med.medicine_name}</td>
                                        <td className="py-3 px-4 text-gray-700">{med.batch_no}</td>
                                        <td className="py-3 px-4 text-gray-700">{med.quantity}</td>
                                        <td className="py-3 px-4 text-gray-700">₹{med.price_per_unit.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-gray-700">₹{med.total.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-gray-500 italic">No medicines added yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total and Generate Bill */}
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-bold text-green-700">Total Amount</span>
                    <span className="text-2xl font-bold text-green-700">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleGenerateBill}
                        disabled={isGeneratingBill || activeBill.medicines.length === 0}
                        className={`${billThemes[activeBillIndex].btnBg} text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors ${billThemes[activeBillIndex].btnHoverBg} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    >
                        {isGeneratingBill ? 'Generating...' : 'Generate New Bill'}
                    </button>
                </div>

                {/* Success/Error Message */}
                {billMessage.show && (
                    <div className={`mt-4 p-4 rounded-lg font-semibold text-center transition-opacity duration-300 ${billMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {billMessage.message}
                    </div>
                )}

                {/* Bill Navigation */}
                <div className="mt-8 flex justify-center space-x-4">
                    {[1, 2, 3].map((billNumber, index) => (
                        <button
                            key={index}
                            onClick={() => handleBillChange(index)}
                            className={`py-2 px-6 rounded-lg font-semibold transition-all duration-300
                                ${activeBillIndex === index
                                    ? `${billThemes[index].activeNav} shadow-md scale-105`
                                    : `${billThemes[index].inactiveNavBg} ${billThemes[index].inactiveNavText} hover:brightness-95 border border-gray-200`
                                }`}
                        >
                            Bill {billNumber}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Medicine Modal */}
            {showModal && (
                <Modal onClose={handleCloseModal}>
                    {modalAlert.show ? (
                        <AlertModal message={modalAlert.message} onClose={() => setModalAlert({ show: false, message: '' })} />
                    ) : (
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">Add Medicine</h2>
                            <p className="text-gray-500 text-sm mb-6">Enter the details of the medicine to add to the bill.</p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <label htmlFor="medicineName" className="text-sm font-medium text-gray-600">Medicine Name</label>
                                    <input
                                        type="text"
                                        id="medicineName"
                                        name="medicineName"
                                        value={modalForm.medicineName}
                                        onChange={handleMedicineNameChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Search medicine by name or batch no."
                                        ref={medicineInputRef}
                                        className="w-full bg-gray-100 p-3 mt-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                                        autoComplete="off"
                                    />
                                    {(suggestionLoading || suggestions.length > 0) && (
                                        <div className="absolute top-full left-0 right-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 mt-1 max-h-60 overflow-y-auto">
                                            {suggestionLoading && <div className="p-3 text-center text-gray-500">Loading...</div>}
                                            {suggestions.length > 0 && suggestions.map((suggestion, index) => (
                                                <div
                                                    key={suggestion.medicine_id + suggestion.batch_no}
                                                    onClick={() => handleSuggestionSelect(suggestion)}
                                                    className={`cursor-pointer px-4 py-3 hover:bg-green-50 transition-colors
                                                        ${index === selectedSuggestionIndex ? 'bg-green-100' : ''}`}
                                                >
                                                    {suggestion.medicine_name} ({suggestion.batch_no})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label htmlFor="purchasePrice" className="text-sm font-medium text-gray-600">Purchase Price</label>
                                        <input
                                            type="text"
                                            id="purchasePrice"
                                            name="purchasePrice"
                                            value={modalForm.purchasePrice}
                                            readOnly
                                            className="w-full bg-gray-100 p-3 mt-1 rounded-lg border border-gray-300 text-gray-600"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="stockQuantity" className="text-sm font-medium text-gray-600">Stock Quantity</label>
                                        <input
                                            type="text"
                                            id="stockQuantity"
                                            name="stockQuantity"
                                            value={modalForm.stockQuantity}
                                            readOnly
                                            className="w-full bg-gray-100 p-3 mt-1 rounded-lg border border-gray-300 text-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label htmlFor="quantity" className="text-sm font-medium text-gray-600">Quantity</label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={modalForm.quantity}
                                            onChange={handleModalFormChange}
                                            min="1"
                                            className="w-full bg-gray-100 p-3 mt-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="sellPrice" className="text-sm font-medium text-gray-600">Sell Price (MRP)</label>
                                        <input
                                            type="number"
                                            id="sellPrice"
                                            name="sellPrice"
                                            value={modalForm.sellPrice}
                                            onChange={handleModalFormChange}
                                            min="0"
                                            className="w-full bg-gray-100 p-3 mt-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToBill}
                                className="w-full mt-8 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                disabled={!modalForm.medicineId || !modalForm.quantity || !modalForm.sellPrice}
                            >
                                Add to Bill
                            </button>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
