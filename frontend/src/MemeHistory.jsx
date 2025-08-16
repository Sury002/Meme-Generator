import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from 'prop-types';
import MemeEditor from "./MemeEditor";

export default function MemeHistory({ history = [], apiUrl, onDelete, onMemeSelect, isDarkMode }) {
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  if (!Array.isArray(history)) {
    console.error('History prop is not an array:', history);
    return (
      <motion.div 
        className={`rounded-xl shadow-lg p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Error Loading Memes</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          There was a problem loading your meme history. Please try again.
        </p>
      </motion.div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div 
        className={`rounded-xl shadow-lg p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Your Meme History</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          No memes generated yet. Upload an image to get started!
        </p>
      </motion.div>
    );
  }

  const handleMemeClick = (meme) => {
    setSelectedMeme(meme);
    setEditMode(true);
  };

  const handleCloseEditor = () => {
    setSelectedMeme(null);
    setEditMode(false);
  };

  return (
    <motion.div 
      className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Your Memes
        </h2>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {history.length} meme{history.length !== 1 ? 's' : ''} generated
        </p>
      </div>
      
      <AnimatePresence>
        {selectedMeme && editMode && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Edit Meme</h3>
                <button 
                  onClick={handleCloseEditor}
                  className={`p-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <MemeEditor 
                  meme={selectedMeme} 
                  apiUrl={apiUrl} 
                  isDarkMode={isDarkMode}
                  onClose={handleCloseEditor}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {history.map((meme) => (
              <motion.div 
                key={meme._id}
                className={`relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <motion.img
                  src={`${apiUrl}${meme.imageUrl}`}
                  alt="Meme"
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => onMemeSelect ? onMemeSelect(meme) : handleMemeClick(meme)}
                  whileHover={{ scale: 1.05 }}
                />
                
                <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 space-x-2 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMemeSelect ? onMemeSelect(meme) : handleMemeClick(meme);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-transform hover:scale-110 shadow-md"
                    title="Edit meme"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(meme._id);
                    }}
                    className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition-transform hover:scale-110 shadow-md"
                    title="Delete meme"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
                
                {confirmDeleteId === meme._id && (
                  <motion.div 
                    className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex flex-col items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-white text-center mb-3 font-medium">Delete this meme?</p>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(meme._id);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

MemeHistory.propTypes = {
  history: PropTypes.array,
  apiUrl: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMemeSelect: PropTypes.func,
  isDarkMode: PropTypes.bool
};

MemeHistory.defaultProps = {
  history: [],
  onMemeSelect: null,
  isDarkMode: false
};