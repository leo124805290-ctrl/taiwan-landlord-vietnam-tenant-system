'use client';

import React, { ReactNode } from 'react';
import { AdminRouteGuard } from '@/components/admin';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AdminRouteGuard requiredRole="admin">
      {children}
    </AdminRouteGuard>
  );
};

export default AdminLayout;