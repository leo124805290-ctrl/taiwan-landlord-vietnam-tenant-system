'use client';

import React from 'react';
import { AdminLayout, AdminRouteGuard } from '@/components/admin';
import UserManagement from '@/components/admin/UserManagement';

const UsersPage: React.FC = () => {
  const handleEditUser = (user: any) => {
    console.log('編輯用戶:', user);
    // 這裡可以打開詳細的編輯對話框
  };

  const handleDeleteUser = (userId: number) => {
    console.log('刪除用戶:', userId);
    // 這裡可以顯示確認對話框
  };

  return (
    <AdminRouteGuard requiredRole="admin">
      <AdminLayout 
        title="用戶管理" 
        subtitle="管理系統用戶帳號、角色和權限"
      >
        <UserManagement 
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default UsersPage;