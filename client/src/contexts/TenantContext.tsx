/**
 * سياق الجهة (Tenant Context)
 * يوفر معلومات الجهة الحالية لجميع مكونات التطبيق
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export interface TenantColors {
  primary?: string;
  secondary?: string;
  background?: string;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  type: 'halaqa' | 'association' | 'academy' | 'independent_sheikh';
  logo?: string;
  colors?: TenantColors;
  city?: string;
  country?: string;
  settings?: {
    allowSelfRegistration?: boolean;
    requireParentApproval?: boolean;
    maxStudents?: number;
    subscriptionPlan?: string;
  };
}

interface TenantContextValue {
  tenant: Tenant | null;
  tenantSlug: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  tenantSlug: null,
  isLoading: false,
  error: null,
  refetch: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // استخراج الـ slug من الـ URL
  // مثال: /tuwaiq/student → slug = 'tuwaiq'
  const tenantSlug = extractTenantSlug(location);

  function extractTenantSlug(path: string): string | null {
    const reserved = [
      '', 'login', 'register', 'forgot-password',
      'quran', 'about', 'courses', 'student', 'teacher',
      'admin', 'super-admin', 'session', 'profile', 'cart',
      'level-test', 'bank-transfer-checkout',
    ];
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    const first = parts[0];
    if (reserved.includes(first)) return null;
    // slug يحتوي على أحرف إنجليزية وأرقام وشرطات فقط
    if (/^[a-z0-9\-]+$/.test(first)) return first;
    return null;
  }

  async function fetchTenant(slug: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenants/slug/${slug}`);
      if (!res.ok) {
        if (res.status === 404) setError('الجهة غير موجودة');
        else setError('خطأ في تحميل بيانات الجهة');
        setTenant(null);
      } else {
        const data = await res.json();
        setTenant(data);
        // تطبيق ألوان الجهة على المتغيرات CSS
        if (data.colors) applyTenantColors(data.colors);
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  }

  function applyTenantColors(colors: TenantColors) {
    const root = document.documentElement;
    if (colors.primary) root.style.setProperty('--tenant-primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--tenant-secondary', colors.secondary);
    if (colors.background) root.style.setProperty('--tenant-bg', colors.background);
  }

  useEffect(() => {
    if (tenantSlug) {
      fetchTenant(tenantSlug);
    } else {
      setTenant(null);
      // إزالة ألوان الجهة عند العودة للصفحة الرئيسية
      const root = document.documentElement;
      root.style.removeProperty('--tenant-primary');
      root.style.removeProperty('--tenant-secondary');
      root.style.removeProperty('--tenant-bg');
    }
  }, [tenantSlug]);

  return (
    <TenantContext.Provider value={{
      tenant,
      tenantSlug,
      isLoading,
      error,
      refetch: () => tenantSlug ? fetchTenant(tenantSlug) : undefined,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
