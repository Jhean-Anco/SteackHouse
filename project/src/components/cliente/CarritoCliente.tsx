import React, { useState } from 'react';
import { Minus, Plus, Trash2, CreditCard, Smartphone, DollarSign, QrCode } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface CarritoClienteProps {
  carrito: any[];
  onActualizarCarrito: (platoId: string, cantidad: number) => void;
  onLimpiarCarrito: () => void;
  mesaId: number;
}

export default function CarritoCliente({ 
  carrito, 
  onActualizarCarrito, 
  onLimpiarCarrito, 
  mesaId 
}: CarritoClienteProps) {
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'yape' | 'transferencia' | 'efectivo' | 'tarjeta'>('yape');
  const [observacionesPedido, setObservacionesPedido] = useState('');
  const { crearPedido, currentUser, actualizarMesa } = useApp();

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const descuento = 0; // Podría aplicarse descuentos
  const total = subtotal - descuento;

  const metodosPago = [
    { 
      id: 'yape', 
      label: 'Yape', 
      icon: Smartphone, 
      color: 'purple',
      descripcion: 'Pago instantáneo con QR'
    },
    { 
      id: 'transferencia', 
      label: 'Transferencia', 
      icon: CreditCard, 
      color: 'blue',
      descripcion: 'Transferencia bancaria'
    },
    { 
      id: 'efectivo', 
      label: 'Efectivo', 
      icon: DollarSign, 
      color: 'green',
      descripcion: 'El mozo validará tu pago'
    },
    { 
      id: 'tarjeta', 
      label: 'Tarjeta', 
      icon: CreditCard, 
      color: 'gray',
      descripcion: 'Visa, Mastercard'
    }
  ];

  const confirmarPedido = () => {
    if (carrito.length === 0) return;

    const pedidoId = crearPedido({
      mesaId,
      clienteId: currentUser!.id,
      items: carrito.map(item => ({
        platoId: item.platoId,
        cantidad: item.cantidad,
        observaciones: item.observaciones,
        precio: item.precio * item.cantidad
      })),
      total,
      estado: 'nuevo',
      metodoPago,
      observaciones: observacionesPedido
    });

    // Limpiar carrito
    onLimpiarCarrito();
    setMostrarPago(false);
    
    // Mostrar confirmación
    if (metodoPago === 'efectivo') {
      alert('¡Pedido enviado! El mozo validará tu pago y luego se enviará a cocina. Te mantendremos informado del progreso.');
    } else {
      alert('¡Pedido confirmado! El mozo y la cocina han sido notificados automáticamente. Puedes seguir el progreso en tiempo real.');
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Smartphone size={64} className="mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
        <p className="text-gray-600">Explora nuestra carta y agrega tus platos favoritos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tu Carrito</h2>
        <button
          onClick={onLimpiarCarrito}
          className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
        >
          <Trash2 size={16} />
          Limpiar todo
        </button>
      </div>

      {/* Items del carrito */}
      <div className="space-y-4">
        {carrito.map((item) => (
          <div key={item.platoId} className="card">
            <div className="flex items-center gap-4">
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.nombre}</h3>
                <p className="text-jungle-600 font-bold">S/ {item.precio.toFixed(2)}</p>
                {item.observaciones && (
                  <p className="text-sm text-orange-600 italic">Obs: {item.observaciones}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onActualizarCarrito(item.platoId, item.cantidad - 1)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold w-8 text-center">{item.cantidad}</span>
                <button
                  onClick={() => onActualizarCarrito(item.platoId, item.cantidad + 1)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-800">
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </p>
                <button
                  onClick={() => onActualizarCarrito(item.platoId, 0)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Observaciones del pedido */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones para el pedido (opcional)
        </label>
        <textarea
          value={observacionesPedido}
          onChange={(e) => setObservacionesPedido(e.target.value)}
          placeholder="Ej: Servir todo junto, sin picante, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jungle-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Resumen */}
      <div className="card bg-jungle-50 border-jungle-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del Pedido</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento:</span>
              <span>-S/ {descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-jungle-200 pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-jungle-600">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {!mostrarPago ? (
        <button
          onClick={() => setMostrarPago(true)}
          className="w-full btn-primary text-lg py-4"
        >
          Proceder al Pago
        </button>
      ) : (
        /* Sección de pago */
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Método de Pago</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {metodosPago.map((metodo) => {
              const Icon = metodo.icon;
              return (
                <button
                  key={metodo.id}
                  onClick={() => setMetodoPago(metodo.id as any)}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    metodoPago === metodo.id
                      ? 'border-jungle-500 bg-jungle-50'
                      : 'border-gray-200 hover:border-jungle-300'
                  }`}
                >
                  <Icon size={24} className={`text-${metodo.color}-600`} />
                  <span className="font-medium">{metodo.label}</span>
                  <span className="text-xs text-gray-500 text-center">{metodo.descripcion}</span>
                </button>
              );
            })}
          </div>

          {metodoPago === 'yape' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-purple-800 font-medium mb-3 flex items-center gap-2">
                <QrCode size={20} />
                Pagar con Yape
              </p>
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-6xl mb-3">📱</div>
                <p className="text-sm text-gray-600 mb-2">Escanea el código QR con tu app Yape</p>
                <p className="font-bold text-purple-600 text-xl">S/ {total.toFixed(2)}</p>
                <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-700">
                  Tu pedido se enviará automáticamente a cocina tras el pago
                </div>
              </div>
            </div>
          )}

          {metodoPago === 'transferencia' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium mb-3 flex items-center gap-2">
                <CreditCard size={20} />
                Transferencia Bancaria
              </p>
              <div className="text-sm space-y-2 bg-white p-4 rounded">
                <p><strong>Banco:</strong> BCP</p>
                <p><strong>Cuenta:</strong> 123-456789-0-12</p>
                <p><strong>CCI:</strong> 00212345678901234567</p>
                <p><strong>Titular:</strong> SteackHouse SAC</p>
                <p className="text-lg font-bold text-blue-600">Monto: S/ {total.toFixed(2)}</p>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                  Tu pedido se enviará automáticamente a cocina tras confirmar la transferencia
                </div>
              </div>
            </div>
          )}

          {metodoPago === 'efectivo' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium mb-2 flex items-center gap-2">
                <DollarSign size={20} />
                Pago en Efectivo
              </p>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-green-700 mb-2">
                  El mozo validará tu pago cuando confirme el pedido
                </p>
                <p className="font-bold text-green-600 text-lg">Total a pagar: S/ {total.toFixed(2)}</p>
                <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded">
                  <p className="text-xs text-orange-800">
                    <strong>⚠️ Importante:</strong> Tu pedido se enviará a cocina solo después de que el mozo valide tu pago
                  </p>
                </div>
              </div>
            </div>
          )}

          {metodoPago === 'tarjeta' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 font-medium mb-2 flex items-center gap-2">
                <CreditCard size={20} />
                Pago con Tarjeta
              </p>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-700 mb-2">
                  El mozo traerá el POS para procesar tu pago
                </p>
                <p className="font-bold text-gray-600 text-lg">Total: S/ {total.toFixed(2)}</p>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  Aceptamos Visa, Mastercard y otras tarjetas principales
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setMostrarPago(false)}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={confirmarPedido}
              className="flex-1 btn-primary py-3"
            >
              {metodoPago === 'efectivo' ? 'Enviar Pedido' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}