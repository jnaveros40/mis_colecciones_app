import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { optimizarImagen, subirASupabaseStorage } from '../services/imageService';

export default function FormularioUpload() {
  const [nombre, setNombre] = useState('');
  const [codigoInterno, setCodigoInterno] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !codigoInterno || !file) {
      setMensaje('Por favor, completa todos los campos requeridos y selecciona una imagen.');
      return;
    }

    setCargando(true);
    setMensaje('');

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
      setNombre('');
      setCodigoInterno('');
      setFile(null);
    } catch (error: any) {
      console.error(error);
      setMensaje(`Error: ${error.message || 'Ocurrió un error inesperado'}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Agregar Nueva Figura</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Código Interno</label>
          <input 
            type="text" 
            value={codigoInterno}
            onChange={(e) => setCodigoInterno(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            placeholder="EJ: FIG-001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre de la Figura</label>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Foto</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={cargando}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? 'Procesando...' : 'Guardar Figura'}
        </button>
      </form>
      {mensaje && (
        <div className={`p-3 rounded ${mensaje.includes('Error') || mensaje.includes('Por favor') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}
