
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  RotateCcw, 
  Maximize2, 
  X, 
  TrendingUp,
  Receipt,
  Coins,
  Settings2,
  Zap,
  Copy,
  Info
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreditCalculatorProps {
  isExpanded?: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const CalculatorInputs = ({ 
  isModal = false, 
  totalPrice, 
  monthlyPayment, 
  onPriceChange, 
  onMonthlyChange,
  formatWithCommas,
  customTerm = "192"
}: { 
  isModal?: boolean,
  totalPrice: string,
  monthlyPayment: string,
  onPriceChange: (val: string) => void,
  onMonthlyChange: (val: string) => void,
  formatWithCommas: (val: string) => string,
  customTerm?: string
}) => {
  const baseFactor = 0.006982; 
  const term = parseInt(customTerm) || 192;
  const displayFactor = ((baseFactor * (192 / term)) * 100).toFixed(4);

  return (
    <div className={isModal ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={isModal ? "totalPriceModal" : "totalPrice"} className="text-xs font-bold text-primary uppercase tracking-wider">
            Monto del crédito (P)
          </Label>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Enganche Base: 3%</span>
        </div>
        <div className="relative flex items-center">
          <span className={cn(
            "absolute left-3 font-bold pointer-events-none",
            isModal ? "text-xl text-primary top-1/2 -translate-y-1/2" : "text-primary top-2.5"
          )}>$</span>
          <Input
            id={isModal ? "totalPriceModal" : "totalPrice"}
            placeholder="0"
            className={isModal ? "pl-9 font-bold text-2xl bg-primary/5 border-primary/30 focus-visible:ring-primary h-14" : "pl-7 font-semibold text-lg bg-primary/5 border-primary/30 focus-visible:ring-primary"}
            type="text"
            value={formatWithCommas(totalPrice)}
            onChange={(e) => onPriceChange(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={isModal ? "monthlyPaymentModal" : "monthlyPayment"} className="text-xs font-bold text-accent uppercase tracking-wider">
            Mensualidad Total
          </Label>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Factor Base: {displayFactor}%</span>
        </div>
        <div className="relative flex items-center">
          <span className={cn(
            "absolute left-3 font-bold pointer-events-none",
            isModal ? "text-xl text-accent top-1/2 -translate-y-1/2" : "text-accent top-2.5"
          )}>$</span>
          <Input
            id={isModal ? "monthlyPaymentModal" : "monthlyPayment"}
            placeholder="0"
            className={isModal ? "pl-9 border-accent/30 focus-visible:ring-accent font-bold text-2xl text-accent bg-accent/5 h-14" : "pl-7 border-accent/30 focus-visible:ring-accent font-bold text-lg text-accent bg-accent/5"}
            type="text"
            value={formatWithCommas(monthlyPayment)}
            onChange={(e) => onMonthlyChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default function CreditCalculator({ isExpanded = false, onExpandedChange }: CreditCalculatorProps) {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [extraDownPayment, setExtraDownPayment] = useState<string>('');
  const [extraMonthlyContribution, setExtraMonthlyContribution] = useState<string>('');
  const [customTerm, setCustomTerm] = useState<string>('192');

  const { toast } = useToast();
  
  const BASE_FACTOR = 0.006982; 
  const FACTOR_ENGANCHE = 0.03; 
  const INCOME_RATIO = 0.35; 

  const currentTerm = parseInt(customTerm) || 192;
  const effectiveFactor = BASE_FACTOR * (192 / currentTerm);

  const parseNumber = (val: string) => Math.round(parseFloat(val.replace(/,/g, ''))) || 0;

  const formatWithCommas = (val: string) => {
    const num = val.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return '';
    return num.split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const handleTotalPriceChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setTotalPrice(cleanVal);
    const p = parseFloat(cleanVal);
    if (!isNaN(p)) {
      const netP = Math.max(0, p - parseNumber(extraDownPayment));
      const totalMonthly = (netP * effectiveFactor) + parseNumber(extraMonthlyContribution);
      setMonthlyPayment(Math.round(totalMonthly).toString());
    }
  };

  const handleMonthlyPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setMonthlyPayment(cleanVal);
    const totalC = parseFloat(cleanVal);
    if (!isNaN(totalC)) {
      const baseC = Math.max(0, totalC - parseNumber(extraMonthlyContribution));
      const p = (baseC / effectiveFactor) + parseNumber(extraDownPayment);
      setTotalPrice(Math.round(p).toString());
    }
  };

  const handleExtraDownChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setExtraDownPayment(cleanVal);
    const p = parseNumber(totalPrice);
    const netP = Math.max(0, p - (parseFloat(cleanVal) || 0));
    setMonthlyPayment(Math.round((netP * effectiveFactor) + parseNumber(extraMonthlyContribution)).toString());
  };

  const handleExtraMonthlyChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setExtraMonthlyContribution(cleanVal);
    const p = parseNumber(totalPrice);
    const netP = Math.max(0, p - parseNumber(extraDownPayment));
    setMonthlyPayment(Math.round((netP * effectiveFactor) + (parseFloat(cleanVal) || 0)).toString());
  };

  useEffect(() => {
    const p = parseNumber(totalPrice);
    const netP = Math.max(0, p - parseNumber(extraDownPayment));
    if (netP > 0) {
      setMonthlyPayment(Math.round((netP * effectiveFactor) + parseNumber(extraMonthlyContribution)).toString());
    }
  }, [customTerm, effectiveFactor]);

  const clear = () => {
    setTotalPrice('');
    setMonthlyPayment('');
    setExtraDownPayment('');
    setExtraMonthlyContribution('');
    setCustomTerm('192');
  };

  const rawP = parseNumber(totalPrice);
  const extraDown = parseNumber(extraDownPayment);
  const netFinancing = Math.max(0, rawP - extraDown);
  const totalDownPayment = (rawP * FACTOR_ENGANCHE) + extraDown;
  const currentExtraMonthly = parseNumber(extraMonthlyContribution);
  const totalMonthlyLoad = (netFinancing * effectiveFactor) + currentExtraMonthly;
  const minIncomeRequired = totalMonthlyLoad / INCOME_RATIO;
  
  const taxesEscrituracion = netFinancing * 0.05;
  const appraisalFee = 7500;
  const totalOperatingExpenses = taxesEscrituracion + appraisalFee;
  
  const netLiquidCredit = netFinancing > 0 ? netFinancing - totalOperatingExpenses : 0;
  const suggestedLivingBudget = minIncomeRequired > 0 ? minIncomeRequired - totalMonthlyLoad : 0;
  const baseMonthly = netFinancing * effectiveFactor;
  const projectedReducedTerm = currentExtraMonthly > 0 ? Math.ceil((baseMonthly * currentTerm) / totalMonthlyLoad) : currentTerm;
  const totalCostOfCredit = (totalMonthlyLoad * projectedReducedTerm) + totalDownPayment + totalOperatingExpenses;

  const handleCopySummary = () => {
    if (rawP <= 0) {
      toast({ title: "Calculadora vacía", description: "Ingresa un monto para copiar la cotización.", variant: "destructive" });
      return;
    }
    
    const text = `📊 *COTIZACIÓN FINANTO*\n\n` +
                 `• Crédito: *${formatCurrency(rawP)}*\n` +
                 `• Mensualidad: *${formatCurrency(totalMonthlyLoad)}*\n` +
                 `• Enganche Base: *${formatCurrency(totalDownPayment)}*\n` +
                 `• Escrituración (5%): *${formatCurrency(taxesEscrituracion)}*\n` +
                 `• Avalúo (Est.): *${formatCurrency(appraisalFee)}*`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Cotización copiada", description: "Datos listos para enviar por WhatsApp." });
    });
  };

  return (
    <>
      <Card className="shadow-xl bg-card border-border overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="text-primary w-6 h-6" />
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-headline font-semibold">Calculadora rápida</CardTitle>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground/40 cursor-help hover:text-primary transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] p-3 text-[11px] leading-relaxed border-white border bg-black text-white" side="top">
                      <p className="font-bold mb-1 text-primary">Modelo de Negocio Finanto</p>
                      Simulador basado en el Plan Tradicional 12pp. Proyecta mensualidades competitivas con un enganche mínimo del 3% y plazos flexibles de hasta 192 meses.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onExpandedChange(true)} className="h-8 w-8 text-muted-foreground/60 hover:text-primary">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-muted-foreground">Plan Tradicional 12pp</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <CalculatorInputs 
            totalPrice={totalPrice} monthlyPayment={monthlyPayment} 
            onPriceChange={handleTotalPriceChange} onMonthlyChange={handleMonthlyPaymentChange} 
            formatWithCommas={formatWithCommas} customTerm={customTerm}
          />
          <div className="space-y-3 p-4 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Inversión Inicial</span>
              <span className="text-[10px] font-bold text-primary">{formatCurrency(totalDownPayment)}</span>
            </div>
            <Progress value={Math.min(100, (totalDownPayment / (rawP || 1)) * 100)} className="h-2" />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase">Factor: {(effectiveFactor * 100).toFixed(4)}%</span>
            <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-destructive h-8 px-2"><RotateCcw className="mr-1 h-3.5 w-3.5" /> Reiniciar</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-calculator-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30"><Calculator className="text-primary w-6 h-6" /></div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold">Simulador Profesional de Crédito</DialogTitle>
                <DialogDescription className="text-xs">Ajuste de escenarios y gastos operativos.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10"><X className="w-5 h-5" /></Button></DialogClose>
          </DialogHeader>

          <TooltipProvider>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              <section className="bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-inner">
                <CalculatorInputs isModal totalPrice={totalPrice} monthlyPayment={monthlyPayment} onPriceChange={handleTotalPriceChange} onMonthlyChange={handleMonthlyPaymentChange} formatWithCommas={formatWithCommas} customTerm={customTerm} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-5 p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary"><TrendingUp className="w-5 h-5" /><h4 className="text-[10px] font-bold uppercase">Estructura del Crédito</h4></div>
                    {currentExtraMonthly > 0 && <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Optimizado: {projectedReducedTerm} m</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div><span className="text-[10px] uppercase font-bold text-muted-foreground">Monto Base</span><p className="font-bold text-lg">{formatCurrency(rawP)}</p></div>
                    <div><span className="text-[10px] uppercase font-bold text-muted-foreground">Enganche</span><p className="font-bold text-lg text-primary">{formatCurrency(totalDownPayment)}</p></div>
                    <div><span className="text-[10px] uppercase font-bold text-muted-foreground">Mensualidad</span><p className="font-bold text-lg text-primary">{formatCurrency(totalMonthlyLoad)}</p></div>
                  </div>
                  <div className="pt-4 border-t border-primary/20"><span className="text-[10px] uppercase font-bold text-primary">Inversión Final Proyectada</span><p className="font-bold text-2xl text-primary">{formatCurrency(totalCostOfCredit)}</p></div>
                </div>

                <div className="lg:col-span-4 p-6 rounded-2xl border border-accent/20 bg-accent/5 space-y-4 flex flex-col">
                  <div className="flex items-center gap-2 text-accent"><Receipt className="w-5 h-5" /><h4 className="text-[10px] font-bold uppercase">Gastos e Inversión</h4></div>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Escrituración (5%)</span>
                      <p className="font-bold text-lg">{formatCurrency(taxesEscrituracion)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Inversión Total</span>
                      <p className="font-bold text-lg text-accent">{formatCurrency(totalDownPayment + totalOperatingExpenses)}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-border/10">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Avalúo (Est. $7,500)</span>
                      <p className="font-bold text-sm text-accent/80">{formatCurrency(appraisalFee)}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-accent/20"><span className="text-[10px] uppercase font-bold text-accent">Saldo Líquido</span><p className="font-bold text-2xl text-accent">{formatCurrency(netLiquidCredit)}</p></div>
                </div>

                <div className="lg:col-span-3">
                  <div className="p-6 rounded-2xl border-2 border-secondary bg-secondary/20 h-full flex flex-col justify-center">
                    <p className="text-[10px] text-primary uppercase font-bold mb-1">Ingreso mín. requerido</p>
                    <p className="text-2xl font-bold">{formatCurrency(minIncomeRequired)}</p>
                    <div className="mt-4 p-3 bg-secondary/30 rounded-xl"><span className="text-[10px] font-bold uppercase">Presupuesto libre</span><p className="text-lg font-bold">{formatCurrency(suggestedLivingBudget)}</p></div>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ajustes" className="border rounded-2xl px-6 bg-card/50 overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-primary"><Settings2 className="w-5 h-5" /><span className="text-sm font-bold uppercase">Ajustes de Escenario</span></div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 border-t border-border/20 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                      <div><Label className="text-[10px] font-bold uppercase">Enganche Extra</Label><Input className="mt-1 h-10 text-sm" placeholder="Ej. 50,000" value={formatWithCommas(extraDownPayment)} onChange={e => handleExtraDownChange(e.target.value)} /></div>
                      <div><Label className="text-[10px] font-bold uppercase">Aportación Mensual Extra</Label><Input className="mt-1 h-10 text-sm" placeholder="Ej. 2,000" value={formatWithCommas(extraMonthlyContribution)} onChange={e => handleExtraMonthlyChange(e.target.value)} /></div>
                      <div><Label className="text-[10px] font-bold uppercase">Plazo (Meses)</Label><Input className="mt-1 h-10 text-sm font-bold" type="number" value={customTerm} onChange={e => setCustomTerm(e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TooltipProvider>

          <div className="p-6 border-t border-border/40 bg-card/10 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2 px-4 rounded-xl bg-muted border border-border/50 text-[10px] font-bold uppercase flex items-center gap-2"><Coins className="w-4 h-4 text-primary" /> Proyección Informativa</div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleCopySummary} variant="outline" className="h-12 px-6 border-green-500 text-green-500 font-bold rounded-xl"><Copy className="w-4 h-4 mr-2" /> Copiar Resumen</Button>
              <Button variant="ghost" onClick={clear} className="h-12 px-4 text-muted-foreground hover:text-destructive"><RotateCcw className="w-4 h-4 mr-2" /> Limpiar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
