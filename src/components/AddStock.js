import React, { useState } from "react";
import axios from "axios";
import AddMedicineModal from "./AddMedicineModal";

const BASE_URL = "http://localhost:4000";
const token = localStorage.getItem('token') || "";

function StockEntry() {
  const [wholesaler, setWholesaler] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleAddMedicine = (medicine) => {
    setMedicines(prev => [...prev, medicine]);
  };

  const handleDeleteMedicine = (idx) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!wholesaler || !invoiceNumber || !date) {
      setError("Please fill all required fields.");
      return;
    }
    if (medicines.length === 0) {
      setError("Please add at least one medicine.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/admin/medicine_stock`, {
        wholesaler,
        invoiceNumber,
        date,
        medicine: medicines
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = res.data;
      if (res.status === 200) {
        setMessage(data.message || "Stock entry added!");
        setWholesaler("");
        setInvoiceNumber("");
        setDate("");
        setMedicines([]);
      } else {
        setError(data.message || "Failed to add stock entry.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Network error or failed to fetch medicine details.");
      }
    }
    setLoading(false);
    setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 3000);
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center px-4 py-4 bg-theme-100 shadow sticky top-0 z-10">
        <span className="text-xl sm:text-2xl mr-3 cursor-pointer text-theme-800" onClick={() => window.history.back()}>←</span>
        <h1 className="text-lg sm:text-xl font-bold text-theme-800">Add New Stock Entry</h1>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow px-4 sm:px-6 py-6 mt-6 sm:mt-8"
      >
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Wholesaler <span className="text-theme-500">*</span></label>
            <input className="w-full border rounded px-3 py-2 focus:ring-theme-500 focus:outline-none" value={wholesaler} onChange={(e) => setWholesaler(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Invoice Number <span className="text-theme-500">*</span></label>
            <input className="w-full border rounded px-3 py-2 focus:ring-theme-500 focus:outline-none" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Date <span className="text-theme-500">*</span></label>
            <input type="date" className="w-full border rounded px-3 py-2 focus:ring-theme-500 focus:outline-none" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        {/* Medicine Table */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h2 className="font-semibold text-lg text-theme-800">Medicines in this Invoice</h2>
            <button
              type="button"
              className="flex items-center bg-theme-600 text-white px-4 py-2 rounded hover:bg-theme-700 transition"
              onClick={() => setShowModal(true)}
            >
              <span className="text-xl mr-2">+</span> Add Medicine
            </button>
          </div>
          <div className="overflow-x-auto rounded border border-theme-200">
            <table className="min-w-full text-sm">
              <thead className="bg-theme-100 text-theme-800">
                <tr>
                  {["Medicine Name", "Brand", "MFG Date", "Expiry Date", "Packed Type", "Qty", "Purchase", "MRP", "Batch", "Action"]
                    .map((col, i) => (
                      <th key={i} className="px-2 py-2 text-left font-semibold">{col}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-400">No medicines added yet.</td>
                  </tr>
                ) : medicines.map((med, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-theme-50"}>
                    <td className="px-2 py-2">{med.medicine_name}</td>
                    <td className="px-2 py-2">{med.brand_name}</td>
                    <td className="px-2 py-2">{med.mfg_date}</td>
                    <td className="px-2 py-2">{med.expiry_date}</td>
                    <td className="px-2 py-2">{med.packed_type}</td>
                    <td className="px-2 py-2">{med.stock_quantity}</td>
                    <td className="px-2 py-2">{med.purchase_price}</td>
                    <td className="px-2 py-2">{med.mrp}</td>
                    <td className="px-2 py-2">{med.batch_no}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        className="text-theme-500 hover:text-red-600"
                        onClick={() => handleDeleteMedicine(idx)}
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="text-red-600 font-medium mb-2">{error}</div>}
        {message && <div className="text-green-600 font-medium mb-2">{message}</div>}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => {
              setWholesaler("");
              setInvoiceNumber("");
              setDate("");
              setMedicines([]);
              setError(null);
              setMessage(null);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded bg-theme-200 text-theme-800 hover:bg-theme-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded bg-theme-600 text-white hover:bg-theme-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Stock Entry"}
          </button>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <AddMedicineModal
          onClose={() => setShowModal(false)}
          onAddMedicine={handleAddMedicine}
        />
      )}
    </div>
  );
}

export default StockEntry;