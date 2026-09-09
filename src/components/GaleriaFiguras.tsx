import React, { useEffect, useState } from 'react';
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
  const [filterMarca, setFilterMarca] = useState('');
  const [filterSerie, setFilterSerie] = useState('');

  const cargarFiguras = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('figuras')
        .select('*')
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

  // Obtener opciones únicas para los selectores
  const marcasUnicas = Array.from(new Set(figuras.map(f => f.marca).filter(Boolean)));
  const seriesUnicas = Array.from(new Set(figuras.map(f => f.serie).filter(Boolean)));

  // Filtrar figuras
  const figurasFiltradas = figuras.filter(fig => {
    const matchSearch = fig.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        fig.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMarca = filterMarca ? fig.marca === filterMarca : true;
    const matchSerie = filterSerie ? fig.serie === filterSerie : true;
    
    return matchSearch && matchMarca && matchSerie;
  });

  if (loading && figuras.length === 0) {
    return <div style={{ textAlign: 'center' }}>Cargando galería...</div>;
  }

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}>Mi Colección</h2>
        
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
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre o código..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px', margin: 0, padding: '0.6rem 1rem' }}
        />
        <select 
          value={filterMarca} 
          onChange={(e) => setFilterMarca(e.target.value)}
          style={{ flex: '1 1 150px', margin: 0, padding: '0.6rem 1rem' }}
        >
          <option value="">Todas las Marcas</option>
          {marcasUnicas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
        </select>
        <select 
          value={filterSerie} 
          onChange={(e) => setFilterSerie(e.target.value)}
          style={{ flex: '1 1 150px', margin: 0, padding: '0.6rem 1rem' }}
        >
          <option value="">Todas las Series</option>
          {seriesUnicas.map(serie => <option key={serie} value={serie}>{serie}</option>)}
        </select>
      </div>
      
      {figurasFiltradas.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <h3>No se encontraron figuras</h3>
          <p style={{ color: 'var(--text-muted)' }}>Prueba a cambiar los filtros o añade nuevas figuras a tu colección.</p>
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
                      <img src={figura.foto_url} alt={figura.nombre} />
                    ) : (
                      <span style={{ color: '#ccc', fontSize: '0.9rem' }}>Sin imagen</span>
                    )}
                  </div>
                  <div style={{ padding: '1.2rem' }}>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {figura.nombre}
                    </h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {figura.marca || 'Sin marca'}
                    </p>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--success)' }}>
                      ${(figura.precio_compra || 0).toLocaleString('es-CO')}
                    </p>
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
                    <th style={{ padding: '1rem' }}>Código</th>
                    <th style={{ padding: '1rem' }}>Nombre</th>
                    <th style={{ padding: '1rem' }}>Serie</th>
                    <th style={{ padding: '1rem' }}>Marca</th>
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
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {figura.foto_url ? (
                            <img src={figura.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '0.6rem' }}>No img</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{figura.codigo_interno}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{figura.nombre}</td>
                      <td style={{ padding: '1rem' }}>{figura.serie || '-'}</td>
                      <td style={{ padding: '1rem' }}>{figura.marca || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--success)' }}>${(figura.precio_compra || 0).toLocaleString('es-CO')}</td>
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
