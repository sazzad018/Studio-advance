import React, { useState } from 'react';
import { useAuth, Role, User, ALL_PERMISSIONS, PROJECT_PERMISSIONS } from '../context/AuthContext';
import { Plus, Trash2, Shield, User as UserIcon, Edit2 } from 'lucide-react';
import Modal from './Modal';

export default function UserManagement() {
  const { currentUser, users, addUser, updateUser, deleteUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const defaultNewUser: Omit<User, 'id'> = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    permissions: currentUser?.role === 'admin' ? ALL_PERMISSIONS.map(p => p.id) : (currentUser?.permissions || []),
    projectPermissions: PROJECT_PERMISSIONS.map(p => p.id) // Default all checked
  };
  
  const [employees] = useState<{id: string, name: string, email: string, designation: string}[]>(() => {
    const saved = localStorage.getItem('studio_employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState<Omit<User, 'id'>>(defaultNewUser);

  if (currentUser?.role !== 'admin' && !currentUser?.permissions?.includes('users')) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 font-medium">
        আপনার এই পেজটি দেখার অনুমতি নেই।
      </div>
    );
  }

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(defaultNewUser);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      permissions: user.permissions || [],
      projectPermissions: user.projectPermissions || PROJECT_PERMISSIONS.map(p => p.id)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => {
      if (prev.permissions.includes(permId)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <Shield className="w-10 h-10 mr-4 text-blue-600" />
          ইউজার ম্যানেজমেন্ট <span className="text-xl text-gray-500 ml-3 font-medium align-middle">{currentUser?.role === 'admin' ? '(এডমিন)' : '(ম্যানেজার)'}</span>
        </h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} className="mr-2" />
          নতুন ইউজার
        </button>
      </div>

      <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden rounded-3xl">
        <ul className="divide-y divide-gray-50">
          {users.map((user) => (
            <li key={user.id} className="hover:bg-blue-50/30 transition-colors group">
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {user.role === 'admin' ? <Shield size={24} /> : <UserIcon size={24} />}
                    </div>
                  </div>
                  <div className="ml-5">
                    <div className="text-lg font-bold text-gray-900">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                      {user.email} 
                      <span className="text-gray-300">•</span> 
                      <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-extrabold border ${
                        user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 
                        user.role === 'manager' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-gray-400 hover:text-blue-600 p-2.5 hover:bg-blue-100 rounded-xl transition-all"
                    title="এডিট"
                  >
                    <Edit2 size={20} />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        if(window.confirm('আপনি কি নিশ্চিত যে আপনি এই ইউজারকে মুছে ফেলতে চান?')) {
                           deleteUser(user.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 p-2.5 hover:bg-red-50 rounded-xl transition-all"
                      title="ডিলিট"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "ইউজার এডিট করুন" : "নতুন ইউজার যোগ করুন"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingUser && employees.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">এমপ্লয়ি সিলেক্ট করুন (ঐচ্ছিক)</label>
              <select 
                onChange={e => {
                  const emp = employees.find(emp => emp.id === e.target.value);
                  if (emp) {
                    setFormData(prev => ({ ...prev, name: emp.name, email: emp.email || prev.email }));
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium mb-2 text-sm bg-gray-50 hover:bg-white"
              >
                <option value="">-- এমপ্লয়ি সিলেক্ট করুন --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} {emp.designation ? `(${emp.designation})` : ''}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">নাম</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm bg-gray-50 hover:bg-white focus:bg-white" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">ইমেইল / ইউজারনেম</label>
            <input 
              required 
              type="text" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm bg-gray-50 hover:bg-white focus:bg-white" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">পাসওয়ার্ড</label>
            <input 
              required={!editingUser} 
              type="text" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm bg-gray-50 hover:bg-white focus:bg-white" 
              placeholder={editingUser ? "অপরিবর্তিত রাখতে ফাঁকা রাখুন" : ""}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">রোল</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value as Role})} 
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm bg-gray-50 hover:bg-white"
              disabled={currentUser?.role !== 'admin' && editingUser?.role === 'admin'}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              {(currentUser?.role === 'admin' || formData.role === 'admin') && <option value="admin">Admin</option>}
            </select>
          </div>
          
          {(formData.role === 'user' || formData.role === 'manager') && (
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">ইউজার পারমিশন (মেনু অ্যাক্সেস)</label>
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-2.5 max-h-[240px] overflow-y-auto custom-scrollbar shadow-inner">
                {ALL_PERMISSIONS.map(perm => {
                  // Managers can only assign permissions they themselves have, unless they are admin
                  const canAssign = currentUser?.role === 'admin' || currentUser?.permissions?.includes(perm.id);
                  if (!canAssign) return null;
                  
                  const isChecked = formData.permissions.includes(perm.id);
                  return (
                    <label key={perm.id} className={`flex items-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                      isChecked 
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                      <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-200 mr-3 flex-shrink-0 ${
                        isChecked 
                          ? 'bg-blue-600 border-blue-600 scale-100' 
                          : 'bg-white border-gray-300 group-hover:border-gray-400 scale-95'
                      }`}>
                        {isChecked && (
                          <svg className="w-3.5 h-3.5 text-white animate-in zoom-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <span className={`text-sm font-bold transition-colors ${
                        isChecked ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{perm.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {(formData.role === 'user' || formData.role === 'manager') && (
            <div className="pt-2">
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">প্রজেক্ট পারমিশন (প্রজেক্টে কী দেখতে পারবে)</label>
               <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-2.5 max-h-[240px] overflow-y-auto custom-scrollbar shadow-inner">
                {PROJECT_PERMISSIONS.map(perm => {
                  const isChecked = formData.projectPermissions?.includes(perm.id) || false;
                  return (
                    <label key={perm.id} className={`flex items-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                      isChecked 
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                      <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-200 mr-3 flex-shrink-0 ${
                        isChecked 
                          ? 'bg-blue-600 border-blue-600 scale-100' 
                          : 'bg-white border-gray-300 group-hover:border-gray-400 scale-95'
                      }`}>
                        {isChecked && (
                          <svg className="w-3.5 h-3.5 text-white animate-in zoom-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={() => {
                           setFormData(prev => {
                             const projectPerms = prev.projectPermissions || [];
                             if (projectPerms.includes(perm.id)) {
                               return { ...prev, projectPermissions: projectPerms.filter(p => p !== perm.id) };
                             } else {
                               return { ...prev, projectPermissions: [...projectPerms, perm.id] };
                             }
                           });
                        }}
                      />
                      <span className={`text-sm font-bold transition-colors ${
                        isChecked ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{perm.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          
          <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5 mt-6 border border-blue-600 hover:border-blue-700">
            সংরক্ষণ করুন
          </button>
        </form>
      </Modal>
    </div>
  );
}
