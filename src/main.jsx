import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { LoaderProvider } from './context/LoaderContext'   // 👈 add this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoaderProvider>   {/* 👈 wrap here */}
        <App />
      </LoaderProvider>
    </BrowserRouter>
  </React.StrictMode>
)
