import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface DetalleFiguraProps {
  figura: any;
  onClose: () => void;
  onFiguraBorrada: () => void;
}

export default function DetalleFigura({ figura, onClose, onFiguraBorrada }: DetalleFiguraProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la figura "${figura.nombre}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('figuras')
        .delete()
        .eq('id', figura.id);

      if (error) throw error;

      onFiguraBorrada();
    } catch (err: any) {
      console.error(err);
      setError('Error al eliminar la figura');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Imagen */}
          <div style={{ flex: '1 1 300px', backgroundColor: '#fff', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
             {figura.foto_url ? (
                <img src={figura.foto_url} alt={figura.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#ccc' }}>Sin imagen</span>
              )}
          </div>

          {/* Detalles */}
          <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, textAlign: 'left', background: 'none', color: 'var(--text-main)', WebkitTextFillColor: 'initial' }}>{figura.nombre}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Código: {figura.codigo_interno}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Serie / Anime</strong>
                <p>{figura.serie || '-'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Marca</strong>
                <p>{figura.marca || '-'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Precio Compra</strong>
                <p>${(figura.precio_compra || 0).toLocaleString('es-CO')}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Fecha Registro</strong>
                <p>{new Date(figura.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '2rem' }}>
              {/* Dejamos el botón Editar como placeholder para futuras expansiones */}
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => alert('Función de edición en desarrollo')}>
                Editar
              </button>
              <button className="btn" style={{ flex: 1, backgroundColor: 'var(--error)' }} onClick={handleDelete} disabled={loading}>
                {loading ? 'Borrando...' : 'Eliminar'}
              </button>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
          </div>

        </div>
      </div>
    </div>
  );
}
