"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  CalendarClock, 
  Calculator, 
  Coins, 
  CheckCircle2, 
  Smartphone, 
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Receipt,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GuideDialog({ open, onOpenChange }: GuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-card border-border shadow-2xl flex flex-col">
        <DialogHeader className="p-6 border-b border-border/40 bg-primary/5 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <BookOpen className="text-primary w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">Manual de Operaciones Finanto</DialogTitle>
              <DialogDescription className="text-xs">Domina las herramientas del ejecutivo inmobiliario profesional.</DialogDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-10 w-10">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="agenda" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-2 border-b border-border/20 bg-muted/30">
            <TabsList className="bg-transparent gap-4 h-12">
              <TabsTrigger value="agenda" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase text-[10px] tracking-widest gap-2">
                <CalendarClock className="w-3.5 h-3.5" /> Agenda CRM
              </TabsTrigger>
              <TabsTrigger value="simulador" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase text-[10px] tracking-widest gap-2">
                <Calculator className="w-3.5 h-3.5" /> Simulador
              </TabsTrigger>
              <TabsTrigger value="comisiones" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase text-[10px] tracking-widest gap-2">
                <Coins className="w-3.5 h-3.5" /> Comisiones
              </TabsTrigger>
              <TabsTrigger value="tips" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase text-[10px] tracking-widest gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Tips Pro
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-8">
            <TabsContent value="agenda" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="space-y-4">
                <h3 className="text-lg font-black uppercase text-primary italic">1. Ciclo de Vida de una Cita</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Finanto está diseñado para centralizar tus prospectos desde el primer contacto en Marketplace hasta la firma del crédito.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: Smartphone, title: "Registro", text: "Ingresa nombre, teléfono y producto. Si viene de otro agente, usa el campo 'Prospectador'." },
                    { icon: CheckCircle2, title: "Confirmación", text: "Usa el botón de confirmación en citas de 'Hoy'. Un ejecutivo organizado sabe quién asistirá antes de salir." },
                    { icon: MessageSquare, title: "Seguimiento", text: "Usa los botones de copia rápida para enviar la ficha técnica por WhatsApp en segundos." }
                  ].map((step, i) => (
                    <div key={i} className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-xs uppercase tracking-wider">{step.title}</h4>
                      <p className="text-[11px] text-muted-foreground">{step.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-bold uppercase text-xs">Estados del CRM</h4>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[11px] text-muted-foreground">
                  <li><strong className="text-foreground">Cierre:</strong> Operación exitosa. Desbloquea el panel financiero.</li>
                  <li><strong className="text-foreground">Apartado:</strong> El cliente reservó pero el trámite sigue en curso.</li>
                  <li><strong className="text-foreground">2da Consulta:</strong> Seguimiento profundo de perfilamiento.</li>
                  <li><strong className="text-foreground">Reagendó:</strong> Mantiene el registro vivo sin ensuciar las estadísticas de hoy.</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="simulador" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="space-y-4">
                <h3 className="text-lg font-black uppercase text-primary italic">Motor Financiero (Plan 12pp)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  El simulador utiliza el factor base de <code className="bg-primary/10 text-primary px-1 rounded">0.00699</code> optimizado para el plan tradicional de Finanto.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl"><Calculator className="w-4 h-4" /></div>
                      <h4 className="font-bold text-sm uppercase">Cálculo Rápido</h4>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"Si el cliente pide números en la primera llamada..."</p>
                    <p className="text-xs leading-relaxed">Ingresa solo el monto de crédito. El sistema calculará la mensualidad sugerida y el enganche mínimo del <strong>3%</strong> automáticamente.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl"><Receipt className="w-4 h-4" /></div>
                      <h4 className="font-bold text-sm uppercase">Modo Profesional</h4>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"Para citas presenciales o videollamadas..."</p>
                    <p className="text-xs leading-relaxed">Expande el simulador para ajustar el plazo (hasta 192 meses) y visualizar la **Ficha Técnica** con gastos de escrituración (5%) y avalúos.</p>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="comisiones" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-primary italic">Lógica de Liquidación</h3>
                  <p className="text-sm text-muted-foreground">Entiende cuándo y cuánto cobrarás por cada cierre registrado.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-muted/20 border border-border/40 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold uppercase text-primary">Ciclo Administrativo</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-2">
                        <span className="text-muted-foreground italic">Ventas Domingo a Martes:</span>
                        <span className="font-bold text-foreground">Viernes Sig. Semana</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground italic">Ventas Miércoles a Sábado:</span>
                        <span className="font-bold text-foreground">Viernes Subsiguiente</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold uppercase text-primary">Fórmula Fiscal</h4>
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Retención ISR: 9%</p>
                      <p className="text-[11px] leading-relaxed">
                        El ingreso que ves en el Panel de Inteligencia ya tiene deducido el 9% de impuestos. Es tu <strong>ingreso neto real</strong> disponible.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="tips" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: "Modo Presentación", text: "En citas presenciales, expande el simulador y oculta la agenda. Proyecta una imagen corporativa limpia al cliente.", icon: Smartphone },
                  { title: "Resumen WhatsApp", text: "No redactes manualmente. Usa el botón 'Copiar Resumen' en el simulador para enviar una cotización impecable con un clic.", icon: MessageSquare },
                  { title: "Seguridad de Datos", text: "Finanto sincroniza tus datos en la nube cada vez que realizas un cambio. Nunca perderás tus prospectos si cambias de equipo.", icon: CheckCircle2 }
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-6 hover:bg-muted/30 transition-colors rounded-3xl border border-border/10 group">
                    <div className="bg-primary/10 p-3 rounded-2xl h-fit group-hover:scale-110 transition-transform">
                      <tip.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm uppercase tracking-tight">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-6 border-t border-border/40 bg-card/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary" /> Versión del Sistema 2.0.4
          </div>
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90 font-bold uppercase text-[10px] tracking-widest h-10 px-8 rounded-xl shadow-lg">
            Entendido, ¡A vender!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
