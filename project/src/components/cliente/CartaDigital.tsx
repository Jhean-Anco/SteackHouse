import React, { useState } from 'react';
import { Plus, Clock, Star, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface CartaDigitalProps {
  onAgregarAlCarrito: (plato: any, cantidad: number, observaciones?: string) => void;
}

export default function CartaDigital({ onAgregarAlCarrito }: CartaDigitalProps) {
  const { platos } = useApp();
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [platoSeleccionado, setPlatoSeleccionado] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [observaciones, setObservaciones] = useState('');

  const categorias = ['todos', ...new Set(platos.map(p => p.categoria))];
  
  const platosFiltrados = platos.filter(plato => {
    const coincideBusqueda = plato.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            plato.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === 'todos' || plato.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria && plato.disponible;
  });

  const abrirModal = (plato: any) => {
    setPlatoSeleccionado(plato);
    setCantidad(1);
    setObservaciones('');
  };

  const cerrarModal = () => {
    setPlatoSeleccionado(null);
    setCantidad(1);
    setObservaciones('');
  };

  const confirmarAgregar = () => {
    if (platoSeleccionado) {
      onAgregarAlCarrito(platoSeleccionado, cantidad, observaciones);
      cerrarModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar platos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-jungle-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jungle-500 focus:border-transparent"
        />
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => setCategoriaActiva(categoria)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              categoriaActiva === categoria
                ? 'bg-jungle-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-jungle-300'
            }`}
          >
            {categoria === 'todos' ? 'Todos' : categoria}
          </button>
        ))}
      </div>

      {/* Grid de platos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platosFiltrados.map((plato) => (
          <div key={plato.id} className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div onClick={() => abrirModal(plato)}>
              <img
                src={plato.imagen}
                alt={plato.nombre}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{plato.nombre}</h3>
                  <span className="text-xl font-bold text-jungle-600">
                    S/ {plato.precio.toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">{plato.descripcion}</p>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-earth-100 text-earth-700 rounded-full text-xs font-medium">
                    {plato.categoria}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{plato.tiempoPreparacion} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">4.8</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {plato.ingredientes.slice(0, 3).map((ingrediente, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {ingrediente}
                    </span>
                  ))}
                  {plato.ingredientes.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{plato.ingredientes.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => abrirModal(plato)}
              className="w-full btn-primary mt-4"
            >
              <Plus size={16} className="mr-2" />
              Agregar al Carrito
            </button>
          </div>
        ))}
      </div>

      {platosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">No se encontraron platos con esos criterios</p>
        </div>
      )}

      {/* Modal de detalle del plato */}
      {platoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={platoSeleccionado.imagen}
                alt={platoSeleccionado.nombre}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                onClick={cerrarModal}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-800">{platoSeleccionado.nombre}</h2>
                <span className="text-2xl font-bold text-jungle-600">
                  S/ {platoSeleccionado.precio.toFixed(2)}
                </span>
              </div>

              <p className="text-gray-600">{platoSeleccionado.descripcion}</p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{platoSeleccionado.tiempoPreparacion} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.8 (125 reseñas)</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Ingredientes:</h4>
                <div className="flex flex-wrap gap-2">
                  {platoSeleccionado.ingredientes.map((ingrediente: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-jungle-100 text-jungle-700 rounded-full text-sm">
                      {ingrediente}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Sin cebolla, término medio, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jungle-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={cerrarModal}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAgregar}
                  className="flex-1 btn-primary"
                >
                  Agregar S/ {(platoSeleccionado.precio * cantidad).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}