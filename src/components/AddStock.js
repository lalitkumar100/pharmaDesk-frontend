import React, { useState } from "react";
import axios from "axios";
import AddMedicineModal from "./AddMedicineModal";

const BASE_URL = "http://localhost:4000";
// Get token from localStorage
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
    setMedicines((prev) => [...prev, medicine]);
  };

  const handleDeleteMedicine = (idx) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
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
        medicine: medicines,
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
    }  catch (err) {
      // Check if the error has a response with a message
      if (err.response && err.response.data && err.response.data.message) {
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
    <div className="min-h-screen bg-theme-50 flex flex-col font-sans">
      <header className="flex items-center px-4 py-4 bg-theme-100 shadow">
        <span className="text-2xl mr-2 cursor-pointer text-theme-800" onClick={() => window.history.back()}>←</span>
        <h1 className="text-xl font-bold text-theme-800">Add New Stock Entry</h1>
      </header>
      <form className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-8 w-11/12 md:w-full" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Wholesaler <span className="text-theme-500">*</span></label>
            <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500 focus:border-theme-500" value={wholesaler} onChange={(e) => setWholesaler(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Invoice Number <span className="text-theme-500">*</span></label>
            <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500 focus:border-theme-500" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Date <span className="text-theme-500">*</span></label>
            <input type="date" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-theme-500 focus:border-theme-500" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg text-theme-800">Medicines in this Invoice</h2>
            <button type="button" className="flex items-center bg-theme-600 text-white px-4 py-2 rounded hover:bg-theme-700 shadow-md transition duration-200 ease-in-out" onClick={() => setShowModal(true)}>
              <span className="text-xl mr-1">+</span> Add Medicine
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-theme-200">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-theme-100 text-theme-800">
                  <th className="px-2 py-2 text-left text-sm font-semibold">Medicine Name</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Brand</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">MFG Date</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Expiry Date</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Packed Type</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Purchase Price</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">MRP</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Batch No</th>
                  <th className="px-2 py-2 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-400">No medicines added yet.</td>
                  </tr>
                ) : (
                  medicines.map((med, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-theme-50"}>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.medicine_name}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.brand_name}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.mfg_date}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.expiry_date}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.packed_type}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.stock_quantity}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.purchase_price}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.mrp}</td>
                      <td className="px-2 py-2 text-sm text-gray-800">{med.batch_no}</td>
                      <td className="px-2 py-2">
                        <button type="button" className="text-theme-500 hover:text-theme-700 transition duration-200 ease-in-out" onClick={() => handleDeleteMedicine(idx)} title="Delete">🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {error && <div className="mb-2 text-theme-600 font-medium">{error}</div>}
        {message && <div className="mb-2 text-theme-600 font-medium">{message}</div>}
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" className="px-4 py-2 rounded bg-theme-200 text-theme-800 hover:bg-theme-300 transition duration-200 ease-in-out" onClick={() => { setWholesaler(""); setInvoiceNumber(""); setDate(""); setMedicines([]); setError(null); setMessage(null); }} disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-theme-600 text-white hover:bg-theme-700 shadow-md transition duration-200 ease-in-out" disabled={loading}>{loading ? "Submitting..." : "Submit Stock Entry"}</button>
        </div>
      </form>
      {showModal && (
        <AddMedicineModal onClose={() => setShowModal(false)} onAddMedicine={handleAddMedicine} />
      )}
    </div>
  );
}

export default StockEntry;
