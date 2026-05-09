import React, { useState, useEffect } from 'react';
import { History, Calendar, User, DollarSign, Plus, Trash2, CheckCircle, XCircle, Save, TrendingUp, Wallet } from 'lucide-react';
import talleresService from '../services/talleres';
import authService from '../services/auth';

const Talleres = () => {
  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    facilitador: '',
    total_ingreso: '',
    pago_facilitador: '',
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
  }, []);

  useEffect(() => {
    fetchTalleres();
  }, [selectedMes, selectedAnio]);

  const fetchTalleres = async () => {
    setLoading(true);
    try {
      const data = await talleresService.getMensuales(selectedMes, selectedAnio);
      setTalleres(data);
    } catch (error) {
      console.error('Error fetching talleres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Función robusta para limpiar números
    const cleanNum = (val) => {
      if (!val) return 0;
      return parseFloat(val.toString().replace(/\./g, '').replace(',', '.'));
    };

    const total_ingreso = cleanNum(form.total_ingreso);
    const pago_facilitador = cleanNum(form.pago_facilitador);

    try {
      await talleresService.create({
        ...form,
        mes: selectedMes,
        anio: selectedAnio,
        total_ingreso,
        pago_facilitador
      });
      setForm({ ...form, nombre: '', facilitador: '', total_ingreso: '', pago_facilitador: '' });
      fetchTalleres();
    } catch (error) {
      alert('Error al registrar taller');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este taller?')) {
      await talleresService.delete(id);
      fetchTalleres();
    }
  };

  const handleTogglePago = async (id) => {
    await talleresService.togglePagoFacilitador(id);
    fetchTalleres();
  };

  const totalIngresos = talleres.reduce((acc, curr) => acc + curr.total_ingreso, 0);
  const totalGanancia = talleres.reduce((acc, curr) => acc + (curr.total_ingreso - curr.pago_facilitador), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary">Talleres Especiales</h1>
          <p className="text-on-surface-variant mt-1">Seminarios, workshops y eventos intensivos.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl golden-border-detail silk-shadow">
            <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" />
              Nuevo Taller
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nombre del Taller</label>
                <input 
                  required
                  type="text"
                  className="input-elegant w-full"
                  placeholder="Ej: Seminario de Velo"
                  value={form.nombre}
                  onChange={(e) => setForm({...form, nombre: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Facilitador</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                  <input 
                    required
                    type="text"
                    className="input-elegant w-full pl-10"
                    placeholder="Nombre del docente"
                    value={form.facilitador}
                    onChange={(e) => setForm({...form, facilitador: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Ingreso Total</label>
                  <input 
                    required
                    type="text"
                    className="input-elegant w-full"
                    placeholder="Ej: 50.000"
                    value={form.total_ingreso}
                    onChange={(e) => setForm({...form, total_ingreso: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Pago Facilit.</label>
                  <input 
                    required
                    type="text"
                    className="input-elegant w-full"
                    placeholder="Ej: 35.000"
                    value={form.pago_facilitador}
                    onChange={(e) => setForm({...form, pago_facilitador: e.target.value})}
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

              <div className="bg-cream/50 p-3 rounded-lg border border-gold/10 text-[11px]">
                <p className="text-burgundy font-bold">
                  Ganancia Estudio: $ {
                    (() => {
                      const clean = (val) => parseFloat(val.toString().replace(/\./g, '').replace(',', '.')) || 0;
                      return (clean(form.total_ingreso) - clean(form.pago_facilitador)).toLocaleString();
                    })()
                  }
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-burgundy text-gold py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Registrar Taller
              </button>
            </form>
          </div>
        </div>

        {/* Resumen y Tabla */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary p-6 rounded-2xl text-gold silk-shadow relative overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ingresos Totales Talleres</p>
              <h3 className="text-3xl font-serif mt-1">$ {totalIngresos.toLocaleString()}</h3>
              <TrendingUp className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10" />
            </div>
            <div className="bg-burgundy p-6 rounded-2xl text-gold silk-shadow relative overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ganancia Neta Estudio</p>
              <h3 className="text-3xl font-serif mt-1">$ {totalGanancia.toLocaleString()}</h3>
              <Wallet className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10" />
            </div>
          </div>

          <div className="bg-white rounded-2xl golden-border-detail silk-shadow overflow-hidden">
            <div className="p-4 border-b border-gold/10 bg-cream/30 flex justify-between items-center">
              <h3 className="font-serif text-primary text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-gold" />
                Talleres de {meses[selectedMes - 1]}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-b border-gold/10 bg-surface-container-low">
                    <th className="px-6 py-4">Taller / Facilitador</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Ingreso</th>
                    <th className="px-6 py-4 text-right">Pago Facil.</th>
                    <th className="px-6 py-4 text-right">Ganancia</th>
                    <th className="px-6 py-4 text-center">Estado Pago</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center italic opacity-50">Cargando...</td></tr>
                  ) : talleres.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center italic opacity-50">No hay talleres este mes.</td></tr>
                  ) : (
                    talleres.map((t) => (
                      <tr key={t.id} className="hover:bg-cream/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-primary">{t.nombre}</p>
                          <p className="text-xs opacity-60">{t.facilitador}</p>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(t.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          $ {t.total_ingreso.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-secondary">
                          $ {t.pago_facilitador.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-burgundy">
                          $ {(t.total_ingreso - t.pago_facilitador).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleTogglePago(t.id)}
                            className={`flex items-center gap-1 mx-auto px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.pago_facilitador_realizado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {t.pago_facilitador_realizado ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {t.pago_facilitador_realizado ? 'Pagado' : 'Pendiente'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg">
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

export default Talleres;
