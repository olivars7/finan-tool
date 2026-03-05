
'use client';

/**
 * @fileOverview Página de diagnóstico temporal para validar la conexión con Firebase.
 * IMPORTANTE: Eliminar este archivo una vez confirmada la conectividad en producción.
 */

import { useEffect, useState } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Intentamos obtener la configuración de las variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function FirebaseTestPage() {
  const [status, setStatus] = useState({
    firebase: false,
    auth: false,
    firestore: false,
    loading: true,
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        // CHECK 1: Firebase Core
        // Si no está inicializado, intentamos hacerlo con la config detectada
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApp();
        }
        const firebaseOk = !!app;

        // CHECK 2: Google Auth available
        const auth = getAuth(app);
        const authOk = !!auth;

        // CHECK 3: Firestore DB available
        const db = getFirestore(app);
        const dbOk = !!db;

        setStatus({
          firebase: firebaseOk,
          auth: authOk,
          firestore: dbOk,
          loading: false,
        });
      } catch (error) {
        console.error('Firebase diagnostic error:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    runDiagnostic();
  }, []);

  const allSystemsGo = status.firebase && status.auth && status.firestore;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white">FIREBASE TEST</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Panel de Diagnóstico Finanto</p>
        </header>

        <div className="grid gap-4">
          {/* Indicador Firebase Core */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Servicio</p>
              <p className="text-xl font-bold text-white">Firebase Core</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={status.firebase ? 'text-green-400 font-black uppercase text-sm' : 'text-red-500 font-black uppercase text-sm'}>
                {status.firebase ? '🟢 conectado' : '🔴 no detectado'}
              </span>
            </div>
          </div>

          {/* Indicador Google Auth */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Autenticación</p>
              <p className="text-xl font-bold text-white">Google Auth</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={status.auth ? 'text-green-400 font-black uppercase text-sm' : 'text-red-500 font-black uppercase text-sm'}>
                {status.auth ? '🟢 disponible' : '🔴 no disponible'}
              </span>
            </div>
          </div>

          {/* Indicador Firestore DB */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Base de Datos</p>
              <p className="text-xl font-bold text-white">Firestore DB</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={status.firestore ? 'text-green-400 font-black uppercase text-sm' : 'text-red-500 font-black uppercase text-sm'}>
                {status.firestore ? '🟢 disponible' : '🔴 no disponible'}
              </span>
            </div>
          </div>
        </div>

        {allSystemsGo && !status.loading && (
          <div className="p-8 bg-green-500/10 border-2 border-green-500/20 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
            <p className="text-green-400 font-black text-2xl leading-none">
              Finanto está correctamente conectado a Firebase
            </p>
          </div>
        )}

        {!status.loading && !allSystemsGo && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center italic text-red-400 text-sm">
            Error de configuración detectado. Revisa las variables de entorno o el archivo de inicialización.
          </div>
        )}

        <footer className="text-center">
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">
            Herramienta de Desarrollo • Eliminar tras validación
          </p>
        </footer>
      </div>
    </div>
  );
}
