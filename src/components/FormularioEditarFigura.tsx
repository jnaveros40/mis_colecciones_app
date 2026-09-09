import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface FormularioEditarFiguraProps {
  figura: any;
  onCancel: () => void;
  onSaved: () => void;
}

export default function FormularioEditarFigura({ figura, onCancel, onSaved }: FormularioEditarFiguraProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para todos los campos (excepto foto_url que no se edita en esta iteración y codigo_interno que es inmutable)
  const [formData, setFormData] = useState({
    nombre: figura.nombre || '',
    serie: figura.serie || '',
    marca: figura.marca || '',
    fabricante: figura.fabricante || '',
    escala: figura.escala || '',
    altura_cm: figura.altura_cm || '',
    fecha_lanzamiento: figura.fecha_lanzamiento || '',
    fecha_compra: figura.fecha_compra || '',
    precio_compra: figura.precio_compra || '',
    tienda: figura.tienda || '',
    condicion: figura.condicion || '',
    empaque: figura.empaque || '',
    ubicacion: figura.ubicacion || '',
    accesorios_completos: figura.accesorios_completos || '',
    venderia: figura.venderia || '',
    valor_sentimental: figura.valor_sentimental || '',
    notas: figura.notas || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        altura_cm: formData.altura_cm ? parseFloat(formData.altura_cm as string) : null,
        precio_compra: formData.precio_compra ? parseFloat(formData.precio_compra as string) : null,
        fecha_lanzamiento: formData.fecha_lanzamiento || null,
        fecha_compra: formData.fecha_compra || null
      };

      const { error: supaError } = await supabase
        .from('figuras')
        .update(payload)
        .eq('id', figura.id);

      if (supaError) throw supaError;
      onSaved();
    } catch (err: any) {
      console.error(err);
      setError('Error al actualizar la figura: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 className="gradient-text" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Editar: {figura.codigo_interno}</h3>
      <form onSubmit={handleSubmit}>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre de la figura *</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Serie / Anime</label>
            <input type="text" name="serie" value={formData.serie} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Marca</label>
            <input type="text" name="marca" value={formData.marca} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Fabricante</label>
            <input type="text" name="fabricante" value={formData.fabricante} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Escala (Ej. 1/7, 1/12)</label>
            <input type="text" name="escala" value={formData.escala} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Altura (cm)</label>
            <input type="number" step="0.1" name="altura_cm" value={formData.altura_cm} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Precio de Compra</label>
            <input type="number" name="precio_compra" value={formData.precio_compra} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Tienda de Compra</label>
            <input type="text" name="tienda" value={formData.tienda} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Fecha de Lanzamiento</label>
            <input type="date" name="fecha_lanzamiento" value={formData.fecha_lanzamiento} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Fecha de Compra</label>
            <input type="date" name="fecha_compra" value={formData.fecha_compra} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Condición</label>
            <select name="condicion" value={formData.condicion} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="Nueva (MISB)">Nueva (MISB)</option>
              <option value="Como Nueva (MIB)">Como Nueva (MIB)</option>
              <option value="Usada (Loose)">Usada (Loose)</option>
              <option value="Dañada">Dañada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Empaque</label>
            <select name="empaque" value={formData.empaque} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="Sellado">Sellado</option>
              <option value="Abierto">Abierto</option>
              <option value="Sin Caja">Sin Caja</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ubicación Física</label>
            <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej: Vitrina 1, Caja 3" />
          </div>

          <div className="form-group">
            <label>Accesorios Completos</label>
            <select name="accesorios_completos" value={formData.accesorios_completos} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>

          <div className="form-group">
            <label>¿Vendería?</label>
            <select name="venderia" value={formData.venderia} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="No">No</option>
              <option value="Quizas">Quizás</option>
              <option value="Si">Sí</option>
            </select>
          </div>

          <div className="form-group">
            <label>Valor Sentimental</label>
            <select name="valor_sentimental" value={formData.valor_sentimental} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Notas Adicionales</label>
          <textarea name="notas" value={formData.notas} onChange={handleChange} rows={3}></textarea>
        </div>

        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Cancelar</button>
          <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </form>
    </div>
  );
}
