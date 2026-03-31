
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

  const currentMonthProspects = activeApps.filter(a => isSameMonth(parseISO(a.date), now)).length;
  const lastMonthProspects = activeApps.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length;

  // REGLA: Los cierres y el volumen se cuentan en el mes de la CITA/CIERRE
  const currentMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length;
  const currentMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(parseISO(a.date), now)).length;
  const currentMonthSales = currentMonthOnlyCierre + currentMonthApartados;

  const lastMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), lastMonth)).length;
  const lastMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(parseISO(a.date), lastMonth)).length;
  const lastMonthSales = lastMonthOnlyCierre + lastMonthApartados;

  const totalCreditSold = activeApps
    .filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now))
    .reduce((sum, a) => sum + (Number(a.finalCreditAmount) || 0), 0);

  const salesWithAmount = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now) && (Number(a.commissionPercent) || 0) > 0);
  const avgParticipation = salesWithAmount.length > 0 
    ? salesWithAmount.reduce((sum, a) => sum + (Number(a.commissionPercent) || 0), 0) / salesWithAmount.length 
    : 0;

  // REGLA: El ingreso se cuenta en el mes de PAGO proyectado
  const currentMonthCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const payDate = getCommissionPaymentDate(a.date);
      return isSameMonth(payDate, now);
    })
    .reduce((sum, a) => {
      const amount = Number(a.finalCreditAmount) || 0;
      const percent = Number(a.commissionPercent) || 0;
      return sum + (amount * 0.007 * (percent / 100)) * 0.91;
    }, 0);

  const lastMonthCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      const payDate = getCommissionPaymentDate(a.date);
      return isSameMonth(payDate, lastMonth);
    })
    .reduce((sum, a) => {
      const amount = Number(a.finalCreditAmount) || 0;
      const percent = Number(a.commissionPercent) || 0;
      return sum + (amount * 0.007 * (percent / 100)) * 0.91;
    }, 0);

  const dayOfWeekToday = getDay(todayStart);
  const daysToFriday = (5 - dayOfWeekToday + 7) % 7;
  const targetFriday = addDays(todayStart, daysToFriday);
  const nextTargetFriday = addDays(targetFriday, 7);

  const thisFridayCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus === 'Pagada') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return payDate.getTime() === targetFriday.getTime();
    })
    .reduce((sum, a) => {
      const amount = Number(a.finalCreditAmount) || 0;
      const percent = Number(a.commissionPercent) || 0;
      return sum + (amount * 0.007 * (percent / 100)) * 0.91;
    }, 0);

  const nextFridayCommission = activeApps
    .filter(a => {
      if (a.status !== 'Cierre') return false;
      if (a.commissionStatus === 'Pagada') return false;
      const payDate = startOfDay(getCommissionPaymentDate(a.date));
      return payDate.getTime() === nextTargetFriday.getTime();
    })
    .reduce((sum, a) => {
      const amount = Number(a.finalCreditAmount) || 0;
      const percent = Number(a.commissionPercent) || 0;
      return sum + (amount * 0.007 * (percent / 100)) * 0.91;
    }, 0);

  const todayTotal = activeApps.filter(a => isToday(parseISO(a.date))).length;
  const todayConfirmed = activeApps.filter(a => isToday(parseISO(a.date)) && (a.isConfirmed || a.status)).length;
  const tomorrowTotal = activeApps.filter(a => {
    const d = parseISO(a.date);
    const tomorrow = addDays(now, 1);
    return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
  }).length;

  const conversionRate = currentMonthProspects > 0 ? (currentMonthSales / currentMonthProspects) * 100 : 0;
  const commissionGrowth = lastMonthCommission > 0 ? ((currentMonthCommission - lastMonthCommission) / lastMonthCommission) * 100 : 0;

  const buildActivityData = (daysBack: number, daysForward: number) => {
    const start = subDays(todayStart, daysBack);
    const end = addDays(todayStart, daysForward);
    const interval = eachDayOfInterval({ start, end });
    const dayInitials = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    
    return interval.map(day => {
      const dayNumber = format(day, 'd');
      const dayFull = format(day, "EEEE d 'de' MMMM", { locale: es });
      const dayOfWeek = getDay(day); 
      
      const agendadas = activeApps.filter(a => isSameDay(parseISO(a.date), day)).length;
      const atendidas = activeApps.filter(a => isSameDay(parseISO(a.date), day) && a.status && a.status !== 'No asistencia').length;
      const cierres = activeApps.filter(a => isSameDay(parseISO(a.date), day) && a.status === 'Cierre').length;
      
      let projectedPay = 0;
      if (dayOfWeek === 5) { // Viernes
        projectedPay = activeApps
          .filter(a => {
            if (a.status !== 'Cierre') return false;
            const payDate = startOfDay(getCommissionPaymentDate(a.date));
            return isSameDay(payDate, day);
          })
          .reduce((sum, a) => {
            const amount = Number(a.finalCreditAmount) || 0;
            const percent = Number(a.commissionPercent) || 0;
            return sum + (amount * 0.007 * (percent / 100)) * 0.91;
          }, 0);
      }

      return { 
        dayNumber,
        dayFull,
        dayInitial: dayInitials[dayOfWeek],
        agendadas, 
        atendidas, 
        cierres, 
        isToday: isToday(day),
        isCorte: dayOfWeek === 2, // Martes
        isPaga: dayOfWeek === 5,  // Viernes
        projectedPay: Math.round(projectedPay)
      };
    });
  };

  const fortnightActivity = buildActivityData(7, 7);
  const expandedActivity = buildActivityData(25, 10);

  const startDate = subMonths(now, 4);
  const endDate = addWeeks(now, 3);
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
  
  const weeklyIncomeHistory = weeks.map(weekStart => {
    const weekEnd = addDays(weekStart, 6);
    const weekLabel = format(weekStart, 'd MMM', { locale: es });
    
    const income = activeApps
      .filter(a => {
        if (a.status !== 'Cierre') return false;
        const payDate = getCommissionPaymentDate(a.date);
        return (isSameDay(payDate, weekStart) || isAfter(payDate, weekStart)) && (isSameDay(payDate, weekEnd) || isBefore(payDate, weekEnd));
      })
      .reduce((sum, a) => {
        const amount = Number(a.finalCreditAmount) || 0;
        const percent = Number(a.commissionPercent) || 0;
        return sum + (amount * 0.007 * (percent / 100)) * 0.91;
      }, 0);

    const isCurrentWeek = (isSameDay(now, weekStart) || isAfter(now, weekStart)) && (isSameDay(now, weekEnd) || isBefore(now, weekEnd));

    return {
      week: weekLabel,
      income: Math.round(income),
      isCurrentWeek
    };
  });

  const allVals = [...fortnightActivity, ...expandedActivity].flatMap(d => [d.agendadas, d.atendidas, d.cierres]);
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
    lastMonthCommission,
    thisFridayCommission,
    nextFridayCommission,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    commissionGrowth: parseFloat(commissionGrowth.toFixed(1)),
    charts: { 
      fortnightActivity,
      expandedActivity,
      globalMax, 
      weeklyIncomeHistory
    }
  };
};
