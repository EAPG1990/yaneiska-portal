import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Edit2, Trash2, Phone, Mail, Calendar, GraduationCap, Star, BookOpen, Layers, X, Save } from 'lucide-react';
import axios from 'axios';
import authService from '../services/auth';
import API_URL from '../config';

const Alumnas = () => {
  const [alumnas, setAlumnas] = useState([]);
  const [combos, setCombos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    actividades: '',
    combo_id: '',
    docente_id: '',
    nivel: '',
    es_clase_prueba: false,
    activo: true
  });

  const niveles = [
    "Principiante", 
    "Principiante/Intermedio", 
    "Intermedio", 
    "Intermedio/Avanzado", 
    "Avanzado", 
    "Perfeccionamiento",
    "NO APLICA"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = authService.getToken();
    try {
      const [alumnasRes, combosRes, docentesRes] = await Promise.all([
        axios.get(`${API_URL}/alumnas/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/configuraciones/combos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/docentes/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAlumnas(alumnasRes.data);
      setCombos(combosRes.data);
      setDocentes(docentesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      nombre: '', apellido: '', email: '', telefono: '',
      actividades: '', combo_id: '', docente_id: '', nivel: '', es_clase_prueba: false, activo: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (alumna) => {
    setIsEditing(true);
    setSelectedId(alumna.id);
    setFormData({
      nombre: alumna.nombre,
      apellido: alumna.apellido,
      email: alumna.email || '',
      telefono: alumna.telefono || '',
      actividades: alumna.actividades || '',
      combo_id: alumna.combo_id || '',
      docente_id: alumna.docente_id || '',
      nivel: alumna.nivel || '',
      es_clase_prueba: alumna.es_clase_prueba || false,
      activo: alumna.activo
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = authService.getToken();
    
    const payload = {
      ...formData,
      combo_id: formData.combo_id ? parseInt(formData.combo_id) : null,
      docente_id: formData.docente_id ? parseInt(formData.docente_id) : null,
      email: formData.email || null,
      telefono: formData.telefono || null,
      actividades: formData.actividades || null,
      nivel: formData.nivel || null
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/alumnas/${selectedId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/alumnas/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Error al guardar: ' + (error.response?.data?.detail || 'Revisá los campos'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás segura de eliminar esta alumna?')) return;
    const token = authService.getToken();
    try {
      await axios.delete(`${API_URL}/alumnas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const filteredAlumnas = alumnas.filter(a => 
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getComboName = (id) => combos.find(c => c.id === id)?.nombre || 'S/Plan';
  const getDocenteName = (id) => docentes.find(d => d.id === id)?.nombre || 'S/Docente';

  if (loading) return <div className="p-8 italic opacity-50">Cargando alumnas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-primary">Gestión de Alumnas</h1>
          <p className="text-on-surface-variant mt-1">Administra el registro y estado de tus estudiantes.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-burgundy text-gold px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 silk-shadow"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Nueva
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50" />
          <input 
            type="text"
            placeholder="Buscar por nombre o apellido..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gold/10 rounded-2xl silk-shadow focus:ring-2 focus:ring-burgundy outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden golden-border-detail silk-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-burgundy text-gold">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Alumna</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Combo / Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Actividades</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Nivel / Docente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {filteredAlumnas.map((alumna) => (
                <tr key={alumna.id} className="hover:bg-cream/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-primary">{alumna.nombre} {alumna.apellido}</div>
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-1 uppercase tracking-tighter">
                       <Calendar className="w-3 h-3" /> Ingreso: {new Date(alumna.fecha_ingreso).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-secondary uppercase">{getComboName(alumna.combo_id)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[11px] italic text-on-surface-variant leading-tight">{alumna.actividades || '-'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-burgundy uppercase">
                        <Layers className="w-3 h-3" /> {alumna.nivel || 'S/N'}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-medium opacity-70 uppercase">
                        <GraduationCap className="w-3 h-3" /> {getDocenteName(alumna.docente_id)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {alumna.es_clase_prueba ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest">
                        ● PRUEBA
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        alumna.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {alumna.activo ? '● ACTIVA' : '● INACTIVA'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(alumna)}
                        className="p-2 text-gold hover:bg-gold/10 rounded-full transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(alumna.id)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal UNIFICADO (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl silk-shadow overflow-hidden border border-gold/20 animate-in zoom-in duration-300">
            <div className="bg-burgundy p-6 text-gold flex justify-between items-center">
              <h3 className="text-xl font-serif">{isEditing ? 'Editar Perfil de Alumna' : 'Registrar Nueva Alumna'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nombre</label>
                <input required className="input-elegant w-full" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Apellido</label>
                <input required className="input-elegant w-full" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Teléfono</label>
                <input className="input-elegant w-full" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Actividades</label>
                <input className="input-elegant w-full" placeholder="Ej: Danza Arabe, Tribal..." value={formData.actividades} onChange={e => setFormData({...formData, actividades: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Combo / Plan</label>
                <select className="input-elegant w-full" value={formData.combo_id} onChange={e => setFormData({...formData, combo_id: e.target.value})}>
                  <option value="">Seleccionar Plan...</option>
                  {combos.map(c => <option key={c.id} value={c.id}>{c.nombre} ($ {c.costo_mensual.toLocaleString()})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Docente Asignado</label>
                <select className="input-elegant w-full" value={formData.docente_id} onChange={e => setFormData({...formData, docente_id: e.target.value})}>
                  <option value="">Seleccionar Docente...</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nivel ddv</label>
                <select className="input-elegant w-full" value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})}>
                  <option value="">Elegir Nivel...</option>
                  {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-4 pt-6 md:col-span-2">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gold/30 text-burgundy focus:ring-burgundy"
                      checked={formData.es_clase_prueba}
                      onChange={e => setFormData({...formData, es_clase_prueba: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-primary">¿Es Clase de Prueba?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gold/30 text-green-600 focus:ring-green-600"
                      checked={formData.activo}
                      onChange={e => setFormData({...formData, activo: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-primary">¿Cuenta Activa?</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 md:col-span-2">
                <button type="submit" className="flex-1 bg-burgundy text-gold py-4 rounded-xl font-bold text-xs uppercase tracking-widest silk-shadow flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Guardar Cambios' : 'Registrar Alumna'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-cream text-primary py-4 rounded-xl font-bold text-xs uppercase tracking-widest border border-gold/10">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alumnas;
