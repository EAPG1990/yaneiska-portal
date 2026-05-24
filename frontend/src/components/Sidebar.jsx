import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Calendar, 
  Wallet, 
  Settings, 
  CreditCard,
  History,
  LogOut,
  Menu,
  Coins
} from 'lucide-react';
import authService from '../services/auth';

const menuItems = [
  { name: 'RESUMEN', path: '/dashboard', icon: LayoutDashboard },
  { name: 'ALUMNAS', path: '/alumnas', icon: Users },
  { name: 'PAGO DE ALUMNAS', path: '/pagos', icon: Coins },
  { name: 'DOCENTES Y CLASES', path: '/docentes', icon: GraduationCap },
  { name: 'ALQUILER DE SALA', path: '/alquileres', icon: Calendar },
  { name: 'GASTOS VARIOS', path: '/gastos', icon: Wallet },
  { name: 'TALLERES', path: '/talleres', icon: History },
  { name: 'ARANCELES', path: '/aranceles', icon: CreditCard },
  { name: 'CONFIGURACIÓN', path: '/configuracion', icon: Settings },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const u = await authService.getCurrentUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'docente') {
      return item.path === '/docentes';
    }
    return false;
  });

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-burgundy min-h-screen flex flex-col shadow-2xl fixed left-0 top-0 z-20 transition-all duration-300`}>
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="p-4 border-b border-white/10 flex flex-col items-center gap-4 relative">
          <button 
            onClick={onToggle}
            className="text-white/70 hover:text-gold transition-colors p-1 rounded hover:bg-white/5"
            title="Expandir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-gold/30 p-1">
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-125" />
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-white/10 flex flex-col items-center relative text-center">
          <button 
            onClick={onToggle}
            className="absolute right-4 top-4 text-white/70 hover:text-gold transition-colors p-1 rounded hover:bg-white/5"
            title="Contraer menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 mb-4 mt-6 rounded-full border-2 border-gold/30 p-1">
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-125" />
          </div>
          <h2 className="text-white font-serif text-[13px] leading-tight px-2">Estudio de Danza del Vientre y Artes Corporales Jimena González</h2>
          <p className="text-gold/60 text-[10px] tracking-[0.2em] font-bold mt-2 uppercase">Portal Administrativo</p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) => `
              flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-300 group
              ${isActive 
                ? 'bg-gold text-burgundy font-bold shadow-lg' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
            {!isCollapsed && <span className="text-xs font-bold tracking-wider">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} w-full py-3 text-white/50 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5`}
          title={isCollapsed ? "CERRAR SESIÓN" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-xs font-bold tracking-wider">CERRAR SESIÓN</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
