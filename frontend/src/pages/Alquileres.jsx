import React, { useState, useEffect } from 'react';
import { Layout, Calendar, Clock, DollarSign, User, Plus, Trash2, CheckCircle, XCircle, Save, ShieldAlert, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import alquileresService from '../services/alquileres';
import configService from '../services/configuraciones';
import authService from '../services/auth';

const Alquileres = () => {
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [isAdmin, setIsAdmin] = useState(false);
  const [tarifas, setTarifas] = useState({ tarifa_alquiler_es: 12000, tarifa_alquiler_fs: 15000 });

  const [form, setForm] = useState({
    nombre_cliente: '',
    tipo: 'ES',
    horas: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      setIsAdmin(user?.role === 'admin');
    };
    
    checkUser();
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAlquileres();
  }, [selectedMes, selectedAnio]);

  const fetchInitialData = async () => {
    try {
      const configData = await configService.getAll();
      if (configData) setTarifas(configData);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchAlquileres = async () => {
    setLoading(true);
    try {
      const data = await alquileresService.getMensuales(selectedMes, selectedAnio);
      setAlquileres(data);
    } catch (error) {
      console.error('Error fetching alquileres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const tarifaKey = form.tipo === 'ES' ? 'tarifa_alquiler_es' : 'tarifa_alquiler_fs';
    const tarifaVigente = parseFloat(tarifas[tarifaKey]);

    try {
      await alquileresService.create({
        ...form,
        tarifa_aplicada: tarifaVigente,
        mes: selectedMes,
        anio: selectedAnio
      });
      setForm({ ...form, nombre_cliente: '', horas: '' });
      fetchAlquileres();
    } catch (error) {
      alert('Error al registrar alquiler');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este registro?')) {
      await alquileresService.delete(id);
      fetchAlquileres();
    }
  };

  const handleTogglePago = async (id) => {
    setSyncingId(id);
    try {
      const updated = await alquileresService.togglePago(id);
      setAlquileres(prev => prev.map(a => a.id === id ? { ...a, pagado: updated.pagado } : a));
    } catch (error) {
      console.error('Error toggling payment:', error);
      alert('Error al actualizar el estado de pago');
    } finally {
      setSyncingId(null);
    }
  };

  // Cálculos dinámicos de cobros
  const totalRecaudado = alquileres.filter(a => a.pagado).reduce((acc, curr) => acc + curr.total, 0);
  const totalPendiente = alquileres.filter(a => !a.pagado).reduce((acc, curr) => acc + curr.total, 0);
  const totalAlquileres = alquileres.length;
  const pagadosAlquileres = alquileres.filter(a => a.pagado).length;
  const porcentajeCobro = totalAlquileres > 0 ? Math.round((pagadosAlquileres / totalAlquileres) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary">Alquiler de Sala</h1>
          <p className="text-on-surface-variant mt-1">Gestión de ingresos por uso del espacio.</p>
        </div>
        
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
        {/* Formulario de Carga */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl golden-border-detail silk-shadow">
            <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" />
              Nuevo Alquiler
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nombre Cliente / Grupo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                  <input 
                    required
                    type="text"
                    className="input-elegant w-full pl-10"
                    placeholder="Ej: Yoga con Maria"
                    value={form.nombre_cliente}
                    onChange={(e) => setForm({...form, nombre_cliente: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Tipo</label>
                  <select 
                    className="input-elegant w-full"
                    value={form.tipo}
                    onChange={(e) => setForm({...form, tipo: e.target.value})}
                  >
                    <option value="ES">Entre Semana</option>
                    <option value="FS">Fin de Semana</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Horas</label>
                  <input 
                    required
                    type="number"
                    step="0.5"
                    className="input-elegant w-full"
                    placeholder="Ej: 2.5"
                    value={form.horas}
                    onChange={(e) => setForm({...form, horas: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Fecha</label>
                <input 
                  required
                  type="date"
                  className="input-elegant w-full"
                  value={form.fecha}
                  onChange={(e) => setForm({...form, fecha: e.target.value})}
                />
              </div>

              {isAdmin && (
                <div className="bg-cream/50 p-3 rounded-lg border border-gold/10 text-[11px]">
                  <p className="font-bold text-primary">Tarifa: $ {parseFloat(tarifas[form.tipo === 'ES' ? 'tarifa_alquiler_es' : 'tarifa_alquiler_fs']).toLocaleString()} / hora</p>
                  <p className="text-burgundy font-bold mt-1">Total Estimado: $ {(form.horas * tarifas[form.tipo === 'ES' ? 'tarifa_alquiler_es' : 'tarifa_alquiler_fs'] || 0).toLocaleString()}</p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-burgundy text-gold py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Registrar Alquiler
              </button>
            </form>
          </div>

          {/* Tarjetas de Configuración (Solo Admin) */}
          {isAdmin && (
            <div className="bg-white p-6 rounded-2xl golden-border-detail silk-shadow space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-burgundy" />
                <h3 className="font-serif text-primary text-sm uppercase tracking-widest">Tarifas de Sala</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70">Entre Semana</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="w-20 text-right border-b border-gold/20 outline-none font-bold"
                      value={tarifas.tarifa_alquiler_es}
                      onChange={(e) => setTarifas({...tarifas, tarifa_alquiler_es: e.target.value})}
                    />
                    <button onClick={() => configService.update('tarifa_alquiler_es', tarifas.tarifa_alquiler_es).then(() => alert('Tarifa actualizada'))}>
                      <Save className="w-3 h-3 text-gold" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70">Fin de Semana</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="w-20 text-right border-b border-gold/20 outline-none font-bold"
                      value={tarifas.tarifa_alquiler_fs}
                      onChange={(e) => setTarifas({...tarifas, tarifa_alquiler_fs: e.target.value})}
                    />
                    <button onClick={() => configService.update('tarifa_alquiler_fs', tarifas.tarifa_alquiler_fs).then(() => alert('Tarifa actualizada'))}>
                      <Save className="w-3 h-3 text-gold" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Registros y Métricas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
            >
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 w-fit mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Total Recaudado</p>
              <h3 className="text-2xl font-serif text-emerald-600 mt-1">$ {totalRecaudado.toLocaleString()}</h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-5 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
            >
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 w-fit mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Monto Pendiente</p>
              <h3 className="text-2xl font-serif text-rose-500 mt-1">$ {totalPendiente.toLocaleString()}</h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-5 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
            >
              <div className="p-3 rounded-2xl bg-cream text-gold w-fit mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Alquileres Cobrados</p>
              <h3 className="text-2xl font-serif text-burgundy mt-1">{pagadosAlquileres} / {totalAlquileres}</h3>
              
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-secondary">
                  <span>Cobro</span>
                  <span>{porcentajeCobro}%</span>
                </div>
                <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                  <div className="h-full bg-burgundy rounded-full transition-all duration-500" style={{ width: `${porcentajeCobro}%` }} />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl golden-border-detail silk-shadow overflow-hidden">
            <div className="p-4 border-b border-gold/10 bg-cream/30">
              <h3 className="font-serif text-primary text-lg">Planilla Mensual</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-b border-gold/10 bg-surface-container-low">
                    <th className="px-6 py-4">Fecha / Cliente</th>
                    <th className="px-6 py-4">Detalle</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center italic opacity-50">Cargando...</td></tr>
                  ) : alquileres.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center italic opacity-50">No hay alquileres este mes.</td></tr>
                  ) : (
                    alquileres.map((a) => (
                      <tr key={a.id} className="hover:bg-cream/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-xs opacity-60">{new Date(a.fecha).toLocaleDateString()}</p>
                          <p className="font-bold text-primary">{a.nombre_cliente}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs">{a.horas} hs ({a.tipo})</p>
                          <p className="text-[10px] opacity-60">$ {a.tarifa_aplicada.toLocaleString()} / h</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-burgundy">
                          $ {a.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              disabled={syncingId === a.id}
                              className={`
                                px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest silk-shadow
                                flex items-center gap-1.5 transition-all duration-300 transform active:scale-95
                                disabled:opacity-50 min-w-[110px] justify-center
                                ${a.pagado 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300'}
                              `}
                              onClick={() => handleTogglePago(a.id)}
                            >
                              {syncingId === a.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : a.pagado ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  PAGADO
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" />
                                  IMPAGO
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alquileres;
