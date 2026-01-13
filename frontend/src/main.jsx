//main.jsx
import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './redux/store/store.js'
import { BrowserRouter } from 'react-router-dom'; 
import { HelmetProvider } from 'react-helmet-async';

import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
        <HelmetProvider>

    <Provider store={store}>
      <App />
    </Provider>
        </HelmetProvider>

  </StrictMode>,
)

