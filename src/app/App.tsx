import { useState, Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import Hero from '@/features/vault/Hero'
const Background3D = lazy(() => import('@/features/scene3d/Background3D'))
import LoadingScreen from '@/components/ui/LoadingScreen'

const PasswordModal = lazy(() => import('@/features/vault/PasswordModal'))
const AdminModal = lazy(() => import('@/features/vault/AdminModal'))

type DownloadType = 'latest' | { id: string; name: string; date: string } | null

function App() {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [downloadType, setDownloadType] = useState<DownloadType>(null)

  const handleDownloadClick = (type: string = 'latest', versionData: unknown = null) => {
    setDownloadType(type === 'latest' ? 'latest' : (versionData as DownloadType))
    setShowPasswordModal(true)
  }

  const handleAdminClick = () => {
    setShowAdminModal(true)
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      <Suspense fallback={null}>
        {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : <Background3D />}
      </Suspense>
      <div className="relative z-10">
        <Hero onDownloadClick={handleDownloadClick} onAdminClick={handleAdminClick} />
      </div>

      <Suspense fallback={<LoadingScreen />}>
        {showPasswordModal && (
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            downloadType={downloadType}
          />
        )}
        {showAdminModal && (
          <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
        )}
      </Suspense>

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
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  )
}

export default App
