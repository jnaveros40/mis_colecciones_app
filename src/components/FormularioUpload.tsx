import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { optimizarImagen, subirASupabaseStorage } from '../services/imageService';

export default function FormularioUpload() {
  const [nombre, setNombre] = useState('');
  const [codigoInterno, setCodigoInterno] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !codigoInterno || !file) {
      setMensaje('Por favor, completa todos los campos requeridos y selecciona una imagen.');
      setEsError(true);
      return;
    }

    setCargando(true);
    setMensaje('');
    setEsError(false);

    try {
      // 1. Optimizar imagen
      setMensaje('Optimizando imagen...');
      const imagenOptimizada = await optimizarImagen(file);

      // 2. Subir imagen a Supabase Storage
      setMensaje('Subiendo imagen a Supabase...');
      const foto_url = await subirASupabaseStorage(imagenOptimizada, 'figuras');

      // 3. Guardar registro en base de datos
      setMensaje('Guardando registro...');
      const { data, error } = await supabase
        .from('figuras')
        .insert([
          { 
            nombre, 
            codigo_interno: codigoInterno,
            foto_url
          }
        ]);

      if (error) {
        throw error;
      }

      setMensaje('¡Figura guardada exitosamente!');
      setEsError(false);
      setNombre('');
      setCodigoInterno('');
      setFile(null);
    } catch (error: any) {
      console.error(error);
      setMensaje(`Error: ${error.message || 'Ocurrió un error inesperado'}`);
      setEsError(true);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Agregar Nueva Figura</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Código Interno</label>
          <input 
            type="text" 
            value={codigoInterno}
            onChange={(e) => setCodigoInterno(e.target.value)}
            placeholder="EJ: FIG-001"
            required
          />
        </div>
        <div className="form-group">
          <label>Nombre de la Figura</label>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Goku S.H.Figuarts"
            required
          />
        </div>
        <div className="form-group">
          <label>Foto</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={cargando}
          className="btn"
        >
          {cargando ? 'Procesando...' : 'Guardar Figura'}
        </button>
      </form>
      {mensaje && (
        <div className={`alert ${esError ? 'alert-error' : 'alert-success'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}
