import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useApp } from '../../contexts/AppContext';

export default function ReportesModule() {
  const [tipoReporte, setTipoReporte] = useState('ventas');
  const [periodo, setPeriodo] = useState('semana');
  const { ventas, pedidos, platos, exportarReporte } = useApp();

  // Procesar datos para gráficos
  const ventasPorDia = (() => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const hoy = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      
      const ventasDia = ventas.filter(v => 
        v.fecha.toDateString() === fecha.toDateString()
      );
      
      data.push({
        dia: dias[fecha.getDay()],
        ventas: ventasDia.reduce((sum, v) => sum + v.total, 0),
        pedidos: ventasDia.length,
        fecha: fecha.toLocaleDateString()
      });
    }
    
    return data;
  })();

  const platosMasVendidos = (() => {
    const conteo: { [key: string]: { cantidad: number, ingresos: number, plato: any } } = {};
    
    pedidos.forEach(pedido => {
      pedido.items.forEach(item => {
        const plato = platos.find(p => p.id === item.platoId);
        if (plato) {
          if (!conteo[plato.id]) {
            conteo[plato.id] = { cantidad: 0, ingresos: 0, plato };
          }
          conteo[plato.id].cantidad += item.cantidad;
          conteo[plato.id].ingresos += item.precio;
        }
      });
    });

    return Object.values(conteo)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  })();

  const ventasPorCategoria = (() => {
    const categorias: { [key: string]: number } = {};
    
    pedidos.forEach(pedido => {
      pedido.items.forEach(item => {
        const plato = platos.find(p => p.id === item.platoId);
        if (plato) {
          categorias[plato.categoria] = (categorias[plato.categoria] || 0) + item.precio;
        }
      });
    });

    const total = Object.values(categorias).reduce((sum, val) => sum + val, 0);
    const colores = ['#22c55e', '#a0923a', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return Object.entries(categorias).map(([name, value], index) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colores[index % colores.length],
      monto: value
    }));
  })();

  const estadisticasGenerales = (() => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const ventasSemana = ventas.filter(v => v.fecha >= inicioSemana);
    const pedidosSemana = pedidos.filter(p => p.fechaCreacion >= inicioSemana);
    
    return {
      ventasTotal: ventasSemana.reduce((sum, v) => sum + v.total, 0),
      pedidosTotal: pedidosSemana.length,
      ticketPromedio: ventasSemana.length > 0 
        ? ventasSemana.reduce((sum, v) => sum + v.total, 0) / ventasSemana.length 
        : 0,
      crecimiento: 15 // Mock - en producción sería calculado
    };
  })();

  const handleExportar = () => {
    const filtros = {
      tipo: tipoReporte,
      periodo,
      fecha: new Date()
    };
    exportarReporte(tipoReporte, filtros);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reportes Visuales</h2>
          <p className="text-gray-600">Análisis detallado del rendimiento del restaurante</p>
        </div>
        <button onClick={handleExportar} className="btn-primary">
          <Download size={16} className="mr-2" />
          Exportar Reporte
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select 
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="input-field"
            >
              <option value="ventas">Ventas</option>
              <option value="platos">Platos Más Vendidos</option>
              <option value="categorias">Ventas por Categoría</option>
              <option value="general">Resumen General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select 
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="input-field"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="trimestre">Trimestre</option>
            </select>
          </div>

          <div className="ml-auto">
            <Calendar size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      {tipoReporte === 'ventas' && (
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-jungle-gradient text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-jungle-100">Ventas Totales</p>
                  <p className="text-3xl font-bold">S/ {estadisticasGenerales.ventasTotal.toFixed(2)}</p>
                  <p className="text-sm text-jungle-200">+{estadisticasGenerales.crecimiento}% vs anterior</p>
                </div>
                <DollarSign size={40} className="text-jungle-200" />
              </div>
            </div>

            <div className="card bg-earth-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-earth-100">Pedidos Totales</p>
                  <p className="text-3xl font-bold">{estadisticasGenerales.pedidosTotal}</p>
                  <p className="text-sm text-earth-200">+8% vs anterior</p>
                </div>
                <TrendingUp size={40} className="text-earth-200" />
              </div>
            </div>

            <div className="card bg-gold-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gold-100">Ticket Promedio</p>
                  <p className="text-3xl font-bold">S/ {estadisticasGenerales.ticketPromedio.toFixed(2)}</p>
                  <p className="text-sm text-gold-200">+5% vs anterior</p>
                </div>
                <Users size={40} className="text-gold-200" />
              </div>
            </div>

            <div className="card bg-purple-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Eficiencia</p>
                  <p className="text-3xl font-bold">92%</p>
                  <p className="text-sm text-purple-200">Objetivo: 90%</p>
                </div>
                <TrendingUp size={40} className="text-purple-200" />
              </div>
            </div>
          </div>

          {/* Gráfico de ventas */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Ventas por Día</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `S/ ${value}`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'ventas' ? `S/ ${value}` : value,
                      name === 'ventas' ? 'Ventas' : 'Pedidos'
                    ]}
                    labelFormatter={(label, payload) => 
                      payload?.[0]?.payload?.fecha || label
                    }
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="ventas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tipoReporte === 'platos' && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Platos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ranking</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plato</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Ingresos</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {platosMasVendidos.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-gold-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-jungle-500'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.plato.imagen}
                          alt={item.plato.nombre}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{item.plato.nombre}</p>
                          <p className="text-sm text-gray-500">{item.plato.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-jungle-600">{item.cantidad}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">S/ {item.ingresos.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-jungle-500 h-2 rounded-full" 
                          style={{ width: `${(item.cantidad / platosMasVendidos[0]?.cantidad || 1) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tipoReporte === 'categorias' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Distribución por Categoría</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ventasPorCategoria}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {ventasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Detalles por Categoría</h3>
            <div className="space-y-4">
              {ventasPorCategoria.map((categoria, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: categoria.color }}
                    ></div>
                    <span className="font-medium text-gray-800">{categoria.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{categoria.value}%</p>
                    <p className="text-sm text-gray-500">S/ {categoria.monto.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tipoReporte === 'general' && (
        <div className="space-y-8">
          {/* Resumen ejecutivo */}
          <div className="card bg-gradient-to-r from-jungle-500 to-earth-500 text-white">
            <h3 className="text-xl font-bold mb-4">Resumen Ejecutivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-jungle-100">Rendimiento General</p>
                <p className="text-3xl font-bold">Excelente</p>
                <p className="text-sm text-jungle-200">Todos los KPIs en verde</p>
              </div>
              <div>
                <p className="text-jungle-100">Tendencia</p>
                <p className="text-3xl font-bold">↗ +15%</p>
                <p className="text-sm text-jungle-200">Crecimiento sostenido</p>
              </div>
              <div>
                <p className="text-jungle-100">Recomendación</p>
                <p className="text-lg font-bold">Mantener estrategia</p>
                <p className="text-sm text-jungle-200">Optimizar inventario</p>
              </div>
            </div>
          </div>

          {/* Métricas clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Indicadores Financieros</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ingresos Totales</span>
                  <span className="font-bold text-jungle-600">S/ {estadisticasGenerales.ventasTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Margen Promedio</span>
                  <span className="font-bold text-gold-600">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ROI</span>
                  <span className="font-bold text-earth-600">23%</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Indicadores Operativos</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tiempo Promedio Cocina</span>
                  <span className="font-bold text-orange-600">18 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Satisfacción Cliente</span>
                  <span className="font-bold text-jungle-600">4.8/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Eficiencia Personal</span>
                  <span className="font-bold text-gold-600">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}