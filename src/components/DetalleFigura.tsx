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
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        
        <button onClick={onClose} className="modal-close" aria-label="Cerrar detalles">
          &times;
        </button>

        <div className="modal-body">
          
          {/* Imagen */}
          <div style={{ flex: '1 1 300px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
             {figura.foto_url ? (
                <img src={figura.foto_url} alt={figura.nombre} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#ccc' }}>Sin imagen</span>
              )}
          </div>

          {/* Detalles */}
          <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column' }}>
            <h2 className="gradient-text" style={{ marginBottom: '0.2rem' }}>{figura.nombre}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Código: {figura.codigo_interno}</p>
            
            <div className="details-grid">
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Serie / Anime</strong>
                <p style={{ fontWeight: 600 }}>{figura.serie || '-'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Marca</strong>
                <p style={{ fontWeight: 600 }}>{figura.marca || '-'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Precio Compra</strong>
                <p style={{ fontWeight: 600, color: 'var(--success)' }}>${(figura.precio_compra || 0).toLocaleString('es-CO')}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Fecha Registro</strong>
                <p style={{ fontWeight: 600 }}>{new Date(figura.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => alert('Función de edición en desarrollo')}>
                Editar
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete} disabled={loading}>
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
