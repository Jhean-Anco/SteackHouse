import React from 'react';
import { Clock, ChefHat, CheckCircle, AlertTriangle, Eye, Play, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function PedidosCocina() {
  const { pedidos, actualizarPedido, actualizarItemPedido, platos } = useApp();

  const pedidosCocina = pedidos.filter(p => 
    ['confirmado', 'preparando'].includes(p.estado) && p.pagoValidado
  ).sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());

  const iniciarPreparacionItem = (pedidoId: string, itemIndex: number) => {
    actualizarItemPedido(pedidoId, itemIndex, { estadoCocina: 'preparando' });
    
    // Si es el primer item que se empieza a preparar, cambiar estado del pedido
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido && pedido.estado === 'confirmado') {
      actualizarPedido(pedidoId, { estado: 'preparando' });
    }
  };

  const marcarItemListo = (pedidoId: string, itemIndex: number) => {
    actualizarItemPedido(pedidoId, itemIndex, { estadoCocina: 'listo' });
  };

  const getPlato = (platoId: string) => {
    return platos.find(p => p.id === platoId);
  };

  const getTiempoTranscurrido = (fecha: Date) => {
    return Math.floor((new Date().getTime() - fecha.getTime()) / 1000 / 60);
  };

  const getTiempoEstimado = (items: any[]) => {
    return items.reduce((max, item) => {
      const plato = getPlato(item.platoId);
      return Math.max(max, (plato?.tiempoPreparacion || 15) * item.cantidad);
    }, 0);
  };

  const esUrgente = (pedido: any) => {
    const tiempoTranscurrido = getTiempoTranscurrido(pedido.fechaCreacion);
    const tiempoEstimado = getTiempoEstimado(pedido.items);
    return tiempoTranscurrido > tiempoEstimado + 5;
  };

  const getEstadoItemColor = (estadoCocina: string) => {
    switch (estadoCocina) {
      case 'pendiente': return 'bg-gray-100 border-gray-300';
      case 'preparando': return 'bg-yellow-100 border-yellow-400';
      case 'listo': return 'bg-jungle-100 border-jungle-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (pedidosCocina.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat size={64} className="mx-auto text-jungle-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay pedidos en cocina</h3>
        <p className="text-gray-600">Los nuevos pedidos aparecerán aquí cuando sean confirmados y pagados</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pedidos en Cocina</h2>
        <p className="text-gray-600">Gestiona la preparación de cada plato por orden de llegada</p>
      </div>

      {/* Cola de pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pedidosCocina.map((pedido) => {
          const tiempoTranscurrido = getTiempoTranscurrido(pedido.fechaCreacion);
          const tiempoEstimado = getTiempoEstimado(pedido.items);
          const urgente = esUrgente(pedido);
          const itemsListos = pedido.items.filter(item => item.estadoCocina === 'listo').length;
          const totalItems = pedido.items.length;

          return (
            <div 
              key={pedido.id} 
              className={`card transition-all duration-300 ${
                urgente ? 'border-2 border-red-500 shadow-lg animate-pulse' : 'hover:shadow-xl'
              } ${pedido.estado === 'preparando' ? 'bg-yellow-50 border-yellow-300' : ''}`}
            >
              {/* Header del pedido */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    urgente ? 'bg-red-500 animate-pulse' : 
                    pedido.estado === 'preparando' ? 'bg-yellow-500' : 'bg-gold-500'
                  }`}>
                    {pedido.mesaId}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Mesa {pedido.mesaId}</h3>
                    <p className="text-sm text-gray-600">
                      {pedido.fechaCreacion.toLocaleTimeString()} • {itemsListos}/{totalItems} listos
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {urgente && (
                    <div className="flex items-center gap-1 text-red-600 mb-1">
                      <AlertTriangle size={16} />
                      <span className="text-xs font-bold">¡URGENTE!</span>
                    </div>
                  )}
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-jungle-500 rounded-full transition-all duration-300"
                      style={{ width: `${(itemsListos / totalItems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Tiempo */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock size={16} className={urgente ? 'text-red-600' : 'text-gray-600'} />
                  <span className={`text-sm ${urgente ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    Transcurrido: <strong>{tiempoTranscurrido} min</strong>
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Estimado: <strong>{tiempoEstimado} min</strong>
                </div>
              </div>

              {/* Items del pedido con estado individual */}
              <div className="space-y-3 mb-4">
                {pedido.items.map((item, index) => {
                  const plato = getPlato(item.platoId);
                  const estadoColor = getEstadoItemColor(item.estadoCocina || 'pendiente');
                  
                  return (
                    <div key={index} className={`border-2 rounded-lg p-4 transition-all duration-300 ${estadoColor}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={plato?.imagen}
                          alt={plato?.nombre}
                          className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-800">{plato?.nombre}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              item.estadoCocina === 'listo' ? 'bg-jungle-500 text-white' :
                              item.estadoCocina === 'preparando' ? 'bg-yellow-500 text-white' :
                              'bg-gray-400 text-white'
                            }`}>
                              {item.estadoCocina === 'listo' ? '✓ Listo' :
                               item.estadoCocina === 'preparando' ? '🔥 Preparando' :
                               '⏳ Pendiente'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Cantidad:</strong> {item.cantidad} • 
                            <strong> Tiempo:</strong> {plato?.tiempoPreparacion} min c/u
                          </p>
                          
                          {item.observaciones && (
                            <div className="bg-orange-100 border border-orange-300 rounded p-2 mb-2">
                              <p className="text-xs text-orange-800 font-medium">
                                <strong>⚠️ Observaciones:</strong> {item.observaciones}
                              </p>
                            </div>
                          )}
                          
                          {/* Ingredientes */}
                          <div className="flex flex-wrap gap-1">
                            {plato?.ingredientes.slice(0, 4).map((ingrediente, i) => (
                              <span key={i} className="text-xs bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded border">
                                {ingrediente}
                              </span>
                            ))}
                            {plato && plato.ingredientes.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{plato.ingredientes.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones por item */}
                      <div className="flex gap-2">
                        {item.estadoCocina === 'pendiente' && (
                          <button
                            onClick={() => iniciarPreparacionItem(pedido.id, index)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Play size={16} />
                            Iniciar Preparación
                          </button>
                        )}
                        
                        {item.estadoCocina === 'preparando' && (
                          <button
                            onClick={() => marcarItemListo(pedido.id, index)}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Marcar Listo
                          </button>
                        )}
                        
                        {item.estadoCocina === 'listo' && (
                          <div className="flex-1 bg-jungle-100 text-jungle-700 py-2 px-4 rounded-lg font-medium text-center">
                            ✅ Plato Listo
                          </div>
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

              {/* Estado general del pedido */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Progreso del pedido:
                  </span>
                  <span className="text-sm font-bold text-jungle-600">
                    {itemsListos}/{totalItems} platos listos
                  </span>
                </div>
                {itemsListos === totalItems && (
                  <div className="mt-2 p-2 bg-jungle-100 border border-jungle-300 rounded text-center">
                    <p className="text-jungle-800 font-bold">
                      🎉 ¡Pedido completo! El mozo será notificado automáticamente
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de tiempos */}
      <div className="card bg-gold-gradient text-white">
        <h3 className="text-lg font-bold mb-4">Resumen de Cocina</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.filter(p => p.estado === 'confirmado').length}
            </p>
            <p className="text-gold-100">En Cola</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.filter(p => p.estado === 'preparando').length}
            </p>
            <p className="text-gold-100">Preparando</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.filter(p => esUrgente(p)).length}
            </p>
            <p className="text-gold-100">Urgentes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.reduce((sum, p) => sum + p.items.filter(i => i.estadoCocina === 'listo').length, 0)}
            </p>
            <p className="text-gold-100">Platos Listos</p>
          </div>
        </div>
      </div>
    </div>
  );
}