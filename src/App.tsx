import { useState, useEffect } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import FormularioUpload from './components/FormularioUpload'
import Dashboard from './components/Dashboard'
import GaleriaFiguras from './components/GaleriaFiguras'
import GestionCatalogos from './components/GestionCatalogos'
import InstallPWA from './components/InstallPWA'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

type VistaDashboard = 'resumen' | 'galeria' | 'agregar' | 'configuracion';

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null)
  const [vistaAuth, setVistaAuth] = useState<'login' | 'registro' | 'autenticado'>('login')
  const [vistaApp, setVistaApp] = useState<VistaDashboard>('resumen')

  useEffect(() => {
    const userGuardado = localStorage.getItem('usuario_figuras')
    if (userGuardado) {
      try {
        const parsed = JSON.parse(userGuardado)
        if (parsed && typeof parsed === 'object' && parsed.id) {
          setUsuarioActivo(parsed)
          setVistaAuth('autenticado')
        } else {
          // Si el objeto de sesión no tiene un id válido, limpiar y pedir login
          localStorage.removeItem('usuario_figuras')
          setVistaAuth('login')
        }
      } catch (e) {
        console.error('Error parseando usuario de localStorage:', e)
        localStorage.removeItem('usuario_figuras')
        setVistaAuth('login')
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
    return (
      <>
        <Login onLoginSuccess={manejarLoginExitoso} onGoToRegister={() => setVistaAuth('registro')} />
        <InstallPWA />
      </>
    );
  }

  if (vistaAuth === 'registro') {
    return (
      <>
        <Registro onRegisterSuccess={manejarLoginExitoso} onGoToLogin={() => setVistaAuth('login')} />
        <InstallPWA />
      </>
    );
  }

  const currentUserId = usuarioActivo?.id || 0;

  return (
    <>
      <header className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img 
            src="/icon-192.png" 
            alt="Mis Colecciones Logo" 
            style={{ width: '42px', height: '42px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/web/icon-192.png'; }}
          />
          <div>
            <h1 className="gradient-text" style={{ marginBottom: 0, fontSize: '1.45rem' }}>Mi coleccion By IngNavs</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hola, {usuarioActivo?.username || 'Coleccionista'}</p>
          </div>
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

          <button
            className={`nav-item ${vistaApp === 'configuracion' ? 'active' : ''}`}
            onClick={() => setVistaApp('configuracion')}
          >
            Configuración
          </button>
          <button className="nav-item" onClick={manejarCierreSesion} style={{ color: 'var(--error)' }}>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      <div className="app-container">
        <ErrorBoundary>
          <main>
            {vistaApp === 'resumen' && <Dashboard usuarioId={currentUserId} />}
            {vistaApp === 'galeria' && <GaleriaFiguras usuarioId={currentUserId} />}
            {vistaApp === 'agregar' && <FormularioUpload usuarioId={currentUserId} onSuccess={() => setVistaApp('galeria')} />}
            {vistaApp === 'configuracion' && <GestionCatalogos usuarioId={currentUserId} />}
          </main>
        </ErrorBoundary>
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
        <button
          className={`nav-item ${vistaApp === 'configuracion' ? 'active' : ''}`}
          onClick={() => setVistaApp('configuracion')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Catálogos
        </button>
        <button className="nav-item" onClick={manejarCierreSesion}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--error)' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Salir
        </button>
      </nav>
      <InstallPWA />
      <Footer />
    </>
  )
}

export default App
