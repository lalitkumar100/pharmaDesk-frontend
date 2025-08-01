import React, { useState } from "react";
import axios from "axios";

// Assuming AddMedicineModal is also designed to be responsive
import AddMedicineModal from "./AddMedicineModal";

// Placeholder for AddMedicineModal to make the code runnable without external files

const BASE_URL = "http://localhost:4000";
// In a real application, consider managing tokens more securely (e.g., React Context, Redux)
// and fetching them dynamically rather than directly from localStorage at the top level.
const token = localStorage.getItem("token") || "";

function StockEntry() {
  const [wholesaler, setWholesaler] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handles adding a new medicine object to the medicines array.
   * @param {object} medicine - The medicine object to add.
   */
  const handleAddMedicine = (medicine) => {
    setMedicines((prev) => [...prev, medicine]);
  };

  /**
   * Handles deleting a medicine from the medicines array by its index.
   * @param {number} idx - The index of the medicine to delete.
   */
  const handleDeleteMedicine = (idx) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  /**
   * Handles the form submission, sending stock entry data to the backend.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Basic client-side validation
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
      const res = await axios.post(
        `${BASE_URL}/admin/medicine_stock`,
        {
          wholesaler,
          invoiceNumber,
          date,
          medicine: medicines, // Ensure backend expects 'medicine' as an array
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Ensure token is valid and sent
          },
        }
      );

      const data = res.data;
      if (res.status === 200) {
        setMessage(data.message || "Stock entry added successfully!");
        // Clear form fields on successful submission
        setWholesaler("");
        setInvoiceNumber("");
        setDate("");
        setMedicines([]);
      } else {
        // Handle non-200 responses from the API
        setError(data.message || "Failed to add stock entry. Please try again.");
      }
    } catch (err) {
      // Handle network errors or errors from the server response
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Network error or failed to connect to the server. Please check your connection."
        );
      }
    } finally {
      setLoading(false);
      // Automatically clear messages after a few seconds
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
    }
  };

  return (
    // Removed min-h-screen here, as the parent Home.js's main div is already managing height and overflow.
    // The flex-1 class remains to ensure it takes up available space within a flex parent.
    <div className="flex flex-col w-full font-sans bg-gray-100 flex-1">
      
  
      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl px-4 py-6 mx-auto mt-6 mb-8 bg-white rounded-lg shadow-lg sm:px-6 sm:mt-8"
      >
        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label
              htmlFor="wholesaler"
              className="block mb-1 font-medium text-gray-700"
            >
              Wholesaler <span className="text-theme-500">*</span>
            </label>
            <input
              id="wholesaler"
              className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-md focus:ring-theme-500 focus:border-theme-500 focus:outline-none"
              value={wholesaler}
              onChange={(e) => setWholesaler(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="invoiceNumber"
              className="block mb-1 font-medium text-gray-700"
            >
              Invoice Number <span className="text-theme-500">*</span>
            </label>
            <input
              id="invoiceNumber"
              className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-md focus:ring-theme-500 focus:border-theme-500 focus:outline-none"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="block mb-1 font-medium text-gray-700"
            >
              Date <span className="text-theme-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-md focus:ring-theme-500 focus:border-theme-500 focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Medicine Table Section */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-theme-800">
              Medicines in this Invoice
            </h2>
            <button
              type="button"
              className="flex items-center px-5 py-2 text-base font-medium text-white transition-colors rounded-md shadow-sm bg-theme-600 hover:bg-theme-700"
              onClick={() => setShowModal(true)}
            >
              <span className="mr-2 text-xl leading-none">+</span> Add Medicine
            </button>
          </div>
          {/* Responsive Table Container */}
          <div className="overflow-x-auto border rounded-lg shadow-sm border-theme-200">
            <table className="min-w-full text-sm divide-y divide-theme-200">
              <thead className="text-theme-800 bg-theme-100">
                <tr>
                  {/* Added min-w classes for better column sizing on smaller screens if needed */}
                  {[
                    "Medicine Name",
                    "Brand",
                    "MFG Date",
                    "Expiry Date",
                    "Packed Type",
                    "Qty",
                    "Purchase",
                    "MRP",
                    "Batch",
                    "Action",
                  ].map((col, i) => (
                    <th
                      key={i}
                      className="px-3 py-3 text-left font-semibold whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-100">
                {medicines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-6 text-center italic text-gray-400"
                    >
                      No medicines added yet. Click "Add Medicine" to start.
                    </td>
                  </tr>
                ) : (
                  medicines.map((med, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-theme-50"}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.medicine_name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.brand_name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.mfg_date}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.expiry_date}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.packed_type}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.stock_quantity}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.purchase_price}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{med.mrp}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {med.batch_no}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="p-1 transition-colors rounded-full text-theme-500 hover:text-red-600 hover:bg-red-100"
                          onClick={() => handleDeleteMedicine(idx)}
                          aria-label={`Delete ${med.medicine_name}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div
            className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block ml-2 sm:inline">{error}</span>
          </div>
        )}
        {message && (
          <div
            className="relative px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded-md"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block ml-2 sm:inline">{message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-end gap-3 mt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              // Reset all form fields and messages
              setWholesaler("");
              setInvoiceNumber("");
              setDate("");
              setMedicines([]);
              setError(null);
              setMessage(null);
            }}
            className="w-full px-6 py-2 font-medium transition-colors rounded-md shadow-sm sm:w-auto bg-theme-200 text-theme-800 hover:bg-theme-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full px-6 py-2 font-medium text-white transition-colors rounded-md shadow-md sm:w-auto bg-theme-600 hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Stock Entry"}
          </button>
        </div>
      </form>
      {/* Add Medicine Modal */}
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