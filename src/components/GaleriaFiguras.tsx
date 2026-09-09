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
    <div className="animate-slide-up">
      <h2 className="gradient-text">Mi Colección</h2>
      
      {figuras.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <h3>Tu colección está vacía</h3>
          <p style={{ color: 'var(--text-muted)' }}>Empieza a añadir figuras para verlas aquí.</p>
        </div>
      ) : (
        <div className="gallery-grid" style={{ marginTop: '1.5rem' }}>
          {figuras.map((figura) => (
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
