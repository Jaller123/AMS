import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BackendProvider } from "./components/InfraController/BackendContext.jsx";
import './index.css'
import "./App.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  
<StrictMode>
  <BackendProvider>
    <App />
  </BackendProvider>,
</StrictMode>
)
