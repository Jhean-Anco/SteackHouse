import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, CreditCard } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function CajaModule() {
  const [selectedPeriod, setSelectedPeriod] = useState('hoy');
  const { ventas } = useApp();

  // Calcular estadísticas
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const ventasHoy = ventas.filter(v => v.fecha >= startOfDay);
  const ingresosDia = ventasHoy.reduce((sum, v) => sum + v.total, 0);
  
  // Mock data para egresos y balance
  const egresosHoy = 850.50; // Sueldos, compras, etc.
  const balanceNeto = ingresosDia - egresosHoy;

  const metodosPago = [
    { metodo: 'Efectivo', cantidad: ventasHoy.filter(v => v.metodoPago === 'efectivo').length, total: 420.50 },
    { metodo: 'Yape', cantidad: ventasHoy.filter(v => v.metodoPago === 'yape').length, total: 680.30 },
    { metodo: 'Transferencia', cantidad: ventasHoy.filter(v => v.metodoPago === 'transferencia').length, total: 250.00 },
    { metodo: 'Tarjeta', cantidad: ventasHoy.filter(v => v.metodoPago === 'tarjeta').length, total: 180.90 },
  ];

  const transacciones = [
    { id: 1, tipo: 'ingreso', concepto: 'Venta Mesa 3', monto: 85.50, fecha: '10:30 AM', metodo: 'Yape' },
    { id: 2, tipo: 'egreso', concepto: 'Compra ingredientes', monto: -120.00, fecha: '09:15 AM', metodo: 'Efectivo' },
    { id: 3, tipo: 'ingreso', concepto: 'Venta Mesa 1', monto: 45.90, fecha: '09:45 AM', metodo: 'Efectivo' },
    { id: 4, tipo: 'egreso', concepto: 'Pago servicios', monto: -180.00, fecha: '08:30 AM', metodo: 'Transferencia' },
    { id: 5, tipo: 'ingreso', concepto: 'Venta Mesa 5', monto: 95.20, fecha: '11:15 AM', metodo: 'Tarjeta' },
  ];

  return (
    <div className="space-y-8">
      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-jungle-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jungle-100">Ingresos Hoy</p>
              <p className="text-3xl font-bold">S/ {ingresosDia.toFixed(2)}</p>
            </div>
            <TrendingUp size={40} className="text-jungle-200" />
          </div>
        </div>

        <div className="card bg-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Egresos Hoy</p>
              <p className="text-3xl font-bold">S/ {egresosHoy.toFixed(2)}</p>
            </div>
            <TrendingDown size={40} className="text-red-200" />
          </div>
        </div>

        <div className={`card ${balanceNeto >= 0 ? 'bg-jungle-gradient' : 'bg-red-500'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={balanceNeto >= 0 ? 'text-jungle-100' : 'text-red-100'}>Balance Neto</p>
              <p className="text-3xl font-bold">S/ {balanceNeto.toFixed(2)}</p>
            </div>
            <DollarSign size={40} className={balanceNeto >= 0 ? 'text-jungle-200' : 'text-red-200'} />
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Métodos de Pago - Hoy</h3>
          <div className="flex gap-2">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field text-sm"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
            </select>
            <button className="btn-primary">
              <Download size={16} className="mr-2" />
              Exportar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metodosPago.map((metodo, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard size={20} className="text-gray-600" />
                <span className="font-medium text-gray-800">{metodo.metodo}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-800">S/ {metodo.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{metodo.cantidad} transacciones</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de transacciones */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Últimas Transacciones</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Concepto</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Método</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Monto</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Hora</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((transaccion) => (
                <tr key={transaccion.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">{transaccion.concepto}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {transaccion.metodo}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${transaccion.monto >= 0 ? 'text-jungle-600' : 'text-red-600'}`}>
                      S/ {Math.abs(transaccion.monto).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {transaccion.fecha}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      transaccion.tipo === 'ingreso' 
                        ? 'bg-jungle-100 text-jungle-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaccion.tipo === 'ingreso' ? '↗ Ingreso' : '↘ Egreso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}