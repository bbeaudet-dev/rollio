import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { UnlockProvider } from './contexts/UnlockContext'
import './index.css'
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <UnlockProvider>
        <App />
      </UnlockProvider>
    </AuthProvider>
  </React.StrictMode>,
) 