'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import VersionManagement from '@/components/admin/VersionManagement';

const VersionsAdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="版本管理" 
        subtitle="管理數據版本，支持恢復和比較"
      >
        <VersionManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default VersionsAdminPage;