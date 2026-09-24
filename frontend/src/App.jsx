import { Navigate, Route, Routes } from 'react-router'
import Topbar from './components/Topbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Ventas from './pages/Ventas.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Topbar appName="EasyStock" userName="Usuario" />

      <div className="app-body">
        <Sidebar />

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/articulos" element={<Catalogo />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
