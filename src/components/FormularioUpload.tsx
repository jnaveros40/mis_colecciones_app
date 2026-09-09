import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { optimizarImagen, subirASupabaseStorage } from '../services/imageService';

interface FormularioUploadProps {
  usuarioId: number;
  onSuccess?: () => void;
}

export default function FormularioUpload({ usuarioId, onSuccess }: FormularioUploadProps) {
  const [nombre, setNombre] = useState('');
  const [serie, setSerie] = useState('');
  const [marca, setMarca] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !file) {
      setMensaje('El nombre y la foto son obligatorios.');
      setEsError(true);
      return;
    }

    setCargando(true);
    setMensaje('');
    setEsError(false);

    try {
      // Generar código interno automáticamente
      const codigoInterno = `FIG-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      // 1. Optimizar imagen
      setMensaje('Optimizando imagen...');
      const imagenOptimizada = await optimizarImagen(file);

      // 2. Subir imagen a Supabase Storage
      setMensaje('Subiendo imagen a Supabase...');
      const foto_url = await subirASupabaseStorage(imagenOptimizada, 'figuras');

      // 3. Guardar registro en base de datos
      setMensaje('Guardando registro...');
      const { error } = await supabase
        .from('figuras')
        .insert([
          {
            usuario_id: usuarioId,
            codigo_interno: codigoInterno,
            nombre,
            serie,
            marca,
            precio_compra: precioCompra ? parseFloat(precioCompra) : null,
            foto_url
          }
        ]);

      if (error) {
        throw error;
      }

      setMensaje('¡Figura guardada exitosamente!');
      setEsError(false);

      // Limpiar formulario
      setNombre('');
      setSerie('');
      setMarca('');
      setPrecioCompra('');
      setFile(null);

      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error(error);
      setMensaje(`Error: ${error.message || 'Ocurrió un error inesperado'}`);
      setEsError(true);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="gradient-text">Añadir Nueva Figura</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de la Figura *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ej. Goku Super Saiyan"
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Serie / Anime</label>
            <input
              type="text"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              placeholder="Ej. Dragon Ball Z"
            />
          </div>

          <div className="form-group">
            <label>Marca / Fabricante</label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej. S.H. Figuarts"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Precio de Compra</label>
          <input
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            placeholder="150000"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Foto *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
              id="file-upload"
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar Figura'}
        </button>

        {mensaje && (
          <div className={`alert ${esError ? 'alert-error' : 'alert-success'}`} style={{ marginTop: '1rem' }}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
}
