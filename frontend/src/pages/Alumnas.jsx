import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Edit2, Trash2, Phone, Mail, Calendar, GraduationCap, Star, BookOpen, Layers, X, Save } from 'lucide-react';
import axios from 'axios';
import authService from '../services/auth';
import API_URL from '../config';

const horasIntervalos = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00"
];

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
    docente_ids: '',
    nivel: '',
    es_clase_prueba: false,
    activo: true,
    dia_hora_clase: '',
    fecha_nacimiento: '',
    contacto_emergencia: '',
    autoriza_imagen: true
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
      if (error.response?.status === 401) {
        authService.logout();
        window.location.href = '/login';
      } else {
        alert('Error al cargar datos: ' + (error.response?.data?.detail || error.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      nombre: '', apellido: '', email: '', telefono: '',
      actividades: '', combo_id: '', docente_id: '', docente_ids: '', nivel: '', es_clase_prueba: false, activo: true,
      dia_hora_clase: '', fecha_nacimiento: '', contacto_emergencia: '', autoriza_imagen: true
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
      docente_ids: alumna.docente_ids || '',
      nivel: alumna.nivel || '',
      es_clase_prueba: alumna.es_clase_prueba || false,
      activo: alumna.activo,
      dia_hora_clase: alumna.dia_hora_clase || '',
      fecha_nacimiento: alumna.fecha_nacimiento || '',
      contacto_emergencia: alumna.contacto_emergencia || '',
      autoriza_imagen: alumna.autoriza_imagen !== undefined ? alumna.autoriza_imagen : true
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
      nivel: formData.nivel || null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      contacto_emergencia: formData.contacto_emergencia || null,
      dia_hora_clase: formData.dia_hora_clase || null,
      docente_ids: formData.docente_ids || null,
      autoriza_imagen: !!formData.autoriza_imagen
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

  const filteredAlumnas = alumnas
    .filter(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`));

  const getComboName = (id) => combos.find(c => c.id === id)?.nombre || 'S/Plan';
  const getDocenteName = (id) => docentes.find(d => d.id === id)?.nombre || 'S/Docente';
  
  const getDocenteNames = (idsStr, fallbackId) => {
    if (!idsStr) return getDocenteName(fallbackId);
    return idsStr.split(',')
      .map(id => docentes.find(d => d.id === parseInt(id))?.nombre)
      .filter(Boolean)
      .join(', ') || 'S/Docente';
  };

  const parseDiaHora = (str) => {
    if (!str) return { dia: 'Lunes', inicio: '18:30', fin: '20:00' };
    const parts = str.split(' ');
    if (parts.length < 2) return { dia: 'Lunes', inicio: '18:30', fin: '20:00' };
    const dia = parts[0];
    const timeParts = parts[1].split('-');
    if (timeParts.length < 2) return { dia, inicio: '18:30', fin: '20:00' };
    return { dia, inicio: timeParts[0], fin: timeParts[1] };
  };

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
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Horario</th>
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
                    <div className="text-[10px] text-on-surface-variant flex flex-wrap gap-x-3 gap-y-1 mt-1 uppercase tracking-tighter">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gold" /> Ingreso: {new Date(alumna.fecha_ingreso).toLocaleDateString()}</span>
                      {alumna.fecha_nacimiento && (
                        <span className="flex items-center gap-1 font-bold text-burgundy"><span className="text-xs">🎂</span> {new Date(alumna.fecha_nacimiento + 'T00:00:00').toLocaleDateString()}</span>
                      )}
                      {alumna.contacto_emergencia && (
                        <span className="flex items-center gap-1 text-red-600 font-bold"><span className="text-xs">🚨</span> Emerg: {alumna.contacto_emergencia}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-secondary uppercase">{getComboName(alumna.combo_id)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[11px] italic text-on-surface-variant leading-tight">{alumna.actividades || '-'}</div>
                  </td>
                  <td className="px-6 py-5">
                    {alumna.dia_hora_clase ? (
                      <div className="flex flex-col gap-1">
                        {alumna.dia_hora_clase.split(', ').filter(Boolean).map((sch, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-gold/15 text-secondary border border-gold/10 text-[9.5px] font-bold uppercase tracking-tighter block w-fit whitespace-nowrap">
                            📅 {sch}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-on-surface-variant/40 text-[10px] italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-burgundy uppercase">
                        <Layers className="w-3 h-3" /> {alumna.nivel || 'S/N'}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-medium opacity-70 uppercase">
                        <GraduationCap className="w-3 h-3" /> {getDocenteNames(alumna.docente_ids, alumna.docente_id)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      {alumna.es_clase_prueba ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest w-fit">
                          ● PRUEBA
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${
                          alumna.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {alumna.activo ? '● ACTIVA' : '● INACTIVA'}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${
                        alumna.autoriza_imagen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {alumna.autoriza_imagen ? '📸 SÍ AUTORIZA' : '📸 NO AUTORIZA'}
                      </span>
                    </div>
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
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nivel ddv</label>
                <select className="input-elegant w-full" value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})}>
                  <option value="">Elegir Nivel...</option>
                  {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Docentes Asignados (Select + Badges) */}
              <div className="space-y-2.5 md:col-span-2 bg-cream/35 p-4 rounded-2xl border border-gold/10">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">Docentes Asignadas * (Seleccioná una o más)</label>
                
                {(() => {
                  const selectedIds = formData.docente_ids ? formData.docente_ids.split(',').filter(Boolean) : [];
                  return (
                    <div className="space-y-2">
                      <select 
                        className="input-elegant w-full text-xs font-bold"
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const ids = [...selectedIds, val];
                          const joinedIds = ids.join(',');
                          const firstId = parseInt(ids[0]);
                          setFormData({
                            ...formData,
                            docente_ids: joinedIds,
                            docente_id: firstId
                          });
                        }}
                      >
                        <option value="">+ Agregar Docente de la lista...</option>
                        {docentes
                          .filter(d => !selectedIds.includes(d.id.toString()))
                          .map(d => (
                            <option key={d.id} value={d.id}>{d.nombre}</option>
                          ))
                        }
                      </select>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedIds.length > 0 ? (
                          selectedIds.map(id => {
                            const d = docentes.find(doc => doc.id.toString() === id);
                            if (!d) return null;
                            return (
                              <span 
                                key={id} 
                                className="flex items-center gap-1.5 bg-burgundy text-gold border border-gold/20 text-xs font-bold px-3 py-1.5 rounded-xl silk-shadow animate-in zoom-in duration-200"
                              >
                                🎓 {d.nombre}
                                <button
                                  type="button"
                                  className="hover:text-red-300 font-bold ml-1 text-[11px] leading-none transition-colors"
                                  title="Quitar docente"
                                  onClick={() => {
                                    const updated = selectedIds.filter(x => x !== id);
                                    const joinedIds = updated.join(',');
                                    const firstId = updated.length > 0 ? parseInt(updated[0]) : '';
                                    setFormData({
                                      ...formData,
                                      docente_ids: joinedIds,
                                      docente_id: firstId
                                    });
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })
                        ) : (
                          <div className="text-[10px] text-on-surface-variant/45 italic py-1">
                            Ninguna docente seleccionada aún. Elegí una del menú desplegable.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Día y Hora de la Clase (Multi-horarios) */}
              {(() => {
                const hasHorario = !!formData.dia_hora_clase;
                const currentSchedules = formData.dia_hora_clase ? formData.dia_hora_clase.split(', ').filter(Boolean) : [];
                return (
                  <div className="space-y-3 md:col-span-2 bg-cream/35 p-4 rounded-2xl border border-gold/10">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Días y Horarios de las Clases</label>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-gold/15 shadow-sm">
                        <input 
                          type="checkbox"
                          checked={hasHorario}
                          className="w-4 h-4 rounded border-gold/30 text-burgundy focus:ring-burgundy"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, dia_hora_clase: 'Lunes 18:30-20:00' });
                            } else {
                              setFormData({ ...formData, dia_hora_clase: '' });
                            }
                          }}
                        />
                        <span className="text-[10px] font-bold text-primary">¿Asignar horarios?</span>
                      </label>
                    </div>

                    {hasHorario ? (
                      <div className="space-y-3">
                        {currentSchedules.map((scheduleStr, index) => {
                          const { dia, inicio, fin } = parseDiaHora(scheduleStr);
                          return (
                            <div key={index} className="p-3 bg-white/70 rounded-xl border border-gold/15 space-y-2.5 relative shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-secondary uppercase bg-cream/80 px-2 py-0.5 rounded border border-gold/10">
                                  Clase #{index + 1}
                                </span>
                                {currentSchedules.length > 1 && (
                                  <button 
                                    type="button"
                                    className="text-[9px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5"
                                    onClick={() => {
                                      const updated = currentSchedules.filter((_, i) => i !== index);
                                      setFormData({ ...formData, dia_hora_clase: updated.join(', ') });
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" /> Quitar día
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[9px] font-bold opacity-60 text-secondary uppercase tracking-wider block mb-1">Día</label>
                                  <select 
                                    className="input-elegant w-full text-xs font-bold"
                                    value={dia}
                                    onChange={(e) => {
                                      const nuevoDia = e.target.value;
                                      const updated = [...currentSchedules];
                                      updated[index] = `${nuevoDia} ${inicio}-${fin}`;
                                      setFormData({ ...formData, dia_hora_clase: updated.join(', ') });
                                    }}
                                  >
                                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => (
                                      <option key={d} value={d}>{d}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold opacity-60 text-secondary uppercase tracking-wider block mb-1">Inicio</label>
                                  <select 
                                    className="input-elegant w-full text-xs font-bold"
                                    value={inicio}
                                    onChange={(e) => {
                                      const nuevoInicio = e.target.value;
                                      const updated = [...currentSchedules];
                                      updated[index] = `${dia} ${nuevoInicio}-${fin}`;
                                      setFormData({ ...formData, dia_hora_clase: updated.join(', ') });
                                    }}
                                  >
                                    {horasIntervalos.map(h => (
                                      <option key={h} value={h}>{h}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold opacity-60 text-secondary uppercase tracking-wider block mb-1">Fin</label>
                                  <select 
                                    className="input-elegant w-full text-xs font-bold"
                                    value={fin}
                                    onChange={(e) => {
                                      const nuevoFin = e.target.value;
                                      const updated = [...currentSchedules];
                                      updated[index] = `${dia} ${inicio}-${nuevoFin}`;
                                      setFormData({ ...formData, dia_hora_clase: updated.join(', ') });
                                    }}
                                  >
                                    {horasIntervalos.map(h => (
                                      <option key={h} value={h}>{h}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {currentSchedules.length < 5 && (
                          <button
                            type="button"
                            className="w-full py-2 bg-gold/10 hover:bg-gold/25 border border-dashed border-gold/30 text-burgundy rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all mt-1"
                            onClick={() => {
                              const updated = [...currentSchedules, 'Lunes 18:30-20:00'];
                              setFormData({ ...formData, dia_hora_clase: updated.join(', ') });
                            }}
                          >
                            <Calendar className="w-3.5 h-3.5" /> + Agregar otro día / horario
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2.5 text-[10px] text-on-surface-variant/40 italic">
                        Sin horarios registrados. Marcá la casilla superior para asignar uno o más días.
                      </div>
                    )}
                    
                    <p className="text-[9.5px] text-on-surface-variant/80 italic mt-1 leading-tight">
                      Horarios registrados: <span className="font-bold text-burgundy">{formData.dia_hora_clase || 'Ninguno'}</span>
                    </p>
                  </div>
                );
              })()}

              {/* Fecha de Nacimiento */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Fecha de Nacimiento</label>
                <input 
                  type="date"
                  className="input-elegant w-full text-xs"
                  value={formData.fecha_nacimiento}
                  onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})}
                />
              </div>

              {/* Contacto de Emergencia */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Contacto de Emergencia</label>
                <input 
                  type="text"
                  placeholder="Nombre y Teléfono"
                  className="input-elegant w-full text-xs"
                  value={formData.contacto_emergencia}
                  onChange={e => setFormData({...formData, contacto_emergencia: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-4 pt-4 md:col-span-2">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
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

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gold/30 text-emerald-600 focus:ring-emerald-600"
                      checked={formData.autoriza_imagen}
                      onChange={e => setFormData({...formData, autoriza_imagen: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-primary flex items-center gap-1">📸 ¿Autoriza uso de Imagen en Redes?</span>
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
