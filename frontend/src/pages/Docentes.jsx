import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, DollarSign, Calendar, Plus, Save, UserPlus, History, ShieldAlert, Settings } from 'lucide-react';
import docentesService from '../services/docentes';
import configService from '../services/configuraciones';
import authService from '../services/auth';
import DocenteManagerModal from '../components/DocenteManagerModal';

const Docentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [clasesMensuales, setClasesMensuales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [userRole, setUserRole] = useState('');
  const [tarifas, setTarifas] = useState({ tarifa_docente_1h: 9900, tarifa_docente_1_5h: 14800 });
  
  // Form para registrar clases
  const [horaForm, setHoraForm] = useState({
    docente_id: '',
    cantidad_clases: '',
    duracion: '1.0'
  });

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    // Obtener rol del usuario de forma segura
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) setUserRole(user.role);
    };
    
    checkUser();
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchClases();
  }, [selectedMes, selectedAnio]);

  const fetchInitialData = async () => {
    try {
      const [docentesData, configData] = await Promise.all([
        docentesService.getAll(),
        configService.getAll()
      ]);
      setDocentes(docentesData);
      if (configData) setTarifas(configData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchClases = async () => {
    setLoading(true);
    try {
      const clasesData = await docentesService.getClasesMensuales(selectedMes, selectedAnio);
      setClasesMensuales(clasesData);
    } catch (error) {
      console.error('Error fetching clases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarHoras = async (e) => {
    e.preventDefault();
    
    // Obtener la tarifa correspondiente a la duración
    const tarifaClave = horaForm.duracion === '1.0' ? 'tarifa_docente_1h' : 'tarifa_docente_1_5h';
    const tarifaVigente = parseFloat(tarifas[tarifaClave]);

    try {
      await docentesService.registrarClase({
        ...horaForm,
        mes: selectedMes,
        anio: selectedAnio,
        cantidad_clases: parseInt(horaForm.cantidad_clases),
        duracion: parseFloat(horaForm.duracion),
        tarifa_hora: tarifaVigente, // Se guarda el precio por clase de esa duración
        horas_ejecutadas: parseInt(horaForm.cantidad_clases) * parseFloat(horaForm.duracion),
        tipo: 'Normal' // Valor por defecto interno
      });
      fetchClases();
      setHoraForm({ ...horaForm, cantidad_clases: '' });
      alert('Clases registradas correctamente');
    } catch (error) {
      alert('Error al registrar clases');
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary">Docentes y Clases</h1>
          <p className="text-on-surface-variant mt-1">Gestión mensual de horas y honorarios del equipo.</p>
        </div>
        
        {/* Selector de Fecha */}
        <div className="flex gap-3 bg-white p-2 rounded-xl border border-gold/20 silk-shadow">
          <select 
            value={selectedMes} 
            onChange={(e) => setSelectedMes(parseInt(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer"
          >
            {meses.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select 
            value={selectedAnio} 
            onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 border-l border-gold/10 cursor-pointer"
          >
            {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Izquierdo: Carga de Clases */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl golden-border-detail silk-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif text-primary">Carga Mensual</h2>
            </div>

            <form onSubmit={handleRegistrarHoras} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Docente</label>
                <select 
                  required
                  className="input-elegant w-full"
                  value={horaForm.docente_id}
                  onChange={(e) => setHoraForm({...horaForm, docente_id: e.target.value})}
                >
                  <option value="">Seleccionar Docente...</option>
                  {docentes.filter(d => d.activo).map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Cant. Clases</label>
                  <input 
                    required
                    type="number"
                    placeholder="Ej: 8"
                    className="input-elegant w-full"
                    value={horaForm.cantidad_clases}
                    onChange={(e) => setHoraForm({...horaForm, cantidad_clases: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Duración</label>
                  <select 
                    className="input-elegant w-full"
                    value={horaForm.duracion}
                    onChange={(e) => setHoraForm({...horaForm, duracion: e.target.value})}
                  >
                    <option value="1.0">1 Hora</option>
                    <option value="1.5">1.5 Horas</option>
                  </select>
                </div>
              </div>

              {isAdmin && (
                <div className="bg-cream/50 p-3 rounded-lg border border-gold/10 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-3 h-3 text-burgundy" />
                    <label className="text-[9px] font-bold text-burgundy uppercase tracking-widest">Tarifa Vigente (Solo Admin)</label>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    $ {parseFloat(tarifas[horaForm.duracion === '1.0' ? 'tarifa_docente_1h' : 'tarifa_docente_1_5h']).toLocaleString()} por clase
                  </p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-burgundy text-gold py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg mt-4"
              >
                <Save className="w-4 h-4" />
                Guardar Registro
              </button>
            </form>
          </div>

          {/* Admin Stats Dashboard - Desglose por Docente */}
          {isAdmin && (
            <div className="bg-burgundy p-6 rounded-2xl shadow-xl text-gold relative overflow-hidden border border-gold/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 border-b border-gold/20 pb-2">
                  <DollarSign className="w-5 h-5" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Liquidación {meses[selectedMes - 1]}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {docentes.map(docente => {
                    const totalDocente = clasesMensuales
                      .filter(c => c.docente_id === docente.id)
                      .reduce((acc, curr) => acc + curr.total_pago, 0);
                    
                    if (totalDocente === 0) return null;

                    return (
                      <div key={docente.id} className="flex justify-between items-end border-b border-gold/5 pb-1">
                        <span className="text-xs font-serif opacity-80">{docente.nombre}</span>
                        <span className="text-sm font-bold">$ {totalDocente.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  
                  {clasesMensuales.length === 0 && (
                    <p className="text-[10px] italic opacity-50">No hay clases registradas aún.</p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-1">Total General</p>
                  <h3 className="text-3xl font-serif">
                    $ {clasesMensuales.reduce((acc, curr) => acc + curr.total_pago, 0).toLocaleString()}
                  </h3>
                </div>
              </div>
              
              <div className="absolute -right-8 -bottom-8 opacity-[0.03]">
                <GraduationCap className="w-48 h-48" />
              </div>
            </div>
          )}

          {/* Configuración de Tarifas (Solo Admin) */}
          {isAdmin && (
            <div className="bg-white p-6 rounded-2xl golden-border-detail silk-shadow space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-burgundy" />
                <h3 className="font-serif text-primary text-sm uppercase tracking-widest">Configurar Tarifas</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Clase 1 Hora</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">$</span>
                    <input 
                      type="number"
                      className="w-24 text-right text-xs font-bold border-b border-gold/30 focus:border-gold outline-none pb-1"
                      value={tarifas.tarifa_docente_1h}
                      onChange={(e) => setTarifas({...tarifas, tarifa_docente_1h: e.target.value})}
                    />
                    <button 
                      onClick={() => {
                        configService.update('tarifa_docente_1h', tarifas.tarifa_docente_1h)
                          .then(() => alert('Tarifa 1h actualizada'));
                      }}
                      className="p-1 hover:bg-gold/10 rounded text-gold"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Clase 1.5 Horas</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">$</span>
                    <input 
                      type="number"
                      className="w-24 text-right text-xs font-bold border-b border-gold/30 focus:border-gold outline-none pb-1"
                      value={tarifas.tarifa_docente_1_5h}
                      onChange={(e) => setTarifas({...tarifas, tarifa_docente_1_5h: e.target.value})}
                    />
                    <button 
                      onClick={() => {
                        configService.update('tarifa_docente_1_5h', tarifas.tarifa_docente_1_5h)
                          .then(() => alert('Tarifa 1.5h actualizada'));
                      }}
                      className="p-1 hover:bg-gold/10 rounded text-gold"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] italic text-on-surface-variant opacity-70 leading-tight pt-2 border-t border-gold/5">
                * Los cambios afectarán solo a los registros nuevos que se guarden desde ahora.
              </p>
            </div>
          )}
        </div>

        {/* Panel Derecho: Tabla de Registros */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl golden-border-detail silk-shadow overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-cream/30">
              <h3 className="font-serif text-primary flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-gold" />
                Planilla de {meses[selectedMes - 1]}
              </h3>
              {isAdmin && (
                <button 
                  onClick={() => setIsManagerOpen(true)}
                  className="text-[10px] font-bold text-burgundy bg-gold/20 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-gold/40 transition-all flex items-center gap-2"
                >
                  <Settings className="w-3 h-3" />
                  Gestionar Equipo
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] tracking-[0.2em] font-bold uppercase text-on-surface-variant border-b border-gold/10">
                    <th className="px-6 py-4">Docente</th>
                    <th className="px-6 py-4">Cantidad</th>
                    <th className="px-6 py-4">Duración</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Monto Total</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center italic text-on-surface-variant">Cargando datos...</td></tr>
                  ) : clasesMensuales.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center italic text-on-surface-variant">No hay horas registradas este mes.</td></tr>
                  ) : (
                    clasesMensuales.map((clase) => {
                      const docente = docentes.find(d => d.id === clase.docente_id);
                      return (
                        <tr key={clase.id} className="hover:bg-cream/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-primary">{docente?.nombre || 'Desconocido'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold bg-surface-container px-2 py-1 rounded">{clase.cantidad_clases} clases</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-on-surface-variant">{clase.duracion === 1 ? '1 Hora' : '1.5 Horas'}</p>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-right">
                              <p className="font-bold text-burgundy">$ {clase.total_pago.toLocaleString()}</p>
                              <p className="text-[9px] text-on-surface-variant">({clase.cantidad_clases} x $ {clase.tarifa_hora.toLocaleString()})</p>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <DocenteManagerModal 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        docentes={docentes}
        onSuccess={fetchInitialData}
      />
    </div>
  );
};

export default Docentes;
