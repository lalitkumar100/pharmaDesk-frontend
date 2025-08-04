import React, { useState, useEffect, useRef } from 'react';
import { Shell, Sparkles, X } from 'lucide-react';
import RandomColorLoader from './looader/RandomColorLoader';
import BASE_URL from '../config';

function ChatBotApp({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const backendUrl = `http://${BASE_URL}/admin/api/chat`;
  const token = localStorage.getItem("lalitkumar_choudhary");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (document.getElementById('imageUpload')) {
      document.getElementById('imageUpload').value = '';
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // New function to send requests to the backend
  const sendToBackend = async (payload) => {
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {     
            'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
         },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending request to backend:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage = {
      type: 'user',
      text: inputText.trim(),
      image: imagePreviewUrl,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const chatHistory = [{
        role: 'user',
        parts: [{ text: inputText.trim() }],
      }];

      const payload = {
        messages: chatHistory,
      };

      if (selectedImage) {
        const base64ImageData = await fileToBase64(selectedImage);
        payload.image = base64ImageData;
        payload.mimeType = selectedImage.type;
      }

      const result = await sendToBackend(payload);
      
      if (result?.text) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: result.text },
        ]);
      } else {
        throw new Error('Invalid API response structure from backend.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get response from chatbot. Please try again.');
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Oops! Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
      setInputText('');
      handleRemoveImage();
    }
  };

  const handleSummarizeChat = async () => {
    if (messages.length === 0) {
      setError('No conversation to summarize.');
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      const conversationText = messages.map(msg => {
        if (msg.type === 'user') {
          return `User: ${msg.text}`;
        } else {
          return `Bot: ${msg.text}`;
        }
      }).join('\n');

      const prompt = `Please provide a concise summary of the following conversation:\n\n${conversationText}`;
      const payload = {
        messages: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      const result = await sendToBackend(payload);

      if (result?.text) {
        const summaryText = result.text;
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: `✨ Chat Summary:\n${summaryText}` },
        ]);
      } else {
        throw new Error('Invalid API response structure for summarization.');
      }
    } catch (err) {
      console.error('Error summarizing chat:', err);
      setError('Failed to summarize chat. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-[#2a2a2a] text-[#f0f0f0] rounded-lg shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gradient-to-r from-[#2c4e4e] to-[#4e7d7d] text-white shadow-lg rounded-t-xl">
        <div className="flex items-center">
          <h3 className="text-xl font-bold tracking-wide flex items-center">
            Hello, it's <Shell className="mx-2 text-[#b0e0e6]" size={28} />
          </h3>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={handleSummarizeChat}
            className={`p-2 rounded-md transition-colors ${
              isSummarizing
                ? 'bg-[#1a2d2d] text-[#a0a0a0] cursor-not-allowed'
                : 'text-white bg-[#5f9ea0] hover:bg-[#4d8c8e]'
            }`}
            disabled={isSummarizing}
            aria-label="Summarize chat"
          >
            {isSummarizing ? (
              <RandomColorLoader className="h-6 w-6" />
            ) : (
              <Sparkles size={24} />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-[#2c4e4e]"
              aria-label="Close chat"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'bot' && (
              <div className="flex-shrink-0 mr-3 mt-1">
                <Shell className="text-[#a0e0e6]" size={24} />
              </div>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow-md sm:max-w-[60%] ${
                msg.type === 'user'
                  ? 'bg-[#3d7c7c] text-white rounded-br-none'
                  : 'bg-[#2c4e4e] text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded preview"
                  className="max-h-24 w-auto rounded-md mb-2 border border-[#4e7d7d]"
                />
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center">
            <div className="flex-shrink-0 mr-3 mt-1">
              <Shell className="text-[#a0e0e6] animate-pulse" size={24} />
            </div>
            <div className="bg-[#2c4e4e] p-3 rounded-xl shadow-md rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#5f9ea0] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-[#5f9ea0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#5f9ea0] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-[#e6b0b0] text-center p-2 bg-[#5c2d2d] rounded-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#2c4e4e] border-t border-[#4e7d7d] shadow-inner rounded-b-xl">
        {imagePreviewUrl && (
          <div className="relative mb-3 p-2 border border-[#4e7d7d] rounded-lg bg-[#3d7c7c]">
            <img src={imagePreviewUrl} alt="Image Preview" className="max-h-24 w-auto rounded-md mx-auto" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-[#d32f2f] text-white rounded-full p-1 text-xs hover:bg-[#e53935] transition-colors"
              aria-label="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-end space-x-3">
          <label
            htmlFor="imageUpload"
            className="flex-shrink-0 p-3 bg-[#3d7c7c] text-[#a0e0e6] rounded-full cursor-pointer hover:bg-[#4e8d8e] transition-colors shadow-sm"
            title="Upload Image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isLoading || isSummarizing}
            />
          </label>

          <textarea
            ref={textareaRef}
            className="flex-1 resize-none overflow-hidden p-3 border border-[#4e7d7d] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a0e0e6] text-gray-100 bg-[#3d7c7c] transition-all duration-200 text-sm sm:text-base"
            placeholder="Type your message..."
            rows="1"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || isSummarizing}
          ></textarea>

          <button
            onClick={handleSendMessage}
            className={`flex-shrink-0 p-3 rounded-full shadow-lg transition-all duration-200 ${
              isLoading || isSummarizing || (!inputText.trim() && !selectedImage)
                ? 'bg-[#3d7c7c] text-[#a0a0a0] cursor-not-allowed'
                : 'bg-[#5f9ea0] text-white hover:bg-[#4d8c8e]'
            }`}
            disabled={isLoading || isSummarizing || (!inputText.trim() && !selectedImage)}
            title="Send Message"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #3d7c7c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5f9ea0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0e0e6;
        }
      `}</style>
    </div>
  );
}

export default ChatBotApp;