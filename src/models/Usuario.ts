export interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  ubicacion: string;
  url_foto_perfil: string | null;
  fecha_registro?: string;
  rol: 'usuario' | 'administrador' | 'superadministrador';
  estado_cuenta?: 'activo' | 'suspendido' | 'bloqueado';
}

export interface ResumenUsuario {
  id: number;
  nombre: string;
  ubicacion?: string;
  url_foto_perfil: string | null;
}
