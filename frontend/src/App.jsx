import { useState, useEffect } from "react";
import MemeEditor from "./MemeEditor";
import MemeHistory from "./MemeHistory";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [meme, setMeme] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const apiUrl = `${apiBaseUrl}/api/memes`;

  const fetchHistory = async () => {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.memes || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { 
    fetchHistory(); 
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPEG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setMeme(data.meme);
      setActiveTab("edit");
      await fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const deleteMeme = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete meme");
      await fetchHistory();
      if (meme && meme._id === id) {
        setMeme(null);
        setActiveTab("create");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center gap-6 px-8 items-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">
              Meme Generator
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Transform your images into hilarious memes with Auto-generated captions. Create, customize, and download in seconds!
          </p>
        </motion.header>

        {/* Error Message */}
        {error && (
          <motion.div 
            className={`mb-8 rounded-lg shadow-sm ${isDarkMode ? 'bg-red-900/50 border-l-4 border-red-500 text-red-200' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-medium p-4">{error}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className={`mb-8 rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-4xl mx-auto`}>
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${activeTab === "create" ? 
                `${isDarkMode ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'}` : 
                `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}
            >
              Create Meme
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              disabled={!meme}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${activeTab === "edit" ? 
                `${isDarkMode ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'}` : 
                `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} ${!meme && 'opacity-50 cursor-not-allowed'}`}`}
            >
              Edit Meme
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${activeTab === "history" ? 
                `${isDarkMode ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'}` : 
                `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}
            >
              Your Memes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl shadow-lg p-6 mb-10 max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Upload Your Image</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Get started by uploading an image to generate hilarious captions
                  </p>
                </div>
                
                <label className={`cursor-pointer rounded-xl p-8 border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ${isDarkMode ? 'border-gray-600 hover:border-purple-400 bg-gray-700/50' : 'border-gray-300 hover:border-purple-500 bg-gray-50'} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className={`font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Choose an image or drag and drop</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </div>
                </label>
                
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center space-x-4`}>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    JPEG, PNG, GIF
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Max 5MB
                  </span>
                </div>
                
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} w-full max-w-md`}>
                  <h3 className="font-medium mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pro Tips
                  </h3>
                  <ul className="text-sm space-y-1">
                    <li>• Use high-contrast images for best results</li>
                    <li>• Faces and expressive images work great</li>
                    <li>• Try different captions for maximum hilarity</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "edit" && meme && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <MemeEditor meme={meme} apiUrl={apiBaseUrl} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <MemeHistory 
                history={history} 
                apiUrl={apiBaseUrl} 
                onDelete={deleteMeme} 
                isDarkMode={isDarkMode}
                onMemeSelect={(meme) => {
                  setMeme(meme);
                  setActiveTab("edit");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© {new Date().getFullYear()}Meme Generator. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm hover:underline">Terms</a>
              <a href="#" className="text-sm hover:underline">Privacy</a>
              <a href="#" className="text-sm hover:underline">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;