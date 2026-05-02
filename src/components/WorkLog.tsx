import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Search } from 'lucide-react';

interface WorkLogEntry {
  id: string;
  userId: string;
  userName: string;
  date: string;
  workDone: string;
  submittedAt: string;
}

export default function WorkLog() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<WorkLogEntry[]>(() => {
    const saved = localStorage.getItem('workLogs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newLog, setNewLog] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim() || !currentUser) return;

    const entry: WorkLogEntry = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      workDone: newLog,
      submittedAt: new Date().toISOString(),
    };

    const newLogs = [entry, ...logs];
    setLogs(newLogs);
    localStorage.setItem('workLogs', JSON.stringify(newLogs));
    setNewLog('');
  };

  const visibleLogs = isAdmin 
    ? logs 
    : logs.filter(log => log.userId === currentUser?.id);

  const filteredLogs = filterDate 
    ? visibleLogs.filter(log => log.date === filterDate)
    : visibleLogs;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ওয়ার্ক লগ</h1>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-none focus:ring-0 text-sm text-gray-700 bg-transparent"
          />
        </div>
      </div>

      {(!isAdmin || currentUser?.role !== 'admin') && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">আজকের কাজের বিবরণ দিন</h2>
          <textarea
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            placeholder="আজকে কি কি কাজ করেছেন তা এখানে লিখুন..."
            className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newLog.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              সাবমিট করুন
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">কাজের তালিকা</h2>
        </div>
        <div className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              কোনো রেকর্ড পাওয়া যায়নি
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredLogs.map(log => (
                <li key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {isAdmin && <h3 className="font-semibold text-indigo-700">{log.userName}</h3>}
                      <span className="text-sm text-gray-500">
                        {new Date(log.submittedAt).toLocaleDateString('bn-BD')} - {new Date(log.submittedAt).toLocaleTimeString('bn-BD')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{log.workDone}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
