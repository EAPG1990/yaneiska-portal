import React, { useState, useEffect } from 'react';
import { Layout, Calendar, Clock, DollarSign, User, Plus, Trash2, CheckCircle, XCircle, Save, ShieldAlert } from 'lucide-react';
import alquileresService from '../services/alquileres';
import configService from '../services/configuraciones';
import authService from '../services/auth';

const Alquileres = () => {
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading] = useState(true);
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
    await alquileresService.togglePago(id);
    fetchAlquileres();
  };

  const totalMensual = alquileres.reduce((acc, curr) => acc + curr.total, 0);

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

        {/* Tabla de Registros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-burgundy p-6 rounded-2xl text-gold silk-shadow flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ingresos Totales {meses[selectedMes - 1]}</p>
              <h3 className="text-3xl font-serif mt-1">$ {totalMensual.toLocaleString()}</h3>
            </div>
            <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
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
                          <button 
                            onClick={() => handleTogglePago(a.id)}
                            className={`flex items-center gap-1 mx-auto px-2 py-1 rounded-full text-[10px] font-bold uppercase ${a.pagado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {a.pagado ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {a.pagado ? 'Pagado' : 'Pendiente'}
                          </button>
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
