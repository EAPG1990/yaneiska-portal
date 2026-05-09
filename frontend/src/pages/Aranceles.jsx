import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Edit2, Check, X, Info, Sparkles, DollarSign, Plus, Trash2, Tag } from 'lucide-react';
import axios from 'axios';
import authService from '../services/auth';
import API_URL from '../config';

const Aranceles = () => {
  const [combos, setCombos] = useState([]);
  const [config, setConfig] = useState({});
  const [editingComboId, setEditingComboId] = useState(null);
  const [editingConfig, setEditingConfig] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [tempCombo, setTempCombo] = useState({});
  const [tempConfig, setTempConfig] = useState({});
  const [newCombo, setNewCombo] = useState({
    nombre: '',
    descripcion: '',
    costo_mensual: '',
    cantidad_actividades: 1
  });

  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      setIsAdmin(user?.role === 'admin');
    };
    checkUser();
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = authService.getToken();
    try {
      const [combosRes, configRes] = await Promise.all([
        axios.get(`${API_URL}/configuraciones/combos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/configuraciones/base`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCombos(combosRes.data);
      
      const configObj = {};
      configRes.data.forEach(c => configObj[c.clave] = c.valor);
      setConfig(configObj);
      setTempConfig(configObj);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCombo = (combo) => {
    setEditingComboId(combo.id);
    setTempCombo({ ...combo });
  };

  const handleSaveCombo = async () => {
    const token = authService.getToken();
    try {
      await axios.put(`${API_URL}/configuraciones/combos/${editingComboId}`, tempCombo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingComboId(null);
      fetchData();
    } catch (error) {
      alert('Error al actualizar combo');
    }
  };

  const handleAddCombo = async (e) => {
    e.preventDefault();
    const token = authService.getToken();
    try {
      // Usando el mismo endpoint de crear combos (si existe) o uno nuevo
      // Por ahora asumo que POST /configuraciones/combos funciona
      await axios.post(`${API_URL}/configuraciones/combos`, newCombo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewCombo({ nombre: '', descripcion: '', costo_mensual: '', cantidad_actividades: 1 });
      fetchData();
    } catch (error) {
      alert('Error al crear combo');
    }
  };

  const handleDeleteCombo = async (id) => {
    if (!window.confirm('¿Eliminar este plan? Esto podría afectar a alumnas inscritas.')) return;
    const token = authService.getToken();
    try {
      await axios.delete(`${API_URL}/configuraciones/combos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al eliminar combo');
    }
  };

  const handleSaveConfig = async () => {
    const token = authService.getToken();
    try {
      const updates = Object.entries(tempConfig).map(([clave, valor]) => 
        axios.put(`${API_URL}/configuraciones/base/${clave}`, { valor: valor.toString() }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      await Promise.all(updates);
      setEditingConfig(false);
      fetchData();
    } catch (error) {
      alert('Error al actualizar configuración');
    }
  };

  if (loading) return <div className="p-8 italic opacity-50">Cargando aranceles...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-primary">Aranceles y Tarifas</h1>
          <p className="text-on-surface-variant mt-1">Configuración global de precios del estudio.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-burgundy text-gold px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 silk-shadow"
          >
            <Plus className="w-4 h-4" />
            Nuevo Plan / Combo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listado de Planes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl golden-border-detail silk-shadow overflow-hidden">
            <div className="p-6 border-b border-gold/10 bg-cream/30">
              <h2 className="text-xl font-serif text-primary flex items-center gap-2">
                <Tag className="w-5 h-5 text-gold" />
                Planes y Combos Mensuales
              </h2>
            </div>
            
            <div className="divide-y divide-gold/5">
              {combos.map(combo => (
                <div key={combo.id} className="p-6 hover:bg-cream/10 transition-colors flex justify-between items-center">
                  <div className="space-y-1 flex-1 pr-8">
                    {editingComboId === combo.id ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full font-bold border-b border-gold bg-transparent focus:outline-none"
                          value={tempCombo.nombre}
                          onChange={(e) => setTempCombo({...tempCombo, nombre: e.target.value})}
                        />
                        <input 
                          className="w-full text-xs text-on-surface-variant border-b border-gold bg-transparent focus:outline-none"
                          value={tempCombo.descripcion}
                          onChange={(e) => setTempCombo({...tempCombo, descripcion: e.target.value})}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-primary">{combo.nombre}</h3>
                        <p className="text-xs text-on-surface-variant">{combo.descripcion}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {editingComboId === combo.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gold" />
                          <input 
                            type="number"
                            className="w-24 pl-6 pr-2 py-1 text-sm border-gold/30 rounded bg-cream/20 focus:ring-burgundy"
                            value={tempCombo.costo_mensual}
                            onChange={(e) => setTempCombo({...tempCombo, costo_mensual: e.target.value})}
                          />
                        </div>
                        <button onClick={handleSaveCombo} className="p-1.5 bg-green-500 text-white rounded-md">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingComboId(null)} className="p-1.5 bg-red-400 text-white rounded-md">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xl font-serif text-burgundy font-bold min-w-[100px] text-right">
                          $ {combo.costo_mensual.toLocaleString()}
                        </span>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleEditCombo(combo)}
                              className="p-2 text-gold hover:bg-gold/10 rounded-full"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCombo(combo.id)}
                              className="p-2 text-red-300 hover:text-red-500 rounded-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tarifas Base */}
        <div className="space-y-6">
          <div className="bg-primary text-gold p-8 rounded-2xl silk-shadow relative overflow-hidden">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
              <Info className="w-6 h-6" />
              Extras
            </h2>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Matrícula Anual</span>
                {editingConfig ? (
                  <input 
                    type="text"
                    className="w-20 bg-white/10 border-b border-gold text-right"
                    value={tempConfig.inscripcion_anual}
                    onChange={(e) => setTempConfig({...tempConfig, inscripcion_anual: e.target.value})}
                  />
                ) : (
                  <span className="text-xl font-serif font-bold">$ {config.inscripcion_anual?.toLocaleString() || '0'}</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Clase de Prueba</span>
                {editingConfig ? (
                  <input 
                    type="text"
                    className="w-20 bg-white/10 border-b border-gold text-right"
                    value={tempConfig.clase_prueba}
                    onChange={(e) => setTempConfig({...tempConfig, clase_prueba: e.target.value})}
                  />
                ) : (
                  <span className="text-xl font-serif font-bold">$ {config.clase_prueba?.toLocaleString() || '0'}</span>
                )}
              </div>

              {isAdmin && (
                <div className="pt-4 border-t border-white/10">
                  {editingConfig ? (
                    <div className="flex gap-2">
                      <button onClick={handleSaveConfig} className="flex-1 bg-gold text-burgundy py-2 rounded-lg font-bold text-xs">GUARDAR</button>
                      <button onClick={() => setEditingConfig(false)} className="px-4 bg-white/10 py-2 rounded-lg font-bold text-xs"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingConfig(true)} className="w-full border border-gold/30 text-gold py-2 rounded-lg font-bold text-xs hover:bg-gold hover:text-burgundy">EDITAR EXTRAS</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Agregar Combo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md silk-shadow overflow-hidden border border-gold/20 animate-in zoom-in duration-300">
            <div className="bg-burgundy p-6 text-gold">
              <h3 className="text-xl font-serif">Crear Nuevo Plan</h3>
            </div>
            <form onSubmit={handleAddCombo} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nombre del Plan</label>
                <input required className="input-elegant w-full" value={newCombo.nombre} onChange={e => setNewCombo({...newCombo, nombre: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Descripción</label>
                <input required className="input-elegant w-full" value={newCombo.descripcion} onChange={e => setNewCombo({...newCombo, descripcion: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Costo Mensual</label>
                  <input required type="number" className="input-elegant w-full" value={newCombo.costo_mensual} onChange={e => setNewCombo({...newCombo, costo_mensual: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Horas / Sem</label>
                  <input required type="number" className="input-elegant w-full" value={newCombo.cantidad_actividades} onChange={e => setNewCombo({...newCombo, cantidad_actividades: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-burgundy text-gold py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Crear Plan</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 bg-cream text-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aranceles;
