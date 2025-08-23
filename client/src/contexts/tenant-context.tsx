import { createContext, useContext, useEffect, useState } from 'react';
import { Tenant } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './auth-context';

interface TenantContextType {
  tenant: Tenant | null;
  branding: any;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.tenantId) {
      fetchTenant();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTenant = async () => {
    try {
      const response = await apiRequest('GET', '/api/tenant');
      const tenantData = await response.json();
      setTenant(tenantData);
    } catch (error) {
      console.error('Failed to fetch tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenant = async () => {
    await fetchTenant();
  };

  const branding = tenant?.branding || {
    logo: "/assets/logo.png",
    primaryColor: "#0EA5E9",
    secondaryColor: "#0284C7",
    accentColor: "#0369A1"
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        branding,
        isLoading,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
