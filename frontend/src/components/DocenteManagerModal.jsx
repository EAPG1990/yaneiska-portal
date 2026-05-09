import React, { useState } from 'react';
import { X, Save, UserPlus, Trash2, Edit2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import docentesService from '../services/docentes';

const DocenteManagerModal = ({ isOpen, onClose, docentes, onSuccess }) => {
  const [newDocente, setNewDocente] = useState({ nombre: '', alias: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await docentesService.create({ ...newDocente, activo: true });
      setNewDocente({ nombre: '', alias: '' });
      onSuccess();
    } catch (error) {
      alert('Error al agregar docente');
    }
  };

  const handleToggleActivo = async (id, currentActivo) => {
    const action = currentActivo ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${action} a este docente?`)) {
      try {
        const docente = docentes.find(d => d.id === id);
        await docentesService.update(id, { ...docente, activo: !currentActivo });
        onSuccess();
      } catch (error) {
        alert('Error al actualizar estado');
      }
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const docente = docentes.find(d => d.id === id);
      await docentesService.update(id, { ...docente, nombre: editValue, alias: editValue });
      setEditingId(null);
      onSuccess();
    } catch (error) {
      alert('Error al editar');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gold/20">
        <div className="bg-burgundy p-6 flex justify-between items-center">
          <h2 className="text-xl font-serif text-gold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Gestionar Equipo
          </h2>
          <button onClick={onClose} className="text-gold/50 hover:text-gold transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nombre del nuevo docente..."
              className="input-elegant flex-1 py-2 text-sm"
              value={newDocente.nombre}
              onChange={(e) => setNewDocente({ nombre: e.target.value, alias: e.target.value })}
              required
            />
            <button type="submit" className="bg-gold text-burgundy px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-primary hover:text-gold transition-colors">
              Agregar
            </button>
          </form>

          {/* List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Plantel Actual</label>
            {docentes.map((docente) => (
              <div key={docente.id} className={`flex items-center justify-between p-3 rounded-xl border ${docente.activo ? 'border-gold/10 bg-cream/20' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                {editingId === docente.id ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      className="input-elegant flex-1 py-1 text-xs" 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <button onClick={() => handleSaveEdit(docente.id)} className="text-green-600"><CheckCircle2 className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <span className={`text-sm font-bold ${docente.activo ? 'text-primary' : 'text-gray-400'}`}>
                    {docente.nombre} {!docente.activo && '(Inactivo)'}
                  </span>
                )}
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingId(docente.id); setEditValue(docente.nombre); }}
                    className="p-1 hover:bg-gold/10 text-on-surface-variant rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleActivo(docente.id, docente.activo)}
                    className={`p-1 rounded ${docente.activo ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-400'}`}
                  >
                    {docente.activo ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 text-center">
          <p className="text-[9px] text-on-surface-variant italic">
            * Desactivar un docente lo quita del menú de carga pero mantiene su historial.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocenteManagerModal;
