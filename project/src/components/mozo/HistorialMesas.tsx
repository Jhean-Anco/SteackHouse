import React, { useState } from 'react';
import { Calendar, CheckCircle, DollarSign, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function HistorialMesas() {
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const { pedidos, currentUser, platos, ventas } = useApp();

  const getPedidosHistorial = () => {
    const hoy = new Date();
    let fechaInicio: Date;
    
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
      default:
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    }

    return pedidos.filter(p => 
      p.mozoId === currentUser?.id && 
      ['entregado', 'pagado'].includes(p.estado) &&
      p.fechaCreacion >= fechaInicio
    ).sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  };

  const pedidosHistorial = getPedidosHistorial();

  const estadisticas = {
    totalPedidos: pedidosHistorial.length,
    totalVentas: pedidosHistorial.reduce((sum, p) => sum + p.total, 0),
    ticketPromedio: pedidosHistorial.length > 0 
      ? pedidosHistorial.reduce((sum, p) => sum + p.total, 0) / pedidosHistorial.length 
      : 0,
    tiempoPromedio: 25 // Mock - en producción s ería calculado
  };

  const getPlato = (platoId: string) => {
    return platos.find(p => p.id === platoId);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Historial de Mesas</h2>
          <p className="text-gray-600">Revisa tu rendimiento y pedidos completados</p>
        </div>
        
        <select 
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="hoy">Hoy</option>
          <option value="semana">Esta Semana</option>
          <option value="mes">Este Mes</option>
        </select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-jungle-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jungle-100">Pedidos Completados</p>
              <p className="text-3xl font-bold">{estadisticas.totalPedidos}</p>
            </div>
            <CheckCircle size={32} className="text-jungle-200" />
          </div>
        </div>

        <div className="card bg-earth-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-earth-100">Total Ventas</p>
              <p className="text-3xl font-bold">S/ {estadisticas.totalVentas.toFixed(2)}</p>
            </div>
            <DollarSign size={32} className="text-earth-200" />
          </div>
        </div>

        <div className="card bg-gold-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100">Ticket Promedio</p>
              <p className="text-3xl font-bold">S/ {estadisticas.ticketPromedio.toFixed(2)}</p>
            </div>
            <DollarSign size={32} className="text-gold-200" />
          </div>
        </div>

        <div className="card bg-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Tiempo Promedio</p>
              <p className="text-3xl font-bold">{estadisticas.tiempoPromedio} min</p>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Pedidos Completados</h3>
        
        {pedidosHistorial.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No hay pedidos completados en este período</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosHistorial.map((pedido) => (
              <div key={pedido.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-jungle-500 rounded-full flex items-center justify-center text-white font-bold">
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
                    <p className="text-lg font-bold text-jungle-600">S/ {pedido.total.toFixed(2)}</p>
                    <span className={`status-badge ${pedido.estado === 'pagado' ? 'status-listo' : 'bg-blue-100 text-blue-700'}`}>
                      {pedido.estado === 'pagado' ? 'Pagado' : 'Entregado'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Items del pedido:</p>
                    <div className="space-y-1">
                      {pedido.items.map((item, index) => {
                        const plato = getPlato(item.platoId);
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.cantidad}x {plato?.nombre}
                            </span>
                            <span className="text-gray-800">S/ {item.precio.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Detalles:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className="text-gray-800 capitalize">{pedido.metodoPago || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="text-gray-800">{pedido.items.length}</span>
                      </div>
                      {pedido.observaciones && (
                        <div className="mt-2">
                          <span className="text-gray-600">Observaciones:</span>
                          <p className="text-gray-800 text-xs italic">{pedido.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}