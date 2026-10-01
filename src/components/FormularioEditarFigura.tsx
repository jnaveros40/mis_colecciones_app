import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizarImagen, subirASupabaseStorage } from '../services/imageService';

interface FormularioEditarFiguraProps {
  figura: any;
  onCancel: () => void;
  onSaved: () => void;
}

interface CatalogoOpcion {
  id: number;
  nombre: string;
  activo: boolean;
}

export default function FormularioEditarFigura({ figura, onCancel, onSaved }: FormularioEditarFiguraProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados del formulario
  const [nombre, setNombre] = useState(figura.nombre || '');
  const [universoId, setUniversoId] = useState(figura.universo_id ? String(figura.universo_id) : '');
  const [lineaId, setLineaId] = useState(figura.linea_id ? String(figura.linea_id) : '');
  const [marcaId, setMarcaId] = useState(figura.marca_id ? String(figura.marca_id) : '');
  const [fabricanteId, setFabricanteId] = useState(figura.fabricante_id ? String(figura.fabricante_id) : '');
  const [baf, setBaf] = useState(Boolean(figura.baf));
  const [anio, setAnio] = useState(figura.anio ? String(figura.anio) : '');
  const [precio, setPrecio] = useState(figura.precio !== null && figura.precio !== undefined ? String(figura.precio) : '');
  const [tamanoPulgadas, setTamanoPulgadas] = useState(figura.tamano_pulgadas ? String(figura.tamano_pulgadas) : '');
  const [descripcion, setDescripcion] = useState(figura.descripcion || '');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(figura.foto_url || null);

  // Listas de catálogos
  const [universos, setUniversos] = useState<CatalogoOpcion[]>([]);
  const [lineas, setLineas] = useState<CatalogoOpcion[]>([]);
  const [marcas, setMarcas] = useState<CatalogoOpcion[]>([]);
  const [fabricantes, setFabricantes] = useState<CatalogoOpcion[]>([]);

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [resUniv, resLin, resMar, resFab] = await Promise.all([
          supabase.from('coleccion_universos').select('id, nombre, activo').order('nombre'),
          supabase.from('coleccion_lineas').select('id, nombre, activo').order('nombre'),
          supabase.from('coleccion_marcas').select('id, nombre, activo').order('nombre'),
          supabase.from('coleccion_fabricantes').select('id, nombre, activo').order('nombre')
        ]);

        // Cargar los activos o el que ya tenga asignado la figura
        if (resUniv.data) {
          setUniversos(resUniv.data.filter(u => u.activo || u.id === figura.universo_id));
        }
        if (resLin.data) {
          setLineas(resLin.data.filter(l => l.activo || l.id === figura.linea_id));
        }
        if (resMar.data) {
          setMarcas(resMar.data.filter(m => m.activo || m.id === figura.marca_id));
        }
        if (resFab.data) {
          setFabricantes(resFab.data.filter(f => f.activo || f.id === figura.fabricante_id));
        }
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
      }
    }
    cargarCatalogos();
  }, [figura]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? e.target.files[0] : null;
    setNewFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let foto_url = figura.foto_url;

      if (newFile) {
        const optimizada = await optimizarImagen(newFile);
        foto_url = await subirASupabaseStorage(optimizada, 'coleccion');
      }

      const payload = {
        nombre: nombre.trim(),
        universo_id: universoId ? parseInt(universoId) : null,
        linea_id: lineaId ? parseInt(lineaId) : null,
        marca_id: marcaId ? parseInt(marcaId) : null,
        fabricante_id: fabricanteId ? parseInt(fabricanteId) : null,
        baf: Boolean(baf),
        anio: anio ? parseInt(anio) : null,
        precio: precio ? parseFloat(precio) : 0,
        tamano_pulgadas: tamanoPulgadas ? parseFloat(tamanoPulgadas) : null,
        descripcion: descripcion.trim() || null,
        foto_url,
        updated_at: new Date().toISOString()
      };

      const { error: supaError } = await supabase
        .from('coleccion_figuras')
        .update(payload)
        .eq('id', figura.id);

      if (supaError) throw supaError;

      onSaved();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al actualizar la figura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="gradient-text" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
        Editar Figura: {figura.nombre}
      </h3>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de la Figura *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Universo</label>
            <select
              value={universoId}
              onChange={(e) => setUniversoId(e.target.value)}
            >
              <option value="">-- Sin Universo --</option>
              {universos.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {!u.activo ? '(Inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Línea</label>
            <select
              value={lineaId}
              onChange={(e) => setLineaId(e.target.value)}
            >
              <option value="">-- Sin Línea --</option>
              {lineas.map(l => (
                <option key={l.id} value={l.id}>
                  {l.nombre} {!l.activo ? '(Inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Marca</label>
            <select
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
            >
              <option value="">-- Sin Marca --</option>
              {marcas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre} {!m.activo ? '(Inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fabricante</label>
            <select
              value={fabricanteId}
              onChange={(e) => setFabricanteId(e.target.value)}
            >
              <option value="">-- Sin Fabricante --</option>
              {fabricantes.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nombre} {!f.activo ? '(Inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div className="form-group">
            <label>Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              min="1950"
              max="2099"
            />
          </div>

          <div className="form-group">
            <label>Tamaño (pulgadas)</label>
            <input
              type="number"
              step="0.1"
              value={tamanoPulgadas}
              onChange={(e) => setTamanoPulgadas(e.target.value)}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Precio ($)</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.75rem' }}>¿Es BAF?</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={baf}
                onChange={(e) => setBaf(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, color: baf ? 'var(--primary)' : 'var(--text-muted)' }}>
                {baf ? 'Sí (BAF)' : 'No'}
              </span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Descripción / Notas</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.85rem 1.2rem',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="form-group">
          <label>Cambiar Foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Vista previa"
                style={{ maxHeight: '140px', borderRadius: '10px', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="action-btn-sm"
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
