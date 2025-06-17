import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';

export default function VentasChart() {
  const { ventas } = useApp();

  // Generar datos de los últimos 7 días
  const generateChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayVentas = ventas.filter(v => 
        v.fecha.toDateString() === date.toDateString()
      );
      
      const total = dayVentas.reduce((sum, v) => sum + v.total, 0);
      
      data.push({
        dia: date.toLocaleDateString('es-PE', { weekday: 'short' }),
        ventas: total,
        fecha: date.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
      });
    }
    
    return data;
  };

  const data = generateChartData();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dia" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `S/ ${value}`}
          />
          <Tooltip 
            formatter={(value) => [`S/ ${value}`, 'Ventas']}
            labelFormatter={(label, payload) => 
              payload?.[0]?.payload?.fecha || label
            }
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="ventas" 
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}