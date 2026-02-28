'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import SettingsPage from '@/components/admin/SettingsPage';

const SettingsAdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="系統設置" 
        subtitle="配置系統參數和行為"
      >
        <SettingsPage />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default SettingsAdminPage;