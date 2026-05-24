import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, CreditCard, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '../services/auth';
import pagosService from '../services/pagos';

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    fetchPagos();
  }, [selectedMes, selectedAnio]);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const data = await pagosService.getPagosMensuales(selectedMes, selectedAnio);
      setPagos(data);
    } catch (error) {
      console.error('Error fetching pagos:', error);
      if (error.response?.status === 401) {
        authService.logout();
        window.location.href = '/login';
      } else {
        alert('Error al cargar la planilla de pagos: ' + (error.response?.data?.detail || error.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePago = async (alumna) => {
    setSyncingId(alumna.alumna_id);
    const newStatus = !alumna.pagado;
    try {
      const standardMonto = newStatus ? alumna.monto_esperado : 0.0;
      await pagosService.registrarPago({
        alumna_id: alumna.alumna_id,
        mes: selectedMes,
        anio: selectedAnio,
        pagado: newStatus,
        monto: standardMonto
      });
      
      // Actualizar estado local reactivamente
      setPagos(prevPagos => 
        prevPagos.map(p => 
          p.alumna_id === alumna.alumna_id 
            ? { ...p, pagado: newStatus, monto_pagado: standardMonto, fecha_pago: newStatus ? new Date() : null } 
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling pago:', error);
      alert('Error al registrar pago: ' + (error.response?.data?.detail || error.message || 'Error desconocido'));
    } finally {
      setSyncingId(null);
    }
  };

  const handleUpdateClases = async (alumna, newCount) => {
    setSyncingId(alumna.alumna_id);
    const isNowPaid = newCount > 0;
    const nuevoMonto = newCount * alumna.monto_esperado;
    try {
      await pagosService.registrarPago({
        alumna_id: alumna.alumna_id,
        mes: selectedMes,
        anio: selectedAnio,
        pagado: isNowPaid,
        monto: nuevoMonto
      });
      
      // Actualizar estado local reactivamente
      setPagos(prevPagos => 
        prevPagos.map(p => 
          p.alumna_id === alumna.alumna_id 
            ? { 
                ...p, 
                pagado: isNowPaid, 
                monto_pagado: nuevoMonto, 
                fecha_pago: isNowPaid ? new Date() : null 
              } 
            : p
        )
      );
    } catch (error) {
      console.error('Error updating clases:', error);
      alert('Error al registrar clases: ' + (error.response?.data?.detail || error.message || 'Error desconocido'));
    } finally {
      setSyncingId(null);
    }
  };

  // Cálculos de Resumen Financiero
  const totalRecaudado = pagos
    .filter(p => p.pagado)
    .reduce((sum, p) => sum + p.monto_pagado, 0);

  const totalPendiente = pagos
    .filter(p => !p.pagado)
    .reduce((sum, p) => sum + p.monto_esperado, 0);

  const totalAlumnas = pagos.length;
  const pagadasAlumnas = pagos.filter(p => p.pagado).length;
  const porcentajeCobro = totalAlumnas > 0 ? Math.round((pagadasAlumnas / totalAlumnas) * 100) : 0;

  // Filtrado por buscador
  const filteredPagos = pagos.filter(p => 
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-gold" />
            Pago de Alumnas
          </h1>
          <p className="text-on-surface-variant mt-1">Control de cuotas mensuales y estado de cobros generales.</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 w-fit mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Total Recaudado</p>
          <h3 className="text-3xl font-serif text-emerald-600 mt-1">$ {totalRecaudado.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
        >
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 w-fit mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Monto Pendiente</p>
          <h3 className="text-3xl font-serif text-rose-500 mt-1">$ {totalPendiente.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl golden-border-detail silk-shadow relative overflow-hidden"
        >
          <div className="p-3 rounded-2xl bg-cream text-gold w-fit mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Alumnas Cobradas</p>
          <h3 className="text-3xl font-serif text-burgundy mt-1">{pagadasAlumnas} / {totalAlumnas}</h3>
          
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-secondary">
              <span>Porcentaje de cobro</span>
              <span>{porcentajeCobro}%</span>
            </div>
            <div className="h-2 bg-cream rounded-full overflow-hidden">
              <div className="h-full bg-burgundy rounded-full transition-all duration-500" style={{ width: `${porcentajeCobro}%` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50" />
          <input 
            type="text"
            placeholder="Buscar alumna por nombre o apellido..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gold/10 rounded-2xl silk-shadow focus:ring-2 focus:ring-burgundy outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl overflow-hidden golden-border-detail silk-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-secondary font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-burgundy" /> Cargando planilla de pagos...
            </div>
          ) : filteredPagos.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant/40 italic">
              No se encontraron alumnas activas o no coinciden con la búsqueda.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-burgundy text-gold">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Alumna</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Combo / Plan</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Monto Cuota</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Estado de Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filteredPagos.map((alumna) => (
                  <tr key={alumna.alumna_id} className="hover:bg-cream/15 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-primary">{alumna.nombre} {alumna.apellido}</div>
                      {alumna.fecha_pago && alumna.pagado && (
                        <div className="text-[9px] text-emerald-600 font-bold uppercase mt-1 tracking-wider flex items-center gap-0.5">
                          ✓ Pagado el {new Date(alumna.fecha_pago).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-secondary uppercase bg-cream px-2.5 py-1 rounded-xl border border-gold/15">
                        {alumna.combo_nombre}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-sm font-serif font-bold text-primary block">
                         $ {alumna.monto_esperado.toLocaleString()}
                         {alumna.combo_nombre && alumna.combo_nombre.toLowerCase() === 'clase' && (
                           <span className="text-[10px] font-sans font-normal text-secondary ml-1">/ clase</span>
                         )}
                       </span>
                       {alumna.combo_nombre && alumna.combo_nombre.toLowerCase() === 'clase' && alumna.pagado && alumna.monto_pagado > 0 && (
                         <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                           Total: $ {alumna.monto_pagado.toLocaleString()}
                         </span>
                       )}
                     </td>
                     <td className="px-6 py-5 text-center">
                       <div className="flex justify-center">
                         {(() => {
                           const isClaseStrict = alumna.combo_nombre && alumna.combo_nombre.toLowerCase() === 'clase';
                           const cantidad = isClaseStrict && alumna.monto_esperado > 0 ? Math.round(alumna.monto_pagado / alumna.monto_esperado) : 0;
                           
                           if (isClaseStrict) {
                             return (
                               <div className="flex flex-col items-center gap-1.5">
                                 <div className="flex items-center gap-2 bg-cream/30 p-1 rounded-2xl border border-gold/15 silk-shadow">
                                   <button
                                     type="button"
                                     disabled={syncingId === alumna.alumna_id || cantidad === 0}
                                     className="w-7 h-7 rounded-lg bg-white border border-gold/20 flex items-center justify-center font-bold text-burgundy hover:bg-rose-50 disabled:opacity-30 active:scale-95 transition-all text-xs"
                                     onClick={() => handleUpdateClases(alumna, cantidad - 1)}
                                   >
                                     -
                                   </button>
                                   <span className="text-xs font-bold text-primary min-w-[65px] text-center">
                                     {cantidad} {cantidad === 1 ? 'clase' : 'clases'}
                                   </span>
                                   <button
                                     type="button"
                                     disabled={syncingId === alumna.alumna_id}
                                     className="w-7 h-7 rounded-lg bg-white border border-gold/20 flex items-center justify-center font-bold text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all text-xs"
                                     onClick={() => handleUpdateClases(alumna, cantidad + 1)}
                                   >
                                     +
                                   </button>
                                 </div>
                                 {cantidad > 0 ? (
                                   <span className="text-[8px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 tracking-wider">
                                     ✓ PAGADO
                                   </span>
                                 ) : (
                                   <span className="text-[8px] font-bold text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 tracking-wider">
                                     ⚠ IMPAGO
                                   </span>
                                 )}
                               </div>
                             );
                           } else {
                             return (
                               <button
                                 type="button"
                                 disabled={syncingId === alumna.alumna_id}
                                 className={`
                                   px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest silk-shadow
                                   flex items-center gap-1.5 transition-all duration-300 transform active:scale-95
                                   disabled:opacity-50 min-w-[130px] justify-center
                                   ${alumna.pagado 
                                     ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' 
                                     : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300'}
                                 `}
                                 onClick={() => handleTogglePago(alumna)}
                               >
                                 {syncingId === alumna.alumna_id ? (
                                   <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                 ) : alumna.pagado ? (
                                   <>
                                     <Check className="w-3.5 h-3.5" />
                                     PAGADO
                                   </>
                                 ) : (
                                   <>
                                     <AlertCircle className="w-3.5 h-3.5" />
                                     IMPAGO
                                   </>
                                 )}
                               </button>
                             );
                           }
                         })()}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagos;
