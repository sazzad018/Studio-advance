import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Plus, Briefcase } from 'lucide-react';
import Modal from './Modal';

export default function Scheduling() {
  const { schedule, models, clients, addScheduleEvent } = useData();
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'Shoot' as any, models: [] as string[], crew: [] as string[], projectId: '' });

  const allProjects = clients.flatMap(client => (client.projects || []).map(project => ({ ...project, clientName: client.name })));

  const sortedSchedule = [...schedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredSchedule = selectedDate
    ? sortedSchedule.filter(event => event.date === selectedDate)
    : sortedSchedule;

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addScheduleEvent(newEvent);
    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', type: 'Shoot', models: [], crew: [], projectId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">মডেল ও ক্রু শিডিউলিং</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} className="mr-2" /> নতুন শিডিউল
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar / Filter Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-orange-600" />
            প্রোডাকশন ক্যালেন্ডার
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
              <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="w-full py-2 text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
              >
                সব শিডিউল দেখুন
              </button>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">আসন্ন ইভেন্ট</h3>
            <ul className="space-y-3">
              {sortedSchedule.slice(0, 5).map(event => (
                <li key={`mini-${event.id}`} className="flex items-start space-x-3 text-sm">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    event.type === 'Shoot' ? 'bg-blue-500' :
                    event.type === 'Meeting' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-gray-500">{new Date(event.date).toLocaleDateString('bn-BD')}</p>
                  </div>
                </li>
              ))}
              {sortedSchedule.length === 0 && (
                <li className="text-gray-500 text-sm">কোনো ইভেন্ট নেই</li>
              )}
            </ul>
          </div>
        </div>

        {/* Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredSchedule.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 w-full ${
                event.type === 'Shoot' ? 'bg-blue-500' :
                event.type === 'Meeting' ? 'bg-purple-500' :
                'bg-red-500'
              }`} />
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">{event.title}</h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-block w-max ${
                    event.type === 'Shoot' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'Meeting' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="font-medium">{new Date(event.date).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {event.projectId ? (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="font-medium truncate">
                        {allProjects.find(p => p.id === event.projectId)?.title || 'অজানা প্রজেক্ট'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      <span>স্টুডিও ফ্লোর ১</span> {/* Mock location */}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  {event.models.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Video className="w-4 h-4 mr-2 text-blue-500" />
                        নির্ধারিত মডেল
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.models.map(modelId => {
                          const model = models.find(m => m.id === modelId);
                          return model ? (
                            <span key={modelId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200">
                              <img src={model.imageUrl} alt={model.name} className="w-5 h-5 rounded-full mr-2 object-cover" />
                              {model.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {event.crew.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-orange-500" />
                        অ্যাসাইনড ক্রু
                      </h4>
                      <ul className="space-y-2">
                        {event.crew.map((member, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center before:content-['•'] before:mr-2 before:text-gray-400">
                            {member}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredSchedule.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">কোনো শিডিউল নেই</h3>
              <p className="text-gray-500 mt-1">নির্বাচিত তারিখে কোনো ইভেন্ট পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন শিডিউল যোগ করুন">
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইভেন্টের নাম</label>
            <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
            <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ধরন</label>
            <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="Shoot">Shoot</option>
              <option value="Meeting">Meeting</option>
              <option value="Deadline">Deadline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট নির্বাচন করুন (ঐচ্ছিক)</label>
            <select value={newEvent.projectId} onChange={e => setNewEvent({...newEvent, projectId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="">কোনো প্রজেক্ট নয়</option>
              {allProjects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.clientName})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
            <select multiple value={newEvent.models} onChange={e => setNewEvent({...newEvent, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24">
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্রু (কমা দিয়ে আলাদা করুন)</label>
            <input type="text" value={newEvent.crew.join(', ')} onChange={e => setNewEvent({...newEvent, crew: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="যেমন: Director: Hasan, Camera: Jamil" />
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}
