import React, { useState, useEffect, useRef } from 'react';
import { Shell, Sparkles, X } from 'lucide-react';
import RandomColorLoader from './RandomColorLoader'; // Import the new component

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

  const callGeminiApi = async (payload, model = 'gemini-2.5-flash-preview-05-20') => {
    const apiKey = 'AIzaSyDZrqy9EZ-9ZONYihdU6HxUCcORXdVHORI';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let response;
    let result;
    const maxRetries = 5;
    let retryCount = 0;
    let delay = 1000;

    while (retryCount < maxRetries) {
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          result = await response.json();
          return result;
        } else if (response.status === 429 || response.status >= 500) {
          console.warn(`API call failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          retryCount++;
        } else {
          const errorData = await response.json();
          throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`);
        }
      } catch (err) {
        if (retryCount === maxRetries - 1) {
          throw err;
        }
        console.error(`Fetch error (retry ${retryCount + 1}):`, err);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        retryCount++;
      }
    }
    throw new Error('Max retries exceeded for API call.');
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

    let chatHistory = [];

    try {
      if (selectedImage) {
        const base64ImageData = await fileToBase64(selectedImage);
        chatHistory.push({
          role: 'user',
          parts: [
            { text: inputText.trim() },
            {
              inlineData: {
                mimeType: selectedImage.type,
                data: base64ImageData,
              },
            },
          ],
        });
      } else {
        chatHistory.push({ role: 'user', parts: [{ text: inputText.trim() }] });
      }

      const payload = { contents: chatHistory };
      const result = await callGeminiApi(payload);

      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const botResponseText = result.candidates[0].content.parts[0].text;
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: botResponseText },
        ]);
      } else {
        throw new Error('Invalid API response structure.');
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
      const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };

      const result = await callGeminiApi(payload);

      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const summaryText = result.candidates[0].content.parts[0].text;
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
    <div className="flex flex-col h-full font-sans bg-stone-900 text-gray-100">
      {/* Header */}
<header className="flex items-center justify-between p-4 bg-gradient-to-r from-stone-700 to-stone-900 text-white shadow-lg rounded-b-xl **flex-wrap gap-y-2**">
  {/* Left side of the header */}
  <div className="flex items-center **w-full sm:w-auto**">
    <h3 className="text-xl **sm:text-2xs** font-bold tracking-wide flex items-center">
      Hello, it's <Shell className="mx-2 text-stone-300" size={28} /> 
    </h3>
  </div>

  {/* Right side of the header with buttons */}
  <div className="flex items-center space-x-2 **ml-auto**">

    {onClose && (
      <button
        onClick={onClose}
        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-stone-700"
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
                <Shell className="text-stone-400" size={24} />
              </div>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow-md **sm:max-w-[60%]** ${
                msg.type === 'user'
                  ? 'bg-stone-600 text-white rounded-br-none'
                  : 'bg-stone-800 text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded preview"
                  className="max-h-24 w-auto rounded-md mb-2 border border-gray-700"
                />
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center">
            <div className="flex-shrink-0 mr-3 mt-1">
              <Shell className="text-stone-400 animate-pulse" size={24} />
            </div>
            <div className="bg-stone-800 p-3 rounded-xl shadow-md rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-center p-2 bg-red-900 rounded-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-stone-800 border-t border-gray-700 shadow-inner rounded-t-xl">
        {imagePreviewUrl && (
          <div className="relative mb-3 p-2 border border-gray-600 rounded-lg bg-stone-700">
            <img src={imagePreviewUrl} alt="Image Preview" className="max-h-24 w-auto rounded-md mx-auto" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition-colors"
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
          {/* Image Upload Button */}
          <label
            htmlFor="imageUpload"
            className="flex-shrink-0 p-3 bg-stone-700 text-stone-200 rounded-full cursor-pointer hover:bg-stone-600 transition-colors shadow-sm"
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
            />
          </label>

          {/* Resizable Textarea */}
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none overflow-hidden p-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 text-gray-100 bg-stone-700 transition-all duration-200 **text-sm sm:text-base**"
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

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className={`flex-shrink-0 p-3 rounded-full shadow-lg transition-all duration-200 ${
              isLoading || isSummarizing || (!inputText.trim() && !selectedImage)
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-stone-500 text-white hover:bg-stone-600'
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
      {/* Custom Scrollbar Styling (for webkit browsers) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #4e6d78ff;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4e4f4fff;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #748baaff;
        }
      `}</style>
    </div>
  );
}

export default ChatBotApp;