import { MetadataRoute } from 'next'

/**
 * @fileOverview Manifiesto de la PWA para Finanto.
 * Define cómo se comporta la aplicación cuando es instalada en un dispositivo móvil.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finanto CRM',
    short_name: 'Finanto',
    description: 'Sistema de Gestión Inmobiliaria Profesional',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#1877F2',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any',
      },
    ],
  }
}
