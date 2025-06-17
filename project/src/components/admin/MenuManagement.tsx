import React, { useState } from 'react';
import { Plus, Edit, Eye, EyeOff, Trash2, Upload, Save, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function MenuManagement() {
  const { platos, actualizarPlato, agregarPlato, eliminarPlato } = useApp();
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [platoEditando, setPlatoEditando] = useState<any>(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    imagen: '',
    ingredientes: '',
    tiempoPreparacion: 15,
    disponible: true
  });

  const categorias = [...new Set(platos.map(p => p.categoria))];
  const platosFiltrados = filtroCategoria === 'todos' 
    ? platos 
    : platos.filter(p => p.categoria === filtroCategoria);

  const toggleDisponibilidad = (platoId: string, disponible: boolean) => {
    actualizarPlato(platoId, { disponible: !disponible });
  };

  const calcularMargen = (precio: number) => {
    const costoEstimado = precio * 0.35;
    const margen = ((precio - costoEstimado) / precio) * 100;
    return margen.toFixed(1);
  };

  const abrirFormulario = (plato?: any) => {
    if (plato) {
      setPlatoEditando(plato);
      setFormulario({
        nombre: plato.nombre,
        descripcion: plato.descripcion,
        precio: plato.precio,
        categoria: plato.categoria,
        imagen: plato.imagen,
        ingredientes: plato.ingredientes.join(', '),
        tiempoPreparacion: plato.tiempoPreparacion,
        disponible: plato.disponible
      });
    } else {
      setPlatoEditando(null);
      setFormulario({
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria: '',
        imagen: '',
        ingredientes: '',
        tiempoPreparacion: 15,
        disponible: true
      });
    }
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setPlatoEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      imagen: '',
      ingredientes: '',
      tiempoPreparacion: 15,
      disponible: true
    });
  };

  const guardarPlato = () => {
    if (!formulario.nombre || !formulario.descripcion || formulario.precio <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const platoData = {
      nombre: formulario.nombre,
      descripcion: formulario.descripcion,
      precio: formulario.precio,
      categoria: formulario.categoria || 'Otros',
      imagen: formulario.imagen || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      ingredientes: formulario.ingredientes.split(',').map(i => i.trim()).filter(i => i),
      tiempoPreparacion: formulario.tiempoPreparacion,
      disponible: formulario.disponible
    };

    if (platoEditando) {
      actualizarPlato(platoEditando.id, platoData);
    } else {
      agregarPlato(platoData);
    }

    cerrarFormulario();
  };

  const confirmarEliminar = (plato: any) => {
    if (confirm(`¿Estás seguro de eliminar "${plato.nombre}"?`)) {
      eliminarPlato(plato.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Menú</h2>
          <p className="text-gray-600">Administra los platos y recetas del restaurante</p>
        </div>
        <button 
          onClick={() => abrirFormulario()}
          className="btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Nuevo Plato
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Filtrar por categoría:</span>
          <select 
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="todos">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {platosFiltrados.length} platos
            </span>
          </div>
        </div>
      </div>

      {/* Lista de platos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {platosFiltrados.map((plato) => (
          <div key={plato.id} className="card hover:shadow-xl transition-all duration-300">
            <div className="relative">
              <img
                src={plato.imagen}
                alt={plato.nombre}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleDisponibilidad(plato.id, plato.disponible)}
                  className={`p-2 rounded-full ${
                    plato.disponible 
                      ? 'bg-jungle-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {plato.disponible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plato.disponible 
                    ? 'bg-jungle-100 text-jungle-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {plato.disponible ? 'Disponible' : 'Agotado'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">{plato.nombre}</h3>
                <span className="text-xl font-bold text-jungle-600">
                  S/ {plato.precio.toFixed(2)}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {plato.descripcion}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-earth-100 text-earth-700 rounded-full text-xs font-medium">
                  {plato.categoria}
                </span>
                <span className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                  {plato.tiempoPreparacion} min
                </span>
                <span className="px-2 py-1 bg-jungle-100 text-jungle-700 rounded-full text-xs font-medium">
                  {calcularMargen(plato.precio)}% margen
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Ingredientes:</p>
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

              <div className="flex gap-2">
                <button 
                  onClick={() => abrirFormulario(plato)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                  <Upload size={14} />
                </button>
                <button 
                  onClick={() => confirmarEliminar(plato)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {platosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">No hay platos en esta categoría</p>
          <button 
            onClick={() => abrirFormulario()}
            className="btn-primary mt-4"
          >
            Agregar Primer Plato
          </button>
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {platoEditando ? 'Editar Plato' : 'Nuevo Plato'}
                </h3>
                <button
                  onClick={cerrarFormulario}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Plato *
                    </label>
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={(e) => setFormulario(prev => ({ ...prev, nombre: e.target.value }))}
                      className="input-field"
                      placeholder="Ej: Lomo Saltado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={formulario.precio}
                      onChange={(e) => setFormulario(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Describe el plato..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formulario.categoria}
                      onChange={(e) => setFormulario(prev => ({ ...prev, categoria: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Entradas">Entradas</option>
                      <option value="Segundos">Segundos</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Postres">Postres</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de Preparación (min)
                    </label>
                    <input
                      type="number"
                      value={formulario.tiempoPreparacion}
                      onChange={(e) => setFormulario(prev => ({ ...prev, tiempoPreparacion: parseInt(e.target.value) || 15 }))}
                      className="input-field"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={formulario.imagen}
                    onChange={(e) => setFormulario(prev => ({ ...prev, imagen: e.target.value }))}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredientes (separados por comas)
                  </label>
                  <input
                    type="text"
                    value={formulario.ingredientes}
                    onChange={(e) => setFormulario(prev => ({ ...prev, ingredientes: e.target.value }))}
                    className="input-field"
                    placeholder="Carne, papas, cebolla, tomate..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="disponible"
                    checked={formulario.disponible}
                    onChange={(e) => setFormulario(prev => ({ ...prev, disponible: e.target.checked }))}
                    className="w-4 h-4 text-jungle-600 border-gray-300 rounded focus:ring-jungle-500"
                  />
                  <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
                    Plato disponible
                  </label>
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
                  onClick={guardarPlato}
                  className="flex-1 btn-primary"
                >
                  <Save size={16} className="mr-2" />
                  {platoEditando ? 'Actualizar' : 'Crear'} Plato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}