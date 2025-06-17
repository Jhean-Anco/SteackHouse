import React, { useState, useEffect } from 'react';
import { QrCode, ShoppingCart, Clock, CheckCircle, Star, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import CartaDigital from './CartaDigital';
import CarritoCliente from './CarritoCliente';
import EstadoPedido from './EstadoPedido';
import HistorialCliente from './HistorialCliente';

export default function ClienteDashboard() {
  const [vistaActual, setVistaActual] = useState('carta');
  const [carrito, setCarrito] = useState<any[]>([]);
  const { mesaActual, setMesaActual, currentUser, pedidos, setCurrentUser } = useApp();

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas salir?')) {
      setCurrentUser(null);
      setMesaActual(null);
    }
  };

  // Simular asignación de mesa por QR
  useEffect(() => {
    if (!mesaActual) {
      // Simular escaneo de QR - asignar mesa aleatoria
      const mesaAsignada = Math.floor(Math.random() * 6) + 1;
      setMesaActual(mesaAsignada);
    }
  }, [mesaActual, setMesaActual]);

  const pedidoActivo = pedidos.find(p => 
    p.clienteId === currentUser?.id && 
    ['nuevo', 'confirmado', 'preparando', 'listo'].includes(p.estado)
  );

  const menuItems = [
    { id: 'carta', label: 'Carta Digital', icon: QrCode },
    { id: 'carrito', label: `Carrito (${carrito.length})`, icon: ShoppingCart },
    { id: 'estado', label: 'Mi Pedido', icon: Clock },
    { id: 'historial', label: 'Historial', icon: CheckCircle }
  ];

  const agregarAlCarrito = (plato: any, cantidad: number, observaciones?: string) => {
    const itemExistente = carrito.find(item => item.platoId === plato.id);
    
    if (itemExistente) {
      setCarrito(prev => prev.map(item => 
        item.platoId === plato.id 
          ? { ...item, cantidad: item.cantidad + cantidad, observaciones }
          : item
      ));
    } else {
      setCarrito(prev => [...prev, {
        platoId: plato.id,
        nombre: plato.nombre,
        precio: plato.precio,
        cantidad,
        observaciones,
        imagen: plato.imagen
      }]);
    }
  };

  const actualizarCarrito = (platoId: string, cantidad: number) => {
    if (cantidad === 0) {
      setCarrito(prev => prev.filter(item => item.platoId !== platoId));
    } else {
      setCarrito(prev => prev.map(item => 
        item.platoId === platoId ? { ...item, cantidad } : item
      ));
    }
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const renderContent = () => {
    switch (vistaActual) {
      case 'carta':
        return <CartaDigital onAgregarAlCarrito={agregarAlCarrito} />;
      case 'carrito':
        return (
          <CarritoCliente 
            carrito={carrito}
            onActualizarCarrito={actualizarCarrito}
            onLimpiarCarrito={limpiarCarrito}
            mesaId={mesaActual!}
          />
        );
      case 'estado':
        return <EstadoPedido pedido={pedidoActivo} />;
      case 'historial':
        return <HistorialCliente />;
      default:
        return <CartaDigital onAgregarAlCarrito={agregarAlCarrito} />;
    }
  };

  return (
    <div className="min-h-screen bg-jungle-50">
      {/* Header */}
      <div className="bg-jungle-gradient text-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🥩 SteackHouse</h1>
              <p className="text-jungle-100">Bienvenido a tu experiencia selvática</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <QrCode size={20} />
                  <span className="font-bold">Mesa {mesaActual}</span>
                </div>
                <p className="text-sm text-jungle-200">Tu mesa asignada</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Salir"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-jungle-100">
        <div className="px-6 py-4">
          <div className="flex gap-1 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setVistaActual(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    vistaActual === item.id
                      ? 'bg-jungle-600 text-white'
                      : 'text-gray-600 hover:bg-jungle-50 hover:text-jungle-600'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status bar */}
      {pedidoActivo && (
        <div className="bg-gold-100 border-b border-gold-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gold-500 rounded-full animate-pulse"></div>
              <span className="text-gold-800 font-medium">
                Tu pedido está {pedidoActivo.estado === 'preparando' ? 'en preparación' : pedidoActivo.estado}
              </span>
            </div>
            <button
              onClick={() => setVistaActual('estado')}
              className="text-gold-700 hover:text-gold-800 font-medium text-sm"
            >
              Ver detalles →
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Floating cart button */}
      {carrito.length > 0 && vistaActual !== 'carrito' && (
        <button
          onClick={() => setVistaActual('carrito')}
          className="fixed bottom-6 right-6 bg-jungle-600 text-white p-4 rounded-full shadow-lg hover:bg-jungle-700 transition-all z-50"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}