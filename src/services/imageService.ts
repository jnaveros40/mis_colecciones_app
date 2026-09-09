import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

/**
 * Optimiza una imagen antes de subirla
 * - Máximo 1280px de ancho/alto
 * - Calidad 80%
 * - Formato WebP (si el navegador lo soporta y el paquete lo permite, si no lo comprime de forma estándar)
 */
export async function optimizarImagen(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3, // ~300KB máximo
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error al optimizar imagen:', error);
    throw error;
  }
}

/**
 * Sube una imagen al Storage de Supabase
 * Reemplaza subirACloudinary para tener todo centralizado en Supabase
 * @param fileComprimido El archivo de imagen previamente optimizado
 * @param bucketName Nombre del bucket en Supabase (ej: 'figuras')
 * @returns La URL pública segura de la imagen subida
 */
export async function subirASupabaseStorage(fileComprimido: File, bucketName: string = 'figuras'): Promise<string> {
  const fileExt = fileComprimido.name.split('.').pop() || 'webp';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `imagenes/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileComprimido, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error subiendo imagen a Supabase:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}
