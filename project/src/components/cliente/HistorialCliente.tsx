import React, { useState } from 'react';
import { Calendar, Star, Download, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function HistorialCliente() {
  const [filtroFecha, setFiltroFecha] = useState('todos');
  const { pedidos, currentUser, platos } = useApp();

  const getPedidosHistorial = () => {
    const hoy = new Date();
    let fechaInicio: Date | null = null;
    
    switch (filtroFecha) {
      case 'hoy':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
    }

    return pedidos.filter(p => 
      p.clienteId === currentUser?.id && 
      ['entregado', 'pagado'].includes(p.estado) &&
      (!fechaInicio || p.fechaCreacion >= fechaInicio)
    ).sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  };

  const pedidosHistorial = getPedidosHistorial();
  const totalGastado = pedidosHistorial.reduce((sum, p) => sum + p.total, 0);
  const pedidosFavoritos = pedidosHistorial.length;

  const getPlato = (platoId: string) => {
    return platos.find(p => p.id === platoId);
  };

  const descargarBoleta = (pedidoId: string) => {
    // Mock functionality - en producción generaría PDF
    alert(`Descargando boleta del pedido ${pedidoId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mi Historial</h2>
          <p className="text-gray-600">Revisa tus pedidos anteriores y descarga boletas</p>
        </div>
        
        <select 
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="todos">Todos los pedidos</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Esta Semana</option>
          <option value="mes">Este Mes</option>
        </select>
      </div>

      {/* Estadísticas del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-jungle-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jungle-100">Total Gastado</p>
              <p className="text-3xl font-bold">S/ {totalGastado.toFixed(2)}</p>
            </div>
            <Star size={32} className="text-jungle-200" />
          </div>
        </div>

        <div className="card bg-gold-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100">Pedidos Realizados</p>
              <p className="text-3xl font-bold">{pedidosHistorial.length}</p>
            </div>
            <Calendar size={32} className="text-gold-200" />
          </div>
        </div>

        <div className="card bg-earth-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-earth-100">Puntos Acumulados</p>
              <p className="text-3xl font-bold">{Math.floor(totalGastado / 10)}</p>
            </div>
            <Star size={32} className="text-earth-200" />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      {pedidosHistorial.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tienes pedidos en este período</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosHistorial.map((pedido) => (
            <div key={pedido.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-jungle-500 rounded-full flex items-center justify-center text-white font-bold">
                    {pedido.mesaId}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Mesa {pedido.mesaId}</p>
                    <p className="text-sm text-gray-600">
                      {pedido.fechaCreacion.toLocaleDateString()} • {pedido.fechaCreacion.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-jungle-600">S/ {pedido.total.toFixed(2)}</p>
                  <span className="status-badge status-listo">
                    {pedido.estado === 'pagado' ? 'Pagado' : 'Completado'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Items del pedido:</h4>
                  <div className="space-y-2">
                    {pedido.items.map((item: any, index: number) => {
                      const plato = getPlato(item.platoId);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={plato?.imagen}
                            alt={plato?.nombre}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{plato?.nombre}</p>
                            <p className="text-xs text-gray-600">
                              {item.cantidad}x • S/ {item.precio.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Detalles:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de pago:</span>
                      <span className="text-gray-800 capitalize">{pedido.metodoPago}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="text-gray-800">{pedido.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Puntos ganados:</span>
                      <span className="text-gold-600 font-medium">+{Math.floor(pedido.total / 10)}</span>
                    </div>
                  </div>

                  {pedido.observaciones && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-xs text-orange-800">
                        <strong>Observaciones:</strong> {pedido.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => descargarBoleta(pedido.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-jungle-100 text-jungle-700 rounded-lg hover:bg-jungle-200 transition-colors text-sm"
                >
                  <Download size={14} />
                  Descargar Boleta
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors text-sm">
                  <Star size={14} />
                  Calificar Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Programa de fidelidad */}
      <div className="card bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">¡Completa tus datos y gana S/5 de descuento!</h3>
            <p className="text-purple-100 text-sm">
              Únete a nuestro programa de fidelidad y obtén beneficios exclusivos
            </p>
          </div>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
            Completar Datos
          </button>
        </div>
      </div>
    </div>
  );
}