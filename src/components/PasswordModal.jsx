import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

function PasswordModal({ isOpen, onClose, downloadType }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [attemptInfo, setAttemptInfo] = useState(null)

  useEffect(() => {
    if (isOpen) {
      checkAttempts()
    }
  }, [isOpen])

  const checkAttempts = async () => {
    try {
      const response = await axios.get('/.netlify/functions/check-attempts')
      setAttemptInfo(response.data)
    } catch (error) {
      console.error('Error checking attempts:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password) {
      toast.error('Please enter a password')
      return
    }

    setLoading(true)

    try {
      const payload = {
        password,
        versionId: downloadType === 'latest' ? null : downloadType?.id
      }

      const response = await axios.post(
        '/.netlify/functions/download-resume',
        payload,
        { responseType: 'blob' }
      )

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const filename = response.headers['content-disposition']
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'resume.pdf'
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Resume downloaded successfully!')
      setPassword('')
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Download failed'
      
      if (error.response?.status === 429) {
        toast.error('Too many attempts. Account locked for 24 hours.')
      } else if (error.response?.status === 401) {
        const remaining = error.response?.data?.remainingAttempts
        toast.error(`Incorrect password. ${remaining} attempts remaining.`)
        await checkAttempts()
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Enter Password</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {attemptInfo?.locked ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Account Locked</h3>
                <p className="text-gray-400 mb-4">
                  Too many failed attempts. Please try again in:
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {formatTime(attemptInfo.timeRemaining)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter password"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {attemptInfo && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-300 text-sm">
                      Attempts remaining: <span className="font-bold">{attemptInfo.remainingAttempts}/3</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </span>
                  ) : (
                    'Download Resume'
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PasswordModal

