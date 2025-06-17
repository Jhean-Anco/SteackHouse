import React from 'react';
import { Clock, ChefHat, CheckCircle, Truck, Star, Play, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface EstadoPedidoProps {
  pedido: any;
}

export default function EstadoPedido({ pedido }: EstadoPedidoProps) {
  const { platos } = useApp();

  if (!pedido) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={64} className="mx-auto text-jungle-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes pedidos activos</h3>
        <p className="text-gray-600">Cuando realices un pedido, podrás seguir su estado aquí en tiempo real</p>
        <div className="mt-6 p-4 bg-jungle-50 border border-jungle-200 rounded-lg max-w-md mx-auto">
          <p className="text-jungle-800 text-sm">
            <strong>💡 Tip:</strong> Una vez que hagas tu pedido, verás actualizaciones en vivo desde la cocina hasta tu mesa
          </p>
        </div>
      </div>
    );
  }

  const getPlato = (platoId: string) => {
    return platos.find(p => p.id === platoId);
  };

  const estadosProgreso = [
    { 
      id: 'nuevo', 
      label: 'Pedido Recibido', 
      icon: CheckCircle, 
      completado: true,
      descripcion: 'Tu pedido ha sido recibido y registrado',
      emoji: '📝'
    },
    { 
      id: 'pago_validado', 
      label: 'Pago Confirmado', 
      icon: CheckCircle, 
      completado: pedido.pagoValidado,
      descripcion: pedido.metodoPago === 'efectivo' ? 'El mozo validará tu pago en efectivo' : 'Pago confirmado automáticamente',
      emoji: pedido.metodoPago === 'efectivo' ? '💰' : '✅'
    },
    { 
      id: 'confirmado', 
      label: 'Confirmado por Mozo', 
      icon: CheckCircle, 
      completado: ['confirmado', 'preparando', 'listo', 'mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'El mozo ha confirmado tu pedido y lo envió a cocina',
      emoji: '👨‍💼'
    },
    { 
      id: 'preparando', 
      label: 'En Preparación', 
      icon: ChefHat, 
      completado: ['preparando', 'listo', 'mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'Nuestros chefs están preparando tu comida con amor',
      emoji: '👨‍🍳'
    },
    { 
      id: 'listo', 
      label: 'Listo para Servir', 
      icon: Star, 
      completado: ['listo', 'mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'Tu pedido está listo y huele delicioso',
      emoji: '🍽️'
    },
    { 
      id: 'mozo_en_camino', 
      label: 'Mozo en Camino', 
      icon: Truck, 
      completado: ['mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'El mozo está llevando tu pedido a la mesa',
      emoji: '🚶‍♂️'
    },
    { 
      id: 'entregado', 
      label: 'Entregado', 
      icon: CheckCircle, 
      completado: pedido.estado === 'entregado',
      descripcion: '¡Disfruta tu comida! 🎉',
      emoji: '🎉'
    }
  ];

  const tiempoTranscurrido = Math.floor((new Date().getTime() - pedido.fechaCreacion.getTime()) / 1000 / 60);
  const tiempoEstimado = pedido.items.reduce((max: number, item: any) => {
    const plato = getPlato(item.platoId);
    return Math.max(max, (plato?.tiempoPreparacion || 15) * item.cantidad);
  }, 0);

  const getEstadoActual = () => {
    if (!pedido.pagoValidado) return 'pago_validado';
    return pedido.estado;
  };

  const estadoActual = getEstadoActual();
  const itemsListos = pedido.items?.filter((item: any) => item.estadoCocina === 'listo').length || 0;
  const totalItems = pedido.items?.length || 0;

  // Mensajes dinámicos según el estado
  const getMensajeEstado = () => {
    if (!pedido.pagoValidado && pedido.metodoPago === 'efectivo') {
      return {
        tipo: 'warning',
        titulo: '💰 Esperando validación de pago',
        mensaje: 'El mozo validará tu pago en efectivo antes de enviar el pedido a cocina. ¡Mantén el dinero listo!',
        color: 'orange'
      };
    }

    switch (pedido.estado) {
      case 'nuevo':
        return {
          tipo: 'info',
          titulo: '📝 Pedido confirmado',
          mensaje: 'Tu pedido ha sido registrado exitosamente. El mozo lo revisará en breve.',
          color: 'blue'
        };
      case 'confirmado':
        return {
          tipo: 'info',
          titulo: '👨‍💼 Enviado a cocina',
          mensaje: 'El mozo ha confirmado tu pedido y ya está en manos de nuestros chefs.',
          color: 'blue'
        };
      case 'preparando':
        return {
          tipo: 'progress',
          titulo: '👨‍🍳 ¡Cocinando con pasión!',
          mensaje: `Nuestros chefs están preparando tu comida. Progreso: ${itemsListos}/${totalItems} platos listos.`,
          color: 'yellow'
        };
      case 'listo':
        return {
          tipo: 'success',
          titulo: '🍽️ ¡Tu pedido está listo!',
          mensaje: 'Tu comida está lista y huele increíble. El mozo la llevará a tu mesa en breve.',
          color: 'green'
        };
      case 'mozo_en_camino':
        return {
          tipo: 'success',
          titulo: '🚶‍♂️ ¡Mozo en camino!',
          mensaje: 'Tu mozo está llevando tu pedido a la mesa. ¡Prepárate para disfrutar!',
          color: 'green'
        };
      case 'entregado':
        return {
          tipo: 'celebration',
          titulo: '🎉 ¡Buen provecho!',
          mensaje: 'Tu pedido ha sido entregado. ¡Disfruta tu experiencia selvática!',
          color: 'green'
        };
      default:
        return {
          tipo: 'info',
          titulo: 'Procesando...',
          mensaje: 'Tu pedido está siendo procesado.',
          color: 'gray'
        };
    }
  };

  const mensajeEstado = getMensajeEstado();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Estado de tu Pedido</h2>
        <p className="text-gray-600">Mesa {pedido.mesaId} • Pedido #{pedido.id.slice(-6)}</p>
      </div>

      {/* Mensaje principal del estado */}
      <div className={`card border-2 ${
        mensajeEstado.color === 'orange' ? 'bg-orange-50 border-orange-300' :
        mensajeEstado.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
        mensajeEstado.color === 'green' ? 'bg-jungle-50 border-jungle-300' :
        mensajeEstado.color === 'blue' ? 'bg-blue-50 border-blue-300' :
        'bg-gray-50 border-gray-300'
      } ${mensajeEstado.tipo === 'celebration' ? 'animate-pulse' : ''}`}>
        <div className="text-center">
          <h3 className={`text-xl font-bold mb-2 ${
            mensajeEstado.color === 'orange' ? 'text-orange-800' :
            mensajeEstado.color === 'yellow' ? 'text-yellow-800' :
            mensajeEstado.color === 'green' ? 'text-jungle-800' :
            mensajeEstado.color === 'blue' ? 'text-blue-800' :
            'text-gray-800'
          }`}>
            {mensajeEstado.titulo}
          </h3>
          <p className={`${
            mensajeEstado.color === 'orange' ? 'text-orange-700' :
            mensajeEstado.color === 'yellow' ? 'text-yellow-700' :
            mensajeEstado.color === 'green' ? 'text-jungle-700' :
            mensajeEstado.color === 'blue' ? 'text-blue-700' :
            'text-gray-700'
          }`}>
            {mensajeEstado.mensaje}
          </p>
        </div>
      </div>

      {/* Progreso visual mejorado */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Progreso en Tiempo Real</h3>
        <div className="space-y-6">
          {estadosProgreso.map((estado, index) => {
            const Icon = estado.icon;
            const esActual = estadoActual === estado.id;
            
            return (
              <div key={estado.id} className="relative">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    estado.completado 
                      ? 'bg-jungle-500 text-white shadow-lg scale-110' 
                      : esActual 
                        ? 'bg-gold-500 text-white animate-pulse shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    <div className="text-center">
                      <div className="text-lg">{estado.emoji}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-bold text-lg ${
                        estado.completado ? 'text-jungle-600' : 
                        esActual ? 'text-gold-600' : 'text-gray-400'
                      }`}>
                        {estado.label}
                      </p>
                      {estado.completado && !esActual && (
                        <span className="text-jungle-600 text-sm font-medium bg-jungle-100 px-3 py-1 rounded-full">
                          ✓ Completado
                        </span>
                      )}
                      {esActual && (
                        <span className="text-gold-600 text-sm font-medium bg-gold-100 px-3 py-1 rounded-full animate-pulse">
                          🔄 En proceso...
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      estado.completado || esActual ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {estado.descripcion}
                    </p>
                    
                    {/* Timestamp para estados completados */}
                    {estado.completado && !esActual && (
                      <p className="text-xs text-gray-500 mt-1">
                        ✓ Completado hace {Math.floor(Math.random() * 5) + 1} min
                      </p>
                    )}
                  </div>
                </div>

                {/* Línea conectora mejorada */}
                {index < estadosProgreso.length - 1 && (
                  <div className={`w-1 h-8 ml-7 mt-2 transition-all duration-500 ${
                    estado.completado ? 'bg-jungle-400' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progreso detallado de cocina */}
      {pedido.estado === 'preparando' && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <ChefHat size={20} />
            👨‍🍳 Vista en Vivo desde la Cocina
          </h3>
          <div className="space-y-4">
            {pedido.items.map((item: any, index: number) => {
              const plato = getPlato(item.platoId);
              return (
                <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img
                      src={plato?.imagen}
                      alt={plato?.nombre}
                      className="w-16 h-16 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{plato?.nombre}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                          item.estadoCocina === 'listo' ? 'bg-jungle-500 text-white animate-bounce' :
                          item.estadoCocina === 'preparando' ? 'bg-yellow-500 text-white animate-pulse' :
                          'bg-gray-400 text-white'
                        }`}>
                          {item.estadoCocina === 'listo' ? '✅ ¡Listo!' :
                           item.estadoCocina === 'preparando' ? '🔥 Cocinando...' :
                           '⏳ En cola'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Cantidad: <strong>{item.cantidad}</strong></span>
                        <span>Tiempo estimado: <strong>{plato?.tiempoPreparacion} min</strong></span>
                      </div>
                      {item.observaciones && (
                        <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-sm">
                          <span className="text-orange-800">
                            <strong>📝 Observaciones:</strong> {item.observaciones}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Barra de progreso general */}
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-800 font-medium">Progreso total de tu pedido:</span>
              <span className="text-yellow-800 font-bold">{itemsListos}/{totalItems} platos listos</span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-3">
              <div 
                className="bg-yellow-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(itemsListos / totalItems) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-yellow-700 mt-2 text-center">
              {itemsListos === totalItems ? '🎉 ¡Todo listo! El mozo viene en camino' : 
               `Faltan ${totalItems - itemsListos} plato${totalItems - itemsListos > 1 ? 's' : ''} por terminar`}
            </p>
          </div>
        </div>
      )}

      {/* Información de tiempo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={24} />
            <h4 className="font-bold text-blue-800">Tiempo Transcurrido</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600">{tiempoTranscurrido} min</p>
          <p className="text-sm text-blue-700 mt-1">Desde que hiciste el pedido</p>
        </div>

        <div className="card bg-gradient-to-r from-jungle-50 to-jungle-100 border-jungle-200">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="text-jungle-600" size={24} />
            <h4 className="font-bold text-jungle-800">Tiempo Estimado</h4>
          </div>
          <p className="text-3xl font-bold text-jungle-600">{tiempoEstimado} min</p>
          <p className="text-sm text-jungle-700 mt-1">Tiempo total de preparación</p>
        </div>
      </div>

      {/* Detalles del pedido */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de tu Pedido</h3>
        <div className="space-y-4">
          {pedido.items.map((item: any, index: number) => {
            const plato = getPlato(item.platoId);
            return (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                  src={plato?.imagen}
                  alt={plato?.nombre}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{plato?.nombre}</h4>
                  <p className="text-gray-600 text-sm mb-1">{plato?.descripcion}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Cantidad: <strong className="text-gray-800">{item.cantidad}</strong>
                    </span>
                    <span className="text-jungle-600 font-bold">
                      S/ {item.precio.toFixed(2)}
                    </span>
                  </div>
                  {item.observaciones && (
                    <p className="text-sm text-orange-600 italic mt-1">
                      📝 {item.observaciones}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold text-gray-800">Total a pagar:</span>
            <span className="text-2xl font-bold text-jungle-600">
              S/ {pedido.total.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Método de pago:</span>
            <span className="capitalize font-medium bg-gray-100 px-2 py-1 rounded">
              {pedido.metodoPago}
            </span>
            {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
              <span className="text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded">
                ⏳ Pendiente de validación
              </span>
            )}
            {pedido.pagoValidado && (
              <span className="text-jungle-600 font-bold bg-jungle-100 px-2 py-1 rounded">
                ✅ Pago confirmado
              </span>
            )}
          </div>
        </div>

        {pedido.observaciones && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-orange-800">
              <strong>📝 Observaciones del pedido:</strong> {pedido.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* Mensaje final motivacional */}
      <div className="card bg-jungle-gradient text-white text-center">
        <h3 className="text-xl font-bold mb-3">
          {pedido.estado === 'entregado' ? '🎉 ¡Gracias por elegirnos!' : '🌿 ¡Gracias por tu paciencia!'}
        </h3>
        <p className="text-jungle-100 text-lg">
          {pedido.estado === 'entregado' 
            ? '¡Disfruta tu experiencia selvática! No olvides calificar tu comida y compartir tu experiencia.'
            : 'Nuestro equipo está trabajando con dedicación para brindarte la mejor experiencia culinaria. Te mantendremos informado en tiempo real.'
          }
        </p>
        {pedido.estado === 'entregado' && (
          <div className="mt-4 flex justify-center gap-3">
            <button className="bg-white text-jungle-600 px-6 py-2 rounded-lg font-medium hover:bg-jungle-50 transition-colors">
              ⭐ Calificar Experiencia
            </button>
            <button className="bg-jungle-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-jungle-800 transition-colors">
              📱 Compartir en Redes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}