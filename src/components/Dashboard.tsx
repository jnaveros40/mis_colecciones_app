import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  usuarioId: number;
}

export default function Dashboard({ usuarioId }: DashboardProps) {
  const [totalFiguras, setTotalFiguras] = useState(0);
  const [inversionTotal, setInversionTotal] = useState(0);
  const [totalBaf, setTotalBaf] = useState(0);
  const [topUniversos, setTopUniversos] = useState<{ nombre: string; cantidad: number }[]>([]);
  const [topLineas, setTopLineas] = useState<{ nombre: string; cantidad: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarEstadisticas() {
      try {
        const { data, error } = await supabase
          .from('coleccion_figuras')
          .select(`
            precio,
            baf,
            universo:coleccion_universos(nombre),
            linea:coleccion_lineas(nombre)
          `)
          .eq('usuario_id', usuarioId);

        if (error) throw error;

        const figuras = data || [];
        setTotalFiguras(figuras.length);

        // Suma de inversión
        const sum = figuras.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);
        setInversionTotal(sum);

        // Total BAF
        const bafs = figuras.filter(f => f.baf).length;
        setTotalBaf(bafs);

        // Conteo por Universos
        const univMap: Record<string, number> = {};
        const lineaMap: Record<string, number> = {};

        figuras.forEach(f => {
          const uNombre = (f.universo as any)?.nombre || 'Sin Universo';
          univMap[uNombre] = (univMap[uNombre] || 0) + 1;

          const lNombre = (f.linea as any)?.nombre || 'Sin Línea';
          lineaMap[lNombre] = (lineaMap[lNombre] || 0) + 1;
        });

        setTopUniversos(
          Object.entries(univMap)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5)
        );

        setTopLineas(
          Object.entries(lineaMap)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5)
        );

      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    }

    cargarEstadisticas();
  }, [usuarioId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando estadísticas...</div>;
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}>Dashboard de tu Colección</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Métricas y distribución de tus piezas coleccionables.
        </p>
      </div>

      {/* Tarjetas Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Total de Figuras
          </h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
            {totalFiguras}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Inversión Estimada
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--success)' }}>
            ${inversionTotal.toLocaleString('es-CO')}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Piezas BAF
          </h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>
            {totalBaf}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {totalFiguras > 0 ? `${Math.round((totalBaf / totalFiguras) * 100)}% de la colección` : '0%'}
          </span>
        </div>
      </div>

      {/* Gráficos / Distribuciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Universos */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Top Universos
          </h3>
          {topUniversos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aún no hay datos registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topUniversos.map((u) => {
                const pct = totalFiguras > 0 ? (u.cantidad / totalFiguras) * 100 : 0;
                return (
                  <div key={u.nombre}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{u.cantidad} fig. ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Líneas */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Top Líneas
          </h3>
          {topLineas.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aún no hay datos registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topLineas.map((l) => {
                const pct = totalFiguras > 0 ? (l.cantidad / totalFiguras) * 100 : 0;
                return (
                  <div key={l.nombre}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{l.nombre}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{l.cantidad} fig. ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--success)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
