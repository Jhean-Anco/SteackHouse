import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Eye, CreditCard, Truck, Play, Bell, Users } from 'lucide-react';
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
      return { color: 'red', label: 'Pago Pendiente', icon: CreditCard, descripcion: 'Cliente desea pagar en efectivo' };
    }
    
    switch (estado) {
      case 'nuevo':
        return { color: 'blue', label: 'Nuevo Pedido', icon: Bell, descripcion: 'Recién recibido del cliente' };
      case 'confirmado':
        return { color: 'orange', label: 'En Cocina', icon: Clock, descripcion: 'Enviado a cocina para preparación' };
      case 'preparando':
        return { color: 'yellow', label: 'Preparando', icon: Clock, descripcion: 'Los chefs están cocinando' };
      case 'listo':
        return { color: 'jungle', label: 'Listo para Entregar', icon: CheckCircle, descripcion: 'Pedido terminado, listo para servir' };
      case 'mozo_en_camino':
        return { color: 'blue', label: 'En Camino', icon: Truck, descripcion: 'Llevando pedido a la mesa' };
      default:
        return { color: 'gray', label: estado, icon: Clock, descripcion: '' };
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

  const getPedidosListos = () => {
    return pedidosActivos.filter(p => p.estado === 'listo');
  };

  const getTiempoTranscurrido = (fecha: Date) => {
    return Math.floor((new Date().getTime() - fecha.getTime()) / 1000 / 60);
  };

  if (pedidosActivos.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={64} className="mx-auto text-jungle-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">🍽️ No tienes pedidos activos</h3>
        <p className="text-gray-600 mb-4">Los nuevos pedidos aparecerán aquí cuando los clientes los realicen</p>
        <div className="max-w-md mx-auto p-4 bg-earth-50 border border-earth-200 rounded-lg">
          <p className="text-earth-800 text-sm">
            <strong>💡 Sistema en tiempo real:</strong> Recibirás notificaciones instantáneas cuando lleguen nuevos pedidos, 
            cuando estén listos en cocina, y podrás gestionar pagos en efectivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🔔 Pedidos Activos</h2>
          <p className="text-gray-600">Gestiona los pedidos asignados a ti • Actualizaciones en tiempo real</p>
        </div>
        
        {/* Alertas de notificaciones */}
        {notificacionesMozo.length > 0 && (
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2">
              <Bell className="text-red-600" size={20} />
              <p className="text-red-800 font-bold">
                {notificacionesMozo.length} notificación{notificacionesMozo.length > 1 ? 'es' : ''} nueva{notificacionesMozo.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sección de pagos pendientes - PRIORIDAD MÁXIMA */}
      {getPedidosConPagoPendiente().length > 0 && (
        <div className="card bg-red-50 border-2 border-red-400 shadow-lg">
          <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <CreditCard size={24} />
            💰 PAGOS PENDIENTES - ACCIÓN REQUERIDA
          </h3>
          <p className="text-red-700 mb-4 font-medium">
            Los siguientes clientes desean pagar en efectivo. Valida el pago para enviar el pedido a cocina:
          </p>
          <div className="space-y-3">
            {getPedidosConPagoPendiente().map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg p-4 border-2 border-red-300 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {pedido.mesaId}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">Mesa {pedido.mesaId}</p>
                      <p className="text-sm text-gray-600">
                        {pedido.items.length} items • Hace {getTiempoTranscurrido(pedido.fechaCreacion)} min
                      </p>
                      <p className="text-sm text-red-600 font-medium">
                        Total a cobrar: <span className="font-bold text-xl">S/ {pedido.total.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => validarPagoEfectivo(pedido.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    ✅ VALIDAR PAGO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de pedidos listos para entregar */}
      {getPedidosListos().length > 0 && (
        <div className="card bg-jungle-50 border-2 border-jungle-400 shadow-lg">
          <h3 className="text-xl font-bold text-jungle-800 mb-4 flex items-center gap-2">
            <CheckCircle size={24} />
            🍽️ PEDIDOS LISTOS PARA ENTREGAR
          </h3>
          <p className="text-jungle-700 mb-4 font-medium">
            Los siguientes pedidos están terminados y esperan ser entregados:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getPedidosListos().map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg p-4 border-2 border-jungle-300 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-jungle-500 rounded-full flex items-center justify-center text-white font-bold">
                      {pedido.mesaId}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Mesa {pedido.mesaId}</p>
                      <p className="text-sm text-gray-600">{pedido.items.length} items</p>
                    </div>
                  </div>
                  <button
                    onClick={() => entregarPedido(pedido.id)}
                    className="bg-jungle-600 hover:bg-jungle-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🚶‍♂️ IR A ENTREGAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista principal de pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pedidosActivos.map((pedido) => {
          const estadoInfo = getEstadoInfo(pedido.estado, pedido.pagoValidado);
          const Icon = estadoInfo.icon;
          const mesa = getMesa(pedido.mesaId);
          const itemsListos = pedido.items?.filter(item => item.estadoCocina === 'listo').length || 0;
          const totalItems = pedido.items?.length || 0;
          const tiempoTranscurrido = getTiempoTranscurrido(pedido.fechaCreacion);

          return (
            <div key={pedido.id} className={`card hover:shadow-xl transition-all duration-300 ${
              !pedido.pagoValidado ? 'border-2 border-red-300 bg-red-50' : 
              pedido.estado === 'listo' ? 'border-2 border-jungle-300 bg-jungle-50' :
              ''
            }`}>
              {/* Header del pedido mejorado */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    !pedido.pagoValidado ? 'bg-red-500 animate-pulse' :
                    pedido.estado === 'listo' ? 'bg-jungle-500 animate-bounce' :
                    'bg-earth-500'
                  }`}>
                    {pedido.mesaId}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Mesa {pedido.mesaId}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>📅 {pedido.fechaCreacion.toLocaleTimeString()}</span>
                      <span>🍽️ {pedido.items.length} items</span>
                      <span>⏱️ Hace {tiempoTranscurrido} min</span>
                    </div>
                    {pedido.estado === 'preparando' && (
                      <p className="text-sm text-yellow-600 font-medium">
                        🔥 Progreso: {itemsListos}/{totalItems} platos listos
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`status-badge bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700 mb-2 block`}>
                    <Icon size={14} className="mr-1" />
                    {estadoInfo.label}
                  </span>
                  <p className="text-xl font-bold text-jungle-600">
                    S/ {pedido.total.toFixed(2)}
                  </p>
                  {pedido.metodoPago && (
                    <p className="text-xs text-gray-500 capitalize">
                      💳 {pedido.metodoPago}
                      {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
                        <span className="text-red-600 font-bold"> - Sin validar</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción del estado */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Estado:</strong> {estadoInfo.descripcion}
                </p>
              </div>

              {/* Items del pedido con vista mejorada */}
              <div className="space-y-3 mb-4">
                {pedido.items.map((item, index) => {
                  const plato = getPlato(item.platoId);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <img
                        src={plato?.imagen}
                        alt={plato?.nombre}
                        className="w-16 h-16 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-800">{plato?.nombre}</p>
                          {item.estadoCocina && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.estadoCocina === 'listo' ? 'bg-jungle-100 text-jungle-700' :
                              item.estadoCocina === 'preparando' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.estadoCocina === 'listo' ? '✅ Listo' :
                               item.estadoCocina === 'preparando' ? '🔥 Cocinando' :
                               '⏳ En cola'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Cantidad: <strong>{item.cantidad}</strong></span>
                          <span>Precio: <strong>S/ {item.precio.toFixed(2)}</strong></span>
                        </div>
                        {item.observaciones && (
                          <p className="text-xs text-orange-600 italic mt-1">
                            📝 Observaciones: {item.observaciones}
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
                    <strong>📝 Observaciones del pedido:</strong> {pedido.observaciones}
                  </p>
                </div>
              )}

              {/* Progreso visual para pedidos en preparación */}
              {pedido.estado === 'preparando' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-yellow-800">Progreso en cocina:</span>
                    <span className="text-sm font-bold text-yellow-800">{itemsListos}/{totalItems}</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(itemsListos / totalItems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Acciones principales */}
              <div className="flex gap-2">
                {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
                  <button
                    onClick={() => validarPagoEfectivo(pedido.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CreditCard size={16} />
                    💰 VALIDAR PAGO
                  </button>
                )}
                
                {pedido.estado === 'nuevo' && pedido.pagoValidado && (
                  <button
                    onClick={() => confirmarPedido(pedido.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Play size={16} />
                    ✅ CONFIRMAR PEDIDO
                  </button>
                )}
                
                {pedido.estado === 'listo' && (
                  <button
                    onClick={() => entregarPedido(pedido.id)}
                    className="flex-1 bg-jungle-600 hover:bg-jungle-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Truck size={16} />
                    🚶‍♂️ IR A ENTREGAR
                  </button>
                )}
                
                {['confirmado', 'preparando'].includes(pedido.estado) && (
                  <button className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <Clock size={16} />
                    🔥 En cocina...
                  </button>
                )}

                {pedido.estado === 'mozo_en_camino' && (
                  <button className="flex-1 bg-blue-100 text-blue-600 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <Truck size={16} />
                    🚶‍♂️ En camino...
                  </button>
                )}

                <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de estados mejorado */}
      <div className="card bg-earth-gradient text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} />
          📊 Resumen de Atención en Tiempo Real
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { estado: 'pago_pendiente', label: '💰 Pagos Pendientes', filtro: (p: any) => !p.pagoValidado, color: 'text-red-200' },
            { estado: 'nuevo', label: '🔔 Nuevos', filtro: (p: any) => p.estado === 'nuevo' && p.pagoValidado, color: 'text-blue-200' },
            { estado: 'confirmado', label: '👨‍🍳 En Cocina', filtro: (p: any) => p.estado === 'confirmado', color: 'text-orange-200' },
            { estado: 'preparando', label: '🔥 Preparando', filtro: (p: any) => p.estado === 'preparando', color: 'text-yellow-200' },
            { estado: 'listo', label: '✅ Listos', filtro: (p: any) => p.estado === 'listo', color: 'text-green-200' },
            { estado: 'entregando', label: '🚶‍♂️ Entregando', filtro: (p: any) => p.estado === 'mozo_en_camino', color: 'text-blue-200' }
          ].map((item) => {
            const count = pedidosActivos.filter(item.filtro).length;
            return (
              <div key={item.estado} className="text-center">
                <p className="text-3xl font-bold">{count}</p>
                <p className={`text-sm ${item.color}`}>{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}