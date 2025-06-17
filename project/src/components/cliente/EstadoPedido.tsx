import React from 'react';
import { Clock, ChefHat, CheckCircle, Truck, Star, Play } from 'lucide-react';
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
        <p className="text-gray-600">Cuando realices un pedido, podrás seguir su estado aquí</p>
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
      icon: Clock, 
      completado: true,
      descripcion: 'Tu pedido ha sido recibido'
    },
    { 
      id: 'pago_validado', 
      label: 'Pago Confirmado', 
      icon: CheckCircle, 
      completado: pedido.pagoValidado,
      descripcion: pedido.metodoPago === 'efectivo' ? 'El mozo validará tu pago' : 'Pago confirmado automáticamente'
    },
    { 
      id: 'confirmado', 
      label: 'Confirmado por Mozo', 
      icon: CheckCircle, 
      completado: ['confirmado', 'preparando', 'listo', 'mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'El mozo ha confirmado tu pedido'
    },
    { 
      id: 'preparando', 
      label: 'En Preparación', 
      icon: ChefHat, 
      completado: ['preparando', 'listo', 'mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'Nuestros chefs están preparando tu comida'
    },
    { 
      id: 'listo', 
      label: 'Listo para Servir', 
      icon: Star, 
      completado: ['listo', 'mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'Tu pedido está listo'
    },
    { 
      id: 'mozo_en_camino', 
      label: 'Mozo en Camino', 
      icon: Truck, 
      completado: ['mozo_en_camino', 'entregado'].includes(pedido.estado),
      descripcion: 'El mozo está llevando tu pedido a la mesa'
    },
    { 
      id: 'entregado', 
      label: 'Entregado', 
      icon: CheckCircle, 
      completado: pedido.estado === 'entregado',
      descripcion: '¡Disfruta tu comida!'
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Estado de tu Pedido</h2>
        <p className="text-gray-600">Mesa {pedido.mesaId} • Pedido #{pedido.id.slice(-6)}</p>
      </div>

      {/* Mensaje especial según el estado */}
      {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600" size={24} />
            <div>
              <h3 className="font-bold text-orange-800">Esperando validación de pago</h3>
              <p className="text-orange-700 text-sm">
                El mozo validará tu pago en efectivo antes de enviar el pedido a cocina
              </p>
            </div>
          </div>
        </div>
      )}

      {pedido.estado === 'mozo_en_camino' && (
        <div className="card bg-blue-50 border-blue-200 animate-pulse">
          <div className="flex items-center gap-3">
            <Truck className="text-blue-600" size={24} />
            <div>
              <h3 className="font-bold text-blue-800">¡Tu mozo está en camino!</h3>
              <p className="text-blue-700 text-sm">
                Prepárate, tu pedido llegará a tu mesa en unos momentos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progreso del pedido */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Progreso</h3>
        <div className="space-y-6">
          {estadosProgreso.map((estado, index) => {
            const Icon = estado.icon;
            const esActual = estadoActual === estado.id;
            
            return (
              <div key={estado.id} className="relative">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    estado.completado 
                      ? 'bg-jungle-500 text-white shadow-lg' 
                      : esActual 
                        ? 'bg-gold-500 text-white animate-pulse shadow-lg'
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-bold ${
                        estado.completado ? 'text-jungle-600' : 
                        esActual ? 'text-gold-600' : 'text-gray-400'
                      }`}>
                        {estado.label}
                      </p>
                      {estado.completado && !esActual && (
                        <span className="text-jungle-600 text-sm font-medium">✓ Completado</span>
                      )}
                      {esActual && (
                        <span className="text-gold-600 text-sm font-medium animate-pulse">En proceso...</span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      estado.completado || esActual ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {estado.descripcion}
                    </p>
                  </div>
                </div>

                {/* Línea conectora */}
                {index < estadosProgreso.length - 1 && (
                  <div className={`w-px h-6 ml-6 mt-2 ${
                    estado.completado ? 'bg-jungle-300' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progreso de cocina detallado */}
      {pedido.estado === 'preparando' && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <ChefHat size={20} />
            Progreso en Cocina
          </h3>
          <div className="space-y-3">
            {pedido.items.map((item: any, index: number) => {
              const plato = getPlato(item.platoId);
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <img
                    src={plato?.imagen}
                    alt={plato?.nombre}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{plato?.nombre}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.estadoCocina === 'listo' ? 'bg-jungle-500 text-white' :
                        item.estadoCocina === 'preparando' ? 'bg-yellow-500 text-white animate-pulse' :
                        'bg-gray-400 text-white'
                      }`}>
                        {item.estadoCocina === 'listo' ? '✓ Listo' :
                         item.estadoCocina === 'preparando' ? '🔥 Preparando' :
                         '⏳ En cola'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-yellow-800 font-medium">Progreso total:</span>
              <span className="text-yellow-800 font-bold">{itemsListos}/{totalItems} platos listos</span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(itemsListos / totalItems) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Tiempo estimado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gold-50 border-gold-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-gold-600" size={20} />
            <h4 className="font-bold text-gold-800">Tiempo Transcurrido</h4>
          </div>
          <p className="text-2xl font-bold text-gold-600">{tiempoTranscurrido} min</p>
        </div>

        <div className="card bg-jungle-50 border-jungle-200">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="text-jungle-600" size={20} />
            <h4 className="font-bold text-jungle-800">Tiempo Estimado</h4>
          </div>
          <p className="text-2xl font-bold text-jungle-600">{tiempoEstimado} min</p>
        </div>
      </div>

      {/* Detalles del pedido */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Detalles del Pedido</h3>
        <div className="space-y-4">
          {pedido.items.map((item: any, index: number) => {
            const plato = getPlato(item.platoId);
            return (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src={plato?.imagen}
                  alt={plato?.nombre}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{plato?.nombre}</p>
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

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-xl font-bold text-jungle-600">
              S/ {pedido.total.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Método de pago: <span className="capitalize font-medium">{pedido.metodoPago}</span>
            {!pedido.pagoValidado && pedido.metodoPago === 'efectivo' && (
              <span className="text-orange-600 font-bold"> (Pendiente de validación)</span>
            )}
          </p>
        </div>

        {pedido.observaciones && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-orange-800">
              <strong>Observaciones:</strong> {pedido.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* Mensaje motivacional */}
      <div className="card bg-jungle-gradient text-white text-center">
        <h3 className="text-lg font-bold mb-2">¡Gracias por tu pedido!</h3>
        <p className="text-jungle-100">
          {pedido.estado === 'entregado' 
            ? '¡Disfruta tu comida! No olvides calificar tu experiencia.'
            : 'Nuestro equipo está trabajando para brindarte la mejor experiencia. Te mantendremos informado del progreso.'
          }
        </p>
      </div>
    </div>
  );
}