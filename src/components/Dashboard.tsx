import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  usuarioId: number;
}

export default function Dashboard({ usuarioId }: DashboardProps) {
  const [totalFiguras, setTotalFiguras] = useState(0);
  const [inversionTotal, setInversionTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarEstadisticas() {
      try {
        const { data, error } = await supabase
          .from('figuras')
          .select('precio_compra')
          .eq('usuario_id', usuarioId);

        if (error) throw error;

        setTotalFiguras(data.length);
        
        const sum = data.reduce((acc, curr) => {
          return acc + (curr.precio_compra || 0);
        }, 0);
        setInversionTotal(sum);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    }

    cargarEstadisticas();
  }, [usuarioId]);

  if (loading) {
    return <div style={{ textAlign: 'center' }}>Cargando estadísticas...</div>;
  }

  return (
    <div className="animate-slide-up">
      <h2 className="gradient-text">Resumen de Colección</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Total de Figuras</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
            {totalFiguras}
          </p>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Inversión Total</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: 0, color: 'var(--success)' }}>
            ${inversionTotal.toLocaleString('es-CO')}
          </p>
        </div>
      </div>
    </div>
  );
}
