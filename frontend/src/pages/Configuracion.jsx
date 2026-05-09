import React, { useState, useEffect } from 'react';
import { Settings, UserPlus, Users, Shield, Trash2, Key, Mail, CheckCircle, AlertTriangle, UserCheck, X } from 'lucide-react';
import axios from 'axios';
import authService from '../services/auth';
import API_URL from '../config';

const Configuracion = () => {
  const [users, setUsers] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'docente'
  });

  const [linkData, setLinkData] = useState({ docenteId: '', userId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = authService.getToken();
    try {
      const [usersRes, docentesRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/docentes/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setDocentes(docentesRes.data);
    } catch (error) {
      console.error('Error fetching config data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = authService.getToken();
    try {
      await axios.post(`${API_URL}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddUser(false);
      setNewUser({ username: '', email: '', password: '', role: 'docente' });
      fetchData();
    } catch (error) {
      alert('Error al crear usuario: ' + (error.response?.data?.detail || 'Error desconocido'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Eliminar esta cuenta de acceso?')) return;
    const token = authService.getToken();
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  const handleLinkDocente = async (e) => {
    e.preventDefault();
    if (!linkData.docenteId || !linkData.userId) return;
    
    const token = authService.getToken();
    try {
      const docente = docentes.find(d => d.id === parseInt(linkData.docenteId));
      await axios.put(`${API_URL}/docentes/${linkData.docenteId}`, {
        ...docente,
        user_id: parseInt(linkData.userId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Docente vinculado con éxito');
      setLinkData({ docenteId: '', userId: '' });
      fetchData();
    } catch (error) {
      alert('Error al vincular docente');
    }
  };

  if (loading) return <div className="p-8 italic opacity-50 italic">Cargando configuración de seguridad...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-serif text-primary">Configuración</h1>
        <p className="text-on-surface-variant mt-1">Gestión de usuarios, roles y accesos al sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gestión de Usuarios */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl golden-border-detail silk-shadow overflow-hidden">
            <div className="p-6 border-b border-gold/10 bg-cream/30 flex justify-between items-center">
              <h2 className="text-xl font-serif text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                Cuentas de Acceso
              </h2>
              <button 
                onClick={() => setShowAddUser(true)}
                className="bg-burgundy text-gold px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all"
              >
                Crear Usuario
              </button>
            </div>

            <div className="divide-y divide-gold/5">
              {users.map(u => (
                <div key={u.id} className="p-4 flex justify-between items-center hover:bg-cream/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${u.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-secondary/10 text-secondary'}`}>
                      {u.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{u.username}</p>
                      <p className="text-[10px] opacity-60 flex items-center gap-1 uppercase">
                        <Shield className="w-3 h-3" /> {u.role}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vínculo con Docentes */}
        <div className="space-y-6">
          <div className="bg-primary text-gold p-8 rounded-2xl silk-shadow relative overflow-hidden">
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
              <Key className="w-6 h-6" />
              Vincular Docente
            </h2>
            <p className="text-xs opacity-70 mb-8 leading-relaxed">
              Para que una docente vea solo sus clases, debés crearle un usuario arriba y luego elegirla aquí para vincular ambas cuentas.
            </p>

            <form onSubmit={handleLinkDocente} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Seleccionar Docente</label>
                <select 
                  className="w-full bg-white/10 border-b border-gold py-2 text-sm focus:outline-none"
                  value={linkData.docenteId}
                  onChange={e => setLinkData({...linkData, docenteId: e.target.value})}
                >
                  <option value="" className="text-burgundy">Elegir Profesional...</option>
                  {docentes.map(d => (
                    <option key={d.id} value={d.id} className="text-burgundy">
                      {d.nombre} {d.user_id ? '(Ya vinculada)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Asignar a Usuario</label>
                <select 
                  className="w-full bg-white/10 border-b border-gold py-2 text-sm focus:outline-none"
                  value={linkData.userId}
                  onChange={e => setLinkData({...linkData, userId: e.target.value})}
                >
                  <option value="" className="text-burgundy">Elegir Cuenta de Acceso...</option>
                  {users.filter(u => u.role === 'docente').map(u => (
                    <option key={u.id} value={u.id} className="text-burgundy">{u.username}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-gold text-burgundy py-3 rounded-xl font-bold text-xs uppercase tracking-widest mt-4 hover:brightness-110 transition-all"
              >
                Vincular Ahora
              </button>
            </form>
          </div>

          <div className="bg-cream/50 p-6 rounded-2xl border border-gold/20">
            <h4 className="font-bold text-primary text-xs flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Estado de Seguridad
            </h4>
            <p className="text-[11px] text-on-surface-variant italic">
              El sistema está cifrando todas las comunicaciones. Los roles restringidos no pueden acceder a las APIs de finanzas ni alquileres.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden silk-shadow border border-gold/20 animate-in zoom-in duration-300">
            <div className="bg-burgundy p-6 text-gold flex justify-between items-center">
              <h3 className="text-xl font-serif">Crear Nuevo Acceso</h3>
              <button onClick={() => setShowAddUser(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Username</label>
                <input required className="input-elegant w-full" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Email</label>
                <input required type="email" className="input-elegant w-full" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Contraseña Inicial</label>
                <input required type="password" placeholder="Mínimo 6 caracteres" className="input-elegant w-full" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Rol de Usuario</label>
                <select className="input-elegant w-full" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="admin">Administrador (Control Total)</option>
                  <option value="docente">Docente (Solo sus clases)</option>
                  <option value="alumna">Alumna (Acceso limitado)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-burgundy text-gold py-4 rounded-xl font-bold text-xs uppercase tracking-widest mt-4">
                Generar Cuenta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
