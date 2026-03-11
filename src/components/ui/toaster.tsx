"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const isMobile = useIsMobile()
  const processedToastIds = useRef(new Set<string>())

  useEffect(() => {
    toasts.forEach((t) => {
      if (!processedToastIds.current.has(t.id)) {
        processedToastIds.current.add(t.id)
        
        const titleStr = t.title?.toString() || '';
        const descStr = t.description?.toString() || '';
        
        const isWelcome = titleStr.includes('¡Bienvenido a Finanto!');
        
        const isCopyAction = 
          titleStr.toLowerCase().includes('copia') || 
          descStr.toLowerCase().includes('copia');

        const isActionRequired = titleStr.includes('Acción Requerida');

        // Sonido base simple (limpio y profesional)
        let soundUrl = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"; 
        let volume = 0.3;

        if (isWelcome) {
          soundUrl = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"; 
          volume = 0.8; 
        } else if (isActionRequired) {
          soundUrl = "https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3"; 
          volume = 0.4;
        } else if (t.variant === 'destructive' || isCopyAction) {
          soundUrl = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"; 
          volume = 0.5;
        }
          
        const audio = new Audio(soundUrl)
        audio.volume = volume;
        audio.play().catch(() => {})
      }
    })

    const currentIds = new Set(toasts.map(t => t.id))
    processedToastIds.current.forEach(id => {
      if (!currentIds.has(id)) {
        processedToastIds.current.delete(id)
      }
    })
  }, [toasts])

  return (
    <ToastProvider swipeDirection={isMobile ? "up" : "right"}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
