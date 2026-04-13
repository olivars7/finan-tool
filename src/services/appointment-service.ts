
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
  addWeeks,
  subWeeks,
  getDay,
  format,
  eachDayOfInterval,
  isSameDay,
  eachWeekOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';

export type AppointmentStatus = 
  | 'Asistencia' 
  | 'No asistencia' 
  | 'Continuación en 2da cita' 
  | 'Reagendó' 
  | 'Reembolso' 
  | 'Cierre'
  | 'Apartado';

export type AppointmentType = '1ra consulta' | '2da consulta' | '3ra consulta' | 'Cierre' | '2do cierre' | 'Seguimiento';

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
 * Calcula las estadísticas individuales.
 */
export const calculateStats = (appointments: Appointment[]) => {
  const activeApps = appointments.filter(a => !a.isArchived);
  const now = new Date();
  const todayStart = startOfDay(now);
  const lastMonth = subMonths(now, 1);

  // Función auxiliar para calcular comisión neta de forma segura
  const getNetCommission = (a: Appointment) => {
    const amount = Number(a.finalCreditAmount) || 0;
    // Default 100% para evitar que cierres de $3,000 desaparezcan por falta de este dato
    const percent = (a.commissionPercent !== undefined && a.commissionPercent !== null) 
      ? Number(a.commissionPercent) 
      : 100;
    return (amount * 0.007 * (percent / 100)) * 0.91;
  };

  const currentMonthProspects = activeApps.filter(a => isSameMonth(startOfDay(parseISO(a.date)), todayStart)).length;
  const lastMonthProspects = activeApps.filter(a => isSameMonth(startOfDay(parseISO(a.date)), lastMonth)).length;

  const currentMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(startOfDay(parseISO(a.date)), todayStart)).length;
  const currentMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(startOfDay(parseISO(a.date)), todayStart)).length;
  const currentMonthSales = currentMonthOnlyCierre + currentMonthApartados;

  const lastMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(startOfDay(parseISO(a.date)), lastMonth)).length;
  const lastMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(startOfDay(parseISO(a.date)), lastMonth)).length;
  const lastMonthSales = lastMonthOnlyCierre + lastMonthApartados;

  const totalCreditSold = activeApps
    .filter(a => a.status === 'Cierre' && isSameMonth(startOfDay(parseISO(a.date)), todayStart))
    .reduce((sum, a) => sum + (Number(a.finalCreditAmount) || 0), 0);

  // Récord de venta histórica
  const salesRecord = activeApps
    .filter(a => a.status === 'Cierre')
    .reduce((max, a) => Math.max(max, Number(a.finalCreditAmount) || 0), 0);

  const currentMonthCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return isSameMonth(payDate, todayStart);
    })
    .reduce((sum, a) => sum + getNetCommission(a), 0);

  const lastMonthCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return isSameMonth(payDate, lastMonth);
    })
    .reduce((sum, a) => sum + getNetCommission(a), 0);

  const dayOfWeekToday = getDay(todayStart);
  const daysToFriday = (5 - dayOfWeekToday + 7) % 7;
  const targetFriday = addDays(todayStart, daysToFriday);
  const nextTargetFriday = addDays(targetFriday, 7);

  const thisFridayCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus === 'Pagada') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return isSameDay(payDate, targetFriday);
    })
    .reduce((sum, a) => sum + getNetCommission(a), 0);

  const nextFridayCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus === 'Pagada') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return isSameDay(payDate, nextTargetFriday);
    })
    .reduce((sum, a) => sum + getNetCommission(a), 0);

  // Desglose de Hoy solicitado
  const todayTotal = activeApps.filter(a => isToday(parseISO(a.date))).length;
  const todayConfirmedGeneral = activeApps.filter(a => isToday(parseISO(a.date)) && (a.isConfirmed || a.status)).length;
  
  // Breakdown preciso para Tooltips
  const todayOnlyConfirmed = activeApps.filter(a => isToday(parseISO(a.date)) && a.isConfirmed && !a.status).length;
  const todayAttended = activeApps.filter(a => isToday(parseISO(a.date)) && a.status && ['Asistencia', 'Cierre', 'Apartado', 'Continuación en 2da cita'].includes(a.status)).length;
  const todayRescheduled = activeApps.filter(a => isToday(parseISO(a.date)) && a.status === 'Reagendó').length;
  const todayCancelled = activeApps.filter(a => isToday(parseISO(a.date)) && a.status === 'No asistencia').length;
  
  const conversionRate = currentMonthProspects > 0 ? (currentMonthSales / currentMonthProspects) * 100 : 0;
  const commissionGrowth = lastMonthCommission > 0 ? ((currentMonthCommission - lastMonthCommission) / lastMonthCommission) * 100 : 0;

  const buildActivityData = (daysBack: number, daysForward: number) => {
    const start = subDays(todayStart, daysBack);
    const end = addDays(todayStart, daysForward);
    const interval = eachDayOfInterval({ start, end });
    const dayInitials = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    
    return interval.map(day => {
      const dayNormalized = startOfDay(day);
      const dayNumber = format(dayNormalized, 'd');
      const dayFull = format(dayNormalized, "EEEE d 'de' MMMM", { locale: es });
      const dayOfWeek = getDay(dayNormalized); 
      
      const agendadas = activeApps.filter(a => isSameDay(startOfDay(parseISO(a.date)), dayNormalized)).length;
      const atendidas = activeApps.filter(a => isSameDay(startOfDay(parseISO(a.date)), dayNormalized) && a.status && a.status !== 'No asistencia').length;
      const cierres = activeApps.filter(a => isSameDay(startOfDay(parseISO(a.date)), dayNormalized) && a.status === 'Cierre').length;
      
      return { 
        dayNumber,
        dayFull,
        dayInitial: dayInitials[dayOfWeek],
        agendadas, 
        atendidas, 
        cierres, 
        isToday: isToday(dayNormalized),
        isCorte: dayOfWeek === 2, // Martes
        isPaga: dayOfWeek === 5,  // Viernes
      };
    });
  };

  const fortnightActivity = buildActivityData(7, 7);
  const expandedActivity = buildActivityData(25, 10);

  const startDate = subMonths(todayStart, 4);
  const endDate = addWeeks(todayStart, 3);
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
  
  const weeklyIncomeHistory = weeks.map(weekStart => {
    const s = startOfDay(weekStart);
    const e = startOfDay(addDays(weekStart, 6));
    const weekLabel = format(s, 'd MMM', { locale: es });
    
    const income = activeApps
      .filter(a => {
        if (a.status !== 'Cierre') return false;
        const payDate = startOfDay(getCommissionPaymentDate(a.date));
        return (isSameDay(payDate, s) || isAfter(payDate, s)) && (isSameDay(payDate, e) || isBefore(payDate, e));
      })
      .reduce((sum, a) => sum + getNetCommission(a), 0);

    const isCurrentWeek = (isSameDay(todayStart, s) || isAfter(todayStart, s)) && (isSameDay(todayStart, e) || isBefore(todayStart, e));

    return {
      week: weekLabel,
      income: Math.round(income),
      isCurrentWeek
    };
  });

  // Actividad últimas 6 semanas para micro stats
  const last6Weeks = eachWeekOfInterval({ 
    start: subWeeks(todayStart, 5), 
    end: todayStart 
  }, { weekStartsOn: 1 }).map(ws => {
    const s = startOfDay(ws);
    const e = startOfDay(addDays(ws, 6));
    const weekApps = activeApps.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isSameDay(d, s) || isAfter(d, s)) && (isSameDay(d, e) || isBefore(d, e));
    });

    return {
      label: format(s, 'd MMM', { locale: es }),
      agendadas: weekApps.length,
      atendidas: weekApps.filter(a => a.status && a.status !== 'No asistencia').length,
      cierres: weekApps.filter(a => a.status === 'Cierre').length,
      isCurrent: (isSameDay(todayStart, s) || isAfter(todayStart, s)) && (isSameDay(todayStart, e) || isBefore(todayStart, e))
    };
  }).reverse();

  const allVals = [...fortnightActivity, ...expandedActivity].flatMap(d => [d.agendadas, d.atendidas, d.cierres]);
  const globalMax = Math.max(0, ...allVals);

  return {
    todayCount: todayTotal,
    todayConfirmed: todayConfirmedGeneral,
    todayOnlyConfirmed,
    todayAttended,
    todayRescheduled,
    todayCancelled,
    pendingCount: activeApps.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, todayStart)) && !a.status;
    }).length,
    currentMonthProspects,
    lastMonthProspects,
    currentMonthSales,
    lastMonthSales,
    currentMonthOnlyCierre,
    currentMonthApartados,
    totalCreditSold,
    salesRecord,
    currentMonthCommission,
    lastMonthCommission,
    thisFridayCommission,
    nextFridayCommission,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    commissionGrowth: parseFloat(commissionGrowth.toFixed(1)),
    last6Weeks,
    charts: { 
      fortnightActivity,
      expandedActivity,
      globalMax, 
      weeklyIncomeHistory
    }
  };
};
