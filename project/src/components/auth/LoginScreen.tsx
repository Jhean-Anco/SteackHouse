import React, { useState } from 'react';
import { Shield, User, ChefHat, Smartphone } from 'lucide-react';
import { useApp, UserRole } from '../../contexts/AppContext';

const roleConfig = {
  admin: {
    icon: Shield,
    title: 'Administrador',
    description: 'Supervisión y gestión general',
    color: 'jungle',
    bgImage: 'bg-jungle-leaves'
  },
  mozo: {
    icon: User,
    title: 'Mozo',
    description: 'Atención de mesas y pedidos',
    color: 'earth',
    bgImage: 'bg-natural-wood'
  },
  cocina: {
    icon: ChefHat,
    title: 'Cocina',
    description: 'Preparación de pedidos',
    color: 'gold',
    bgImage: 'bg-jungle-leaves'
  },
  cliente: {
    icon: Smartphone,
    title: 'Cliente',
    description: 'Realizar pedidos desde mesa',
    color: 'jungle',
    bgImage: 'bg-natural-wood'
  }
};

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { setCurrentUser } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLogin = () => {
    // Mock authentication - en producción sería validación real
    const mockUser = {
      id: `${selectedRole}-${Date.now()}`,
      name: selectedRole === 'admin' ? 'Carlos Administrador' : 
            selectedRole === 'mozo' ? 'Ana Mesera' :
            selectedRole === 'cocina' ? 'José Cocinero' : 'Cliente Mesa',
      role: selectedRole!,
      email: credentials.email || `${selectedRole}@steakhouse.pe`
    };
    
    setCurrentUser(mockUser);
  };

  const handleClientAccess = () => {
    // Para clientes, acceso directo sin credenciales
    const clienteUser = {
      id: `cliente-${Date.now()}`,
      name: 'Cliente',
      role: 'cliente' as UserRole,
      email: 'cliente@mesa.com'
    };
    setCurrentUser(clienteUser);
  };

  return (
    <div className="min-h-screen bg-jungle-gradient jungle-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🥩 SteackHouse
          </h1>
          <p className="text-xl text-jungle-100 max-w-2xl mx-auto">
            Plataforma integral para la gestión del restaurante más selvático del Perú
          </p>
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg max-w-md mx-auto">
            <p className="text-jungle-100 text-sm">
              <strong>🔧 Modo Prototipo:</strong> Selecciona cualquier perfil para explorar las funcionalidades. 
              Puedes cambiar entre perfiles usando el botón "Salir\" en cada dashboard.
            </p>
          </div>
        </div>

        {!selectedRole ? (
          /* Role Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(roleConfig).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={role}
                  onClick={() => handleRoleSelect(role as UserRole)}
                  className={`card cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${config.bgImage} bg-cover bg-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="relative z-10 text-center text-white">
                    <div className={`w-16 h-16 bg-${config.color}-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{config.title}</h3>
                    <p className="text-sm opacity-90">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Login Form */
          <div className="max-w-md mx-auto">
            <div className="card bg-white/95 backdrop-blur-sm">
              <div className="text-center mb-6">
                {(() => {
                  const Icon = roleConfig[selectedRole].icon;
                  return (
                    <div className={`w-20 h-20 bg-${roleConfig[selectedRole].color}-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon size={40} className="text-white" />
                    </div>
                  );
                })()}
                <h2 className="text-2xl font-bold text-gray-800">
                  {roleConfig[selectedRole].title}
                </h2>
                <p className="text-gray-600">{roleConfig[selectedRole].description}</p>
              </div>

              {selectedRole === 'cliente' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Escanea el código QR de tu mesa o ingresa directamente
                    </p>
                    <div className="bg-gray-100 p-8 rounded-lg mb-4">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-sm text-gray-500">Código QR</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClientAccess}
                    className="btn-primary w-full"
                  >
                    Acceder como Cliente
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="tu-email@steakhouse.pe"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Iniciar Sesión
                  </button>
                </form>
              )}

              <button
                onClick={() => setSelectedRole(null)}
                className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Cambiar perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}