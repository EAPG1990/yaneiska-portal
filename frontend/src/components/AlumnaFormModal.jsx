import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Hash, CheckCircle2 } from 'lucide-react';
import alumnasService from '../services/alumnas';

const AlumnaFormModal = ({ isOpen, onClose, onSuccess, alumnaToEdit = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    email: '',
    telefono: '',
    es_clase_prueba: false,
    activo: true
  });

  React.useEffect(() => {
    if (alumnaToEdit) {
      setFormData({
        nombre: alumnaToEdit.nombre || '',
        apellido: alumnaToEdit.apellido || '',
        edad: alumnaToEdit.edad || '',
        email: alumnaToEdit.email || '',
        telefono: alumnaToEdit.telefono || '',
        es_clase_prueba: alumnaToEdit.es_clase_prueba || false,
        activo: alumnaToEdit.activo || true
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        edad: '',
        email: '',
        telefono: '',
        es_clase_prueba: false,
        activo: true
      });
    }
  }, [alumnaToEdit, isOpen]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Adaptar datos para el backend
      const dataToSend = {
        ...formData,
        edad: formData.edad ? parseInt(formData.edad) : null
      };
      
      if (alumnaToEdit) {
        await alumnasService.update(alumnaToEdit.id, dataToSend);
      } else {
        await alumnasService.create(dataToSend);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Error al registrar la alumna. Verifique los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gold/20 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-burgundy p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif text-gold">
              {alumnaToEdit ? 'Editar Alumna' : 'Registrar Nueva Alumna'}
            </h2>
            <p className="text-white/60 text-xs uppercase tracking-widest mt-1">
              {alumnaToEdit ? 'Modifica los datos del perfil' : 'Completa los datos del perfil'}
            </p>
          </div>
          <button onClick={onClose} className="text-gold/50 hover:text-gold transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nombre *</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  required
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input-elegant w-full pl-6 py-2"
                  placeholder="Ej: Jimena"
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Apellido *</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  required
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="input-elegant w-full pl-6 py-2"
                  placeholder="Ej: González"
                />
              </div>
            </div>

            {/* Edad */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Edad</label>
              <div className="relative">
                <Hash className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  className="input-elegant w-full pl-6 py-2"
                  placeholder="Ej: 25"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-elegant w-full pl-6 py-2"
                  placeholder="+54 9 11 ..."
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-elegant w-full pl-6 py-2"
                  placeholder="alumna@ejemplo.com"
                />
              </div>
            </div>
          </div>


          {/* Configuration Options */}
          <div className="bg-cream/50 p-4 rounded-xl border border-gold/10 flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="es_clase_prueba"
                checked={formData.es_clase_prueba}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gold/30 text-burgundy focus:ring-secondary"
              />
              <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors italic">¿Es Clase de Prueba?</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gold/30 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">Alumna Activa</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-lg font-bold text-xs uppercase tracking-widest border border-surface-container-highest text-on-surface-variant hover:bg-cream transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-burgundy text-gold px-6 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 group"
            >
              {loading ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Guardar Registro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlumnaFormModal;
