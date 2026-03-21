"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuidePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
