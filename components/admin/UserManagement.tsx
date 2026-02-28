import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus,
  CheckCircle,
  XCircle,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface User {
  id: number;
  username: string;
  role: 'super_admin' | 'admin' | 'viewer';
  full_name?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
}

interface UserManagementProps {
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: number) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onEditUser, onDeleteUser }) => {
  const { state } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 篩選狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // 編輯狀態
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // 模擬用戶數據
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'super_admin',
      role: 'super_admin',
      full_name: '系統管理員',
      email: 'admin@example.com',
      phone: '0912-345-678',
      status: 'active',
      last_login: '2026-02-27T22:30:00Z',
      created_at: '2026-02-25T10:00:00Z'
    },
    {
      id: 2,
      username: 'manager',
      role: 'admin',
      full_name: '王經理',
      email: 'manager@example.com',
      phone: '0923-456-789',
      status: 'active',
      last_login: '2026-02-27T20:15:00Z',
      created_at: '2026-02-26T14:30:00Z'
    },
    {
      id: 3,
      username: 'viewer1',
      role: 'viewer',
      full_name: '張查看員',
      email: 'viewer1@example.com',
      status: 'active',
      last_login: '2026-02-27T18:45:00Z',
      created_at: '2026-02-26T16:20:00Z'
    },
    {
      id: 4,
      username: 'viewer2',
      role: 'viewer',
      full_name: '李查看員',
      status: 'inactive',
      created_at: '2026-02-27T09:15:00Z'
    },
    {
      id: 5,
      username: 'test_admin',
      role: 'admin',
      full_name: '測試管理員',
      email: 'test@example.com',
      phone: '0934-567-890',
      status: 'suspended',
      last_login: '2026-02-26T11:30:00Z',
      created_at: '2026-02-27T11:45:00Z'
    },
    {
      id: 6,
      username: 'user3',
      role: 'viewer',
      full_name: '陳用戶',
      status: 'active',
      last_login: '2026-02-27T15:20:00Z',
      created_at: '2026-02-27T13:10:00Z'
    },
    {
      id: 7,
      username: 'user4',
      role: 'viewer',
      full_name: '林用戶',
      email: 'user4@example.com',
      status: 'active',
      last_login: '2026-02-27T12:45:00Z',
      created_at: '2026-02-27T10:30:00Z'
    },
    {
      id: 8,
      username: 'user5',
      role: 'viewer',
      status: 'inactive',
      created_at: '2026-02-27T08:15:00Z'
    }
  ];
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      
      // 暫時使用模擬數據
      setTimeout(() => {
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setTotalPages(Math.ceil(mockUsers.length / itemsPerPage));
        setError(null);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('獲取用戶列表失敗:', err);
      setError('無法載入用戶列表');
      setLoading(false);
    }
  };
  
  const filterUsers = () => {
    let filtered = [...users];
    
    // 搜索過濾
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      );
    }
    
    // 角色過濾
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // 狀態過濾
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // 重置到第一頁
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
  };
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
    if (onEditUser) onEditUser(user);
  };
  
  const handleDeleteUser = (userId: number) => {
    if (window.confirm('確定要刪除/禁用這個用戶嗎？')) {
      // 這裡應該調用後端 API
      console.log('刪除用戶:', userId);
      if (onDeleteUser) onDeleteUser(userId);
      
      // 更新本地狀態
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  
  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    // 這裡應該調用後端 API
    console.log(`更新用戶 ${user.id} 狀態: ${user.status} -> ${newStatus}`);
    
    // 更新本地狀態
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
  };
  
  const handleAddUser = () => {
    // 這裡應該打開添加用戶對話框
    console.log('添加新用戶');
  };
  
  // 分頁計算
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  // 角色顯示文本
  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin': return '超級管理員';
      case 'admin': return '管理員';
      case 'viewer': return '查看者';
      default: return role;
    }
  };
  
  // 狀態顯示文本和顏色
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '啟用', color: 'text-green-600', bg: 'bg-green-100' };
      case 'inactive':
        return { text: '停用', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'suspended':
        return { text: '暫停', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };
  
  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '從未登入';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入用戶列表中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-red-800">載入失敗</h2>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">用戶管理</h1>
          <p className="text-gray-600 mt-1">管理系統用戶帳號和權限</p>
        </div>
        
        <button
          onClick={handleAddUser}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          添加用戶
        </button>
      </div>
      
      {/* 篩選和搜索欄 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用戶名、姓名、郵箱..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* 角色篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有角色</option>
              <option value="super_admin">超級管理員</option>
              <option value="admin">管理員</option>
              <option value="viewer">查看者</option>
            </select>
          </div>
          
          {/* 狀態篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有狀態</option>
              <option value="active">啟用</option>
              <option value="inactive">停用</option>
              <option value="suspended">暫停</option>
            </select>
          </div>
        </div>
        
        {/* 統計信息 */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            總用戶: {users.length}
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            啟用: {users.filter(u => u.status === 'active').length}
          </div>
          <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            停用: {users.filter(u => u.status === 'inactive').length}
          </div>
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            暫停: {users.filter(u => u.status === 'suspended').length}
          </div>
        </div>
      </div>
      
      {/* 用戶表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後登入
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  創建時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <UserPlus className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">沒有找到匹配的用戶</p>
                      <p className="text-gray-400 text-sm mt-1">嘗試調整搜索條件或添加新用戶</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const statusInfo = getStatusInfo(user.status);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="font-bold text-blue-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                            <div className="flex items-center mt-1 space-x-3">
                              {user.email && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {user.email}
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Shield className={`w-4 h-4 mr-2 ${
                            user.role === 'super_admin' ? 'text-purple-600' :
                            user.role === 'admin' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getRoleText(user.role)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.status === 'active' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(user.last_login)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('zh-TW')}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="編輯用戶"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1 rounded ${
                              user.status === 'active' 
                                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-50' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? '停用用戶' : '啟用用戶'}
                          >
                            {user.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="刪除用戶"
                            disabled={user.id === state.user?.id} // 不能刪除自己
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分頁控制 */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                顯示 <span className="font-medium">{startIndex + 1}</span> 到{' '}
                <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> 的{' '}
                <span className="font-medium">{filteredUsers.length}</span> 個結果
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一頁
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一頁
                </button>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={5}>5 條/頁</option>
                  <option value={10}>10 條/頁</option>
                  <option value={20}>20 條/頁</option>
                  <option value={50}>50 條/頁</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 編輯用戶模態框（簡單版本） */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">編輯用戶</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用戶名
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="super_admin">超級管理員</option>
                    <option value="admin">管理員</option>
                    <option value="viewer">查看者</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    狀態
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({...editingUser, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">啟用</option>
                    <option value="inactive">停用</option>
                    <option value="suspended">暫停</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // 這裡應該調用後端 API 更新用戶
                    console.log('更新用戶:', editingUser);
                    setShowEditModal(false);
                    
                    // 更新本地狀態
                    setUsers(users.map(u => 
                      u.id === editingUser.id ? editingUser : u
                    ));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存更改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
