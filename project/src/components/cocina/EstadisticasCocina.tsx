import React from 'react';
import { Clock, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';

export default function EstadisticasCocina() {
  const { pedidos, platos } = useApp();

  // Estadísticas del día
  const hoy = new Date();
  const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  
  const pedidosHoy = pedidos.filter(p => p.fechaCreacion >= inicioDelDia);
  const pedidosCompletados = pedidosHoy.filter(p => ['listo', 'entregado', 'pagado'].includes(p.estado));
  
  // Mock data para tiempos promedio
  const tiempoPromedio = 18; // minutos
  const eficiencia = 92; // porcentaje

  // Platos más preparados
  const platosMasPreparados = pedidosCompletados
    .flatMap(p => p.items)
    .reduce((acc: any, item) => {
      const plato = platos.find(p => p.id === item.platoId);
      if (plato) {
        acc[plato.id] = (acc[plato.id] || 0) + item.cantidad;
      }
      return acc;
    }, {});

  const topPlatos = Object.entries(platosMasPreparados)
    .map(([platoId, cantidad]) => ({
      plato: platos.find(p => p.id === platoId),
      cantidad: cantidad as number
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Datos para gráfico de rendimiento por hora
  const rendimientoPorHora = Array.from({ length: 12 }, (_, i) => {
    const hora = i + 8; // De 8 AM a 8 PM
    const pedidosHora = pedidosCompletados.filter(p => 
      p.fechaCreacion.getHours() === hora
    ).length;
    
    return {
      hora: `${hora}:00`,
      pedidos: pedidosHora,
      tiempoPromedio: Math.floor(Math.random() * 10) + 15 // Mock data
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Cocina</h2>
        <p className="text-gray-600">Análisis del rendimiento y eficiencia de la cocina</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-jungle-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jungle-100">Pedidos Completados</p>
              <p className="text-3xl font-bold">{pedidosCompletados.length}</p>
              <p className="text-sm text-jungle-200">Hoy</p>
            </div>
            <CheckCircle size={40} className="text-jungle-200" />
          </div>
        </div>

        <div className="card bg-gold-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-100">Tiempo Promedio</p>
              <p className="text-3xl font-bold">{tiempoPromedio}</p>
              <p className="text-sm text-gold-200">minutos</p>
            </div>
            <Clock size={40} className="text-gold-200" />
          </div>
        </div>

        <div className="card bg-earth-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-earth-100">Eficiencia</p>
              <p className="text-3xl font-bold">{eficiencia}%</p>
              <p className="text-sm text-earth-200">del objetivo</p>
            </div>
            <TrendingUp size={40} className="text-earth-200" />
          </div>
        </div>

        <div className="card bg-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pedidos Urgentes</p>
              <p className="text-3xl font-bold">
                {pedidos.filter(p => {
                  const tiempoTranscurrido = (new Date().getTime() - p.fechaCreacion.getTime()) / 1000 / 60;
                  return ['confirmado', 'preparando'].includes(p.estado) && tiempoTranscurrido > 20;
                }).length}
              </p>
              <p className="text-sm text-orange-200">actualmente</p>
            </div>
            <AlertTriangle size={40} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráfico de rendimiento */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Rendimiento por Hora</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rendimientoPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hora" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value, name) => [value, name === 'pedidos' ? 'Pedidos' : 'Tiempo Promedio (min)']}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="pedidos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platos más preparados */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Platos Más Preparados Hoy</h3>
          <div className="space-y-4">
            {topPlatos.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-gold-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-500' : 'bg-jungle-500'
                }`}>
                  {index + 1}
                </div>
                <img
                  src={item.plato?.imagen}
                  alt={item.plato?.nombre}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{item.plato?.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {item.cantidad} preparados • {item.plato?.tiempoPreparacion} min c/u
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-jungle-600">{item.cantidad}</p>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas de calidad */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Métricas de Calidad</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Tiempo Promedio</span>
                <span className="font-bold text-gray-800">{tiempoPromedio} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-jungle-500 h-3 rounded-full" 
                  style={{ width: `${Math.min((25 - tiempoPromedio) / 25 * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Objetivo: menos de 20 min</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Eficiencia</span>
                <span className="font-bold text-gray-800">{eficiencia}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gold-500 h-3 rounded-full" 
                  style={{ width: `${eficiencia}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Objetivo: 90%</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Pedidos a Tiempo</span>
                <span className="font-bold text-gray-800">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-earth-500 h-3 rounded-full" 
                  style={{ width: '87%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Dentro del tiempo estimado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}