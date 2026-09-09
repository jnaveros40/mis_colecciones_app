import { useState, useEffect } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import FormularioUpload from './components/FormularioUpload'

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null)
  const [vista, setVista] = useState<'login' | 'registro' | 'dashboard'>('login')

  // Revisar si ya hay un usuario guardado al cargar
  useEffect(() => {
    const userGuardado = localStorage.getItem('usuario_figuras')
    if (userGuardado) {
      try {
        setUsuarioActivo(JSON.parse(userGuardado))
        setVista('dashboard')
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const manejarLoginExitoso = (user: any) => {
    setUsuarioActivo(user)
    localStorage.setItem('usuario_figuras', JSON.stringify(user))
    setVista('dashboard')
  }

  const manejarCierreSesion = () => {
    setUsuarioActivo(null)
    localStorage.removeItem('usuario_figuras')
    setVista('login')
  }

  if (vista === 'login') {
    return (
      <Login 
        onLoginSuccess={manejarLoginExitoso} 
        onGoToRegister={() => setVista('registro')} 
      />
    )
  }

  if (vista === 'registro') {
    return (
      <Registro 
        onRegisterSuccess={manejarLoginExitoso} 
        onGoToLogin={() => setVista('login')} 
      />
    )
  }

  return (
    <div className="app-container">
      <header className="dashboard-header glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: 0, textAlign: 'left' }}>Mis Figuras</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Hola, {usuarioActivo?.username}</p>
        </div>
        <button className="logout-btn" onClick={manejarCierreSesion}>
          Cerrar Sesión
        </button>
      </header>

      <main>
        <FormularioUpload />
      </main>
    </div>
  )
}

export default App
