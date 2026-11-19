export interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string | null;
  telefono_verificado?: boolean;
  ubicacion: string;
  url_foto_perfil: string | null;
  url_foto_portada?: string | null;
  biografia?: string | null;
  fecha_registro?: string;
  rol: 'usuario' | 'administrador' | 'superadministrador';
  estado_cuenta?: 'activo' | 'suspendido' | 'bloqueado';
}

export interface ResumenUsuario {
  id: number;
  nombre: string;
  ubicacion?: string;
  url_foto_perfil: string | null;
  url_foto_portada?: string | null;
  biografia?: string | null;
  telefono_verificado?: boolean;
}
