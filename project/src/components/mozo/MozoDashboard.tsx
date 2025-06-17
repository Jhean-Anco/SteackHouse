import React, { useState } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, Bell, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import MapaMesas from './MapaMesas';
import PedidosActivos from './PedidosActivos';
import HistorialMesas from './HistorialMesas';

export default function MozoDashboard() {
  const [vistaActual, setVistaActual] = useState('mesas');
  const { currentUser, pedidos, notificaciones, mesas, setCurrentUser } = useApp();

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      setCurrentUser(null);
    }
  };

  // Estadísticas del mozo
  const pedidosHoy = pedidos.filter(p => 
    p.mozoId === currentUser?.id && 
    p.fechaCreacion.toDateString() === new Date().toDateString()
  );
  
  const mesasAtendidas = mesas.filter(m => m.mozoId === currentUser?.id);
  const pedidosActivos = pedidos.filter(p => 
    p.mozoId === currentUser?.id && 
    ['nuevo', 'confirmado', 'preparando', 'listo'].includes(p.estado)
  );

  const notificacionesMozo = notificaciones.filter(n => 
    n.tipo === 'nuevo_pedido' || n.tipo === 'pedido_listo'
  ).slice(0, 5);

  const menuItems = [
    { id: 'mesas', label: 'Mapa de Mesas', icon: Users },
    { id: 'pedidos', label: 'Pedidos Activos', icon: Clock },
    { id: 'historial', label: 'Historial', icon: CheckCircle }
  ];

  const renderContent = () => {
    switch (vistaActual) {
      case 'mesas':
        return <MapaMesas />;
      case 'pedidos':
        return <PedidosActivos />;
      case 'historial':
        return <HistorialMesas />;
      default:
        return <MapaMesas />;
    }
  };

  return (
    <div className="min-h-screen bg-jungle-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-jungle-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                🥩 SteackHouse Mozo
              </h1>
              <span className="text-sm text-gray-500">
                Panel de Atención
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Notificaciones */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-jungle-600 relative">
                  <Bell size={20} />
                  {notificacionesMozo.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificacionesMozo.length}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentUser?.name}
                </span>
                <div className="w-10 h-10 bg-earth-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {currentUser?.name.charAt(0)}
                  </span>
                </div>
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

      {/* Stats rápidos */}
      <div className="px-6 py-4 bg-white border-b border-jungle-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-jungle-100 rounded-lg flex items-center justify-center">
              <Users className="text-jungle-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mesas Asignadas</p>
              <p className="text-xl font-bold text-gray-800">{mesasAtendidas.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Activos</p>
              <p className="text-xl font-bold text-gray-800">{pedidosActivos.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-gold-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Atendidos Hoy</p>
              <p className="text-xl font-bold text-gray-800">{pedidosHoy.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alertas</p>
              <p className="text-xl font-bold text-gray-800">{notificacionesMozo.length}</p>
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
                    onClick={() => setVistaActual(item.id)}
                    className={`nav-item ${vistaActual === item.id ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                );
              })}
            </nav>

            {/* Notificaciones recientes */}
            {notificacionesMozo.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Notificaciones</h4>
                <div className="space-y-2">
                  {notificacionesMozo.map((notif, index) => (
                    <div key={index} className="p-3 bg-jungle-50 rounded-lg border border-jungle-100">
                      <p className="text-xs text-jungle-700 font-medium">{notif.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de logout en sidebar */}
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