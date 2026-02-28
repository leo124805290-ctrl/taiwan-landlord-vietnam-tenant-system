'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import LoginLogs from '@/components/admin/LoginLogs';

const LogsAdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="系統日誌" 
        subtitle="查看和管理系統登入及操作記錄"
      >
        <LoginLogs />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default LogsAdminPage;