import { useState, Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import Background3D from './components/Background3D'
import Hero from './components/Hero'
import LoadingScreen from './components/LoadingScreen'

// Lazy load components for better performance
const PasswordModal = lazy(() => import('./components/PasswordModal'))
const AdminModal = lazy(() => import('./components/AdminModal'))

function App() {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [downloadType, setDownloadType] = useState(null) // 'latest' or version object

  const handleDownloadClick = (type = 'latest', versionData = null) => {
    setDownloadType(type === 'latest' ? 'latest' : versionData)
    setShowPasswordModal(true)
  }

  const handleAdminClick = () => {
    setShowAdminModal(true)
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {/* 3D Background */}
      <Background3D />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Hero 
          onDownloadClick={handleDownloadClick}
          onAdminClick={handleAdminClick}
        />
      </div>

      {/* Modals */}
      <Suspense fallback={<LoadingScreen />}>
        {showPasswordModal && (
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            downloadType={downloadType}
          />
        )}
        {showAdminModal && (
          <AdminModal
            isOpen={showAdminModal}
            onClose={() => setShowAdminModal(false)}
          />
        )}
      </Suspense>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App

