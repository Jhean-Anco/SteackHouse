import React, { useState } from 'react';
import { 
  BarChart3, Package, CreditCard, Menu, Users, FileText, 
  TrendingUp, AlertTriangle, Clock, DollarSign, LogOut 
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import VentasChart from './VentasChart';
import InventarioResumen from './InventarioResumen';
import CajaModule from './CajaModule';
import MenuManagement from './MenuManagement';
import PersonalModule from './PersonalModule';
import ReportesModule from './ReportesModule';

const menuItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'jungle' },
  { id: 'inventario', icon: Package, label: 'Inventario', color: 'earth' },
  { id: 'caja', icon: CreditCard, label: 'Caja', color: 'gold' },
  { id: 'menu', icon: Menu, label: 'Menú & Recetas', color: 'jungle' },
  { id: 'personal', icon: Users, label: 'Personal', color: 'earth' },
  { id: 'reportes', icon: FileText, label: 'Reportes', color: 'gold' }
];

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { pedidos, ventas, platos, currentUser, setCurrentUser } = useApp();

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      setCurrentUser(null);
    }
  };

  // Estadísticas del día
  const ventasHoy = ventas.filter(v => 
    v.fecha.toDateString() === new Date().toDateString()
  );
  const ingresosDia = ventasHoy.reduce((sum, v) => sum + v.total, 0);
  const pedidosActivos = pedidos.filter(p => 
    ['nuevo', 'confirmado', 'preparando'].includes(p.estado)
  ).length;
  const platosAgotados = platos.filter(p => !p.disponible).length;

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardContent />;
      case 'inventario':
        return <InventarioResumen />;
      case 'caja':
        return <CajaModule />;
      case 'menu':
        return <MenuManagement />;
      case 'personal':
        return <PersonalModule />;
      case 'reportes':
        return <ReportesModule />;
      default:
        return <DashboardContent />;
    }
  };

  const DashboardContent = () => (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-jungle-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jungle-100">Ingresos Hoy</p>
              <p className="text-3xl font-bold">S/ {ingresosDia.toFixed(2)}</p>
            </div>
            <DollarSign size={40} className="text-jungle-200" />
          </div>
        </div>

        <div className="card bg-earth-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-earth-100">Pedidos Activos</p>
              <p className="text-3xl font-bold">{pedidosActivos}</p>
            </div>
            <Clock size={40} className="text-earth-200" />
          </div>
        </div>

        <div className="card bg-gold-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100">Ventas Día</p>
              <p className="text-3xl font-bold">{ventasHoy.length}</p>
            </div>
            <TrendingUp size={40} className="text-gold-200" />
          </div>
        </div>

        <div className="card bg-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Alertas</p>
              <p className="text-3xl font-bold">{platosAgotados}</p>
            </div>
            <AlertTriangle size={40} className="text-red-200" />
          </div>
        </div>
      </div>

      {/* Gráficos y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ventas de la Semana</h3>
          <VentasChart />
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Alertas del Sistema</h3>
          <div className="space-y-3">
            {platosAgotados > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="text-red-500" size={20} />
                <span className="text-red-700">{platosAgotados} platos sin stock</span>
              </div>
            )}
            {pedidosActivos > 5 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="text-orange-500" size={20} />
                <span className="text-orange-700">Muchos pedidos pendientes</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-jungle-50 border border-jungle-200 rounded-lg">
              <TrendingUp className="text-jungle-500" size={20} />
              <span className="text-jungle-700">Día con buen rendimiento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-jungle-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-jungle-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                🥩 SteackHouse Admin
              </h1>
              <span className="text-sm text-gray-500">
                Panel de Administración
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {currentUser?.name}
              </span>
              <div className="w-10 h-10 bg-jungle-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {currentUser?.name.charAt(0)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <div className="p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                );
              })}
            </nav>

            {/* Botón de logout en sidebar también */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}