import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'mozo' | 'cocina' | 'cliente';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'limpieza';
  clienteId?: string;
  mozoId?: string;
  pedidoActivo?: string;
}

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  disponible: boolean;
  ingredientes: string[];
  tiempoPreparacion: number;
}

export interface PedidoItem {
  platoId: string;
  cantidad: number;
  observaciones?: string;
  precio: number;
  estadoCocina?: 'pendiente' | 'preparando' | 'listo';
}

export interface Pedido {
  id: string;
  mesaId: number;
  clienteId: string;
  mozoId?: string;
  items: PedidoItem[];
  total: number;
  estado: 'nuevo' | 'confirmado' | 'preparando' | 'listo' | 'mozo_en_camino' | 'entregado' | 'pagado';
  metodoPago?: 'yape' | 'transferencia' | 'efectivo' | 'tarjeta';
  pagoValidado?: boolean;
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Venta {
  id: string;
  pedidoId: string;
  total: number;
  metodoPago: string;
  fecha: Date;
}

export interface Notificacion {
  id: string;
  tipo: 'nuevo_pedido' | 'pedido_listo' | 'pago_pendiente' | 'mozo_en_camino' | 'pedido_entregado';
  mensaje: string;
  pedidoId?: string;
  mesaId?: number;
  destinatario: UserRole;
  timestamp: Date;
  leida: boolean;
}

export interface InventarioItem {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  unidad: string;
  precio: number;
  proveedor?: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  rol: UserRole;
  email: string;
  telefono?: string;
  fechaIngreso: Date;
  activo: boolean;
  horario?: string;
}

interface AppContextType {
  // Usuario actual
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Mesas
  mesas: Mesa[];
  actualizarMesa: (mesaId: number, datos: Partial<Mesa>) => void;
  
  // Platos
  platos: Plato[];
  actualizarPlato: (platoId: string, datos: Partial<Plato>) => void;
  agregarPlato: (plato: Omit<Plato, 'id'>) => void;
  eliminarPlato: (platoId: string) => void;
  
  // Pedidos
  pedidos: Pedido[];
  crearPedido: (pedido: Omit<Pedido, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => string;
  actualizarPedido: (pedidoId: string, datos: Partial<Pedido>) => void;
  actualizarItemPedido: (pedidoId: string, itemIndex: number, datos: Partial<PedidoItem>) => void;
  validarPago: (pedidoId: string) => void;
  
  // Ventas
  ventas: Venta[];
  registrarVenta: (venta: Omit<Venta, 'id'>) => void;
  
  // Inventario
  inventario: InventarioItem[];
  actualizarInventario: (itemId: string, datos: Partial<InventarioItem>) => void;
  agregarInventario: (item: Omit<InventarioItem, 'id'>) => void;
  
  // Empleados
  empleados: Empleado[];
  agregarEmpleado: (empleado: Omit<Empleado, 'id'>) => void;
  actualizarEmpleado: (empleadoId: string, datos: Partial<Empleado>) => void;
  
  // Notificaciones en tiempo real
  notificaciones: Notificacion[];
  agregarNotificacion: (notificacion: Omit<Notificacion, 'id' | 'timestamp' | 'leida'>) => void;
  marcarNotificacionLeida: (notificacionId: string) => void;
  
  // Mesa actual (para clientes)
  mesaActual: number | null;
  setMesaActual: (mesa: number | null) => void;
  
  // Funciones de utilidad
  obtenerEstadisticas: () => any;
  exportarReporte: (tipo: string, filtros: any) => void;
  limpiarNotificaciones: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Datos mock iniciales expandidos
const mesasIniciales: Mesa[] = [
  { id: 1, numero: 1, capacidad: 4, estado: 'libre' },
  { id: 2, numero: 2, capacidad: 2, estado: 'ocupada', clienteId: 'cliente1', mozoId: 'mozo1' },
  { id: 3, numero: 3, capacidad: 6, estado: 'libre' },
  { id: 4, numero: 4, capacidad: 4, estado: 'reservada' },
  { id: 5, numero: 5, capacidad: 8, estado: 'libre' },
  { id: 6, numero: 6, capacidad: 2, estado: 'ocupada', clienteId: 'cliente2', mozoId: 'mozo2' },
];

const platosIniciales: Plato[] = [
  {
    id: '1',
    nombre: 'Lomo Saltado',
    descripcion: 'Clásico peruano con carne de res, papas fritas y arroz',
    precio: 32.90,
    categoria: 'Segundos',
    imagen: 'https://images.pexels.com/photos/8705814/pexels-photo-8705814.jpeg?auto=compress&cs=tinysrgb&w=400',
    disponible: true,
    ingredientes: ['Carne de res', 'Papas', 'Cebolla', 'Tomate', 'Arroz'],
    tiempoPreparacion: 15
  },
  {
    id: '2',
    nombre: 'Ají de Gallina',
    descripcion: 'Pollo deshilachado en crema de ají amarillo',
    precio: 28.90,
    categoria: 'Segundos',
    imagen: 'https://images.pexels.com/photos/9609866/pexels-photo-9609866.jpeg?auto=compress&cs=tinysrgb&w=400',
    disponible: true,
    ingredientes: ['Pollo', 'Ají amarillo', 'Pan', 'Leche', 'Nueces'],
    tiempoPreparacion: 20
  },
  {
    id: '3',
    nombre: 'Anticuchos',
    descripcion: 'Brochetas de corazón de res a la parrilla',
    precio: 18.90,
    categoria: 'Entradas',
    imagen: 'https://images.pexels.com/photos/12737774/pexels-photo-12737774.jpeg?auto=compress&cs=tinysrgb&w=400',
    disponible: true,
    ingredientes: ['Corazón de res', 'Ají panca', 'Comino', 'Vinagre'],
    tiempoPreparacion: 12
  },
  {
    id: '4',
    nombre: 'Ceviche Mixto',
    descripcion: 'Pescado y mariscos frescos en leche de tigre',
    precio: 35.90,
    categoria: 'Entradas',
    imagen: 'https://images.pexels.com/photos/11265842/pexels-photo-11265842.jpeg?auto=compress&cs=tinysrgb&w=400',
    disponible: true,
    ingredientes: ['Pescado', 'Camarones', 'Limón', 'Cebolla', 'Ají'],
    tiempoPreparacion: 10
  },
  {
    id: '5',
    nombre: 'Chicha Morada',
    descripcion: 'Bebida tradicional peruana refrescante',
    precio: 8.90,
    categoria: 'Bebidas',
    imagen: 'https://images.pexels.com/photos/7525104/pexels-photo-7525104.jpeg?auto=compress&cs=tinysrgb&w=400',
    disponible: true,
    ingredientes: ['Maíz morado', 'Piña', 'Canela', 'Clavo'],
    tiempoPreparacion: 5
  },
  {
    id: '6',
    nombre: 'Pisco Sour',
    descripcion: 'Cóctel bandera del Perú',
    precio: 15.90,
    categoria: 'Bebidas',
    imagen: 'https://images.pexels.com/photos/5531265/pexels-photo-5531265.jpeg?auto=compress&cs=tinysrgb&w=400',
    disponible: true,
    ingredientes: ['Pisco', 'Limón', 'Clara de huevo', 'Jarabe'],
    tiempoPreparacion: 3
  }
];

const inventarioInicial: InventarioItem[] = [
  { id: '1', nombre: 'Carne de Res', categoria: 'Proteínas', stock: 25, minimo: 10, unidad: 'kg', precio: 35.00 },
  { id: '2', nombre: 'Pollo', categoria: 'Proteínas', stock: 8, minimo: 15, unidad: 'kg', precio: 12.00 },
  { id: '3', nombre: 'Papas', categoria: 'Verduras', stock: 2, minimo: 20, unidad: 'kg', precio: 3.50 },
  { id: '4', nombre: 'Arroz', categoria: 'Cereales', stock: 50, minimo: 10, unidad: 'kg', precio: 4.20 },
  { id: '5', nombre: 'Ají Amarillo', categoria: 'Condimentos', stock: 12, minimo: 5, unidad: 'kg', precio: 8.00 },
  { id: '6', nombre: 'Limones', categoria: 'Frutas', stock: 0, minimo: 30, unidad: 'kg', precio: 2.50 },
];

const empleadosIniciales: Empleado[] = [
  {
    id: '1',
    nombre: 'Ana García',
    rol: 'mozo',
    email: 'ana@steakhouse.pe',
    telefono: '987654321',
    fechaIngreso: new Date('2023-01-15'),
    activo: true,
    horario: 'Mañana (8:00-16:00)'
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    rol: 'mozo',
    email: 'carlos@steakhouse.pe',
    telefono: '987654322',
    fechaIngreso: new Date('2023-02-01'),
    activo: true,
    horario: 'Noche (16:00-24:00)'
  },
  {
    id: '3',
    nombre: 'José Ramirez',
    rol: 'cocina',
    email: 'jose@steakhouse.pe',
    telefono: '987654323',
    fechaIngreso: new Date('2022-11-10'),
    activo: true,
    horario: 'Mañana (8:00-16:00)'
  },
  {
    id: '4',
    nombre: 'María López',
    rol: 'cocina',
    email: 'maria@steakhouse.pe',
    telefono: '987654324',
    fechaIngreso: new Date('2023-03-20'),
    activo: true,
    horario: 'Noche (16:00-24:00)'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>(mesasIniciales);
  const [platos, setPlatos] = useState<Plato[]>(platosIniciales);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>(inventarioInicial);
  const [empleados, setEmpleados] = useState<Empleado[]>(empleadosIniciales);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mesaActual, setMesaActual] = useState<number | null>(null);

  // Generar datos de ventas mock para demostración
  useEffect(() => {
    if (ventas.length === 0) {
      const ventasMock: Venta[] = [];
      for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        
        const numVentas = Math.floor(Math.random() * 15) + 5;
        for (let j = 0; j < numVentas; j++) {
          ventasMock.push({
            id: `venta-${i}-${j}`,
            pedidoId: `pedido-${i}-${j}`,
            total: Math.floor(Math.random() * 100) + 20,
            metodoPago: ['yape', 'efectivo', 'tarjeta', 'transferencia'][Math.floor(Math.random() * 4)],
            fecha: new Date(fecha.getTime() + Math.random() * 24 * 60 * 60 * 1000)
          });
        }
      }
      setVentas(ventasMock);
    }
  }, [ventas.length]);

  const actualizarMesa = (mesaId: number, datos: Partial<Mesa>) => {
    setMesas(prev => prev.map(mesa => 
      mesa.id === mesaId ? { ...mesa, ...datos } : mesa
    ));
  };

  const actualizarPlato = (platoId: string, datos: Partial<Plato>) => {
    setPlatos(prev => prev.map(plato => 
      plato.id === platoId ? { ...plato, ...datos } : plato
    ));
  };

  const agregarPlato = (platoData: Omit<Plato, 'id'>) => {
    const nuevoPlato: Plato = {
      ...platoData,
      id: `plato-${Date.now()}`
    };
    setPlatos(prev => [...prev, nuevoPlato]);
  };

  const eliminarPlato = (platoId: string) => {
    setPlatos(prev => prev.filter(plato => plato.id !== platoId));
  };

  const actualizarInventario = (itemId: string, datos: Partial<InventarioItem>) => {
    setInventario(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...datos } : item
    ));
  };

  const agregarInventario = (itemData: Omit<InventarioItem, 'id'>) => {
    const nuevoItem: InventarioItem = {
      ...itemData,
      id: `inv-${Date.now()}`
    };
    setInventario(prev => [...prev, nuevoItem]);
  };

  const agregarEmpleado = (empleadoData: Omit<Empleado, 'id'>) => {
    const nuevoEmpleado: Empleado = {
      ...empleadoData,
      id: `emp-${Date.now()}`
    };
    setEmpleados(prev => [...prev, nuevoEmpleado]);
  };

  const actualizarEmpleado = (empleadoId: string, datos: Partial<Empleado>) => {
    setEmpleados(prev => prev.map(emp => 
      emp.id === empleadoId ? { ...emp, ...datos } : emp
    ));
  };

  const crearPedido = (pedidoData: Omit<Pedido, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): string => {
    const nuevoPedido: Pedido = {
      ...pedidoData,
      id: `pedido-${Date.now()}`,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      items: pedidoData.items.map(item => ({
        ...item,
        estadoCocina: 'pendiente'
      })),
      pagoValidado: pedidoData.metodoPago !== 'efectivo'
    };
    
    setPedidos(prev => [...prev, nuevoPedido]);
    
    // Actualizar estado de la mesa
    actualizarMesa(pedidoData.mesaId, { 
      estado: 'ocupada',
      pedidoActivo: nuevoPedido.id
    });

    // Asignar mozo automáticamente si no hay uno
    const mesa = mesas.find(m => m.id === pedidoData.mesaId);
    if (!mesa?.mozoId) {
      const mozoDisponible = empleados.find(e => e.rol === 'mozo' && e.activo);
      if (mozoDisponible) {
        actualizarMesa(pedidoData.mesaId, { mozoId: mozoDisponible.id });
        nuevoPedido.mozoId = mozoDisponible.id;
      }
    }

    // Notificar a cocina
    agregarNotificacion({
      tipo: 'nuevo_pedido',
      mensaje: `Nuevo pedido en Mesa ${pedidoData.mesaId} - ${nuevoPedido.items.length} items`,
      pedidoId: nuevoPedido.id,
      mesaId: pedidoData.mesaId,
      destinatario: 'cocina'
    });

    // Notificar al mozo
    agregarNotificacion({
      tipo: 'nuevo_pedido',
      mensaje: `Pedido recibido de Mesa ${pedidoData.mesaId} - Total: S/ ${nuevoPedido.total.toFixed(2)}`,
      pedidoId: nuevoPedido.id,
      mesaId: pedidoData.mesaId,
      destinatario: 'mozo'
    });

    // Si es pago en efectivo, notificar al mozo para validación
    if (pedidoData.metodoPago === 'efectivo') {
      agregarNotificacion({
        tipo: 'pago_pendiente',
        mensaje: `Mesa ${pedidoData.mesaId} desea pagar en efectivo - Total: S/ ${nuevoPedido.total.toFixed(2)}`,
        pedidoId: nuevoPedido.id,
        mesaId: pedidoData.mesaId,
        destinatario: 'mozo'
      });
    }

    return nuevoPedido.id;
  };

  const actualizarPedido = (pedidoId: string, datos: Partial<Pedido>) => {
    setPedidos(prev => prev.map(pedido => {
      if (pedido.id === pedidoId) {
        const pedidoActualizado = { ...pedido, ...datos, fechaActualizacion: new Date() };
        
        // Notificaciones según el estado
        if (datos.estado === 'listo') {
          agregarNotificacion({
            tipo: 'pedido_listo',
            mensaje: `Pedido de Mesa ${pedido.mesaId} está listo para entregar`,
            pedidoId,
            mesaId: pedido.mesaId,
            destinatario: 'mozo'
          });
        }
        
        if (datos.estado === 'mozo_en_camino') {
          agregarNotificacion({
            tipo: 'mozo_en_camino',
            mensaje: `Tu mozo está en camino a Mesa ${pedido.mesaId}`,
            pedidoId,
            mesaId: pedido.mesaId,
            destinatario: 'cliente'
          });
        }
        
        if (datos.estado === 'entregado') {
          agregarNotificacion({
            tipo: 'pedido_entregado',
            mensaje: `Pedido entregado en Mesa ${pedido.mesaId}. ¡Buen provecho!`,
            pedidoId,
            mesaId: pedido.mesaId,
            destinatario: 'cliente'
          });

          // Registrar venta automáticamente
          registrarVenta({
            pedidoId,
            total: pedido.total,
            metodoPago: pedido.metodoPago || 'efectivo',
            fecha: new Date()
          });
        }
        
        return pedidoActualizado;
      }
      return pedido;
    }));
  };

  const actualizarItemPedido = (pedidoId: string, itemIndex: number, datos: Partial<PedidoItem>) => {
    setPedidos(prev => prev.map(pedido => {
      if (pedido.id === pedidoId) {
        const itemsActualizados = pedido.items.map((item, index) => 
          index === itemIndex ? { ...item, ...datos } : item
        );
        
        // Verificar si todos los items están listos
        const todosListos = itemsActualizados.every(item => item.estadoCocina === 'listo');
        
        return {
          ...pedido,
          items: itemsActualizados,
          estado: todosListos ? 'listo' : pedido.estado,
          fechaActualizacion: new Date()
        };
      }
      return pedido;
    }));
  };

  const validarPago = (pedidoId: string) => {
    setPedidos(prev => prev.map(pedido => 
      pedido.id === pedidoId 
        ? { ...pedido, pagoValidado: true, estado: 'confirmado', fechaActualizacion: new Date() }
        : pedido
    ));
  };

  const registrarVenta = (ventaData: Omit<Venta, 'id'>) => {
    const nuevaVenta: Venta = {
      ...ventaData,
      id: `venta-${Date.now()}`,
    };
    setVentas(prev => [nuevaVenta, ...prev]);
  };

  const agregarNotificacion = (notificacionData: Omit<Notificacion, 'id' | 'timestamp' | 'leida'>) => {
    const nuevaNotificacion: Notificacion = {
      ...notificacionData,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      leida: false
    };
    setNotificaciones(prev => [nuevaNotificacion, ...prev.slice(0, 99)]);
  };

  const marcarNotificacionLeida = (notificacionId: string) => {
    setNotificaciones(prev => prev.map(notif => 
      notif.id === notificacionId ? { ...notif, leida: true } : notif
    ));
  };

  const limpiarNotificaciones = () => {
    setNotificaciones([]);
  };

  const obtenerEstadisticas = () => {
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    const ventasHoy = ventas.filter(v => v.fecha >= inicioDelDia);
    const pedidosHoy = pedidos.filter(p => p.fechaCreacion >= inicioDelDia);
    
    return {
      ventasHoy: ventasHoy.length,
      ingresosDia: ventasHoy.reduce((sum, v) => sum + v.total, 0),
      pedidosActivos: pedidos.filter(p => ['nuevo', 'confirmado', 'preparando', 'listo'].includes(p.estado)).length,
      mesasOcupadas: mesas.filter(m => m.estado === 'ocupada').length,
      platosAgotados: platos.filter(p => !p.disponible).length,
      inventarioBajo: inventario.filter(i => i.stock <= i.minimo).length
    };
  };

  const exportarReporte = (tipo: string, filtros: any) => {
    // Simulación de exportación
    const datos = {
      ventas: ventas.filter(v => {
        if (filtros.fecha) {
          return v.fecha.toDateString() === filtros.fecha.toDateString();
        }
        return true;
      }),
      pedidos: pedidos.filter(p => {
        if (filtros.estado) {
          return p.estado === filtros.estado;
        }
        return true;
      }),
      inventario: inventario
    };

    // En un sistema real, esto generaría un archivo
    console.log(`Exportando reporte de ${tipo}:`, datos);
    alert(`Reporte de ${tipo} exportado exitosamente. Revisa la consola para ver los datos.`);
  };

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    mesas,
    actualizarMesa,
    platos,
    actualizarPlato,
    agregarPlato,
    eliminarPlato,
    pedidos,
    crearPedido,
    actualizarPedido,
    actualizarItemPedido,
    validarPago,
    ventas,
    registrarVenta,
    inventario,
    actualizarInventario,
    agregarInventario,
    empleados,
    agregarEmpleado,
    actualizarEmpleado,
    notificaciones,
    agregarNotificacion,
    marcarNotificacionLeida,
    limpiarNotificaciones,
    mesaActual,
    setMesaActual,
    obtenerEstadisticas,
    exportarReporte
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}