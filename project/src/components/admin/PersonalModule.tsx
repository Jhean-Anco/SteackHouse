import React, { useState } from 'react';
import { Users, Plus, Clock, Star, Calendar, Edit, Save, X, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function PersonalModule() {
  const [vistaActual, setVistaActual] = useState('lista');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<any>(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    rol: 'mozo' as any,
    email: '',
    telefono: '',
    horario: '',
    activo: true
  });

  const { empleados, agregarEmpleado, actualizarEmpleado } = useApp();

  const horarios = [
    { empleado: 'Ana García', lunes: '8:00-16:00', martes: '8:00-16:00', miercoles: '8:00-16:00', jueves: 'Descanso', viernes: '8:00-16:00', sabado: '8:00-16:00', domingo: 'Descanso' },
    { empleado: 'Carlos Mendoza', lunes: '16:00-24:00', martes: '16:00-24:00', miercoles: '16:00-24:00', jueves: '16:00-24:00', viernes: '16:00-24:00', sabado: 'Descanso', domingo: 'Descanso' },
    { empleado: 'José Ramirez', lunes: '8:00-16:00', martes: '8:00-16:00', miercoles: '8:00-16:00', jueves: '8:00-16:00', viernes: 'Descanso', sabado: '8:00-16:00', domingo: '8:00-16:00' },
    { empleado: 'María López', lunes: '16:00-24:00', martes: 'Descanso', miercoles: '16:00-24:00', jueves: '16:00-24:00', viernes: '16:00-24:00', sabado: '16:00-24:00', domingo: '16:00-24:00' }
  ];

  const getEstadoColor = (activo: boolean) => {
    return activo ? 'jungle' : 'red';
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'purple';
      case 'mozo': return 'blue';
      case 'cocina': return 'orange';
      default: return 'gray';
    }
  };

  const abrirFormulario = (empleado?: any) => {
    if (empleado) {
      setEmpleadoEditando(empleado);
      setFormulario({
        nombre: empleado.nombre,
        rol: empleado.rol,
        email: empleado.email,
        telefono: empleado.telefono || '',
        horario: empleado.horario || '',
        activo: empleado.activo
      });
    } else {
      setEmpleadoEditando(null);
      setFormulario({
        nombre: '',
        rol: 'mozo',
        email: '',
        telefono: '',
        horario: '',
        activo: true
      });
    }
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setEmpleadoEditando(null);
  };

  const guardarEmpleado = () => {
    if (!formulario.nombre || !formulario.email) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const empleadoData = {
      ...formulario,
      fechaIngreso: empleadoEditando?.fechaIngreso || new Date()
    };

    if (empleadoEditando) {
      actualizarEmpleado(empleadoEditando.id, empleadoData);
    } else {
      agregarEmpleado(empleadoData);
    }

    cerrarFormulario();
  };

  const toggleEstadoEmpleado = (empleadoId: string, activo: boolean) => {
    actualizarEmpleado(empleadoId, { activo: !activo });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Personal</h2>
          <p className="text-gray-600">Administra empleados, horarios y rendimiento</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setVistaActual('lista')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'lista' 
                  ? 'bg-white text-jungle-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setVistaActual('horarios')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'horarios' 
                  ? 'bg-white text-jungle-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Horarios
            </button>
          </div>
          <button 
            onClick={() => abrirFormulario()}
            className="btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Nuevo Empleado
          </button>
        </div>
      </div>

      {vistaActual === 'lista' ? (
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-jungle-gradient text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-jungle-100">Total Empleados</p>
                  <p className="text-3xl font-bold">{empleados.length}</p>
                </div>
                <Users size={32} className="text-jungle-200" />
              </div>
            </div>

            <div className="card bg-earth-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-earth-100">Activos</p>
                  <p className="text-3xl font-bold">
                    {empleados.filter(e => e.activo).length}
                  </p>
                </div>
                <Clock size={32} className="text-earth-200" />
              </div>
            </div>

            <div className="card bg-gold-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gold-100">Mozos</p>
                  <p className="text-3xl font-bold">
                    {empleados.filter(e => e.rol === 'mozo').length}
                  </p>
                </div>
                <Star size={32} className="text-gold-200" />
              </div>
            </div>

            <div className="card bg-orange-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Cocina</p>
                  <p className="text-3xl font-bold">
                    {empleados.filter(e => e.rol === 'cocina').length}
                  </p>
                </div>
                <Star size={32} className="text-orange-200" />
              </div>
            </div>
          </div>

          {/* Lista de empleados */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {empleados.map((empleado) => (
                <div key={empleado.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-jungle-500 rounded-full flex items-center justify-center text-white font-bold">
                      {empleado.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{empleado.nombre}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getRolColor(empleado.rol)}-100 text-${getRolColor(empleado.rol)}-700`}>
                          {empleado.rol.charAt(0).toUpperCase() + empleado.rol.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getEstadoColor(empleado.activo)}-100 text-${getEstadoColor(empleado.activo)}-700`}>
                          {empleado.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800">{empleado.email}</span>
                    </div>
                    {empleado.telefono && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="text-gray-800">{empleado.telefono}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingreso:</span>
                      <span className="text-gray-800">
                        {empleado.fechaIngreso.toLocaleDateString()}
                      </span>
                    </div>
                    {empleado.horario && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Horario:</span>
                        <span className="text-gray-800">{empleado.horario}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button 
                      onClick={() => abrirFormulario(empleado)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleEstadoEmpleado(empleado.id, empleado.activo)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        empleado.activo 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-jungle-100 text-jungle-600 hover:bg-jungle-200'
                      }`}
                    >
                      {empleado.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Vista de horarios */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Horarios de Trabajo</h3>
            <button className="btn-primary text-sm">
              <Calendar size={16} className="mr-2" />
              Editar Horarios
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Empleado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Lun</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Mar</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Mié</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Jue</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Vie</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Sáb</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Dom</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((horario, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800">{horario.empleado}</span>
                    </td>
                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
                      <td key={dia} className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          horario[dia as keyof typeof horario] === 'Descanso' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-jungle-100 text-jungle-700'
                        }`}>
                          {horario[dia as keyof typeof horario]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
                  {empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado'}
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
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario(prev => ({ ...prev, nombre: e.target.value }))}
                    className="input-field"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formulario.rol}
                      onChange={(e) => setFormulario(prev => ({ ...prev, rol: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="mozo">Mozo</option>
                      <option value="cocina">Cocina</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formulario.activo ? 'activo' : 'inactivo'}
                      onChange={(e) => setFormulario(prev => ({ ...prev, activo: e.target.value === 'activo' }))}
                      className="input-field"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formulario.email}
                    onChange={(e) => setFormulario(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="empleado@steakhouse.pe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario(prev => ({ ...prev, telefono: e.target.value }))}
                    className="input-field"
                    placeholder="987654321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario
                  </label>
                  <select
                    value={formulario.horario}
                    onChange={(e) => setFormulario(prev => ({ ...prev, horario: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Seleccionar horario</option>
                    <option value="Mañana (8:00-16:00)">Mañana (8:00-16:00)</option>
                    <option value="Noche (16:00-24:00)">Noche (16:00-24:00)</option>
                    <option value="Completo (8:00-24:00)">Completo (8:00-24:00)</option>
                    <option value="Medio tiempo">Medio tiempo</option>
                  </select>
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
                  onClick={guardarEmpleado}
                  className="flex-1 btn-primary"
                >
                  <Save size={16} className="mr-2" />
                  {empleadoEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}