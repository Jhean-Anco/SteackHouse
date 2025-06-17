import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Clock, Plus, Edit, Save, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function InventarioResumen() {
  const { inventario, actualizarInventario, agregarInventario } = useApp();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState<any>(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    categoria: '',
    stock: 0,
    minimo: 0,
    unidad: '',
    precio: 0,
    proveedor: ''
  });

  const disponibles = inventario.filter(i => i.stock > i.minimo);
  const agotados = inventario.filter(i => i.stock === 0);
  const stockBajo = inventario.filter(i => i.stock > 0 && i.stock <= i.minimo);
  
  const getEstadoColor = (item: any) => {
    if (item.stock === 0) return 'red';
    if (item.stock <= item.minimo) return 'orange';
    return 'jungle';
  };

  const getEstadoIcon = (item: any) => {
    if (item.stock === 0) return AlertTriangle;
    if (item.stock <= item.minimo) return Clock;
    return CheckCircle;
  };

  const getEstadoTexto = (item: any) => {
    if (item.stock === 0) return 'Agotado';
    if (item.stock <= item.minimo) return 'Stock Bajo';
    return 'Disponible';
  };

  const abrirFormulario = (item?: any) => {
    if (item) {
      setItemEditando(item);
      setFormulario({
        nombre: item.nombre,
        categoria: item.categoria,
        stock: item.stock,
        minimo: item.minimo,
        unidad: item.unidad,
        precio: item.precio,
        proveedor: item.proveedor || ''
      });
    } else {
      setItemEditando(null);
      setFormulario({
        nombre: '',
        categoria: '',
        stock: 0,
        minimo: 0,
        unidad: '',
        precio: 0,
        proveedor: ''
      });
    }
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setItemEditando(null);
  };

  const guardarItem = () => {
    if (!formulario.nombre || !formulario.categoria || !formulario.unidad) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (itemEditando) {
      actualizarInventario(itemEditando.id, formulario);
    } else {
      agregarInventario(formulario);
    }

    cerrarFormulario();
  };

  const actualizarStock = (itemId: string, nuevoStock: number) => {
    if (nuevoStock < 0) return;
    actualizarInventario(itemId, { stock: nuevoStock });
  };

  return (
    <div className="space-y-8">
      {/* Resumen de stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-jungle-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jungle-100">Productos Disponibles</p>
              <p className="text-3xl font-bold">{disponibles.length}</p>
            </div>
            <CheckCircle size={40} className="text-jungle-200" />
          </div>
        </div>

        <div className="card bg-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Stock Bajo</p>
              <p className="text-3xl font-bold">{stockBajo.length}</p>
            </div>
            <Clock size={40} className="text-orange-200" />
          </div>
        </div>

        <div className="card bg-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Productos Agotados</p>
              <p className="text-3xl font-bold">{agotados.length}</p>
            </div>
            <AlertTriangle size={40} className="text-red-200" />
          </div>
        </div>

        <div className="card bg-earth-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-earth-100">Total Items</p>
              <p className="text-3xl font-bold">{inventario.length}</p>
            </div>
            <Package size={40} className="text-earth-200" />
          </div>
        </div>
      </div>

      {/* Inventario detallado */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Inventario Detallado</h3>
          <button 
            onClick={() => abrirFormulario()}
            className="btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Agregar Producto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock Actual</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock Mínimo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Precio/Unidad</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => {
                const Icon = getEstadoIcon(item);
                const colorClass = getEstadoColor(item);
                
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{item.nombre}</div>
                      <div className="text-sm text-gray-500">{item.unidad}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.categoria}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => actualizarStock(item.id, item.stock - 1)}
                          className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300 text-sm"
                        >
                          -
                        </button>
                        <span className={`font-bold px-2 ${item.stock <= item.minimo ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.stock}
                        </span>
                        <button
                          onClick={() => actualizarStock(item.id, item.stock + 1)}
                          className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.minimo}</td>
                    <td className="py-3 px-4 text-center text-gray-600">S/ {item.precio.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${colorClass}-100 text-${colorClass}-700`}>
                        <Icon size={14} />
                        <span>{getEstadoTexto(item)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => abrirFormulario(item)}
                        className="text-jungle-600 hover:text-jungle-700 font-medium text-sm"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas críticas */}
      {(agotados.length > 0 || stockBajo.length > 0) && (
        <div className="card bg-red-50 border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Alertas de Inventario
          </h3>
          <div className="space-y-3">
            {[...agotados, ...stockBajo].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{item.nombre}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {item.stock === 0 ? 'Sin stock' : `Solo ${item.stock} ${item.unidad}`}
                  </span>
                </div>
                <button 
                  onClick={() => actualizarStock(item.id, item.minimo + 10)}
                  className="btn-gold text-sm py-2 px-4"
                >
                  Reabastecer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {itemEditando ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={cerrarFormulario}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario(prev => ({ ...prev, nombre: e.target.value }))}
                    className="input-field"
                    placeholder="Ej: Carne de Res"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formulario.categoria}
                      onChange={(e) => setFormulario(prev => ({ ...prev, categoria: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Proteínas">Proteínas</option>
                      <option value="Verduras">Verduras</option>
                      <option value="Cereales">Cereales</option>
                      <option value="Condimentos">Condimentos</option>
                      <option value="Frutas">Frutas</option>
                      <option value="Lácteos">Lácteos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad *
                    </label>
                    <select
                      value={formulario.unidad}
                      onChange={(e) => setFormulario(prev => ({ ...prev, unidad: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Seleccionar</option>
                      <option value="kg">Kilogramos</option>
                      <option value="lt">Litros</option>
                      <option value="unidad">Unidades</option>
                      <option value="paquete">Paquetes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      value={formulario.stock}
                      onChange={(e) => setFormulario(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      value={formulario.minimo}
                      onChange={(e) => setFormulario(prev => ({ ...prev, minimo: parseInt(e.target.value) || 0 }))}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Unidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formulario.precio}
                    onChange={(e) => setFormulario(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor (opcional)
                  </label>
                  <input
                    type="text"
                    value={formulario.proveedor}
                    onChange={(e) => setFormulario(prev => ({ ...prev, proveedor: e.target.value }))}
                    className="input-field"
                    placeholder="Nombre del proveedor"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={cerrarFormulario}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarItem}
                  className="flex-1 btn-primary"
                >
                  <Save size={16} className="mr-2" />
                  {itemEditando ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}