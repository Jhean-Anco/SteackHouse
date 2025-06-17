import React, { useState } from 'react';
import { Clock, ChefHat, CheckCircle, AlertTriangle, Eye, Play, Check, Timer, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function PedidosCocina() {
  const { pedidos, actualizarPedido, actualizarItemPedido, platos } = useApp();
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');

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
      case 'pendiente': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'preparando': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'listo': return 'bg-jungle-100 border-jungle-400 text-jungle-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getPrioridadPedido = (pedido: any) => {
    const tiempoTranscurrido = getTiempoTranscurrido(pedido.fechaCreacion);
    const tiempoEstimado = getTiempoEstimado(pedido.items);
    
    if (tiempoTranscurrido > tiempoEstimado + 10) return 'critica';
    if (tiempoTranscurrido > tiempoEstimado + 5) return 'alta';
    if (tiempoTranscurrido > tiempoEstimado) return 'media';
    return 'normal';
  };

  const pedidosFiltrados = pedidosCocina.filter(pedido => {
    if (filtroUrgencia === 'urgentes') return esUrgente(pedido);
    if (filtroUrgencia === 'preparando') return pedido.estado === 'preparando';
    if (filtroUrgencia === 'nuevos') return pedido.estado === 'confirmado';
    return true;
  });

  if (pedidosCocina.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat size={64} className="mx-auto text-jungle-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">🍽️ Cocina lista para trabajar</h3>
        <p className="text-gray-600 mb-4">Los nuevos pedidos aparecerán aquí cuando sean confirmados y pagados</p>
        <div className="max-w-md mx-auto p-4 bg-jungle-50 border border-jungle-200 rounded-lg">
          <p className="text-jungle-800 text-sm">
            <strong>💡 Sistema en tiempo real:</strong> Cuando llegue un pedido, verás toda la información del cliente, 
            fotos de los platos, observaciones especiales y podrás marcar el progreso paso a paso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🔥 Estación de Cocina</h2>
          <p className="text-gray-600">Gestión en tiempo real de pedidos • Ordenados por antigüedad</p>
        </div>
        
        {/* Filtros de urgencia */}
        <div className="flex gap-2">
          {[
            { id: 'todos', label: 'Todos', count: pedidosCocina.length },
            { id: 'nuevos', label: 'Nuevos', count: pedidosCocina.filter(p => p.estado === 'confirmado').length },
            { id: 'preparando', label: 'En Proceso', count: pedidosCocina.filter(p => p.estado === 'preparando').length },
            { id: 'urgentes', label: 'Urgentes', count: pedidosCocina.filter(p => esUrgente(p)).length }
          ].map((filtro) => (
            <button
              key={filtro.id}
              onClick={() => setFiltroUrgencia(filtro.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroUrgencia === filtro.id
                  ? 'bg-jungle-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-jungle-300'
              }`}
            >
              {filtro.label} ({filtro.count})
            </button>
          ))}
        </div>
      </div>

      {/* Alertas de pedidos críticos */}
      {pedidosCocina.filter(p => getPrioridadPedido(p) === 'critica').length > 0 && (
        <div className="card bg-red-50 border-2 border-red-300 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-red-800">🚨 ATENCIÓN: Pedidos Críticos</h3>
          </div>
          <p className="text-red-700">
            Hay {pedidosCocina.filter(p => getPrioridadPedido(p) === 'critica').length} pedido(s) 
            que exceden significativamente el tiempo estimado. ¡Prioridad máxima!
          </p>
        </div>
      )}

      {/* Cola de pedidos mejorada */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {pedidosFiltrados.map((pedido, index) => {
          const tiempoTranscurrido = getTiempoTranscurrido(pedido.fechaCreacion);
          const tiempoEstimado = getTiempoEstimado(pedido.items);
          const prioridad = getPrioridadPedido(pedido);
          const itemsListos = pedido.items.filter(item => item.estadoCocina === 'listo').length;
          const totalItems = pedido.items.length;
          const itemsPreparando = pedido.items.filter(item => item.estadoCocina === 'preparando').length;

          const getBorderColor = () => {
            switch (prioridad) {
              case 'critica': return 'border-red-500 shadow-red-200';
              case 'alta': return 'border-orange-500 shadow-orange-200';
              case 'media': return 'border-yellow-500 shadow-yellow-200';
              default: return 'border-jungle-300 shadow-jungle-200';
            }
          };

          return (
            <div 
              key={pedido.id} 
              className={`card transition-all duration-300 border-2 ${getBorderColor()} ${
                prioridad === 'critica' ? 'animate-pulse shadow-xl' : 'hover:shadow-xl'
              } ${pedido.estado === 'preparando' ? 'bg-yellow-50' : 'bg-white'}`}
            >
              {/* Header mejorado con prioridad visual */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg ${
                    prioridad === 'critica' ? 'bg-red-500 animate-bounce' : 
                    prioridad === 'alta' ? 'bg-orange-500' : 
                    prioridad === 'media' ? 'bg-yellow-500' : 
                    'bg-jungle-500'
                  }`}>
                    <span className="text-lg">{pedido.mesaId}</span>
                    <span className="text-xs">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      Mesa {pedido.mesaId}
                      {prioridad === 'critica' && <span className="text-red-500 animate-pulse">🚨</span>}
                      {prioridad === 'alta' && <span className="text-orange-500">⚠️</span>}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>📅 {pedido.fechaCreacion.toLocaleTimeString()}</span>
                      <span>🍽️ {totalItems} platos</span>
                      <span>👥 {pedido.items.reduce((sum, item) => sum + item.cantidad, 0)} porciones</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold mb-2 ${
                    prioridad === 'critica' ? 'bg-red-500 text-white' :
                    prioridad === 'alta' ? 'bg-orange-500 text-white' :
                    prioridad === 'media' ? 'bg-yellow-500 text-white' :
                    'bg-jungle-500 text-white'
                  }`}>
                    {prioridad === 'critica' ? '🚨 CRÍTICO' :
                     prioridad === 'alta' ? '⚠️ URGENTE' :
                     prioridad === 'media' ? '⏰ ATRASADO' :
                     '✅ A TIEMPO'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Progreso: {itemsListos}/{totalItems}
                  </div>
                </div>
              </div>

              {/* Información de tiempo mejorada */}
              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    tiempoTranscurrido > tiempoEstimado ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {tiempoTranscurrido} min
                  </div>
                  <div className="text-xs text-gray-600">Transcurrido</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-jungle-600">{tiempoEstimado} min</div>
                  <div className="text-xs text-gray-600">Estimado</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    tiempoTranscurrido > tiempoEstimado ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tiempoTranscurrido > tiempoEstimado ? '+' : ''}{tiempoTranscurrido - tiempoEstimado} min
                  </div>
                  <div className="text-xs text-gray-600">Diferencia</div>
                </div>
              </div>

              {/* Barra de progreso general */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso del pedido:</span>
                  <span className="text-sm font-bold text-jungle-600">
                    {itemsListos}/{totalItems} listos
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-jungle-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${(itemsListos / totalItems) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Items del pedido con vista mejorada */}
              <div className="space-y-3 mb-4">
                {pedido.items.map((item, itemIndex) => {
                  const plato = getPlato(item.platoId);
                  const estadoColor = getEstadoItemColor(item.estadoCocina || 'pendiente');
                  
                  return (
                    <div key={itemIndex} className={`border-2 rounded-lg p-4 transition-all duration-300 ${estadoColor}`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative">
                          <img
                            src={plato?.imagen}
                            alt={plato?.nombre}
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                          {/* Badge de cantidad */}
                          <div className="absolute -top-2 -right-2 bg-jungle-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {item.cantidad}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-800 text-lg">{plato?.nombre}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                              item.estadoCocina === 'listo' ? 'bg-jungle-500 text-white animate-bounce' :
                              item.estadoCocina === 'preparando' ? 'bg-yellow-500 text-white animate-pulse' :
                              'bg-gray-400 text-white'
                            }`}>
                              {item.estadoCocina === 'listo' ? '✅ ¡LISTO!' :
                               item.estadoCocina === 'preparando' ? '🔥 COCINANDO' :
                               '⏳ EN COLA'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                            <span>🍽️ <strong>{item.cantidad}</strong> porciones</span>
                            <span>⏱️ <strong>{plato?.tiempoPreparacion}</strong> min c/u</span>
                            <span>💰 <strong>S/ {item.precio.toFixed(2)}</strong></span>
                            <span>🔥 <strong>{(plato?.tiempoPreparacion || 15) * item.cantidad}</strong> min total</span>
                          </div>
                          
                          {/* Observaciones destacadas */}
                          {item.observaciones && (
                            <div className="bg-orange-100 border-l-4 border-orange-400 p-3 mb-3">
                              <p className="text-sm text-orange-800 font-medium">
                                <strong>⚠️ OBSERVACIONES ESPECIALES:</strong>
                              </p>
                              <p className="text-orange-700 font-bold">{item.observaciones}</p>
                            </div>
                          )}
                          
                          {/* Ingredientes principales */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs text-gray-500 mr-2">Ingredientes:</span>
                            {plato?.ingredientes.slice(0, 4).map((ingrediente, i) => (
                              <span key={i} className="text-xs bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded border">
                                {ingrediente}
                              </span>
                            ))}
                            {plato && plato.ingredientes.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{plato.ingredientes.length - 4} más
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones por item mejoradas */}
                      <div className="flex gap-2">
                        {item.estadoCocina === 'pendiente' && (
                          <button
                            onClick={() => iniciarPreparacionItem(pedido.id, itemIndex)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Play size={18} />
                            🔥 INICIAR PREPARACIÓN
                          </button>
                        )}
                        
                        {item.estadoCocina === 'preparando' && (
                          <button
                            onClick={() => marcarItemListo(pedido.id, itemIndex)}
                            className="flex-1 bg-jungle-500 hover:bg-jungle-600 text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Check size={18} />
                            ✅ MARCAR LISTO
                          </button>
                        )}
                        
                        {item.estadoCocina === 'listo' && (
                          <div className="flex-1 bg-jungle-100 text-jungle-700 py-3 px-4 rounded-lg font-bold text-center border-2 border-jungle-300">
                            🎉 PLATO TERMINADO
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Observaciones generales del pedido */}
              {pedido.observaciones && (
                <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg mb-4">
                  <p className="text-sm text-orange-800 font-bold mb-1">
                    📝 OBSERVACIONES GENERALES DEL PEDIDO:
                  </p>
                  <p className="text-orange-700 font-medium">{pedido.observaciones}</p>
                </div>
              )}

              {/* Estado final del pedido */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    Estado del pedido completo:
                  </span>
                  <span className="text-sm font-bold text-jungle-600">
                    {itemsListos}/{totalItems} platos terminados
                  </span>
                </div>
                
                {itemsPreparando > 0 && (
                  <div className="text-sm text-yellow-700 mb-2">
                    🔥 {itemsPreparando} plato{itemsPreparando > 1 ? 's' : ''} en preparación activa
                  </div>
                )}
                
                {itemsListos === totalItems ? (
                  <div className="mt-3 p-3 bg-jungle-100 border-2 border-jungle-400 rounded-lg text-center animate-bounce">
                    <p className="text-jungle-800 font-bold text-lg">
                      🎉 ¡PEDIDO COMPLETO! 
                    </p>
                    <p className="text-jungle-700 text-sm">
                      El mozo ha sido notificado automáticamente para recoger el pedido
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-jungle-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(itemsListos / totalItems) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      Faltan {totalItems - itemsListos} plato{totalItems - itemsListos > 1 ? 's' : ''} por terminar
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel de estadísticas en tiempo real */}
      <div className="card bg-gradient-to-r from-jungle-500 to-earth-500 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ChefHat size={24} />
          📊 Resumen de Cocina en Tiempo Real
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.filter(p => p.estado === 'confirmado').length}
            </p>
            <p className="text-jungle-100">⏳ En Cola</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.filter(p => p.estado === 'preparando').length}
            </p>
            <p className="text-jungle-100">🔥 Cocinando</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.filter(p => esUrgente(p)).length}
            </p>
            <p className="text-jungle-100">🚨 Urgentes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.reduce((sum, p) => sum + p.items.filter(i => i.estadoCocina === 'listo').length, 0)}
            </p>
            <p className="text-jungle-100">✅ Platos Listos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {pedidosCocina.reduce((sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0)}
            </p>
            <p className="text-jungle-100">🍽️ Porciones Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}