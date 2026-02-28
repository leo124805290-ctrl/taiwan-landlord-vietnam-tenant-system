'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import Notifications from '@/components/admin/Notifications';

const NotificationsAdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="通知管理" 
        subtitle="管理系統通知和用戶提醒"
      >
        <Notifications />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default NotificationsAdminPage;