import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Shield, Loader } from 'lucide-react';

interface AdminRouteGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  redirectTo?: string;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  requiredRole = 'admin',
  redirectTo = '/'
}) => {
  const { state, isLoading } = useApp();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  
  useEffect(() => {
    const checkPermission = () => {
      if (isLoading) {
        return; // 等待應用加載完成
      }
      
      // 檢查是否已登入
      if (!state.user) {
        console.log('未登入，重定向到登入頁');
        router.push('/');
        return;
      }
      
      // 檢查用戶角色
      const userRole = state.user.role;
      const isSuperAdmin = userRole === 'super_admin';
      const isAdmin = userRole === 'admin';
      
      let hasAccess = false;
      
      if (requiredRole === 'super_admin') {
        hasAccess = isSuperAdmin;
      } else {
        // admin 權限：super_admin 和 admin 都可以訪問
        hasAccess = isSuperAdmin || isAdmin;
      }
      
      if (!hasAccess) {
        console.log(`權限不足：需要 ${requiredRole}，當前是 ${userRole}`);
        router.push(redirectTo);
        return;
      }
      
      setHasPermission(true);
      setIsChecking(false);
    };
    
    checkPermission();
  }, [state.user, isLoading, requiredRole, router, redirectTo]);
  
  // 加載中顯示
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">檢查權限中...</p>
        </div>
      </div>
    );
  }
  
  // 權限不足顯示
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">權限不足</h2>
          <p className="text-gray-600 text-center mb-6">
            您需要{requiredRole === 'super_admin' ? '超級管理員' : '管理員'}權限才能訪問此頁面。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回主系統
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回管理首頁
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 有權限，顯示子組件
  return <>{children}</>;
};

export default AdminRouteGuard;