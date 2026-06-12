/// <reference types="vite-plugin-pwa/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import './utils/api'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Peut être géré pour forcer le rechargement si nécessaire
  },
  onOfflineReady() {
    console.log("App ready to work offline")
  },
})
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '781573004833-r7cnd0at155k9cruu0qf27iitcjj0mrj.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
