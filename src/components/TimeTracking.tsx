import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Square, Coffee, Calendar } from 'lucide-react';

interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lunchIn: string | null;
  lunchOut: string | null;
}

export default function TimeTracking() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('timeLogs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [filterDate, setFilterDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const isAdmin = currentUser?.role === 'admin';

  // Find today's log for current user
  const today = new Date().toISOString().split('T')[0];
  const userTodayLog = logs.find(log => log.userId === currentUser?.id && log.date === today);

  const updateLog = (field: keyof TimeLog, value: string) => {
    if (!currentUser) return;
    
    let newLogs = [...logs];
    const existingLogIndex = newLogs.findIndex(log => log.userId === currentUser.id && log.date === today);

    if (existingLogIndex >= 0) {
      newLogs[existingLogIndex] = {
        ...newLogs[existingLogIndex],
        [field]: value
      };
    } else {
      newLogs.push({
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        date: today,
        checkIn: field === 'checkIn' ? value : null,
        checkOut: field === 'checkOut' ? value : null,
        lunchIn: field === 'lunchIn' ? value : null,
        lunchOut: field === 'lunchOut' ? value : null,
      });
    }

    setLogs(newLogs);
    localStorage.setItem('timeLogs', JSON.stringify(newLogs));
  };

  const handleAction = (action: 'checkIn' | 'lunchOut' | 'lunchIn' | 'checkOut') => {
    const now = new Date().toISOString();
    updateLog(action, now);
  };

  const visibleLogs = isAdmin 
    ? logs 
    : logs.filter(log => log.userId === currentUser?.id);

  const filteredLogs = filterDate 
    ? visibleLogs.filter(log => log.date === filterDate)
    : visibleLogs;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">ইন/আউট টাইম</h1>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">আজকের এটেন্ডেন্স</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleAction('checkIn')}
              disabled={!!userTodayLog?.checkIn}
              className={`flex flex-col items-center justify-center p-4 rounded-xl w-32 md:w-40 transition-all ${
                !userTodayLog?.checkIn 
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              <Play className="w-8 h-8 mb-2" />
              <span className="font-medium text-sm">ইন টাইম</span>
              <span className="text-xs mt-1">{formatTime(userTodayLog?.checkIn || null)}</span>
            </button>

            <button
              onClick={() => handleAction('lunchOut')}
              disabled={!userTodayLog?.checkIn || !!userTodayLog?.lunchOut}
              className={`flex flex-col items-center justify-center p-4 rounded-xl w-32 md:w-40 transition-all ${
                userTodayLog?.checkIn && !userTodayLog?.lunchOut
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              <Coffee className="w-8 h-8 mb-2" />
              <span className="font-medium text-sm">লাঞ্চে যাচ্ছি</span>
              <span className="text-xs mt-1">{formatTime(userTodayLog?.lunchOut || null)}</span>
            </button>

            <button
              onClick={() => handleAction('lunchIn')}
              disabled={!userTodayLog?.lunchOut || !!userTodayLog?.lunchIn}
              className={`flex flex-col items-center justify-center p-4 rounded-xl w-32 md:w-40 transition-all ${
                userTodayLog?.lunchOut && !userTodayLog?.lunchIn
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              <Coffee className="w-8 h-8 mb-2" />
              <span className="font-medium text-sm">লাঞ্চ থেকে ফিরলাম</span>
              <span className="text-xs mt-1">{formatTime(userTodayLog?.lunchIn || null)}</span>
            </button>

            <button
              onClick={() => handleAction('checkOut')}
              disabled={!userTodayLog?.checkIn || !!userTodayLog?.checkOut}
              className={`flex flex-col items-center justify-center p-4 rounded-xl w-32 md:w-40 transition-all ${
                userTodayLog?.checkIn && !userTodayLog?.checkOut
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              <Square className="w-8 h-8 mb-2" />
              <span className="font-medium text-sm">আউট টাইম</span>
              <span className="text-xs mt-1">{formatTime(userTodayLog?.checkOut || null)}</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">টাইম ট্র্যাকিং রেকর্ড</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">নাম</th>
                <th className="p-4 font-medium pl-6">ইন টাইম</th>
                <th className="p-4 font-medium">লাঞ্চ ব্রেক</th>
                <th className="p-4 font-medium">আউট টাইম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    এই তারিখে কোনো রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{log.userName}</td>
                    <td className="p-4 pl-6 text-indigo-600 font-medium">{formatTime(log.checkIn)}</td>
                    <td className="p-4 text-orange-600">
                      {log.lunchOut ? (
                        <span>{formatTime(log.lunchOut)} - {formatTime(log.lunchIn)}</span>
                      ) : (
                        <span className="text-gray-400">--:--</span>
                      )}
                    </td>
                    <td className="p-4 text-red-600 font-medium">{formatTime(log.checkOut)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
