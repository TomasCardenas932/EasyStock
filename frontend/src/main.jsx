import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import SesionProvider from './sesion/SesionProvider.jsx'
import { aplicarTema, temaInicial } from './tema.js'

// Antes del primer render, para que la pantalla no arranque en un tema y
// cambie al otro.
aplicarTema(temaInicial())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
