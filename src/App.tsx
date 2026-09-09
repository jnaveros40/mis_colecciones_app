import { useState, useEffect } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import FormularioUpload from './components/FormularioUpload'
import Dashboard from './components/Dashboard'
import GaleriaFiguras from './components/GaleriaFiguras'

type VistaDashboard = 'resumen' | 'galeria' | 'agregar';

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null)
  const [vistaAuth, setVistaAuth] = useState<'login' | 'registro' | 'autenticado'>('login')
  const [vistaApp, setVistaApp] = useState<VistaDashboard>('resumen')

  useEffect(() => {
    const userGuardado = localStorage.getItem('usuario_figuras')
    if (userGuardado) {
      try {
        setUsuarioActivo(JSON.parse(userGuardado))
        setVistaAuth('autenticado')
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const manejarLoginExitoso = (user: any) => {
    setUsuarioActivo(user)
    localStorage.setItem('usuario_figuras', JSON.stringify(user))
    setVistaAuth('autenticado')
    setVistaApp('resumen')
  }

  const manejarCierreSesion = () => {
    setUsuarioActivo(null)
    localStorage.removeItem('usuario_figuras')
    setVistaAuth('login')
  }

  if (vistaAuth === 'login') {
    return <Login onLoginSuccess={manejarLoginExitoso} onGoToRegister={() => setVistaAuth('registro')} />
  }

  if (vistaAuth === 'registro') {
    return <Registro onRegisterSuccess={manejarLoginExitoso} onGoToLogin={() => setVistaAuth('login')} />
  }

  return (
    <div className="app-container">
      <header className="dashboard-header glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: 0, textAlign: 'left' }}>Mis Figuras</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Hola, {usuarioActivo?.username}</p>
        </div>
        
        <nav style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <button 
            onClick={() => setVistaApp('resumen')}
            style={{ background: 'none', border: 'none', color: vistaApp === 'resumen' ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', fontWeight: vistaApp === 'resumen' ? 'bold' : 'normal' }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setVistaApp('galeria')}
            style={{ background: 'none', border: 'none', color: vistaApp === 'galeria' ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', fontWeight: vistaApp === 'galeria' ? 'bold' : 'normal' }}
          >
            Mi Colección
          </button>
          <button 
            onClick={() => setVistaApp('agregar')}
            style={{ background: 'none', border: 'none', color: vistaApp === 'agregar' ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', fontWeight: vistaApp === 'agregar' ? 'bold' : 'normal' }}
          >
            Añadir Figura
          </button>
        </nav>

        <button className="logout-btn" onClick={manejarCierreSesion}>
          Cerrar Sesión
        </button>
      </header>

      <main>
        {vistaApp === 'resumen' && <Dashboard usuarioId={usuarioActivo.id} />}
        {vistaApp === 'galeria' && <GaleriaFiguras usuarioId={usuarioActivo.id} />}
        {vistaApp === 'agregar' && <FormularioUpload usuarioId={usuarioActivo.id} onSuccess={() => setVistaApp('galeria')} />}
      </main>
    </div>
  )
}

export default App
