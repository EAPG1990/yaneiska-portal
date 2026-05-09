import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Tag, FileText, DollarSign, Plus, Trash2, Save, TrendingDown, Receipt } from 'lucide-react';
import gastosService from '../services/gastos';
import authService from '../services/auth';

const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    categoria: 'Luz / Servicios',
    descripcion: '',
    monto: '',
    ticket: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const categorias = [
    "Alquiler Local",
    "Luz / Servicios",
    "Internet / Teléfono",
    "Limpieza / Insumos",
    "Fotocopias / Papelería",
    "Mantenimiento",
    "Publicidad",
    "Impuestos",
    "Otros"
  ];

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
    fetchGastos();
  }, [selectedMes, selectedAnio]);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      const data = await gastosService.getMensuales(selectedMes, selectedAnio);
      setGastos(data);
    } catch (error) {
      console.error('Error fetching gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanNum = (val) => parseFloat(val.toString().replace(/\./g, '').replace(',', '.')) || 0;
    
    try {
      await gastosService.create({
        ...form,
        mes: selectedMes,
        anio: selectedAnio,
        monto: cleanNum(form.monto)
      });
      setForm({ ...form, descripcion: '', monto: '', ticket: '' });
      fetchGastos();
    } catch (error) {
      alert('Error al registrar gasto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este gasto?')) {
      await gastosService.delete(id);
      fetchGastos();
    }
  };

  const totalGastos = gastos.reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary">Gastos Varios</h1>
          <p className="text-on-surface-variant mt-1">Control de egresos y facturas del estudio.</p>
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
        {/* Formulario Lateral */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl golden-border-detail silk-shadow">
            <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" />
              Nuevo Gasto
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Categoría</label>
                <select 
                  className="input-elegant w-full"
                  value={form.categoria}
                  onChange={(e) => setForm({...form, categoria: e.target.value})}
                >
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Descripción</label>
                <input 
                  required
                  type="text"
                  className="input-elegant w-full"
                  placeholder="Ej: Factura Edesur Mayo"
                  value={form.descripcion}
                  onChange={(e) => setForm({...form, descripcion: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Monto (ARS)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                  <input 
                    required
                    type="text"
                    className="input-elegant w-full pl-10"
                    placeholder="Ej: 15.000"
                    value={form.monto}
                    onChange={(e) => setForm({...form, monto: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Nro Comprobante / Ticket</label>
                <input 
                  type="text"
                  className="input-elegant w-full"
                  placeholder="Opcional"
                  value={form.ticket}
                  onChange={(e) => setForm({...form, ticket: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Fecha de Pago</label>
                <input 
                  required
                  type="date"
                  className="input-elegant w-full"
                  value={form.fecha}
                  onChange={(e) => setForm({...form, fecha: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-burgundy text-gold py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Gasto
              </button>
            </form>
          </div>
        </div>

        {/* Listado Principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* KPI Card */}
          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 silk-shadow flex justify-between items-center overflow-hidden relative">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Total Egresos {meses[selectedMes - 1]}</p>
              <h3 className="text-4xl font-serif text-burgundy mt-1">$ {totalGastos.toLocaleString()}</h3>
            </div>
            <TrendingDown className="w-16 h-16 text-red-500/10 absolute -right-2 -bottom-2" />
          </div>

          <div className="bg-white rounded-2xl golden-border-detail silk-shadow overflow-hidden">
            <div className="p-4 border-b border-gold/10 bg-cream/30">
              <h3 className="font-serif text-primary text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                Detalle de Gastos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-b border-gold/10 bg-surface-container-low">
                    <th className="px-6 py-4">Categoría / Fecha</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Ticket</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center italic opacity-50">Cargando...</td></tr>
                  ) : gastos.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center italic opacity-50">No hay gastos registrados este mes.</td></tr>
                  ) : (
                    gastos.map((g) => (
                      <tr key={g.id} className="hover:bg-cream/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-gold" />
                            <span className="font-bold text-primary">{g.categoria}</span>
                          </div>
                          <p className="text-[10px] opacity-60 mt-1">{new Date(g.fecha).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-xs italic">
                          {g.descripcion}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono opacity-60">
                          {g.ticket || '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-burgundy">
                          $ {g.monto.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(g.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors">
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

export default Gastos;
