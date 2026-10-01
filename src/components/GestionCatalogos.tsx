import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './GestionCatalogos.css';

interface GestionCatalogosProps {
  usuarioId?: number;
}

type TipoCatalogo = 'universos' | 'lineas' | 'marcas' | 'fabricantes';

interface CatalogoConfig {
  key: TipoCatalogo;
  tabla: string;
  titulo: string;
  singular: string;
  placeholder: string;
}

const CATALOGOS: CatalogoConfig[] = [
  {
    key: 'universos',
    tabla: 'coleccion_universos',
    titulo: 'Universos',
    singular: 'Universo',
    placeholder: 'Ej: Marvel, DC, Star Wars, Anime, DBZ...'
  },
  {
    key: 'lineas',
    tabla: 'coleccion_lineas',
    titulo: 'Líneas',
    singular: 'Línea',
    placeholder: 'Ej: Marvel Legends, Black Series, Figuarts...'
  },
  {
    key: 'marcas',
    tabla: 'coleccion_marcas',
    titulo: 'Marcas',
    singular: 'Marca',
    placeholder: 'Ej: Marvel, Disney, Lucasfilm, Toei...'
  },
  {
    key: 'fabricantes',
    tabla: 'coleccion_fabricantes',
    titulo: 'Fabricantes',
    singular: 'Fabricante',
    placeholder: 'Ej: Hasbro, Bandai, Hot Toys, McFarlane...'
  }
];

interface ItemCatalogo {
  id: number;
  usuario_id: number;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export default function GestionCatalogos({ usuarioId }: GestionCatalogosProps) {
  const [catalogoActual, setCatalogoActual] = useState<TipoCatalogo>('universos');
  const [items, setItems] = useState<ItemCatalogo[]>([]);
  const [counts, setCounts] = useState<Record<TipoCatalogo, number>>({
    universos: 0,
    lineas: 0,
    marcas: 0,
    fabricantes: 0
  });

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  // Edición inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNombre, setEditingNombre] = useState('');

  const configActual = CATALOGOS.find(c => c.key === catalogoActual) || CATALOGOS[0];

  // Cargar contadores de todos los catálogos
  const cargarContadores = async () => {
    try {
      const countsObj: Record<TipoCatalogo, number> = { universos: 0, lineas: 0, marcas: 0, fabricantes: 0 };
      for (const cat of CATALOGOS) {
        let query = supabase.from(cat.tabla).select('id', { count: 'exact', head: true });
        if (usuarioId && usuarioId > 0) {
          query = query.or(`usuario_id.eq.${usuarioId},usuario_id.is.null`);
        } else {
          query = query.is('usuario_id', null);
        }
        const { count, error } = await query;
        if (!error && count !== null) {
          countsObj[cat.key] = count;
        }
      }
      setCounts(countsObj);
    } catch (err) {
      console.error('Error cargando contadores:', err);
    }
  };

  // Cargar elementos del catálogo actual
  const cargarItems = async () => {
    setLoading(true);
    setMensaje(null);
    try {
      let query = supabase.from(configActual.tabla).select('*').order('nombre', { ascending: true });
      if (usuarioId && usuarioId > 0) {
        query = query.or(`usuario_id.eq.${usuarioId},usuario_id.is.null`);
      } else {
        query = query.is('usuario_id', null);
      }
      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
      setCounts(prev => ({ ...prev, [catalogoActual]: data?.length || 0 }));
    } catch (err: any) {
      console.error(err);
      setMensaje({ texto: `Error cargando ${configActual.titulo}: ${err.message}`, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarContadores();
  }, [usuarioId]);

  useEffect(() => {
    setEditingId(null);
    setSearchTerm('');
    cargarItems();
  }, [catalogoActual]);

  // Crear nuevo elemento
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    if (!usuarioId || usuarioId <= 0) {
      setMensaje({ texto: 'Sesión no detectada. Por favor recarga o vuelve a iniciar sesión.', tipo: 'error' });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const { error } = await supabase
        .from(configActual.tabla)
        .insert([
          {
            usuario_id: usuarioId,
            nombre: nuevoNombre.trim(),
            activo: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setMensaje({ texto: `¡${configActual.singular} "${nuevoNombre}" agregado correctamente!`, tipo: 'success' });
      setNuevoNombre('');
      cargarItems();
      cargarContadores();
    } catch (err: any) {
      console.error(err);
      setMensaje({ texto: `Error al crear: ${err.message || 'Error desconocido'}`, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  // Guardar edición de nombre
  const handleGuardarEdicion = async (id: number) => {
    if (!editingNombre.trim()) return;

    setGuardando(true);
    setMensaje(null);
    try {
      const { error } = await supabase
        .from(configActual.tabla)
        .update({ nombre: editingNombre.trim() })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => item.id === id ? { ...item, nombre: editingNombre.trim() } : item));
      setEditingId(null);
      setMensaje({ texto: `Nombre actualizado con éxito`, tipo: 'success' });
    } catch (err: any) {
      console.error(err);
      setMensaje({ texto: `Error al actualizar: ${err.message}`, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  // Alternar Activo / Inactivo (CRU - Sin eliminación)
  const handleToggleActivo = async (item: ItemCatalogo) => {
    setGuardando(true);
    const nuevoEstado = !item.activo;
    try {
      const { error } = await supabase
        .from(configActual.tabla)
        .update({ activo: nuevoEstado })
        .eq('id', item.id);

      if (error) throw error;

      setItems(items.map(i => i.id === item.id ? { ...i, activo: nuevoEstado } : i));
      setMensaje({
        texto: `${configActual.singular} "${item.nombre}" ahora está ${nuevoEstado ? 'Activo' : 'Inactivo'}`,
        tipo: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setMensaje({ texto: `Error al cambiar estado: ${err.message}`, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado
  const itemsFiltrados = items.filter(item => {
    const matchSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterActivo === 'todos'
      ? true
      : filterActivo === 'activos'
        ? item.activo
        : !item.activo;
    return matchSearch && matchEstado;
  });

  return (
    <div className="catalogos-container">
      <div className="catalogos-header">
        <h2 className="gradient-text">Configuración de Catálogos</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Gestiona Universos, Líneas, Marcas y Fabricantes con control de estado (Activo / Inactivo).
        </p>
      </div>

      {/* Tabs */}
      <div className="catalogos-tabs">
        {CATALOGOS.map(cat => (
          <button
            key={cat.key}
            className={`catalogos-tab-btn ${catalogoActual === cat.key ? 'active' : ''}`}
            onClick={() => setCatalogoActual(cat.key)}
          >
            <span>{cat.titulo}</span>
            <span className="tab-badge">{counts[cat.key]}</span>
          </button>
        ))}
      </div>

      {/* Feedback Alert */}
      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {mensaje.texto}
        </div>
      )}

      {/* Barra de creación y búsqueda */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleCrear} className="catalogo-actions-bar">
          <div className="catalogo-add-form">
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder={configActual.placeholder}
              required
            />
            <button type="submit" className="btn" style={{ width: 'auto', whiteSpace: 'nowrap' }} disabled={guardando}>
              {guardando ? 'Guardando...' : `+ Añadir ${configActual.singular}`}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="catalogo-search"
            />
            <select
              value={filterActivo}
              onChange={(e: any) => setFilterActivo(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="todos">Todos</option>
              <option value="activos">Solo Activos</option>
              <option value="inactivos">Solo Inactivos</option>
            </select>
          </div>
        </form>
      </div>

      {/* Tabla CRU */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="catalogos-table-wrap">
          <table className="catalogos-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Nombre</th>
                <th style={{ width: '25%' }}>Estado</th>
                <th style={{ width: '30%', textAlign: 'right' }}>Acciones (CRU)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Cargando {configActual.titulo.toLowerCase()}...
                  </td>
                </tr>
              ) : itemsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {searchTerm ? 'No se encontraron resultados para la búsqueda.' : `No hay ${configActual.titulo.toLowerCase()} registrados aún.`}
                  </td>
                </tr>
              ) : (
                itemsFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {editingId === item.id ? (
                        <div className="inline-edit-form">
                          <input
                            type="text"
                            value={editingNombre}
                            onChange={(e) => setEditingNombre(e.target.value)}
                            className="inline-edit-input"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="action-btn-sm"
                            style={{ color: 'var(--success)' }}
                            onClick={() => handleGuardarEdicion(item.id)}
                            disabled={guardando}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            className="action-btn-sm"
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600, color: item.activo ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {item.nombre}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status ${item.activo ? 'active' : 'inactive'}`}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: item.activo ? '#34d399' : '#94a3b8'
                          }}
                        />
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {editingId !== item.id && (
                          <button
                            type="button"
                            className="action-btn-sm"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditingNombre(item.nombre);
                            }}
                            title="Editar nombre"
                          >
                            ✎ Editar
                          </button>
                        )}
                        <button
                          type="button"
                          className={`action-btn-sm toggle-btn ${!item.activo ? 'btn-activate' : ''}`}
                          onClick={() => handleToggleActivo(item)}
                          disabled={guardando}
                          title={item.activo ? 'Desactivar este registro' : 'Activar este registro'}
                        >
                          {item.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
