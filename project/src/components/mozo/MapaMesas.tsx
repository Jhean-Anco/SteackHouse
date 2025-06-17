import React from 'react';
import { Users, Clock, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function MapaMesas() {
  const { mesas, actualizarMesa, currentUser, pedidos } = useApp();

  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'libre':
        return { color: 'jungle', icon: CheckCircle, label: 'Libre', bgClass: 'bg-jungle-100 border-jungle-300' };
      case 'ocupada':
        return { color: 'red', icon: Users, label: 'Ocupada', bgClass: 'bg-red-100 border-red-300' };
      case 'reservada':
        return { color: 'gold', icon: Clock, label: 'Reservada', bgClass: 'bg-gold-100 border-gold-300' };
      case 'limpieza':
        return { color: 'orange', icon: AlertCircle, label: 'Limpieza', bgClass: 'bg-orange-100 border-orange-300' };
      default:
        return { color: 'gray', icon: Users, label: 'Desconocido', bgClass: 'bg-gray-100 border-gray-300' };
    }
  };

  const asignarMesa = (mesaId: number) => {
    actualizarMesa(mesaId, { 
      mozoId: currentUser?.id,
      estado: 'ocupada'
    });
  };

  const liberarMesa = (mesaId: number) => {
    // Confirmar antes de liberar
    if (confirm('¿Estás seguro de liberar esta mesa? Se perderán los datos del cliente.')) {
      actualizarMesa(mesaId, { 
        mozoId: undefined,
        estado: 'libre',
        clienteId: undefined,
        pedidoActivo: undefined
      });
    }
  };

  const marcarParaLimpieza = (mesaId: number) => {
    actualizarMesa(mesaId, { 
      estado: 'limpieza',
      mozoId: undefined,
      clienteId: undefined,
      pedidoActivo: undefined
    });
  };

  const completarLimpieza = (mesaId: number) => {
    actualizarMesa(mesaId, { 
      estado: 'libre'
    });
  };

  const getPedidoMesa = (mesa: any) => {
    if (!mesa.pedidoActivo) return null;
    return pedidos.find(p => p.id === mesa.pedidoActivo);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mapa de Mesas</h2>
          <p className="text-gray-600">Vista en tiempo real del estado de las mesas</p>
        </div>
        
        {/* Leyenda */}
        <div className="flex gap-4">
          {[
            { estado: 'libre', color: 'jungle', label: 'Libre' },
            { estado: 'ocupada', color: 'red', label: 'Ocupada' },
            { estado: 'reservada', color: 'gold', label: 'Reservada' },
            { estado: 'limpieza', color: 'orange', label: 'Limpieza' }
          ].map((item) => (
            <div key={item.estado} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full bg-${item.color}-500`}></div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mesas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesas.map((mesa) => {
          const estadoInfo = getEstadoInfo(mesa.estado);
          const Icon = estadoInfo.icon;
          const pedido = getPedidoMesa(mesa);
          const esMiMesa = mesa.mozoId === currentUser?.id;
          
          return (
            <div 
              key={mesa.id} 
              className={`card ${estadoInfo.bgClass} border-2 transition-all duration-300 hover:shadow-lg ${
                esMiMesa ? 'ring-2 ring-earth-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-${estadoInfo.color}-500 rounded-full flex items-center justify-center text-white`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Mesa {mesa.numero}</h3>
                    <p className="text-sm text-gray-600">{mesa.capacidad} personas</p>
                  </div>
                </div>
                <span className={`status-badge status-${mesa.estado.toLowerCase()}`}>
                  {estadoInfo.label}
                </span>
              </div>

              {/* Información de la mesa */}
              <div className="space-y-3">
                {mesa.mozoId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mozo asignado:</span>
                    <span className={`text-sm font-medium ${esMiMesa ? 'text-earth-700' : 'text-gray-700'}`}>
                      {esMiMesa ? 'Tú'  : 'Otro mozo'}
                    </span>
                  </div>
                )}

                {pedido && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Pedido Activo:</span>
                      <span className={`status-badge status-${pedido.estado}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-bold text-jungle-600">S/ {pedido.total.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {pedido.items.length} items • {pedido.fechaCreacion.toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  {mesa.estado === 'libre' && (
                    <button
                      onClick={() => asignarMesa(mesa.id)}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <Play size={14} />
                      Asignar Mesa
                    </button>
                  )}
                  
                  {mesa.estado === 'limpieza' && (
                    <button
                      onClick={() => completarLimpieza(mesa.id)}
                      className="flex-1 btn-jungle text-sm py-2"
                    >
                      ✓ Limpieza Lista
                    </button>
                  )}
                  
                  {esMiMesa && mesa.estado === 'ocupada' && (
                    <>
                      {pedido?.estado === 'listo' && (
                        <button className="flex-1 btn-gold text-sm py-2">
                          Entregar Pedido
                        </button>
                      )}
                      <button
                        onClick={() => marcarParaLimpieza(mesa.id)}
                        className="flex-1 btn-secondary text-sm py-2"
                      >
                        Marcar Limpieza
                      </button>
                      <button
                        onClick={() => liberarMesa(mesa.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Liberar
                      </button>
                    </>
                  )}
                  
                  {!esMiMesa && mesa.estado === 'ocupada' && (
                    <button className="flex-1 bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-sm cursor-not-allowed">
                      Atendida por otro mozo
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="card bg-earth-gradient text-white">
        <h3 className="text-lg font-bold mb-4">Tu Resumen del Turno</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{mesas.filter(m => m.mozoId === currentUser?.id).length}</p>
            <p className="text-earth-100">Mesas Asignadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidos.filter(p => p.mozoId === currentUser?.id && p.fechaCreacion.toDateString() === new Date().toDateString()).length}
            </p>
            <p className="text-earth-100">Pedidos Hoy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              S/ {pedidos
                .filter(p => p.mozoId === currentUser?.id && p.fechaCreacion.toDateString() === new Date().toDateString())
                .reduce((sum, p) => sum + p.total, 0)
                .toFixed(2)
              }
            </p>
            <p className="text-earth-100">Ventas Hoy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">4.8</p>
            <p className="text-earth-100">Rating Promedio</p>
          </div>
        </div>
      </div>
    </div>
  );
}