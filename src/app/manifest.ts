import type { MetadataRoute } from 'next'

/**
 * @fileOverview Manifiesto de la PWA para Finanto.
 * Define cómo se comporta la aplicación cuando es instalada en un dispositivo móvil.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finanto Cloud',
    short_name: 'Finanto',
    description: 'Sistema de Gestión Inmobiliaria Profesional',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#1877F2',
    icons: [
      {
        src: 'https://picsum.photos/seed/finanto-pwa-192/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://picsum.photos/seed/finanto-pwa-512/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
