import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DetalleFigura from './DetalleFigura';

interface GaleriaFigurasProps {
  usuarioId: number;
}

type ViewMode = 'grid' | 'table';

export default function GaleriaFiguras({ usuarioId }: GaleriaFigurasProps) {
  const [figuras, setFiguras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [figuraSeleccionada, setFiguraSeleccionada] = useState<any | null>(null);

  // Estados para UI y Filtros
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniverso, setFilterUniverso] = useState('');
  const [filterLinea, setFilterLinea] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterBaf, setFilterBaf] = useState<'todos' | 'baf' | 'no-baf'>('todos');

  const cargarFiguras = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coleccion_figuras')
        .select(`
          *,
          universo:coleccion_universos(id, nombre),
          linea:coleccion_lineas(id, nombre),
          marca:coleccion_marcas(id, nombre),
          fabricante:coleccion_fabricantes(id, nombre)
        `)
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiguras(data || []);
    } catch (err) {
      console.error('Error cargando galería:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFiguras();
  }, [usuarioId]);

  // Opciones únicas dinámicas para filtros
  const universosUnicos = Array.from(
    new Set(figuras.map(f => f.universo?.nombre).filter(Boolean))
  ) as string[];

  const lineasUnicas = Array.from(
    new Set(figuras.map(f => f.linea?.nombre).filter(Boolean))
  ) as string[];

  const marcasUnicas = Array.from(
    new Set(figuras.map(f => f.marca?.nombre).filter(Boolean))
  ) as string[];

  // Filtrado de figuras
  const figurasFiltradas = figuras.filter(fig => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      fig.nombre.toLowerCase().includes(term) ||
      (fig.universo?.nombre && fig.universo.nombre.toLowerCase().includes(term)) ||
      (fig.linea?.nombre && fig.linea.nombre.toLowerCase().includes(term)) ||
      (fig.marca?.nombre && fig.marca.nombre.toLowerCase().includes(term)) ||
      (fig.descripcion && fig.descripcion.toLowerCase().includes(term));

    const matchUniverso = filterUniverso ? fig.universo?.nombre === filterUniverso : true;
    const matchLinea = filterLinea ? fig.linea?.nombre === filterLinea : true;
    const matchMarca = filterMarca ? fig.marca?.nombre === filterMarca : true;
    const matchBaf =
      filterBaf === 'todos'
        ? true
        : filterBaf === 'baf'
        ? Boolean(fig.baf)
        : !Boolean(fig.baf);

    return matchSearch && matchUniverso && matchLinea && matchMarca && matchBaf;
  });

  if (loading && figuras.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando galería...</div>;
  }

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Mi Colección</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            {figuras.length} figura{figuras.length === 1 ? '' : 's'} en total
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px' }}>
          <button 
            className={`btn ${viewMode === 'grid' ? '' : 'btn-secondary'}`} 
            style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
            onClick={() => setViewMode('grid')}
          >
            Tarjetas
          </button>
          <button 
            className={`btn ${viewMode === 'table' ? '' : 'btn-secondary'}`} 
            style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </button>
        </div>
      </div>

      {/* Toolbar de Filtros */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar figura, universo, línea..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '2 1 200px', margin: 0, padding: '0.6rem 1rem' }}
        />
        <select 
          value={filterUniverso} 
          onChange={(e) => setFilterUniverso(e.target.value)}
          style={{ flex: '1 1 140px', margin: 0, padding: '0.6rem 1rem' }}
        >
          <option value="">Todos los Universos</option>
          {universosUnicos.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select 
          value={filterLinea} 
          onChange={(e) => setFilterLinea(e.target.value)}
          style={{ flex: '1 1 140px', margin: 0, padding: '0.6rem 1rem' }}
        >
          <option value="">Todas las Líneas</option>
          {lineasUnicas.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select 
          value={filterMarca} 
          onChange={(e) => setFilterMarca(e.target.value)}
          style={{ flex: '1 1 140px', margin: 0, padding: '0.6rem 1rem' }}
        >
          <option value="">Todas las Marcas</option>
          {marcasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select 
          value={filterBaf} 
          onChange={(e: any) => setFilterBaf(e.target.value)}
          style={{ flex: '1 1 120px', margin: 0, padding: '0.6rem 1rem' }}
        >
          <option value="todos">Todos (BAF / No)</option>
          <option value="baf">Solo BAF</option>
          <option value="no-baf">Sin BAF</option>
        </select>
      </div>
      
      {figurasFiltradas.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <h3>No se encontraron figuras</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Prueba a cambiar los filtros o añade nuevas figuras a tu colección.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="gallery-grid">
              {figurasFiltradas.map((figura) => (
                <div 
                  key={figura.id} 
                  className="glass-panel figure-card" 
                  onClick={() => setFiguraSeleccionada(figura)}
                >
                  <div className="figure-img-container">
                    {figura.foto_url ? (
                      <img src={figura.foto_url} alt={figura.nombre} loading="lazy" />
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sin imagen</span>
                    )}
                    {figura.baf && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                      }}>
                        BAF
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1.2rem' }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {figura.nombre}
                    </h4>
                    
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                      {figura.universo?.nombre && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {figura.universo.nombre}
                        </span>
                      )}
                      {figura.linea?.nombre && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', padding: '2px 6px', borderRadius: '4px' }}>
                          {figura.linea.nombre}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                        ${Number(figura.precio || 0).toLocaleString('es-CO')}
                      </p>
                      {figura.tamano_pulgadas && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {figura.tamano_pulgadas}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '1rem' }}>Miniatura</th>
                    <th style={{ padding: '1rem' }}>Nombre</th>
                    <th style={{ padding: '1rem' }}>Universo</th>
                    <th style={{ padding: '1rem' }}>Línea</th>
                    <th style={{ padding: '1rem' }}>Marca</th>
                    <th style={{ padding: '1rem' }}>BAF</th>
                    <th style={{ padding: '1rem' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {figurasFiltradas.map((figura) => (
                    <tr 
                      key={figura.id} 
                      onClick={() => setFiguraSeleccionada(figura)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {figura.foto_url ? (
                            <img src={figura.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Sin foto</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{figura.nombre}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{figura.universo?.nombre || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{figura.linea?.nombre || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{figura.marca?.nombre || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        {figura.baf ? (
                          <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                            Sí
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 600 }}>
                        ${Number(figura.precio || 0).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {figuraSeleccionada && (
        <DetalleFigura 
          figura={figuraSeleccionada} 
          onClose={() => setFiguraSeleccionada(null)} 
          onFiguraBorrada={() => {
            setFiguraSeleccionada(null);
            cargarFiguras();
          }} 
        />
      )}
    </div>
  );
}
