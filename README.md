# Finanto v1.1 - Sistema de Gestión Inmobiliaria Profesional

Finanto es una herramienta de alta productividad diseñada específicamente para ejecutivos de financiamiento inmobiliario. Este sistema permite centralizar el perfilamiento financiero, la agenda de citas y el control de comisiones en una interfaz moderna y eficiente.

---

## 🔄 1. Flujo de Trabajo y Capacidades

El sistema está diseñado para acompañar al ejecutivo en cada etapa del embudo de ventas, desde el primer contacto hasta el cobro de la comisión.

### 📈 Fase 1: Perfilamiento y Simulación
*   **Calculadora Rápida**: Ubicada en el panel lateral, permite ingresar un monto de crédito y obtener instantáneamente la mensualidad proyectada y el ingreso mínimo requerido.
*   **Simulador Profesional**: Al expandir la calculadora, el ejecutivo puede ajustar plazos (hasta 192 meses), enganches extra y visualizar gastos operativos como escrituración (5%) y avalúos.
*   **Modo Presentación**: Ideal para citas presenciales, el simulador se limpia de distracciones para mostrar números profesionales al cliente.
*   **Ficha Técnica**: Botón "Copiar Resumen" para enviar una cotización impecable por WhatsApp con un solo clic.

### 📅 Fase 2: Gestión de Agenda (CRM)
*   **Registro de Citas**: Formulario robusto que captura nombre, teléfono, producto (Casa, Terreno, etc.) y motivo de consulta.
*   **Confirmación de Asistencia**: Botón de validación para citas de "Hoy", permitiendo al ejecutivo saber quiénes realmente asistirán antes de salir a la oficina.
*   **Reporte de Prospectores**: Genera un mensaje estructurado con las métricas de flujo (hoy, confirmadas, mañana y pasado mañana) para grupos de coordinación.
*   **Búsqueda Global**: Filtro inteligente que busca por nombre, teléfono o incluso fechas casuales (ej. "martes").

### 💰 Fase 3: Cierre y Motor Financiero
*   **Finalizar Consulta**: Al marcar un "Cierre", el sistema solicita el monto de crédito final y el porcentaje de participación.
*   **Cálculo Automático**: El sistema deduce automáticamente la retención fiscal del 9% sobre la comisión bruta (0.7% del crédito) para mostrar el **Ingreso Neto Real**.
*   **Ciclos de Pago**: Basado en el día de cierre, el sistema proyecta la fecha de cobro (viernes de la siguiente o subsiguiente semana) y lanza alertas si un pago está vencido.
*   **Celebración de Cierre**: Interfaz especial con recomendaciones post-venta al concretar un trámite.

### 🤖 Fase 4: Seguimiento e Inteligencia
*   **IA de Seguimiento**: Integración con Google Genkit para generar mensajes personalizados basados en el resultado de la cita (Cierre, Reagendó, No asistió).
*   **Panel de Stats**: Gráficas de barras que comparan el ciclo actual vs el anterior, resaltando el día de hoy y mostrando el crecimiento de ingresos proyectados.
*   **Papelera de Reciclaje**: Sistema de archivado para mantener la agenda limpia sin perder datos históricos.

---

## 🛠 2. Documentación Técnica (Ingenieros e IA)

### 🏗 Stack Tecnológico
- **Framework**: Next.js 15 (App Router).
- **Lenguaje**: TypeScript (Strict Mode).
- **Estilos**: Tailwind CSS + Shadcn UI (Radix Primitives).
- **Persistencia**: LocalStorage API (`FINANTO_DATA_V1.1_50SEED`).
- **GenAI**: Google Genkit (Gemini 2.5 Flash) para flujos de texto.
- **Gráficas**: Recharts (Customized charts).

### 🧮 Lógica de Negocio Central (`appointment-service.ts`)
1.  **Algoritmo de Comisiones**: 
    - `Comisión Bruta = (Crédito Final * 0.007) * (Participación / 100)`
    - `Comisión Neta (Liquidada) = Comisión Bruta * 0.91` (Retención ISR del 9%).
2.  **Ciclo Administrativo de Pagos**:
    - Ventas de **Domingo a Martes**: Liquidación el viernes de la semana siguiente (+10 a +12 días).
    - Ventas de **Miércoles a Sábado**: Liquidación el viernes de la semana subsiguiente (+13 a +16 días).
3.  **Simulador Hipotecario**: 
    - Factor base: `0.006982` (normalizado a 192 meses).
    - Ratio de Ingresos: 35% (Capacidad de pago).

### 📊 Estructura de Datos (`Appointment` Interface)
```typescript
interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string; // ISO String
  time: string; // HH:mm (24h)
  status?: AppointmentStatus; // Cierre, Apartado, etc.
  isConfirmed?: boolean;
  finalCreditAmount?: number;
  commissionPercent?: number;
  commissionStatus?: 'Pagada' | 'Pendiente';
  prospectorName?: string;
  attendingExecutive?: string;
  isArchived?: boolean;
}
```

### 🧠 Implementación de IA
El sistema utiliza un flujo de Genkit (`generate-follow-up-message.ts`) que recibe el `status` de la cita y el contexto del cliente para devolver una plantilla adaptada al tono de voz de Finanto. Utiliza Handlebars para el templating del prompt sistemático.

### 🎨 Sistema de Temas y UI
- **Temas Dinámicos**: Implementados mediante atributos `data-theme` en el elemento raíz, controlados por variables CSS en `globals.css`.
- **Z-Index Layering**: 
    - Header: 50
    - Dialogs: 150 (para asegurar superposición sobre modales de stats).
    - Tooltips: 400 (siempre visibles).
- **Tooltips**: Configurables con transparencia (85%) y bordes de 1px gris en temas oscuros, y fondo blanco sólido en el tema Corporativo.

---
**Nota para IA**: Al realizar cambios en las fórmulas financieras, siempre referenciar `appointment-service.ts` para mantener la integridad de los ciclos de pago y retenciones fiscales.