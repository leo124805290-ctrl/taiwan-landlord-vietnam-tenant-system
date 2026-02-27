'use client';

import React from 'react';
import { AdminLayout, AdminDashboard, AdminRouteGuard } from '@/components/admin';

const AdminPage: React.FC = () => {
  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout title="管理儀表板" subtitle="系統概覽和快速操作">
        <AdminDashboard />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default AdminPage;