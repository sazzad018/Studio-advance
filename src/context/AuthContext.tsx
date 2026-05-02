import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'admin' | 'manager' | 'user';

export const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড' },
  { id: 'projects', label: 'প্রজেক্ট লিস্ট' },
  { id: 'clients', label: 'ক্লায়েন্ট প্রোফাইল' },
  { id: 'models', label: 'মডেল বিশ্লেষণ' },
  { id: 'scheduling', label: 'শিডিউলিং' },
  { id: 'lead', label: 'লিড' },
  { id: 'invoice', label: 'ইনভয়েস' },
  { id: 'daily-tasks', label: 'ডেইলি টাস্ক' },
  { id: 'terms', label: 'কোম্পানি কন্ডিশন' },
  { id: 'task-manager', label: 'টাস্ক ম্যানেজার' },
  { id: 'portfolio', label: 'স্টুডিও পোর্টফোলিও' },
  { id: 'employees', label: 'এমপ্লয়ি লিস্ট' },
  { id: 'users', label: 'ইউজার ম্যানেজমেন্ট' },
  { id: 'messages', label: 'মেসেজ বক্স' }
];

export const PROJECT_PERMISSIONS = [
  { id: 'project-financials', label: 'বাজেট ও পেমেন্ট (Budget & Payment)' },
  { id: 'project-scripts', label: 'স্ক্রিপ্ট ও ফরম্যাট (Scripts & Format)' },
  { id: 'project-content', label: 'কনটেন্ট লগ (Content Log)' },
  { id: 'project-links', label: 'লিঙ্কসমূহ (Links)' },
  { id: 'project-dates', label: 'তারিখ (Dates)' },
  { id: 'project-team', label: 'টিম মেম্বার (Assigned Team)' }
];

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  permissions: string[];
  projectPermissions?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const defaultAdmin: User = {
  id: 'u1',
  name: 'Admin',
  email: 'admin',
  password: 'admin',
  role: 'admin',
  permissions: ALL_PERMISSIONS.map(p => p.id),
  projectPermissions: PROJECT_PERMISSIONS.map(p => p.id)
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studio_auth_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('studio_auth_users');
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  useEffect(() => {
    localStorage.setItem('studio_auth_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('studio_auth_users', JSON.stringify(users));
  }, [users]);

  const login = (email: string, password?: string) => {
    const user = users.find(u => u.email === email && (!password || u.password === password));
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `u${Date.now()}` };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedFields } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
