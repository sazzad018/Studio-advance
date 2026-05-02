import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Edit3, X, Save, Plus, LayoutGrid, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { USE_MOCK_FALLBACK } from '../config';

const WORKFLOW_STEPS = [
  { id: 'step1', title: '১. পোস্ট করা', shortLabel: 'পোস্ট করা', description: 'আজকের পোস্টগুলো শিডিউল বা পাবলিশ করা' },
  { id: 'step2', title: '২. ডেমো ভিডিও', shortLabel: 'ডেমো ভিডিও', description: 'ডেমো ভিডিও তৈরি এবং রেডি করা' },
  { id: 'step3', title: '৩. মেসেজ রিপ্লে', shortLabel: 'মেসেজ রিপ্লে', description: 'ইনবক্সের সব মেসেজের রিপ্লে দেওয়া' },
  { id: 'step4', title: '৪. ক্লাইন্ট বাজেট', shortLabel: 'ক্লাইন্ট বাজেট', description: 'ক্লায়েন্টদের সাথে বাজেট নিয়ে কথা বলা' },
  { id: 'step5', title: '৫. স্ক্রিপ্ট রাইট', shortLabel: 'স্ক্রিপ্ট রাইট', description: 'নতুন প্রজেক্টের জন্য স্ক্রিপ্ট লেখা' },
  { id: 'step6', title: '৬. স্ক্রিপ্ট মতামত', shortLabel: 'স্ক্রিপ্ট মতামত', description: 'স্ক্রিপ্ট নিয়ে ক্লায়েন্ট বা টিমের মতামত নেওয়া' },
  { id: 'step7', title: '৭. ভিডিও ও ধারণা', shortLabel: 'ভিডিও ও ধারণা', description: 'ভিডিও করা এবং বিস্তারিত ধারণা সেট করা' },
  { id: 'step8', title: '৮. এডিটিং', shortLabel: 'এডিটিং', description: 'ভিডিও এডিটিংয়ের কাজ শেষ করা' },
  { id: 'step9', title: '৯. পেমেন্ট ও ডেলিভারি', shortLabel: 'পেমেন্ট ও ডেলিভারি', description: 'পেমেন্ট নিশ্চিত করা এবং ভিডিও পাঠানো' }
];

type TaskData = { completed: boolean; notes: string; };
type DayData = { [stepId: string]: TaskData; };
type AllData = { [dateIso: string]: DayData; };

// Helper format function
const toLocalISOString = (d: Date) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

// ==============================
// ROADMAP VIEW COMPONENT
// ==============================
function RoadmapView({ allData, updateTask }: { allData: AllData, updateTask: (d: string, s: string, c: boolean, n: string) => void }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const dateKey = toLocalISOString(selectedDate);
  const todayData = allData[dateKey] || {};

  const currentStepIndex = WORKFLOW_STEPS.findIndex(step => !todayData[step.id]?.completed);
  const activeIndex = currentStepIndex === -1 ? WORKFLOW_STEPS.length - 1 : currentStepIndex;

  const handlePrevDay = () => setSelectedDate(new Date(selectedDate.getTime() - 86400000));
  const handleNextDay = () => setSelectedDate(new Date(selectedDate.getTime() + 86400000));
  const handleToday = () => {
    const d = new Date(); d.setHours(0, 0, 0, 0); setSelectedDate(d);
  };

  const toggleComplete = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stepData = todayData[stepId] || { completed: false, notes: '' };
    updateTask(dateKey, stepId, !stepData.completed, stepData.notes);
  };

  const openNotes = (stepId: string) => {
    setActiveStepId(stepId);
    setEditNotes(todayData[stepId]?.notes || '');
    setIsModalOpen(true);
  };

  const saveNotes = () => {
    if (activeStepId) {
      const stepData = todayData[activeStepId] || { completed: false, notes: '' };
      updateTask(dateKey, activeStepId, stepData.completed, editNotes);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800">রাস্তার ধাপে ধাপে কাজ সম্পন্ন করুন</h2>
        <div className="flex items-center space-x-2 bg-indigo-50 p-1.5 rounded-xl border border-indigo-100">
          <button onClick={handlePrevDay} className="p-2 hover:bg-white rounded-lg text-indigo-600 transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleToday} className="px-4 py-1 flex items-center font-bold text-indigo-900 bg-white rounded-lg shadow-sm border border-indigo-50 hover:bg-gray-50 cursor-pointer">
            <CalendarIcon size={16} className="mr-2 text-indigo-500" />
            {selectedDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
          </button>
          <button onClick={handleNextDay} className="p-2 hover:bg-white rounded-lg text-indigo-600 transition-all shadow-sm">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto py-10">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-indigo-100 via-purple-100 to-indigo-100 rounded-full border-x-4 border-indigo-50 drop-shadow-md"></div>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 border-x border-dashed border-indigo-300 opacity-50 z-0"></div>

        <div className="relative z-10 flex flex-col space-y-20">
          {WORKFLOW_STEPS.map((step, index) => {
            const stepData = todayData[step.id] || { completed: false, notes: '' };
            const isCompleted = stepData.completed;
            const isUnlocked = index <= activeIndex;
            const isCurrent = index === activeIndex;
            const isLeft = index % 2 === 0;

            return (
              <div key={step.id} className={`flex items-center w-full ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-1/2 flex justify-center"></div>
                <div className="relative flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center z-20 transition-all duration-500
                    ${isCompleted ? 'bg-green-500 border-green-200' : isCurrent ? 'bg-indigo-500 border-indigo-300 ring-4 ring-indigo-100' : 'bg-gray-200 border-gray-100'}
                  `}>
                    {isCompleted ? <Check className="text-white" size={20} /> : <span className={`font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{index + 1}</span>}
                  </div>
                  <AnimatePresence>
                    {isCurrent && (
                      <motion.div 
                        initial={{ scale: 0, y: -50, opacity: 0 }}
                        animate={{ scale: 1, y: -35, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="absolute text-5xl z-30 drop-shadow-xl"
                        style={{ filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.2))' }}
                      >
                        🐒
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className={`w-1/2 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <motion.div 
                    initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
                    animate={{ opacity: isUnlocked ? 1 : 0.4, x: 0 }}
                    className={`relative p-5 rounded-2xl shadow-xl transition-all duration-300 border-b-4
                      ${isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500' : 
                        isCurrent ? 'bg-gradient-to-br from-white to-indigo-50 border-indigo-500 transform scale-105 z-10' : 
                        'bg-white border-gray-200 grayscale-0'}
                    `}
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 h-1.5 w-8 ${isLeft ? '-right-8 bg-gradient-to-r from-transparent to-indigo-200' : '-left-8 bg-gradient-to-l from-transparent to-indigo-200'}`}></div>
                    <h3 className={`text-xl font-bold mb-1 ${isCompleted ? 'text-green-800' : isCurrent ? 'text-indigo-900' : 'text-gray-600'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mb-4 ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>{step.description}</p>
                    <div className={`flex items-center gap-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                      <button 
                        disabled={!isUnlocked && !isCompleted}
                        onClick={(e) => toggleComplete(step.id, e)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                          ${isCompleted ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5'}
                        `}
                      >
                        {isCompleted ? 'বাতিল করুন' : 'সম্পন্ন হয়েছে'}
                      </button>
                      <button 
                        disabled={!isUnlocked && !isCompleted}
                        onClick={() => openNotes(step.id)}
                        className={`p-2 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${stepData.notes ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}
                        `}
                        title="নোট লিখুন"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                    {stepData.notes && (
                      <div className={`mt-3 p-3 rounded-lg text-sm text-left border ${isCompleted ? 'bg-white/60 border-green-200 text-green-800' : 'bg-indigo-50/50 border-indigo-100 text-indigo-800'}`}>
                        <div className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-70">নোট:</div>
                        <div className="line-clamp-2 break-words">{stepData.notes}</div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && activeStepId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-indigo-50"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-bold">{WORKFLOW_STEPS.find(s => s.id === activeStepId)?.title}</h3>
                  <p className="text-indigo-100 text-sm mt-1">বিস্তারিত নোট বা আপডেট লিখুন</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-48 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:ring-0 focus:border-indigo-500 focus:bg-white text-gray-800 resize-none transition-colors"
                  value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  placeholder="এই ধাপের জন্য কোনো লিংক, মেসেজ হিস্ট্রি বা প্রয়োজনীয় ডিটেইলস এখানে সেভ করে রাখতে পারেন..." autoFocus
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                  বাতিল
                </button>
                <button onClick={saveNotes} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 font-semibold flex items-center transition-all transform hover:-translate-y-0.5">
                  <Save size={18} className="mr-2" /> সেভ করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==============================
// GRID VIEW COMPONENT
// ==============================
function GridView({ allData, updateTask }: { allData: AllData, updateTask: (d: string, s: string, c: boolean, n: string) => void }) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ date: string; stepId: string; title: string; displayDate: string } | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);

  const dates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(startDate); d.setDate(d.getDate() + i); return d;
  });

  const goNext = () => { const d = new Date(startDate); d.setDate(d.getDate() + 10); setStartDate(d); };
  const goPrev = () => { const d = new Date(startDate); d.setDate(d.getDate() - 10); setStartDate(d); };
  const goToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); setStartDate(d); };

  const openModal = (dateStr: string, stepId: string, title: string, displayDate: string) => {
    const stepData = allData[dateStr]?.[stepId] || { completed: false, notes: '' };
    setEditNotes(stepData.notes);
    setEditCompleted(stepData.completed);
    setEditingCell({ date: dateStr, stepId, title, displayDate });
    setIsModalOpen(true);
  };

  const handleSaveCell = () => {
    if (editingCell) {
      updateTask(editingCell.date, editingCell.stepId, editCompleted, editNotes);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800">১০ দিনের ওভারভিউ ম্যাট্রিক্স</h2>
        <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <button onClick={goPrev} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors" title="আগের ১০ দিন">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToday} className="px-4 py-1 hover:bg-white rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center shadow-sm">
            <CalendarIcon size={16} className="mr-2" /> আজ থেকে শুরু
          </button>
          <button onClick={goNext} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors" title="পরবর্তী ১০ দিন">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-4 font-bold text-gray-800 sticky left-0 bg-gray-50 z-20 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-32">
                  তারিখ
                </th>
                {WORKFLOW_STEPS.map(step => (
                  <th key={step.id} className="py-4 px-4 text-sm font-bold text-gray-700 border-r border-gray-200 min-w-[180px] max-w-[200px]" title={step.title}>
                    {step.shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => {
                const dateString = toLocalISOString(date);
                const displayDate = date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
                const isToday = toLocalISOString(new Date()) === dateString;
                
                return (
                  <tr key={dateString} className="group/row border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className={`py-3 px-4 font-medium sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors ${isToday ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 bg-white group-hover/row:bg-gray-50'}`}>
                      <div className="whitespace-nowrap">
                        {displayDate}
                        {isToday && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800">আজ</span>}
                      </div>
                    </td>

                    {WORKFLOW_STEPS.map(step => {
                      const stepData = allData[dateString]?.[step.id];
                      const isCompleted = stepData?.completed;
                      const content = stepData?.notes || '';
                      const hasContent = content.trim().length > 0;
                      
                      return (
                        <td key={step.id} 
                          className="py-2 px-3 border-r border-gray-100 min-w-[180px] max-w-[200px] cursor-pointer group/cell relative"
                          onClick={() => openModal(dateString, step.id, step.title, displayDate)}
                        >
                          <div className={`
                            min-h-[70px] w-full p-3 rounded-lg border transition-all text-sm flex flex-col justify-between
                            ${isCompleted ? 'bg-green-50 border-green-200 text-green-900 shadow-sm' : hasContent ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' : 'bg-transparent border-transparent text-gray-400 border-dashed group-hover/cell:border-gray-300 group-hover/cell:bg-gray-50'}
                          `}>
                            {isCompleted && <div className="flex items-center text-green-600 font-medium mb-1"><Check size={16} className="mr-1"/> সম্পন্ন</div>}
                            {hasContent ? (
                              <div className="line-clamp-2 whitespace-pre-wrap">{content}</div>
                            ) : !isCompleted ? (
                              <div className="flex items-center justify-center h-full opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                <Plus size={18} className="mr-1"/> <span>অ্যাড করুন</span>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingCell && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{editingCell.title}</h3>
                <p className="text-sm text-indigo-600 mt-1 font-medium"><CalendarIcon size={14} className="inline mr-1" /> {editingCell.displayDate}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">কাজের বিস্তারিত নোট</label>
              <textarea
                className="w-full h-40 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 resize-none mb-6 text-sm"
                value={editNotes} onChange={e => setEditNotes(e.target.value)}
                placeholder="এখানে বিস্তারিত লিখুন..." autoFocus
              />
              
              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <input type="checkbox" className="hidden" checked={editCompleted} onChange={(e) => setEditCompleted(e.target.checked)} />
                  <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${editCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                    {editCompleted && <Check size={16} className="text-white" />}
                  </div>
                </div>
                <span className={`font-medium ${editCompleted ? 'text-green-700' : 'text-gray-700'}`}>এই কাজটিকে সম্পন্ন (Completed) হিসেবে মার্ক করুন</span>
              </label>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                বাতিল
              </button>
              <button 
                onClick={handleSaveCell} 
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 font-medium flex items-center transition-colors"
              >
                <Save size={18} className="mr-2" /> সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================
// MAIN PARENT WRAPPER
// ==============================
export default function DailyTasks() {
  const [allData, setAllData] = useState<AllData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'roadmap'|'grid'>('roadmap');

  useEffect(() => {
    // Load from DB via API, fallback to localStorage if it fails
    api.getDailyTasks()
      .then(data => {
        setAllData(data || {});
        setIsLoading(false);
      })
      .catch(err => {
        if (!USE_MOCK_FALLBACK) {
          console.error("Failed to load daily tasks from API, using local storage:", err);
        }
        const saved = localStorage.getItem('studio_roadmap_tasks');
        setAllData(saved ? JSON.parse(saved) : {});
        setIsLoading(false);
      });
  }, []);

  const updateTask = async (dateKey: string, stepId: string, completed: boolean, notes: string) => {
    // Optimistic UI update
    setAllData(prev => {
      const dayData = prev[dateKey] || {};
      const newAllData = {
        ...prev,
        [dateKey]: {
          ...dayData,
          [stepId]: { completed, notes }
        }
      };
      // Backup to local storage
      localStorage.setItem('studio_roadmap_tasks', JSON.stringify(newAllData));
      return newAllData;
    });

    // Save to Database via API
    try {
      await api.saveDailyTask(dateKey, stepId, completed, notes);
    } catch (err) {
      console.error("Failed to save daily task to database:", err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Universal Header with Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ডেইলি টাস্ক ম্যানেজমেন্ট</h1>
          <p className="text-gray-500 mt-1">রোডম্যাপ অথবা গ্রিড ভিউ থেকে কাজ পরিচালনা করুন</p>
        </div>
        
        <div className="flex bg-gray-200 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setViewMode('roadmap')}
            className={`px-5 py-2.5 flex items-center space-x-2 text-sm font-bold rounded-lg transition-all ${
              viewMode === 'roadmap' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Route size={18} />
            <span>রোডম্যাপ ভিউ</span>
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-5 py-2.5 flex items-center space-x-2 text-sm font-bold rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <LayoutGrid size={18} />
            <span>গ্রিড ভিউ</span>
          </button>
        </div>
      </div>

      {/* Render selected view and pass the data state */}
      {viewMode === 'roadmap' ? (
        <RoadmapView allData={allData} updateTask={updateTask} />
      ) : (
        <GridView allData={allData} updateTask={updateTask} />
      )}
    </div>
  );
}
