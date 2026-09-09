import { useState, useEffect } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import FormularioUpload from './components/FormularioUpload'
import Dashboard from './components/Dashboard'
import GaleriaFiguras from './components/GaleriaFiguras'
import Footer from './components/Footer'

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
    <>
      <header className="top-nav">
        <div>
          <h1 className="gradient-text" style={{ marginBottom: 0, fontSize: '1.5rem' }}>Mis Colecciones</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hola, {usuarioActivo?.username}</p>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button
            className={`nav-item ${vistaApp === 'resumen' ? 'active' : ''}`}
            onClick={() => setVistaApp('resumen')}
          >
            Dashboard
          </button>
          <button
            className={`nav-item ${vistaApp === 'galeria' ? 'active' : ''}`}
            onClick={() => setVistaApp('galeria')}
          >
            Mi Colección
          </button>
          <button
            className={`nav-item ${vistaApp === 'agregar' ? 'active' : ''}`}
            onClick={() => setVistaApp('agregar')}
          >
            Añadir Figura
          </button>
          <button className="nav-item" onClick={manejarCierreSesion} style={{ color: 'var(--error)' }}>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      <div className="app-container animate-slide-up">
        <main>
          {vistaApp === 'resumen' && <Dashboard usuarioId={usuarioActivo.id} />}
          {vistaApp === 'galeria' && <GaleriaFiguras usuarioId={usuarioActivo.id} />}
          {vistaApp === 'agregar' && <FormularioUpload usuarioId={usuarioActivo.id} onSuccess={() => setVistaApp('galeria')} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className={`nav-item ${vistaApp === 'resumen' ? 'active' : ''}`}
          onClick={() => setVistaApp('resumen')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          Inicio
        </button>
        <button
          className={`nav-item ${vistaApp === 'galeria' ? 'active' : ''}`}
          onClick={() => setVistaApp('galeria')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          Galería
        </button>
        <button
          className={`nav-item ${vistaApp === 'agregar' ? 'active' : ''}`}
          onClick={() => setVistaApp('agregar')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Añadir
        </button>
        <button className="nav-item" onClick={manejarCierreSesion}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--error)' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Salir
        </button>
      </nav>
      <Footer />
    </>
  )
}

export default App
