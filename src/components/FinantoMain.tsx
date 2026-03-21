
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import MobileDashboard from '@/components/dashboard/MobileDashboard';
import DesktopDashboard from '@/components/dashboard/DesktopDashboard';
import TrashDialog from '@/components/appointments/TrashDialog';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { 
  Sparkles, 
  MessageSquare, 
  Palette, 
  Cpu, 
  Moon, 
  Crown, 
  LogOut, 
  Trash2,
  X,
  UserPlus
} from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';

type Theme = 'tranquilo' | 'moderno' | 'discreto' | 'olivares' | 'corporativo' | 'corporativo-oscuro';

export interface FinantoMainProps {
  initialSection?: 'simulador' | 'gestor' | 'stats';
}

export default function FinantoMain({ initialSection }: FinantoMainProps) {
  const [showTrash, setShowTrash] = useState(false);
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);
  const [isGestorExpanded, setIsGestorExpanded] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('corporativo');
  
  const appointmentState = useAppointments();

  const { 
    appointments, stats, isLoaded, addAppointment, editAppointment, 
    unarchiveAppointment, deletePermanent, user, profile
  } = appointmentState;

  const { toast } = useToast();

  const syncUrl = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  const handleToggleSimulator = (open: boolean) => {
    setIsSimulatorExpanded(open);
    if (open) { syncUrl('/simulador'); document.title = "Simulador - Finanto"; }
    else { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleGestor = (open: boolean) => {
    setIsGestorExpanded(open);
    if (open) { syncUrl('/gestor'); document.title = "Agenda - Finanto"; }
    else { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleStats = (open: boolean) => {
    setIsStatsExpanded(open);
    if (open) { syncUrl('/stats'); document.title = "Stats - Finanto"; }
    else { syncUrl('/'); document.title = "Finanto"; }
  };

  useEffect(() => {
    if (initialSection === 'simulador') setIsSimulatorExpanded(true);
    if (initialSection === 'gestor') setIsGestorExpanded(true);
    if (initialSection === 'stats') setIsStatsExpanded(true);
  }, [initialSection]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsSimulatorExpanded(path === '/simulador');
      setIsGestorExpanded(path === '/gestor');
      setIsStatsExpanded(path === '/stats');
    };

    window.addEventListener('popstate', handlePopState);
    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) applyTheme(savedTheme);
    else applyTheme('corporativo');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const applyTheme = (themeId: Theme) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    if (themeId === 'corporativo') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleThemeChange = (themeId: Theme) => {
    applyTheme(themeId);
    localStorage.setItem('finanto-theme', themeId);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Universal */}
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[12px] bg-card/10 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => syncUrl('/')}>
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 flex items-center justify-center overflow-hidden">
              <Image 
                src="/favicon.ico" 
                alt="Finanto Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-headline font-bold tracking-tight text-foreground leading-none">
                FINANTO <span className="text-accent">CRM</span>
              </h1>
              <span className="text-[10px] text-muted-foreground font-medium opacity-60 mt-1">Por Olivares</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {profile?.role && (
              <Badge variant="outline" className="hidden sm:flex text-[9px] font-bold uppercase tracking-tighter bg-primary/5 text-primary border-primary/20 px-2 py-0.5 rounded-full">
                {profile.role}
              </Badge>
            )}
            
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full overflow-hidden border border-border/50 outline-none focus:ring-2 focus:ring-primary/50">
                  <Avatar className="h-8 w-8 mx-auto">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {user?.displayName?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 backdrop-blur-lg">
                <DropdownMenuLabel className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">{user?.displayName}</span>
                    <Badge className="text-[8px] h-4 px-1.5 font-black uppercase bg-primary/10 text-primary border-none">{profile?.role || 'Prospectador'}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Temas Visuales</DropdownMenuLabel>
                {[
                  { id: 'corporativo', label: 'Corporativo', icon: MessageSquare, color: 'bg-[#1877F2]' },
                  { id: 'corporativo-oscuro', label: 'Corporativo Oscuro', icon: Sparkles, color: 'bg-slate-900' },
                  { id: 'tranquilo', label: 'Tranquilo', icon: Palette, color: 'bg-primary' },
                  { id: 'moderno', label: 'Moderno', icon: Cpu, color: 'bg-cyan-500' },
                  { id: 'discreto', label: 'Discreto', icon: Moon, color: 'bg-slate-700' },
                  { id: 'olivares', label: 'Olivares', icon: Crown, color: 'bg-yellow-600' },
                ].map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => handleThemeChange(t.id as Theme)} className="cursor-pointer">
                    <t.icon className="w-4 h-4 text-muted-foreground mr-2" />
                    <div className={cn("w-2 h-2 rounded-full mr-2", t.color)} /> {t.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Responsive Dashboards */}
      <main className="flex-1 flex flex-col container mx-auto px-4 py-6 md:py-12">
        {/* MOBILE DASHBOARD (lg:hidden) */}
        <div className="block lg:hidden flex-1 flex flex-col">
          <MobileDashboard 
            userName={user?.displayName || 'Ejecutivo'}
            appointments={appointments}
            stats={stats}
            onOpenCalculator={() => handleToggleSimulator(true)}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            onOpenAgenda={() => handleToggleGestor(true)}
            onOpenStats={() => handleToggleStats(true)}
            onSelectApp={setSelectedId}
            format12hTime={appointmentState.format12hTime}
          />
        </div>

        {/* DESKTOP DASHBOARD (hidden lg:block) */}
        <div className="hidden lg:block">
          <DesktopDashboard 
            stats={stats}
            appointments={appointments}
            activeAppointments={appointmentState.activeAppointments}
            upcoming={appointmentState.upcoming}
            past={appointmentState.past}
            addAppointment={addAppointment}
            editAppointment={editAppointment}
            archiveAppointment={appointmentState.archiveAppointment}
            unarchiveAppointment={unarchiveAppointment}
            formatFriendlyDate={appointmentState.formatFriendlyDate}
            format12hTime={appointmentState.format12hTime}
            isSimulatorExpanded={isSimulatorExpanded}
            onToggleSimulator={handleToggleSimulator}
            isGestorExpanded={isGestorExpanded}
            onToggleGestor={handleToggleGestor}
            isStatsExpanded={isStatsExpanded}
            onToggleStats={handleToggleStats}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            theme={theme}
          />
        </div>
      </main>

      <footer className="border-t border-border/40 py-4 sm:py-6 bg-card/10 backdrop-blur-md shrink-0">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground uppercase tracking-widest">Finanto CRM v2.0</span>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="hidden sm:inline">Infraestructura Google Cloud</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTrash(true)} 
              className="text-muted-foreground hover:text-destructive gap-2 h-8 px-2 sm:px-3 rounded-full"
            >
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Papelera</span> ({appointments.filter(a => a.isArchived).length})
            </Button>
          </div>
        </div>
      </footer>

      {/* Diálogo de Nueva Cita (Móvil - Optimizado con Scroll) */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none bg-background shadow-2xl flex flex-col h-[90vh]">
          <DialogHeader className="p-6 border-b border-border/10 bg-primary/5 relative shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg">
                <UserPlus size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground">Nueva Cita</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase text-primary tracking-[0.2em] mt-1">Registro rápido de prospecto</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-muted/20 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
                <X size={20} />
              </Button>
            </DialogClose>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6 scrollbar-thin">
            <div className="pb-20">
              <AppointmentForm onAdd={(data) => {
                addAppointment(data);
                setIsNewAppointmentOpen(false);
              }} />
            </div>
          </ScrollArea>

          <div className="p-4 bg-muted/20 flex justify-center shrink-0 border-t border-border/10">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-10 px-8 rounded-full font-bold uppercase text-[10px] text-muted-foreground">
                Cancelar Registro
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGOS DE APOYO */}
      <TrashDialog 
        open={showTrash} 
        onOpenChange={setShowTrash} 
        archivedAppointments={appointments.filter(a => a.isArchived)}
        onRestore={unarchiveAppointment}
        onDelete={deletePermanent}
        formatDate={appointmentState.formatFriendlyDate}
        format12hTime={appointmentState.format12hTime}
      />
    </div>
  );
}
