import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Calendar, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import authService from '../services/auth';
import API_URL from '../config';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    fetchResumen();
  }, [selectedMes, selectedAnio]);

  const fetchResumen = async () => {
    setLoading(true);
    const token = authService.getToken();
    try {
      const response = await axios.get(`${API_URL}/dashboard/resumen-mensual?mes=${selectedMes}&anio=${selectedAnio}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div className="p-12 text-center italic opacity-50">Calculando balance mensual...</div>;

  const StatCard = ({ title, amount, icon: Icon, trend, color }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
    >
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 w-fit mb-4`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">{title}</p>
      <h3 className="text-3xl font-serif text-primary mt-1">$ {amount.toLocaleString()}</h3>
      
      {trend !== undefined && (
        <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{trend > 0 ? 'Superávit Mensual' : 'Déficit en el Periodo'}</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-gold" />
            Resumen General
          </h1>
          <p className="text-on-surface-variant mt-1">Balance consolidado de {meses[selectedMes-1]} {selectedAnio}.</p>
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

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Ingresos Totales" 
          amount={data?.ingresos.total || 0} 
          icon={TrendingUp} 
          color="bg-green-600" 
        />
        <StatCard 
          title="Egresos Totales" 
          amount={data?.egresos.total || 0} 
          icon={TrendingDown} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Ganancia Neta" 
          amount={data?.balance_neto || 0} 
          icon={DollarSign} 
          trend={data?.balance_neto}
          color="bg-burgundy" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución de Ingresos */}
        <div className="bg-white p-8 rounded-3xl golden-border-detail silk-shadow space-y-6">
          <h3 className="text-xl font-serif text-primary flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gold" />
            Origen de Ingresos
          </h3>
          
          <div className="space-y-4 pt-4">
            {[
              { label: 'Cuotas Alumnas', val: data?.ingresos.cuotas, color: 'bg-burgundy' },
              { label: 'Alquiler de Sala', val: data?.ingresos.alquileres, color: 'bg-gold' },
              { label: 'Talleres / Eventos', val: data?.ingresos.talleres, color: 'bg-secondary' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-70">
                  <span>{item.label}</span>
                  <span>$ {item.val?.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-cream rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.val / (data?.ingresos.total || 1)) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desglose de Gastos */}
        <div className="bg-primary text-gold p-8 rounded-3xl silk-shadow space-y-6 relative overflow-hidden">
          <Activity className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5" />
          <h3 className="text-xl font-serif flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold" />
            Estructura de Egresos
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold uppercase opacity-60">Pago Docentes</p>
              <p className="text-2xl font-serif mt-1">$ {data?.egresos.docentes.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold uppercase opacity-60">Gastos Varios</p>
              <p className="text-2xl font-serif mt-1">$ {data?.egresos.gastos_varios.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 col-span-2">
              <p className="text-[10px] font-bold uppercase opacity-60">Pagos Facilitadores</p>
              <p className="text-2xl font-serif mt-1">$ {data?.egresos.facilitadores.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20 mt-4 italic text-[11px] opacity-80">
            "Este resumen incluye todos los egresos liquidados y gastos operativos registrados en el periodo."
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
