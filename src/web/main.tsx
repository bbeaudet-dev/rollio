import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { UnlockProvider } from './contexts/UnlockContext'
import { preloadSounds } from './utils/sounds'
import './index.css'

// Preload sound effects for instant playback
preloadSounds().catch(err => {
  console.warn('Failed to preload some sounds:', err);
});
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <UnlockProvider>
        <App />
      </UnlockProvider>
    </AuthProvider>
  </React.StrictMode>,
) 