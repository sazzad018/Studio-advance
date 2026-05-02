import React, { useState, useEffect } from 'react';
import { Users, Camera, Image as ImageIcon, Calendar, DollarSign, TrendingDown, TrendingUp, Bell, Clock, LayoutGrid, List } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ClientReminder, ClientProfile } from './AllClients';

export default function Dashboard() {
  const { clients, content, schedule } = useData();
  const { currentUser } = useAuth();
  
  const [reminders, setReminders] = useState<ClientReminder[]>([]);
  const [allClientsProfiles, setAllClientsProfiles] = useState<ClientProfile[]>([]);
  const [reminderView, setReminderView] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    const rm = localStorage.getItem('allClientsReminders');
    if (rm) setReminders(JSON.parse(rm));
    
    const cp = localStorage.getItem('allClientsData');
    if (cp) setAllClientsProfiles(JSON.parse(cp));
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const myReminders = reminders.filter(r => isAdmin || r.assignedToId === currentUser?.id);
  const activeReminders = myReminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const allProjects = clients.flatMap(c => c.projects || []).filter(project => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      return project.contentWriterId === currentUser.id || project.editorId === currentUser.id;
    }
    return true;
  });

  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter(p => p.status !== 'Completed').length;

  const canSee = (permId: string) => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return true;
    return currentUser?.projectPermissions?.includes(permId) ?? false;
  };

  const totalProjectValue = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalExpenses = allProjects.reduce((sum, p) => sum + (p.modelPayment || 0) + (p.extraExpenses || 0), 0);
  const totalRevenue = totalProjectValue - totalExpenses;

  return (
    <div className="space-y-6">
      {activeReminders.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
              <Bell size={20} className="animate-pulse" /> গুরুত্বপূর্ণ রিমাইন্ডারসমূহ
            </h2>
            <div className="flex bg-white rounded-lg p-1 border border-orange-200 shadow-sm">
              <button 
                onClick={() => setReminderView('list')}
                className={`p-1.5 rounded-md ${reminderView === 'list' ? 'bg-orange-100 text-orange-700' : 'text-gray-400 hover:text-gray-600'}`}
                title="লিস্ট ভিউ"
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setReminderView('grid')}
                className={`p-1.5 rounded-md ${reminderView === 'grid' ? 'bg-orange-100 text-orange-700' : 'text-gray-400 hover:text-gray-600'}`}
                title="গ্রিড ভিউ"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
          <div className={`${reminderView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col space-y-3'}`}>
            {activeReminders.map(reminder => {
              const client = allClientsProfiles.find(c => c.id === reminder.clientId);
              return (
                <div key={reminder.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex gap-4 items-start">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{client?.businessName || 'Unknown Client'}</h3>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{reminder.text}</p>
                    <p className="text-xs font-semibold text-orange-600 mt-2 flex items-center gap-1">
                      <Calendar size={14} /> তারিখ: {new Date(reminder.dueDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ড্যাশবোর্ড ওভারভিউ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট ক্লায়েন্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Camera size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">অ্যাক্টিভ প্রজেক্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{activeProjects} / {totalProjects}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট কনটেন্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{content.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">আসন্ন ইভেন্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{schedule.length}</p>
          </div>
        </div>
      </div>

      {canSee('project-financials') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">মোট কত টাকার প্রোজেক্ট</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">৳{totalProjectValue.toLocaleString('bn-BD')}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">মোট এক্সপেন্স</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">৳{totalExpenses.toLocaleString('bn-BD')}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">রেভিনিউ</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">৳{totalRevenue.toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
              <TrendingUp size={16} />
            </span>
            সাম্প্রতিক প্রজেক্টসমূহ
          </h2>
          <div className="space-y-4">
            {clients.flatMap(c => c.projects || []).slice(0, 3).map((project) => (
              <div key={project.id} className="flex justify-between items-center p-5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {project.priority === 'Urgent' && <span className="inline-block mr-2 text-red-600 text-sm" title="জরুরী (Urgent)">🔥</span>}
                    {project.title}
                  </h3>
                  {canSee('project-financials') && (
                    <p className="text-sm font-medium text-gray-500">বাজেট: ৳{project.budget.toLocaleString()}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 text-xs font-bold tracking-wide rounded-full uppercase ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                    project.status === 'Shooting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  } border`}>
                    {project.status}
                  </span>
                  {project.priority === 'Urgent' && (
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mr-3">
              <Calendar size={16} />
            </span>
            আসন্ন শিডিউল
          </h2>
          <div className="space-y-4">
            {schedule.slice(0, 3).map((event) => (
              <div key={event.id} className="flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors border border-gray-200/60 shadow-sm rounded-2xl">
                <div className="flex items-center space-x-5">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 p-3 rounded-xl text-center min-w-[70px] shadow-inner border border-orange-200/50">
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5">{new Date(event.date).toLocaleString('bn-BD', { month: 'short' })}</p>
                    <p className="text-2xl font-black leading-none">{new Date(event.date).getDate()}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-0.5">{event.title}</h3>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span>
                      {event.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
