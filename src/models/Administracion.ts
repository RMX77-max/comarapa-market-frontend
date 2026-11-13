export interface ResumenAdministrativo {
  usuarios: {
    total: number;
    nuevos_hoy: number;
  };
  publicaciones: {
    total: number;
    disponibles: number;
    vendidas: number;
    pendientes_revision: number;
  };
  operaciones: {
    total: number;
    en_curso: number;
    pagadas: number;
    completadas: number;
  };
  caja_mes: {
    desde: string;
    ingresos: number;
    egresos: number;
    saldo: number;
    pagado_vendedores: number;
    gastos: number;
  };
  rol_actual: 'administrador' | 'superadministrador';
}

export interface ActorAuditoria {
  id: number;
  nombre: string;
  email: string;
  rol: 'administrador' | 'superadministrador';
}

export interface AuditoriaAdministrativa {
  id: number;
  accion: string;
  descripcion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  valores_anteriores: Record<string, unknown> | null;
  valores_nuevos: Record<string, unknown> | null;
  direccion_ip: string | null;
  fecha: string;
  actor: ActorAuditoria | null;
}
