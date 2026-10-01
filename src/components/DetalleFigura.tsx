import { useState } from 'react';
import { supabase } from '../lib/supabase';
import FormularioEditarFigura from './FormularioEditarFigura';

interface DetalleFiguraProps {
  figura: any;
  onClose: () => void;
  onFiguraBorrada: () => void;
}

export default function DetalleFigura({ figura, onClose, onFiguraBorrada }: DetalleFiguraProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres borrar a ${figura.nombre}?`)) {
      return;
    }

    setLoading(true);
    try {
      if (figura.foto_url) {
        const path = figura.foto_url.split('/').pop();
        if (path) {
          await supabase.storage.from('figuras').remove([path]);
        }
      }

      const { error: supaError } = await supabase
        .from('coleccion_figuras')
        .delete()
        .eq('id', figura.id);

      if (supaError) throw supaError;
      onFiguraBorrada();
    } catch (err: any) {
      console.error(err);
      setError('Error al borrar la figura');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '850px' }}>
        
        <button onClick={onClose} className="modal-close" aria-label="Cerrar detalles">
          &times;
        </button>

        <div className="modal-body" style={{ padding: '0 2rem 2rem 2rem' }}>
          {isEditing ? (
            <FormularioEditarFigura 
              figura={figura} 
              onCancel={() => setIsEditing(false)} 
              onSaved={() => {
                setIsEditing(false);
                onFiguraBorrada();
              }} 
            />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              {/* Imagen */}
              <div style={{
                flex: '1 1 300px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px'
              }}>
                {figura.foto_url ? (
                  <img
                    src={figura.foto_url}
                    alt={figura.nombre}
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px' }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
                    <p>Sin fotografía</p>
                  </div>
                )}
              </div>

              {/* Detalles */}
              <div style={{ flex: '2 1 320px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <h2 className="gradient-text" style={{ margin: 0 }}>{figura.nombre}</h2>
                  {figura.baf && (
                    <span style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      BAF
                    </span>
                  )}
                </div>

                <div className="details-grid" style={{ marginTop: '1rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Universo</strong>
                    <p style={{ fontWeight: 600 }}>{figura.universo?.nombre || '-'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Línea</strong>
                    <p style={{ fontWeight: 600 }}>{figura.linea?.nombre || '-'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Marca</strong>
                    <p style={{ fontWeight: 600 }}>{figura.marca?.nombre || '-'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Fabricante</strong>
                    <p style={{ fontWeight: 600 }}>{figura.fabricante?.nombre || '-'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Año</strong>
                    <p style={{ fontWeight: 600 }}>{figura.anio || '-'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Tamaño</strong>
                    <p style={{ fontWeight: 600 }}>{figura.tamano_pulgadas ? `${figura.tamano_pulgadas}"` : '-'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Precio</strong>
                    <p style={{ fontWeight: 600, color: 'var(--success)', fontSize: '1.1rem' }}>
                      ${Number(figura.precio || 0).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>Fecha de Registro</strong>
                    <p style={{ fontWeight: 600 }}>{new Date(figura.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {figura.descripcion && (
                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                      Descripción / Notas
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{figura.descripcion}</p>
                  </div>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '2rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(true)}>
                    ✎ Editar
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete} disabled={loading}>
                    {loading ? 'Borrando...' : '🗑 Eliminar'}
                  </button>
                </div>
                
                {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
