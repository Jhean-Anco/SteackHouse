import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Eye, CreditCard, Truck, Play } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function PedidosActivos() {
  const { pedidos, actualizarPedido, validarPago, currentUser, platos, mesas, notificaciones, marcarNotificacionLeida } = useApp();

  const pedidosActivos = pedidos.filter(p => 
    p.mozoId === currentUser?.id && 
    ['nuevo', 'confirmado', 'preparando', 'listo', 'mozo_en_camino'].includes(p.estado)
  );

  const notificacionesMozo = notificaciones.filter(n => 
    n.destinatario === 'mozo' && !n.leida
  );

  const entregarPedido = (pedidoId: string) => {
    actualizarPedido(pedidoId, { estado: 'mozo_en_camino' });
    setTimeout(() => {
      actualizarPedido(pedidoId, { estado: 'entregado' });
      // Marcar notificaciones relacionadas como leídas
      notificacionesMozo
        .filter(n => n.pedidoId === pedidoId)
        .forEach(n => marcarNotificacionLeida(n.id));
    }, 3000); // Simular tiempo de entrega
  };

  const confirmarPedido = (pedidoId: string) => {
    actualizarPedido(pedidoId, { estado: 'confirmado' });
    // Marcar notificaciones relacionadas como leídas
    notificacionesMozo
      .filter(n => n.pedidoId === pedidoId && n.tipo === 'nuevo_pedido')
      .forEach(n => marcarNotificacionLeida(n.id));
  };

  const validarPagoEfectivo = (pedidoId: string) => {
    validarPago(pedidoId);
    // Marcar notificaciones relacionadas como leídas
    notificacionesMozo
      .filter(n => n.pedidoId === pedidoId && n.tipo === 'pago_pendiente')
      .forEach(n => marcarNotificacionLeida(n.id));
  };

  const getEstadoInfo = (estado: string, pagoValidado?: boolean) => {
    if (!pagoValidado && estado === 'nuevo') {
      return { color: 'red', label: 'Pago Pendiente', icon: CreditCard };
    }
    
    switch (estado) {
      case 'nuevo':
        return { color: 'blue', label: 'Nuevo', icon: AlertTriangle };
      case 'confirmado':
        return { color: 'orange', label: 'Confirmado', icon: Clock };
      case 'preparando':
        return { color: 'yellow', label: 'Preparando', icon: Clock };
      case 'listo':
        return { color: 'jungle', label: 'Listo para Entregar', icon: CheckCircle };
      case 'mozo_en_camino':
        return { color: 'blue', label: 'En Camino', icon: Truck };
      default:
        return { color: 'gray', label: estado, icon: Clock };
    }
  };

  const getMesa = (mesaId: number) => {
    return mesas.find(m => m.id === mesaId);
  };

  const getPlato = (platoId: string) => {
    return platos.find(p => p.id === platoId);
  };

  const getPedidosConPagoPendiente = () => {
    return pedidosActivos.filter(p => !p.pagoValidado && p.metodoPago === 'efectivo');
  };

  if (pedidosActivos.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={64} className="mx-auto text-jungle-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes pedidos activos</h3>
        <p className="text-gray-600">Los nuevos pedidos aparecerán aquí cuando los clientes los realicen</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pedidos Activos</h2>
          <p className="text-gray-600">Gestiona los pedidos asignados a ti</p>
        </div>
        
        {/* Alertas de notificaciones */}
        {notificacionesMozo.length > 0 && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-red-800 font-medium">
              {notificacionesMozo.length} notificación{notificacionesMozo.length > 1 ? 'es' : ''} nueva{notificacionesMozo.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Pedidos con pago pendiente */}
      {getPedidosConPagoPendiente().length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Pagos Pendientes de Validación
          </h3>
          <div className="space-y-3">
            {getPedidosConPagoPendiente().map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div>
                  <p className="font-bold text-gray-800">Mesa {pedido.mesaId}</p>
                  <p className="text-sm text-gray-600">
                    Total: <span className="font-bold text-red-600">S/ {pedido.total.toFixed(2)}</span> • Pago en efectivo
                  </p>
                </div>
                <button
                  onClick={() => validarPagoEfectivo(pedido.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Validar Pago
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pedidosActivos.map((pedido) => {
          const estadoInfo = getEstadoInfo(pedido.estado, pedido.pagoValidado);
          const Icon = estadoInfo.icon;
          const mesa = getMesa(pedido.mesaId);
          const itemsListos = pedido.items?.filter(item => item.estadoCocina === 'listo').length || 0;
          const totalItems = pedido.items?.length || 0;

          return (
            <div key={pedido.id} className={`card hover:shadow-xl transition-all duration-300 ${
              !pedido.pagoValidado ? 'border-red-300 bg-red-50' : ''
            }`}>
              {/* Header del pedido */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-earth-500 rounded-full flex items-center justify-center text-white font-bold">
                    {pedido.mesaId}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Mesa {pedido.mesaId}</h3>
                    <p className="text-sm text-gray-600">
                      {pedido.fechaCreacion.toLocaleTimeString()} • {pedido.items.length} items
                    </p>
                    {pedido.estado === 'preparando' && (
                      <p className="text-xs text-yellow-600 font-medium">
                        {itemsListos}/{totalItems} platos listos
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`status-badge bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700`}>
                    <Icon size={14} className="mr-1" />
                    {estadoInfo.label}
                  </span>
                  <p className="text-lg font-bold text-jungle-600 mt-1">
                    S/ {pedido.total.toFixed(2)}
                  </p>
                  {pedido.metodoPago && (
                    <p className="text-xs text-gray-500 capitalize">
                      {pedido.metodoPago}
                      {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
                        <span className="text-red-600 font-bold"> - Sin validar</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Items del pedido */}
              <div className="space-y-3 mb-4">
                {pedido.items.map((item, index) => {
                  const plato = getPlato(item.platoId);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={plato?.imagen}
                        alt={plato?.nombre}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800">{plato?.nombre}</p>
                          {item.estadoCocina && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.estadoCocina === 'listo' ? 'bg-jungle-100 text-jungle-700' :
                              item.estadoCocina === 'preparando' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.estadoCocina === 'listo' ? '✓ Listo' :
                               item.estadoCocina === 'preparando' ? '🔥 Preparando' :
                               '⏳ Pendiente'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.cantidad} • S/ {item.precio.toFixed(2)}
                        </p>
                        {item.observaciones && (
                          <p className="text-xs text-orange-600 italic">
                            Obs: {item.observaciones}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Observaciones generales */}
              {pedido.observaciones && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <p className="text-sm text-orange-800">
                    <strong>Observaciones:</strong> {pedido.observaciones}
                  </p>
                </div>
              )}

              {/* Tiempo transcurrido */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock size={14} />
                <span>
                  Hace {Math.floor((new Date().getTime() - pedido.fechaCreacion.getTime()) / 1000 / 60)} minutos
                </span>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
                  <button
                    onClick={() => validarPagoEfectivo(pedido.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    Validar Pago
                  </button>
                )}
                
                {pedido.estado === 'nuevo' && pedido.pagoValidado && (
                  <button
                    onClick={() => confirmarPedido(pedido.id)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Confirmar Pedido
                  </button>
                )}
                
                {pedido.estado === 'listo' && (
                  <button
                    onClick={() => entregarPedido(pedido.id)}
                    className="flex-1 btn-gold flex items-center justify-center gap-2"
                  >
                    <Truck size={16} />
                    Ir a Entregar
                  </button>
                )}
                
                {['confirmado', 'preparando'].includes(pedido.estado) && (
                  <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <Clock size={16} />
                    En cocina...
                  </button>
                )}

                {pedido.estado === 'mozo_en_camino' && (
                  <button className="flex-1 bg-blue-100 text-blue-600 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <Truck size={16} />
                    En camino...
                  </button>
                )}

                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de pedidos por estado */}
      <div className="card bg-jungle-gradient text-white">
        <h3 className="text-lg font-bold mb-4">Resumen de Estados</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { estado: 'nuevo', label: 'Nuevos', filtro: (p: any) => p.estado === 'nuevo' },
            { estado: 'pago_pendiente', label: 'Pago Pendiente', filtro: (p: any) => !p.pagoValidado },
            { estado: 'confirmado', label: 'Confirmados', filtro: (p: any) => p.estado === 'confirmado' },
            { estado: 'preparando', label: 'En Cocina', filtro: (p: any) => p.estado === 'preparando' },
            { estado: 'listo', label: 'Listos', filtro: (p: any) => p.estado === 'listo' }
          ].map((item) => {
            const count = pedidosActivos.filter(item.filtro).length;
            return (
              <div key={item.estado} className="text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-jungle-100 text-sm">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}