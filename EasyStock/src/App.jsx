import Topbar from './components/Topbar.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Topbar appName="EasyStock" userName="Usuario" />

      <main className="app-content">
        <h1>Inicio</h1>
        <p>Contenido de la aplicacion.</p>
      </main>
    </div>
  )
}

export default App
