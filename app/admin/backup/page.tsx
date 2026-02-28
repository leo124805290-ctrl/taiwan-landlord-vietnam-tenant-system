'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import BackupManagement from '@/components/admin/BackupManagement';

const BackupAdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="數據備份管理" 
        subtitle="管理系統數據備份和恢復操作"
      >
        <BackupManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default BackupAdminPage;