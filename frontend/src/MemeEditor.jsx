import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

export default function MemeEditor({ meme, apiUrl, isDarkMode, onClose }) {
  const [caption, setCaption] = useState(meme.captions[0] || "");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [position, setPosition] = useState("bottom");
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const memeRef = useRef(null);

  const downloadMeme = async () => {
    if (!memeRef.current) return;
    
    setIsDownloading(true);
    try {
      // Ensure the image is loaded before capturing
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = `${apiUrl}${meme.imageUrl}`;
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      const canvas = await html2canvas(memeRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement("a");
      link.download = `meme-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate meme:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const positionStyles = {
    top: { 
      top: "10%", 
      left: "50%", 
      transform: "translate(-50%, 0)" 
    },
    middle: { 
      top: "50%", 
      left: "50%", 
      transform: "translate(-50%, -50%)" 
    },
    bottom: { 
      top: "90%", 
      left: "50%", 
      transform: "translate(-50%, -100%)" 
    },
  }[position];

  return (
    <motion.div 
      className={`rounded-xl w-full shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Meme Editor
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        <div className="flex flex-col items-center">
          <motion.div 
            ref={memeRef}
            className="relative w-full max-w-lg overflow-hidden rounded-xl shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: "300px" }}
          >
            <img
              src={`${apiUrl}${meme.imageUrl}`}
              alt="Meme"
              className="w-full h-auto rounded-lg"
              crossOrigin="anonymous"
            />
            <motion.div
              className="absolute text-center w-full px-4"
              style={{
                ...positionStyles,
                fontSize: `${fontSize}px`,
                color: textColor,
                textShadow: `2px 2px 0 ${outlineColor}, 
                            -2px -2px 0 ${outlineColor}, 
                            2px -2px 0 ${outlineColor}, 
                            -2px 2px 0 ${outlineColor}`,
                fontFamily: "'Impact', 'Arial Black', sans-serif",
                width: "90%",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {caption}
            </motion.div>
          </motion.div>
          
          <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Click and drag to reposition text (coming soon)
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Caption
            </label>
            <div className="relative">
              <select
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm appearance-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                style={{ height: 'auto' }}
              >
                {meme.captions.map((c, i) => (
                  <option key={i} value={c} style={{ whiteSpace: 'normal' }}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={copyToClipboard}
                className={`text-sm px-3 py-1 rounded flex items-center ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Text
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Text Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Font Size: <span className="font-bold text-purple-500">{fontSize}px</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-gray-600' : 'bg-purple-100'}`}
                />
                <button 
                  onClick={() => setFontSize(40)}
                  className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Reset
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Text Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer shadow-md border border-gray-300"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className={`w-24 p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <button 
                  onClick={() => setTextColor("#ffffff")}
                  className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Reset
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Outline Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer shadow-md border border-gray-300"
                />
                <input
                  type="text"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className={`w-24 p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <button 
                  onClick={() => setOutlineColor("#000000")}
                  className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <motion.button
              onClick={downloadMeme}
              disabled={isDownloading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center ${
                isDownloading
                  ? "bg-gray-500 cursor-not-allowed"
                  : `${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`
              }`}
              whileHover={!isDownloading ? { scale: 1.02 } : {}}
              whileTap={!isDownloading ? { scale: 0.98 } : {}}
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Meme
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}