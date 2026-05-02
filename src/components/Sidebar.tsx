import React, { useState, useRef } from 'react';
import { LayoutDashboard, Users, Camera, Image as ImageIcon, Calendar, Briefcase, FileText, Upload, X, ClipboardList, Shield, LogOut, UserPlus, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type SidebarProps = {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
};

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const [appLogo, setAppLogo] = useState<string>(() => localStorage.getItem('appLogo') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, logout } = useAuth();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAppLogo(result);
        localStorage.setItem('appLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppLogo('');
    localStorage.removeItem('appLogo');
  };

  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'projects', label: 'প্রজেক্ট লিস্ট', icon: Briefcase },
    { id: 'messages', label: 'মেসেজ বক্স', icon: MessageSquare },
    { id: 'clients', label: 'ক্লায়েন্ট প্রোফাইল', icon: Users },
    { id: 'all-clients', label: 'অল ক্লায়েন্ট', icon: Briefcase },
    { id: 'message-templates', label: 'মেসেজ টেমপ্লেটস', icon: MessageSquare },
    { id: 'models', label: 'মডেল বিশ্লেষণ', icon: Camera },
    { id: 'scheduling', label: 'শিডিউলিং', icon: Calendar },
    { id: 'lead', label: 'লিড', icon: UserPlus },
    { id: 'invoice', label: 'ইনভয়েস', icon: FileText },
    { id: 'daily-tasks', label: 'ডেইলি টাস্ক', icon: ClipboardList },
    { id: 'terms', label: 'কোম্পানি কন্ডিশন', icon: FileText },
    { id: 'task-manager', label: 'টাস্ক ম্যানেজার', icon: ClipboardList },
    { id: 'portfolio', label: 'স্টুডিও পোর্টফোলিও', icon: ImageIcon },
    { id: 'work-log', label: 'ওয়ার্ক লগ', icon: FileText },
    { id: 'time-tracking', label: 'ইন/আউট টাইম', icon: Clock },
    { id: 'employees', label: 'এমপ্লয়ি লিস্ট', icon: Users },
  ].filter(item => {
    if (currentUser?.role === 'admin') return true;
    if (item.id === 'work-log' || item.id === 'time-tracking') return true;
    return currentUser?.permissions?.includes(item.id);
  });

  if (currentUser?.role === 'admin' || currentUser?.permissions?.includes('users')) {
    tabs.push({ id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Shield });
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div 
          className="relative group cursor-pointer flex items-center h-12 rounded-lg hover:bg-gray-50 transition-colors p-2 -mx-2"
          onClick={() => fileInputRef.current?.click()}
          title="লোগো পরিবর্তন করতে ক্লিক করুন"
        >
          {appLogo ? (
            <div className="w-full flex items-center justify-between">
              <img src={appLogo} alt="App Logo" className="max-h-10 max-w-[180px] object-contain" />
              <button 
                onClick={handleRemoveLogo}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="লোগো মুছুন"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
                <Camera className="mr-2" />
                স্টুডিও প্রো
              </h1>
              <Upload size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-sm font-medium text-gray-900 truncate pr-2">
            {currentUser?.name}
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-600 transition-colors" title="লগআউট">
            <LogOut size={18} />
          </button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          &copy; 2026 Studio Pro
        </div>
      </div>
    </div>
  );
}
