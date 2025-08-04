import React, { useState } from "react";
import axios from "axios";
import AddMedicineModal from "./AddMedicineModal";
import RandomColorLoader from "../../looader/RandomColorLoader"; // specife loader
import BoxLoader from "../../looader/BoxLoader"; // normal loader
import {
  PlusCircle,
  Trash2,
  Loader2,
  PackagePlus,
  AlertTriangle,
  FileUp,
} from "lucide-react";

// It's better to manage the base URL and token in a more centralized way,
// e.g., using an Axios instance or environment variables.
import BASE_URL from "../../../config";
const token = localStorage.getItem("lalitkumar_choudhary") || "";

function StockEntryResponsive() {
  // --- STATE MANAGEMENT ---
  const [wholesaler, setWholesaler] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // --- HANDLERS ---
  const handleAddMedicine = (medicine) => {
    setMedicines((prev) => [...prev, medicine]);
  };

  const handleDeleteMedicine = (idx) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearForm = () => {
    setWholesaler("");
    setInvoiceNumber("");
    setDate("");
    setMedicines([]);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!wholesaler || !invoiceNumber || !date) {
      setError("Please fill in all invoice details.");
      return;
    }
    if (medicines.length === 0) {
      setError("Please add at least one medicine to the list.");
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
          medicine: medicines, // API expects 'medicine' key
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setMessage(res.data.message || "Stock entry added successfully!");
        clearForm();
      } else {
        setError(res.data.message || "Failed to add stock entry.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "A server error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
      // Automatically clear messages after a few seconds
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleSubmitFile(file);
    }
  };

  const handleSubmitFile = async (file) => {
    setFileProcessing(true); // Start the file processing loader and blur
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("invoice", file); // 'invoice' should match the key expected by the backend

    try {
      const res = await axios.post(`${BASE_URL}/admin/api/process-invoice`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        const { wholesaler, invoiceNumber, date, medicines: apiMedicines } = res.data;
        
        // Validate if the API returned any medicines
        if (apiMedicines && apiMedicines.length > 0) {
          setWholesaler(wholesaler);
          setInvoiceNumber(invoiceNumber);
          setDate(date);
          setMedicines(apiMedicines);
          setMessage("Invoice processed successfully! Details have been filled.");
        } else {
          setError("Invoice processed, but no medicine items were found. Please add them manually.");
          // Clear any previously filled form data to avoid confusion
          clearForm();
        }
      } else {
        setError(res.data.message || "Failed to process invoice.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "A server error occurred during file upload."
      );
    } finally {
      setFileProcessing(false); // End the file processing loader and blur
      // Automatically clear messages after a few seconds
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
    }
  };

  // --- RENDER ---
  return (
    <>
      {/* File processing loader overlay */}
      {fileProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
          <RandomColorLoader />
        </div>
      )}
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Main layout grid: 1 column on mobile, 2 columns on large screens */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* --- LEFT COLUMN: FORM DETAILS --- */}
            <div className="lg:col-span-2">
              <div className="sticky p-6 bg-white rounded-lg shadow-md top-8">
                <h2 className="mb-6 text-2xl font-bold text-slate-800">
                  Stock Entry Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="wholesaler"
                      className="block mb-1 text-sm font-medium text-slate-600"
                    >
                      Wholesaler <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="wholesaler"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={wholesaler}
                      onChange={(e) => setWholesaler(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="invoiceNumber"
                      className="block mb-1 text-sm font-medium text-slate-600"
                    >
                      Invoice No <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="invoiceNumber"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="date"
                      className="block mb-1 text-sm font-medium text-slate-600"
                    >
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="date"
                      type="date"
                      className="w-full px-3 py-2 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  {/* --- MESSAGES --- */}
                  <div className="pt-4 space-y-3">
                    {error && (
                      <div
                        className="p-3 text-sm text-red-800 bg-red-100 rounded-lg"
                        role="alert"
                      >
                        {error}
                      </div>
                    )}
                    {message && (
                      <div
                        className="p-3 text-sm text-green-800 bg-green-100 rounded-lg"
                        role="alert"
                      >
                        {message}
                      </div>
                    )}
                  </div>
                  {/* --- ACTION BUTTONS --- */}
                  <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                    <button
                      type="submit"
                      className="flex items-center justify-center w-full px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-md shadow-sm sm:w-auto hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                      disabled={loading || fileProcessing}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Entry"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearForm}
                      className="w-full px-6 py-2.5 font-semibold text-slate-700 bg-slate-200 rounded-md sm:w-auto hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50"
                      disabled={loading || fileProcessing}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* --- RIGHT COLUMN: MEDICINE LIST --- */}
            <div className="lg:col-span-3">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-start justify-between gap-4 mb-5 sm:flex-row sm:items-center">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Medicine Items ({medicines.length})
                  </h3>
                  <div className="flex gap-2">
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-sm cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <FileUp size={20} />
                      Upload img/pdf
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*, application/pdf"
                      disabled={loading || fileProcessing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddMedicineModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      disabled={loading || fileProcessing}
                    >
                      <PlusCircle size={20} />
                      Add Medicine
                    </button>
                  </div>
                </div>
                {/* --- RESPONSIVE MEDICINE LIST --- */}
                <div className="space-y-4">
                  {medicines.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed rounded-lg border-slate-200">
                      <PackagePlus className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                      <p className="font-medium text-slate-500">
                        No medicines added yet.
                      </p>
                      <p className="text-sm text-slate-400">
                        Upload an invoice to fill automatically or click "Add Medicine" to enter manually.
                      </p>
                    </div>
                  ) : (
                    medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 transition-all duration-300 bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md hover:border-indigo-200"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-indigo-700">
                              {med.medicine_name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {med.brand_name}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="p-1 text-red-500 rounded-full hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleDeleteMedicine(idx)}
                            aria-label="Delete medicine"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {/* Card Body - Responsive Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-sm sm:grid-cols-3 md:grid-cols-4">
                          <div>
                            <span className="block text-xs font-medium text-slate-500">
                              Batch No.
                            </span>
                            <span className="font-semibold text-slate-700">
                              {med.batch_no}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-slate-500">
                              Quantity
                            </span>
                            <span className="font-semibold text-slate-700">
                              {med.stock_quantity}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-slate-500">
                              MRP
                            </span>
                            <span className="font-semibold text-slate-700">
                              ₹{med.mrp}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-slate-500">
                              Purchase
                            </span>
                            <span className="font-semibold text-slate-700">
                              ₹{med.purchase_price}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-slate-500">
                              Packed Type
                            </span>
                            <span className="font-semibold text-slate-700">
                              {med.packed_type}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-slate-500">
                              MFG Date
                            </span>
                            <span className="font-semibold text-slate-700">
                              {med.mfg_date}
                            </span>
                          </div>
                          <div
                            className={
                              new Date(med.expiry_date) < new Date()
                                ? "text-red-600"
                                : ""
                            }
                          >
                            <span className="block text-xs font-medium text-slate-500">
                              Expiry Date
                            </span>
                            <span className="font-semibold">
                              {med.expiry_date}{" "}
                              {new Date(med.expiry_date) < new Date() && (
                                <AlertTriangle className="inline w-4 h-4 ml-1" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* --- MODAL --- */}
      {showAddMedicineModal && (
        <AddMedicineModal
          onClose={() => setShowAddMedicineModal(false)}
          onAddMedicine={handleAddMedicine}
        />
      )}
    </>
  );
}

export default StockEntryResponsive;