/**
 * @fileOverview Servicio de Gestión de Datos - Finanto
 * 
 * Centraliza la persistencia y lógica de negocio.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  isToday, 
  isAfter, 
  isBefore, 
  startOfDay, 
  parseISO, 
  subMonths, 
  isSameMonth, 
  subDays, 
  addDays, 
  getDay,
  format,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';

export type AppointmentStatus = 
  | 'Asistencia' 
  | 'No asistencia' 
  | 'Continuación en otra cita' 
  | 'Reagendó' 
  | 'Reembolso' 
  | 'Cierre'
  | 'Apartado';

export type AppointmentType = '1ra consulta' | '2da consulta' | 'Cierre' | 'Seguimiento';

export type AppointmentProduct = 'Casa' | 'Departamento' | 'Terreno' | 'Transporte' | 'Préstamo';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  type: AppointmentType;
  product?: AppointmentProduct;
  status?: AppointmentStatus;
  notes?: string;
  isConfirmed?: boolean;
  isArchived?: boolean;
  // Datos de comisión
  commissionPercent?: number;
  commissionStatus?: 'Pagada' | 'Pendiente';
  finalCreditAmount?: number;
  // Datos de prospectador externo
  prospectorName?: string;
  prospectorPhone?: string;
  // Ejecutivo que atendió
  attendingExecutive?: string;
}

export const STORAGE_KEY = 'FINANTO_DATA_V1.1_50SEED';

/**
 * Calcula la fecha de pago estimada para una comisión.
 */
export const getCommissionPaymentDate = (dateStr: string): Date => {
  const d = parseISO(dateStr);
  const dayOfWeek = getDay(d); // 0=Dom, 1=Lun, 2=Mar, 3=Mié...
  
  let daysToAdd = 0;
  if (dayOfWeek <= 2) {
    // Domingo a Martes -> Viernes de la siguiente semana
    daysToAdd = (5 - dayOfWeek) + 7;
  } else {
    // Miércoles a Sábado -> Viernes de la subsiguiente semana
    daysToAdd = (5 - dayOfWeek) + 14;
  }
  
  return addDays(d, daysToAdd);
};

/**
 * Guarda la lista de citas en el almacenamiento local (localStorage).
 */
export const saveToDisk = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

/**
 * Recupera las citas guardadas.
 */
export const getFromDisk = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return [];
  try {
    return JSON.parse(rawData) as Appointment[];
  } catch (e) {
    return [];
  }
};

/**
 * Formatea un número de teléfono a un estilo legible.
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = ('' + phone).replace(/\D/g, ''); 
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) return `${match[1]} ${match[2]} ${match[3]}`;
  return phone;
};

/**
 * Genera datos de prueba realistas y variados (60 registros).
 * Se asegura que un registro NO tenga prospectador y ejecutivo simultáneamente.
 */
export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  
  const firstNames = [
    'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Roberto', 'Sofía', 'Diego', 'Lucía', 
    'Fernando', 'Gabriela', 'Ricardo', 'Patricia', 'Héctor', 'Isabel', 'Jorge', 'Mónica', 'Andrés', 'Carmen',
    'Alejandro', 'Daniela', 'Raúl', 'Verónica', 'Víctor', 'Adriana', 'Oscar', 'Paola', 'Miguel', 'Rosa'
  ];
  
  const lastNames = [
    'Pérez', 'García', 'López', 'Martínez', 'Rodríguez', 'Gómez', 'Díaz', 'Ruiz', 'Torres', 'Morales'
  ];

  const products: AppointmentProduct[] = ['Casa', 'Departamento', 'Terreno', 'Transporte', 'Préstamo'];
  const hours = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];
  const executives = ['Marco Olivares', 'Brenda Solis', 'Kevin Castro', 'Diana Reyes', 'Andrés Luna'];

  const now = new Date();

  const getName = (index: number) => {
    const fname = firstNames[index % firstNames.length];
    const lname = lastNames[(index + 3) % lastNames.length];
    return `${fname} ${lname}`;
  };

  const getPhone = (index: number) => {
    const base = 6641000000 + (index * 54321) % 8999999;
    return base.toString();
  };

  // 25 Citas Próximas (Hoy y Futuro)
  for (let i = 0; i < 25; i++) {
    let appDate;
    if (i < 5) appDate = now; 
    else if (i < 10) appDate = addDays(now, 1);
    else appDate = addDays(now, (i % 10) + 2);
    
    const isTodayApp = isToday(appDate);
    
    // Lógica de exclusividad: 30% prospectador, 30% ejecutivo, 40% ninguno
    const rand = Math.random();
    let pName, pPhone, eName;
    if (rand < 0.3) {
      pName = 'Agente Externo ' + (i % 5);
      pPhone = '664 555 0000';
    } else if (rand < 0.6) {
      eName = executives[i % executives.length];
    }

    data.push({
      id: uuidv4(),
      name: getName(i),
      phone: formatPhoneNumber(getPhone(i)),
      date: appDate.toISOString(),
      time: hours[i % hours.length],
      type: i % 3 === 0 ? '2da consulta' : '1ra consulta',
      product: products[i % products.length],
      isConfirmed: isTodayApp ? Math.random() > 0.5 : false,
      isArchived: false,
      notes: i % 4 === 0 ? `Interés en ${products[i % products.length]} zona centro.` : '',
      prospectorName: pName,
      prospectorPhone: pPhone,
      attendingExecutive: eName
    });
  }

  // 35 Citas Pasadas (Historial con cierres variados)
  for (let i = 0; i < 35; i++) {
    const pastDate = i < 15 ? subDays(now, (i % 20) + 1) : subMonths(subDays(now, i % 10), 1);
    const globalIndex = i + 25;
    
    let status: AppointmentStatus = 'Asistencia';
    if (i % 5 === 0) status = 'Cierre';
    else if (i % 7 === 0) status = 'Apartado';
    else if (i % 10 === 0) status = 'No asistencia';
    else if (i % 12 === 0) status = 'Reagendó';

    const isSale = status === 'Cierre';
    
    // Lógica de exclusividad
    const rand = Math.random();
    let pName, pPhone, eName;
    if (rand < 0.3) {
      pName = 'Marketing FB';
      pPhone = '664 111 2222';
    } else if (rand < 0.6) {
      eName = executives[i % executives.length];
    }

    data.push({
      id: uuidv4(),
      name: getName(globalIndex),
      phone: formatPhoneNumber(getPhone(globalIndex)),
      date: pastDate.toISOString(),
      time: hours[i % hours.length],
      type: i % 4 === 0 ? 'Seguimiento' : '1ra consulta',
      status: status,
      product: products[i % products.length],
      isConfirmed: true,
      isArchived: false,
      notes: isSale ? `Operación exitosa por ${products[i % products.length]}.` : '',
      commissionStatus: isSale ? (i % 2 === 0 ? 'Pagada' : 'Pendiente') : undefined,
      commissionPercent: isSale ? (i % 3 === 0 ? 50 : 100) : undefined,
      finalCreditAmount: isSale ? Math.floor(800000 + Math.random() * 2500000) : undefined,
      attendingExecutive: eName,
      prospectorName: pName,
      prospectorPhone: pPhone
    });
  }
  
  saveToDisk(data);
  return data;
};

/**
 * Calcula las estadísticas globales enriquecidas.
 */
export const calculateStats = (appointments: Appointment[]) => {
  const activeApps = appointments.filter(a => !a.isArchived);
  const now = new Date();
  const todayStart = startOfDay(now);
  const lastMonth = subMonths(now, 1);

  const currentMonthProspects = activeApps.filter(a => isSameMonth(parseISO(a.date), now)).length;
  const lastMonthProspects = activeApps.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length;

  // Solo contamos Cierres para ventas efectivas financieras
  const currentMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length;
  const currentMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(parseISO(a.date), now)).length;
  
  // Ventas totales para indicadores operativos (Cierre + Apartado)
  const currentMonthSales = currentMonthOnlyCierre + currentMonthApartados;
  const lastMonthSales = activeApps.filter(a => (a.status === 'Cierre' || a.status === 'Apartado') && isSameMonth(parseISO(a.date), lastMonth)).length;

  // El crédito vendido SOLO cuenta los Cierres
  const totalCreditSold = activeApps
    .filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now))
    .reduce((sum, a) => sum + (a.finalCreditAmount || 0), 0);

  const salesWithAmount = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now) && (a.commissionPercent || 0) > 0);
  const avgParticipation = salesWithAmount.length > 0 
    ? salesWithAmount.reduce((sum, a) => sum + (a.commissionPercent || 0), 0) / salesWithAmount.length 
    : 0;

  // Comisiones que se PAGAN en el mes actual (Vengan de este mes o del anterior)
  const currentMonthCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const payDate = getCommissionPaymentDate(a.date);
      return isSameMonth(payDate, now);
    })
    .reduce((sum, a) => sum + ((a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100)) * 0.91, 0);

  // Específicamente: Cuánto del ingreso actual viene de ventas del mes pasado
  const prevMonthCommissionPaidNow = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const appointmentDate = parseISO(a.date);
      const payDate = getCommissionPaymentDate(a.date);
      return isSameMonth(appointmentDate, lastMonth) && isSameMonth(payDate, now);
    })
    .reduce((sum, a) => sum + ((a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100)) * 0.91, 0);

  const currentMonthPaidCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus !== 'Pagada') return false;
      const payDate = getCommissionPaymentDate(a.date);
      return isSameMonth(payDate, now);
    })
    .reduce((sum, a) => sum + ((a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100)) * 0.91, 0);

  const lastMonthCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const payDate = getCommissionPaymentDate(a.date);
      return isSameMonth(payDate, lastMonth);
    })
    .reduce((sum, a) => sum + ((a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100)) * 0.91, 0);

  const dayOfWeekToday = getDay(todayStart);
  const daysToFriday = (5 - dayOfWeekToday + 7) % 7;
  const targetFriday = addDays(todayStart, daysToFriday);

  const thisFridayCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus === 'Pagada') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return payDate.getTime() === targetFriday.getTime();
    })
    .reduce((sum, a) => sum + ((a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100)) * 0.91, 0);

  const overdueCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus === 'Pagada') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return isBefore(payDate, todayStart);
    })
    .reduce((sum, a) => sum + ((a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100)) * 0.91, 0);

  const todayTotal = activeApps.filter(a => isToday(parseISO(a.date))).length;
  const todayConfirmed = activeApps.filter(a => isToday(parseISO(a.date)) && (a.isConfirmed || a.status)).length;
  const tomorrowTotal = activeApps.filter(a => {
    const d = parseISO(a.date);
    const tomorrow = addDays(now, 1);
    return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
  }).length;

  const conversionRate = currentMonthProspects > 0 ? (currentMonthSales / currentMonthProspects) * 100 : 0;

  const buildCycleData = (start: Date, end: Date) => {
    const interval = eachDayOfInterval({ start, end });
    return interval.map(day => {
      const dayStr = format(day, 'eee', { locale: es });
      const agendadas = activeApps.filter(a => isSameDay(parseISO(a.date), day)).length;
      const atendidas = activeApps.filter(a => 
        isSameDay(parseISO(a.date), day) && 
        a.status && 
        a.status !== 'No asistencia'
      ).length;
      const cierres = activeApps.filter(a => 
        isSameDay(parseISO(a.date), day) && 
        a.status === 'Cierre'
      ).length;
      return { 
        day: dayStr, 
        agendadas, 
        atendidas, 
        cierres,
        isToday: isToday(day)
      };
    });
  };

  const getCycleStart = (date: Date) => {
    const day = getDay(date); 
    const diff = (day - 3 + 7) % 7;
    return startOfDay(subDays(date, diff));
  };

  const currentCycleStart = getCycleStart(now);
  const currentCycleEnd = addDays(currentCycleStart, 6);
  const lastCycleStart = subDays(currentCycleStart, 7);
  const lastCycleEnd = subDays(currentCycleStart, 1);

  const dailyActivity = buildCycleData(currentCycleStart, currentCycleEnd);
  const lastWeekActivity = buildCycleData(lastCycleStart, lastCycleEnd);

  const allVals = [...dailyActivity, ...lastWeekActivity].flatMap(d => [d.agendadas, d.atendidas, d.cierres]);
  const globalMax = Math.max(0, ...allVals);

  return {
    todayCount: todayTotal,
    todayConfirmed,
    tomorrowTotal,
    pendingCount: activeApps.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, startOfDay(now))) && !a.status;
    }).length,
    currentMonthProspects,
    lastMonthProspects,
    currentMonthSales,
    lastMonthSales,
    currentMonthOnlyCierre,
    currentMonthApartados,
    totalCreditSold,
    avgParticipation: parseFloat(avgParticipation.toFixed(1)),
    currentMonthCommission,
    prevMonthCommissionPaidNow,
    lastMonthCommission,
    currentMonthPaidCommission,
    thisFridayCommission,
    overdueCommission,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    charts: {
      dailyActivity,
      lastWeekActivity,
      globalMax
    }
  };
};
