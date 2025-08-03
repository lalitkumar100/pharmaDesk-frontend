// src/components/AddMedicineModal.js
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import BoxLoader from "../../looader/BoxLoader";

const BASE_URL = "http://localhost:4000";
// Get token from localStorage
const token = localStorage.getItem('token') || "";

function formatDate(dateStr) {
  if (!dateStr) return "";
  // Handles both ISO and YYYY-MM-DD
  return dateStr.slice(0, 10);
}

const initialFields = {
  medicine_name: "",
  brand_name: "",
  mfg_date: "",
  expiry_date: "",
  packed_type: "",
  stock_quantity: "",
  purchase_price: "",
  mrp: "",
  batch_no: "",
};

export default function AddMedicineModal({ onClose, onAddMedicine }) {
  const [fields, setFields] = useState(initialFields);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState(null); // State for displaying errors in the modal

  const debounceTimeout = useRef(null);
  const inputRef = useRef(null);

  // Debounced fetch for medicine name suggestions
  useEffect(() => {
    if (!fields.medicine_name) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/admin/medicines/recommendation?query=${
          fields.medicine_name
        }`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.data.status === "success") {
          setSuggestions(res.data.recommendations || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
        // Optionally set an error if the suggestion fetch fails
        // setError("Failed to fetch medicine suggestions.");
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(debounceTimeout.current);
  }, [fields.medicine_name]);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((idx) => (idx + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((idx) =>
        idx <= 0 ? suggestions.length - 1 : idx - 1
      );
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIdx]);
    }
  };

  // Select suggestion and fetch details
  const handleSelectSuggestion = async (suggestion) => {
    setShowSuggestions(false);
    setFields((f) => ({
      ...f,
      medicine_name: suggestion.medicine_name,
    }));
    setSuggestions([]);
    setSelectedIdx(-1);
    setFetchingDetails(true);
    setError(null); // Clear previous errors when selecting a suggestion
    try {
      const res = await axios.get(
        `${BASE_URL}/admin/medicne_info/${suggestion.medicine_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (res.data.status === "success" && res.data.medicine && res.data.medicine.length > 0) {
        const med = res.data.medicine[0];
        setFields({
          medicine_name: med.medicine_name || "",
          brand_name: med.brand_name || "",
          mfg_date: formatDate(med.mfg_date),
          expiry_date: formatDate(med.expiry_date),
          packed_type: med.packed_type || "",
          stock_quantity: med.stock_quantity || "",
          purchase_price: med.purchase_price || "",
          mrp: med.mrp || "",
          batch_no: med.batch_no || "",
        });
      } else {
        setError("Failed to fetch medicine details.");
      }
    } catch (err) {
      setError("Network error or failed to fetch medicine details.");
    }
    setFetchingDetails(false);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((f) => ({
      ...f,
      [name]: value,
    }));
    if (name === "medicine_name") {
      setShowSuggestions(true);
      setSelectedIdx(-1);
    }
    setError(null); // Clear error on input change
  };

  // Add medicine
  const handleAdd = () => {
    setError(null);
    // Basic validation
    if (
      !fields.medicine_name ||
      !fields.brand_name ||
      !fields.mfg_date ||
      !fields.expiry_date ||
      !fields.packed_type ||
      !fields.stock_quantity ||
      !fields.purchase_price ||
      !fields.mrp ||
      !fields.batch_no
    ) {
      setError("Please fill all required fields.");
      return;
    }
    // Pass medicine object to parent
    onAddMedicine({
      medicine_name: fields.medicine_name,
      brand_name: fields.brand_name,
      mfg_date: fields.mfg_date,
      expiry_date: fields.expiry_date,
      packed_type: fields.packed_type,
      stock_quantity: Number(fields.stock_quantity),
      purchase_price: Number(fields.purchase_price), // Ensure numbers are passed
      mrp: Number(fields.mrp), // Ensure numbers are passed
      batch_no: fields.batch_no,
    });
    onClose();
  };

  // Refresh/clear fields
  const handleRefresh = () => {
    setFields(initialFields);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIdx(-1);
    setError(null);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClick = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-h-[95vh] overflow-y-auto max-w-lg md:w-auto p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-theme-800">Add New Medicine</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>
        <p className="mb-4 text-gray-600 text-sm">
          Enter details for the medicine to add to stock.
        </p>
        {/* Form */}
        <div className="space-y-4">
          {/* Medicine Name with auto-suggest */}
          <div ref={inputRef} className="relative">
            <label className="block font-medium mb-1 text-gray-700">
              Medicine Name <span className="text-theme-500">*</span>
            </label>
            <input
              name="medicine_name"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500"
              value={fields.medicine_name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              required
            />
            {/* Suggestions */}
            {showSuggestions && fields.medicine_name && (
              <ul className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                {loading ? (
                  <li className="px-3 py-2 text-gray-400">Loading...</li>
                ) : suggestions.length === 0 ? (
                  <li className="px-3 py-2 text-gray-400">No suggestions</li>
                ) : (
                  suggestions.map((s, idx) => (
                    <li
                      key={s.medicine_id}
                      className={`px-3 py-2 cursor-pointer ${
                        idx === selectedIdx
                          ? "bg-theme-100"
                          : "hover:bg-theme-50"
                      }`}
                      onMouseDown={() => handleSelectSuggestion(s)}
                    >
                      {s.medicine_name}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          {/* Other Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Brand <span className="text-theme-500">*</span></label>
              <input name="brand_name" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.brand_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">MFG Date <span className="text-theme-500">*</span></label>
              <input type="date" name="mfg_date" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.mfg_date} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Expiry Date <span className="text-theme-500">*</span></label>
              <input type="date" name="expiry_date" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.expiry_date} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Packed Type <span className="text-theme-500">*</span></label>
              <input name="packed_type" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.packed_type} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Quantity <span className="text-theme-500">*</span></label>
              <input type="number" name="stock_quantity" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.stock_quantity} onChange={handleChange} min={1} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Purchase Price (₹) <span className="text-theme-500">*</span></label>
              <input type="number" name="purchase_price" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.purchase_price} onChange={handleChange} min={0} step="0.01" required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">MRP (₹) <span className="text-theme-500">*</span></label>
              <input type="number" name="mrp" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.mrp} onChange={handleChange} min={0} step="0.01" required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Batch No <span className="text-theme-500">*</span></label>
              <input name="batch_no" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500" value={fields.batch_no} onChange={handleChange} required />
            </div>
          </div>
        </div>
        {/* Error */}
        {error && (
          <div className="mt-4 text-theme-600 font-medium">{error}</div>
        )}
        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded bg-theme-200 text-theme-800 hover:bg-theme-300 transition duration-200 ease-in-out"
            onClick={onClose}
            disabled={fetchingDetails}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-theme-400 text-white hover:bg-theme-500 transition duration-200 ease-in-out"
            onClick={handleRefresh}
            disabled={fetchingDetails}
          >
            Refresh
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-theme-600 text-white hover:bg-theme-700 transition duration-200 ease-in-out"
            onClick={handleAdd}
            disabled={fetchingDetails}
          >
            {fetchingDetails ? "Loading..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
