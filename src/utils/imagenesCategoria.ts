const imagenes: Record<string, string> = {
  vehiculos: '/categorias/vehiculos.png',
  tecnologia: '/categorias/tecnologia.png',
  hogar: '/categorias/hogar.png',
  ropa: '/categorias/ropa.png',
  otros: '/categorias/otros.png',
};

export function obtenerImagenCategoria(slug: string): string | undefined {
  return imagenes[slug];
}
