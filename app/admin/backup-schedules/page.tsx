'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import BackupSchedules from '@/components/admin/BackupSchedules';

const BackupSchedulesAdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="自動備份排程" 
        subtitle="設定和管理自動備份排程"
      >
        <BackupSchedules />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default BackupSchedulesAdminPage;