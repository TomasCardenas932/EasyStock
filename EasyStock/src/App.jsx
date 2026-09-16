import Topbar from './components/Topbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Topbar appName="EasyStock" userName="Usuario" />

      <div className="app-body">
        <Sidebar />

        <main className="app-content">
          <h1>Dashboard</h1>
          <p>Contenido de la aplicacion.</p>
        </main>
      </div>
    </div>
  )
}

export default App
