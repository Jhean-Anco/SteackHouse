import React, { useState } from 'react';
import { ChefHat, Clock, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import PedidosCocina from './PedidosCocina';
import EstadisticasCocina from './EstadisticasCocina';

export default function CocinaDashboard() {
  const [vistaActual, setVistaActual] = useState('pedidos');
  const { currentUser, pedidos, setCurrentUser } = useApp();

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      setCurrentUser(null);
    }
  };

  const pedidosCocina = pedidos.filter(p => 
    ['confirmado', 'preparando'].includes(p.estado)
  );

  const pedidosListos = pedidos.filter(p => p.estado === 'listo');
  const pedidosPreparando = pedidos.filter(p => p.estado === 'preparando');

  const menuItems = [
    { id: 'pedidos', label: 'Pedidos Activos', icon: ChefHat },
    { id: 'estadisticas', label: 'Estadísticas', icon: CheckCircle }
  ];

  const renderContent = () => {
    switch (vistaActual) {
      case 'pedidos':
        return <PedidosCocina />;
      case 'estadisticas':
        return <EstadisticasCocina />;
      default:
        return <PedidosCocina />;
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
                🥩 SteackHouse Cocina
              </h1>
              <span className="text-sm text-gray-500">
                Panel de Preparación
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentUser?.name}
                </span>
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
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
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Cola</p>
              <p className="text-xl font-bold text-gray-800">
                {pedidos.filter(p => p.estado === 'confirmado').length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ChefHat className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Preparando</p>
              <p className="text-xl font-bold text-gray-800">{pedidosPreparando.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-jungle-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-jungle-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Listos</p>
              <p className="text-xl font-bold text-gray-800">{pedidosListos.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgentes</p>
              <p className="text-xl font-bold text-gray-800">
                {pedidosCocina.filter(p => {
                  const tiempoTranscurrido = (new Date().getTime() - p.fechaCreacion.getTime()) / 1000 / 60;
                  return tiempoTranscurrido > 20;
                }).length}
              </p>
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

            {/* Tiempo promedio */}
            <div className="mt-8 p-4 bg-gold-50 rounded-lg">
              <h4 className="text-sm font-bold text-gold-800 mb-2">Tiempo Promedio</h4>
              <p className="text-2xl font-bold text-gold-600">18 min</p>
              <p className="text-xs text-gold-600">Por pedido hoy</p>
            </div>

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