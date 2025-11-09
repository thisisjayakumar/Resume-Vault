import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

function Hero({ onDownloadClick, onAdminClick }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVersions()
  }, [])

  const fetchVersions = async () => {
    try {
      const response = await axios.get('/.netlify/functions/list-versions')
      setVersions(response.data.versions || [])
    } catch (error) {
      console.error('Error fetching versions:', error)
      toast.error('Failed to load versions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Resume Manager
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Secure, versioned, and always accessible
          </p>
        </motion.div>

        {/* Main Download Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass rounded-3xl p-8 mb-8 shadow-2xl hover:shadow-primary/20 transition-all duration-300"
        >
          <div className="text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 animate-float">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-semibold text-white mb-4">
              Download Latest Resume
            </h2>
            <p className="text-gray-400 mb-6">
              Password protected • Secure delivery • Always up-to-date
            </p>
            <button
              onClick={() => onDownloadClick('latest')}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-primary/50 animate-glow"
            >
              Download Now
            </button>
          </div>
        </motion.div>

        {/* Version History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Previous Versions
          </h3>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl loading-shimmer"></div>
              ))}
            </div>
          ) : versions.length > 0 ? (
            <div className="space-y-4">
              {versions.slice(1, 3).map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div>
                    <p className="text-white font-medium">{version.name}</p>
                    <p className="text-gray-400 text-sm">{version.date}</p>
                  </div>
                  <button
                    onClick={() => onDownloadClick('version', version)}
                    className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 group-hover:scale-105"
                  >
                    Download
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No previous versions available</p>
          )}
        </motion.div>

        {/* Admin Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={onAdminClick}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline"
          >
            Admin Access
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Hero

