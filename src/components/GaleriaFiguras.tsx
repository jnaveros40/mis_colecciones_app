import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DetalleFigura from './DetalleFigura';

interface GaleriaFigurasProps {
  usuarioId: number;
}

export default function GaleriaFiguras({ usuarioId }: GaleriaFigurasProps) {
  const [figuras, setFiguras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [figuraSeleccionada, setFiguraSeleccionada] = useState<any | null>(null);

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

  if (loading && figuras.length === 0) {
    return <div style={{ textAlign: 'center' }}>Cargando galería...</div>;
  }

  return (
    <div>
      <h2 style={{ textAlign: 'left', marginBottom: '2rem' }}>Mi Colección</h2>
      
      {figuras.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>Tu colección está vacía</h3>
          <p style={{ color: 'var(--text-muted)' }}>Empieza a añadir figuras para verlas aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {figuras.map((figura) => (
            <div 
              key={figura.id} 
              className="glass-panel" 
              style={{ overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onClick={() => setFiguraSeleccionada(figura)}
            >
              <div style={{ height: '250px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {figura.foto_url ? (
                  <img src={figura.foto_url} alt={figura.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#ccc' }}>Sin imagen</span>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {figura.nombre}
                </h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {figura.marca || 'Sin marca'}
                </p>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  ${(figura.precio_compra || 0).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          ))}
        </div>
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
