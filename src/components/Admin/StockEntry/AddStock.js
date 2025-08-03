import React, { useState, useRef } from "react";
import axios from "axios";
import { Shell } from "lucide-react"; // Importing the Bot icon for the AI button
import RandomColorLoader from "../../looader/RandomColorLoader";
import AddMedicineModal from './AddMedicineModal'
// Placeholder for BoxLoader
const BoxLoader = () => (

  <RandomColorLoader
    className="animate-spin-slow w-full h-full mb-4"
    // ... other props
  />


);



// ImageUploadModal Component updated to use Gemini API
const ImageUploadModal = ({ onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  // Function to convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 string without data:image/png;base64,
      reader.onerror = (error) => reject(error);
    });
  };

  // Exponential backoff retry logic for API calls
  const fetchWithExponentialBackoff = async (url, options, retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 && retries > 0) { // Too Many Requests
        await new Promise(res => setTimeout(res, delay));
        return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64ImageData = await fileToBase64(selectedFile);
      const prompt = "Extract the following information from this invoice image as a JSON object: wholesaler, invoiceNumber, and an array of medicine objects. Each medicine object should contain: packed_type (e.g., 'strip', 'bottle', 'box', 'vial'), medicine_name, brand_name, batch_no, purchase_price, mrp, stock_quantity (as a number), mfg_date (YYYY-MM-DD), and expiry_date (YYYY-MM-DD). If a field is not found, use an empty string for text fields, 0 for numbers, and 'YYYY-MM-DD' for dates. Ensure all numerical values are correctly parsed as numbers. The response should strictly adhere to this JSON schema.";

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: selectedFile.type, // Use the actual MIME type of the selected file
                  data: base64ImageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "wholesaler": { "type": "STRING" },
              "invoiceNumber": { "type": "STRING" },
              "medicine": {
                "type": "ARRAY",
                "items": {
                  "type": "OBJECT",
                  "properties": {
                    "packed_type": { "type": "STRING" },
                    "medicine_name": { "type": "STRING" },
                    "brand_name": { "type": "STRING" },
                    "batch_no": { "type": "STRING" },
                    "purchase_price": { "type": "STRING" }, // Keep as string if it can have decimals
                    "mrp": { "type": "STRING" }, // Keep as string if it can have decimals
                    "stock_quantity": { "type": "NUMBER" },
                    "mfg_date": { "type": "STRING" },
                    "expiry_date": { "type": "STRING" }
                  },
                  "required": ["packed_type", "medicine_name", "brand_name", "batch_no", "purchase_price", "mrp", "stock_quantity", "mfg_date", "expiry_date"]
                }
              }
            },
            "required": ["wholesaler", "invoiceNumber", "medicine"]
          }
        }
      };

      const apiKey = 'AIzaSyDZrqy9EZ-9ZONYihdU6HxUCcORXdVHORI' // Leave as-is, Canvas will provide it at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetchWithExponentialBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(jsonString);
        onUploadSuccess(parsedData); // Pass the parsed data back to the parent
        onClose(); // Close the modal on success
      } else {
        setError("No valid data received from the AI. Please try another image or check the format.");
      }

    } catch (err) {
      console.error("Error processing image with Gemini API:", err);
      setError(`Processing failed: ${err.message}. Ensure the image is clear and contains invoice data.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Upload Invoice Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>
        )}

        {error && (
          <div className="relative px-4 py-3 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-md" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-200 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            className="flex items-center justify-center px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <BoxLoader />
              </>
            ) : (
              "Upload and Process"
            )}
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
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false); // Renamed for clarity
  const [showImageUploadModal, setShowImageUploadModal] = useState(false); // New state for image modal
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
   * Handles the click of the AI image processing button, opening the image upload modal.
   */
  const handleImageEntry = () => {
    setShowImageUploadModal(true);
  };

  /**
   * Processes the data received from the image upload modal and fills the form.
   * @param {object} invoiceData - The JSON data received from the server.
   */
  const handleProcessedInvoiceData = (invoiceData) => {
    if (invoiceData) {
      setWholesaler(invoiceData.wholesaler || "");
      setInvoiceNumber(invoiceData.invoiceNumber || "");
      // Assuming the date from the invoice is in a format compatible with input type="date"
      // You might need to parse and reformat it if it's different (e.g., "YYYY-MM-DD")
      // If date is not in the response, you might keep the current date or leave it blank.
      // Example: if invoiceData.date exists and is in "YYYY-MM-DD" format:
      // setDate(invoiceData.date); 

      if (invoiceData.medicine && Array.isArray(invoiceData.medicine)) {
        setMedicines(invoiceData.medicine);
      }
      setMessage("Invoice data successfully loaded from image!");
    } else {
      setError("No data received from image processing.");
    }
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
    <div className="flex flex-col w-full font-sans bg-theme-70 flex-1">
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
              onClick={() => setShowAddMedicineModal(true)}
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
      {showAddMedicineModal && (
        <AddMedicineModal
          onClose={() => setShowAddMedicineModal(false)}
          onAddMedicine={handleAddMedicine}
        />
      )}
      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <ImageUploadModal
          onClose={() => setShowImageUploadModal(false)}
          onUploadSuccess={handleProcessedInvoiceData}
        />
      )}
    </div>
  );
}

export default StockEntry;
