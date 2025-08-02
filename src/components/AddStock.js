import React, { useState } from "react";
import axios from "axios";
import { Shell } from "lucide-react"; // Importing the Bot icon for the AI button

// Placeholder for AddMedicineModal to make the code runnable without external files
const AddMedicineModal = ({ onClose, onAddMedicine }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Medicine</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <p>This is a placeholder modal. Add your form fields here.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={() => {
              // Example of adding a new medicine
              onAddMedicine({
                medicine_name: "New Med",
                brand_name: "Brand X",
                mfg_date: "2023-01-01",
                expiry_date: "2025-01-01",
                packed_type: "Tablet",
                stock_quantity: 100,
                purchase_price: 10.50,
                mrp: 15.00,
                batch_no: "BATCH123"
              });
              onClose();
            }}
            className="px-4 py-2 rounded-md text-white bg-theme-600 hover:bg-theme-700"
          >
            Add Medicine
          </button>
        </div>
      </div>
    </div>
  );
};


const BASE_URL = "http://localhost:4000";
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
   * Placeholder function for the new AI image processing button.
   * In a real app, this would open a modal or navigate to a new page
   * to handle image upload and processing.
   */
  const handleImageEntry = () => {
    console.log("Image entry button clicked. Implement your image processing logic here!");
    // You would typically open a new modal or a file input here.
    // For example, you could show a modal with a file upload field.
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
    <div className="flex flex-col w-full font-sans bg-gray-100 flex-1">
      {/* New AI-powered button, placed above the form */}
      <div className="w-full max-w-5xl px-4 mx-auto mt-6 sm:px-6">
        <button
          type="button"
          onClick={handleImageEntry}
          className="flex items-center justify-center w-full px-5 py-2 text-base font-medium text-white transition-colors rounded-lg shadow-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 md:w-auto"
        >
    
            <Shell className="w-5 h-5 mr-2" />
          Entry purchase bill by img
        </button>
      </div>

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
