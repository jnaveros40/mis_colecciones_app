import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizarImagen, subirASupabaseStorage } from '../services/imageService';

interface FormularioUploadProps {
  usuarioId: number;
  onSuccess?: () => void;
}

interface CatalogoOpcion {
  id: number;
  nombre: string;
}

export default function FormularioUpload({ usuarioId, onSuccess }: FormularioUploadProps) {
  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [universoId, setUniversoId] = useState('');
  const [lineaId, setLineaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [fabricanteId, setFabricanteId] = useState('');
  const [baf, setBaf] = useState(false);
  const [anio, setAnio] = useState('');
  const [precio, setPrecio] = useState('');
  const [tamanoPulgadas, setTamanoPulgadas] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Listas de catálogos (solo activos)
  const [universos, setUniversos] = useState<CatalogoOpcion[]>([]);
  const [lineas, setLineas] = useState<CatalogoOpcion[]>([]);
  const [marcas, setMarcas] = useState<CatalogoOpcion[]>([]);
  const [fabricantes, setFabricantes] = useState<CatalogoOpcion[]>([]);

  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  // Cargar catálogos activos
  useEffect(() => {
    async function cargarCatalogosActivos() {
      setCargandoCatalogos(true);
      try {
        const [resUniv, resLin, resMar, resFab] = await Promise.all([
          supabase
            .from('coleccion_universos')
            .select('id, nombre')
            .eq('activo', true)
            .or(`usuario_id.eq.${usuarioId},usuario_id.is.null`)
            .order('nombre'),
          supabase
            .from('coleccion_lineas')
            .select('id, nombre')
            .eq('activo', true)
            .or(`usuario_id.eq.${usuarioId},usuario_id.is.null`)
            .order('nombre'),
          supabase
            .from('coleccion_marcas')
            .select('id, nombre')
            .eq('activo', true)
            .or(`usuario_id.eq.${usuarioId},usuario_id.is.null`)
            .order('nombre'),
          supabase
            .from('coleccion_fabricantes')
            .select('id, nombre')
            .eq('activo', true)
            .or(`usuario_id.eq.${usuarioId},usuario_id.is.null`)
            .order('nombre')
        ]);

        if (resUniv.data) setUniversos(resUniv.data);
        if (resLin.data) setLineas(resLin.data);
        if (resMar.data) setMarcas(resMar.data);
        if (resFab.data) setFabricantes(resFab.data);
      } catch (err) {
        console.error('Error cargando catálogos activos:', err);
      } finally {
        setCargandoCatalogos(false);
      }
    }

    cargarCatalogosActivos();
  }, [usuarioId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMensaje({ texto: 'El nombre de la figura es obligatorio.', tipo: 'error' });
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      let foto_url: string | null = null;

      // 1. Si subió imagen, optimizarla y subirla a Supabase Storage
      if (file) {
        setMensaje({ texto: 'Optimizando y subiendo imagen...', tipo: 'success' });
        const imagenOptimizada = await optimizarImagen(file);
        foto_url = await subirASupabaseStorage(imagenOptimizada, 'coleccion');
      }

      // 2. Guardar registro en coleccion_figuras
      setMensaje({ texto: 'Guardando registro de la figura...', tipo: 'success' });
      const { error } = await supabase
        .from('coleccion_figuras')
        .insert([
          {
            usuario_id: usuarioId,
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
            foto_url
          }
        ]);

      if (error) throw error;

      setMensaje({ texto: '¡Figura añadida exitosamente a tu colección!', tipo: 'success' });

      // Limpiar formulario
      setNombre('');
      setUniversoId('');
      setLineaId('');
      setMarcaId('');
      setFabricanteId('');
      setBaf(false);
      setAnio('');
      setPrecio('');
      setTamanoPulgadas('');
      setDescripcion('');
      setFile(null);
      setPreviewUrl(null);

      if (onSuccess) {
        setTimeout(() => onSuccess(), 800);
      }
    } catch (error: any) {
      console.error(error);
      setMensaje({ texto: `Error: ${error.message || 'Ocurrió un error inesperado'}`, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h2 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Añadir Nueva Figura</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Registra tu figura con sus características y catálogos vinculados.
      </p>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="form-group">
          <label>Nombre de la Figura *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ej. Spider-Man Retro Classic"
          />
        </div>

        {/* Fila: Universo y Línea */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Universo</label>
            <select
              value={universoId}
              onChange={(e) => setUniversoId(e.target.value)}
              disabled={cargandoCatalogos}
            >
              <option value="">-- Seleccionar Universo --</option>
              {universos.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Línea</label>
            <select
              value={lineaId}
              onChange={(e) => setLineaId(e.target.value)}
              disabled={cargandoCatalogos}
            >
              <option value="">-- Seleccionar Línea --</option>
              {lineas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila: Marca y Fabricante */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Marca</label>
            <select
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              disabled={cargandoCatalogos}
            >
              <option value="">-- Seleccionar Marca --</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fabricante</label>
            <select
              value={fabricanteId}
              onChange={(e) => setFabricanteId(e.target.value)}
              disabled={cargandoCatalogos}
            >
              <option value="">-- Seleccionar Fabricante --</option>
              {fabricantes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila: BAF (Checkbox/Switch), Año, Tamaño, Precio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div className="form-group">
            <label>Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="Ej: 2023"
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
              placeholder="Ej: 6.0"
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
              placeholder="Ej: 120000"
              min="0"
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ marginBottom: '0.75rem' }}>¿Es BAF?</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={baf}
                onChange={(e) => setBaf(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, color: baf ? 'var(--primary)' : 'var(--text-muted)' }}>
                {baf ? 'Sí (Build-A-Figure)' : 'No'}
              </span>
            </label>
          </div>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción / Detalles</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles de la figura, accesorios que incluye, estado o notas personales..."
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

        {/* Foto */}
        <div className="form-group">
          <label>Fotografía de la Figura</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="file-upload"
          />
          {previewUrl && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Vista previa"
                style={{
                  maxHeight: '180px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn" style={{ marginTop: '1rem' }} disabled={cargando}>
          {cargando ? 'Procesando...' : 'Guardar Figura'}
        </button>
      </form>
    </div>
  );
}
