import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Briefcase, DollarSign, FileText, Users, Plus, Phone, Mail, Facebook, Link as LinkIcon, Copy, Trash2 } from 'lucide-react';
import Modal from './Modal';

const VIDEO_FORMATS = ['1:1', '4:5', '9:16', '16:9'];
const CONTENT_TYPES = ['Product Education Content', 'Retargeting Content', 'Offer/Promotion Content', 'Awareness Content', 'Sales Content'];
const FRAMEWORKS_MAP: Record<string, string[]> = {
  'Product Education Content': ['How-To / Step-by-Step', 'Feature Deep Dive', 'FAQ / Q&A', 'Use Case Demo', 'Problem-Solving Showcase'],
  'Retargeting Content': ['Objection Handling', 'Urgency/Scarcity', 'Social Proof/Testimonial', 'Reminder/Abandoned Cart'],
  'Offer/Promotion Content': ['Discount Highlight', 'Bundle Offer', 'Limited Time Event', 'Flash Sale'],
  'Awareness Content': ['Brand Story', 'Behind the Scenes', 'Mission/Values', 'Entertaining/Viral', 'Educational/Value First'],
  'Sales Content': ['AIDA Model', 'PAS (Problem-Agitate-Solve)', 'FAB (Features-Advantages-Benefits)', 'BAB (Before-After-Bridge)', 'Hook-Story-Offer', 'PASTOR Model', 'The 4 Cs'],
};

export default function Clients({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { clients, models, categories, addClient, addProject } = useData();
  const { currentUser, users } = useAuth();
  const [selectedClient, setSelectedClient] = useState(clients[0] || null);
  
  const eligibleWriters = users;
  const eligibleEditors = users;
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const canSee = (permId: string) => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return true;
    return currentUser?.projectPermissions?.includes(permId) ?? false;
  };

  const clientProjects = (selectedClient?.projects || []).filter(project => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      return project.contentWriterId === currentUser.id || project.editorId === currentUser.id;
    }
    return true;
  });
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '', facebook: '', totalBudget: 0 });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    title: '', 
    category: categories[0] || '',
    status: 'Planning' as any, 
    budget: 0, 
    clientAdvance: 0,
    modelPayment: 0,
    extraExpenses: 0,
    models: [] as string[], 
    contentLog: [] as string[],
    thumbnailUrl: '',
    script: '',
    scripts: [] as { id: string; title: string; content: string; }[],
    recommendationLink: '',
    videoDuration: '',
    formats: [] as string[],
    contentType: '',
    framework: '',
    contentWriterId: '',
    editorId: '',
    link: '',
    startDate: '',
    endDate: '',
    priority: 'Normal' as 'Urgent' | 'Normal'
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(newClient);
    setIsClientModalOpen(false);
    setNewClient({ name: '', company: '', email: '', phone: '', facebook: '', totalBudget: 0 });
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      addProject(selectedClient.id, newProject);
      setIsProjectModalOpen(false);
      setNewProject({ title: '', category: categories[0] || '', status: 'Planning', budget: 0, clientAdvance: 0, modelPayment: 0, extraExpenses: 0, models: [], contentLog: [], thumbnailUrl: '', script: '', scripts: [], recommendationLink: '', videoDuration: '', formats: [], contentType: '', framework: '', contentWriterId: '', editorId: '', link: '', startDate: '', endDate: '', priority: 'Normal' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          setNewProject({ ...newProject, thumbnailUrl: base64String });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = (clientId: string) => {
    const url = `${window.location.origin}/?client-portal=${clientId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('ক্লায়েন্ট পোর্টাল লিংক কপি করা হয়েছে!');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ক্লায়েন্ট প্রোফাইল</h1>
        <button 
          onClick={() => setIsClientModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} className="mr-2" /> নতুন ক্লায়েন্ট
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client List */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 sticky top-0">
            <h2 className="font-bold text-gray-800 flex items-center text-lg">
              <Users className="w-5 h-5 mr-2 text-gray-400" />
              ক্লায়েন্ট তালিকা
            </h2>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto custom-scrollbar flex-1 p-2">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-4 rounded-xl mb-1 transition-all group ${
                  selectedClient?.id === client.id 
                    ? 'bg-blue-600 shadow-md shadow-blue-200 translate-x-1' 
                    : 'hover:bg-gray-50 hover:translate-x-1'
                }`}
              >
                <h3 className={`font-bold text-base transition-colors ${
                  selectedClient?.id === client.id ? 'text-white' : 'text-gray-900 group-hover:text-blue-600'
                }`}>{client.name}</h3>
                <p className={`text-sm mt-0.5 transition-colors ${
                  selectedClient?.id === client.id ? 'text-blue-100' : 'text-gray-500'
                }`}>{client.company}</p>
              </button>
            ))}
            {clients.length === 0 && (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <Users className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium">কোনো ক্লায়েন্ট নেই</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedClient ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -z-10"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedClient.name}</h2>
                  <p className="text-lg font-medium text-blue-600 mb-5">{selectedClient.company}</p>
                  
                  <div className="space-y-3 p-5 bg-gray-50 rounded-2xl border border-gray-100 inline-block w-full text-sm font-medium text-gray-700">
                    {selectedClient.phone && (
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.phone}
                      </p>
                    )}
                    {selectedClient.email && (
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.email}
                      </p>
                    )}
                    {selectedClient.facebook && (
                      <p className="flex items-center">
                        <Facebook className="w-4 h-4 mr-2 text-gray-400" />
                        <a href={selectedClient.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          ফেসবুক পেজ
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3 w-full md:w-auto">
                  {canSee('project-financials') && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-end w-full md:w-auto">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">মোট বাজেট</p>
                      <p className="text-2xl font-black text-emerald-600">৳{selectedClient.totalBudget?.toLocaleString()}</p>
                    </div>
                  )}
                  <button
                    onClick={() => handleCopyLink(selectedClient.id)}
                    className="flex items-center text-sm bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold w-full md:w-auto justify-center"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    পোর্টাল লিংক কপি করুন
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pt-6 border-t border-gray-100/60">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  প্রজেক্টসমূহ
                </h3>
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center"
                >
                  <Plus size={16} className="mr-1" /> নতুন প্রজেক্ট
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientProjects.map((project) => (
                  <div key={project.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-extrabold text-gray-900 text-lg leading-tight pr-4">
                        {project.priority === 'Urgent' && <span className="inline-block mr-1.5 text-red-600" title="জরুরী (Urgent)">🔥</span>}
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider border ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          project.status === 'Shooting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {project.thumbnailUrl && (
                      <div className="mb-5 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-colors">
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title} 
                          className="w-full h-40 object-cover transform transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    {canSee('project-financials') && (
                      <div className="grid grid-cols-2 gap-y-3 gap-x-3 mb-5 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">মোট বাজেট</span>
                          <span className="text-sm font-black text-gray-900">৳{(project.budget || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">অ্যাডভান্স</span>
                          <span className="text-sm font-black text-emerald-700">৳{(project.clientAdvance || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-0.5">মডেল পেমেন্ট</span>
                          <span className="text-sm font-black text-purple-700">৳{(project.modelPayment || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-0.5">অতিরিক্ত খরচ</span>
                          <span className="text-sm font-black text-rose-700">৳{(project.extraExpenses || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {canSee('project-team') && (
                      <div className="mb-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">মডেল:</span>
                        <div className="flex flex-wrap gap-2">
                          {project.models.map(modelId => {
                            const model = models.find(m => m.id === modelId);
                            return model ? (
                              <span key={modelId} className="text-xs bg-gray-100 border border-gray-200 font-medium px-2.5 py-1 rounded-md text-gray-700">
                                {model.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {canSee('project-content') && (
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-5">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center">
                          <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                          কনটেন্ট লগ
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {(project.contentLog || []).map((log, index) => (
                            <li key={index} className="flex items-start">
                               <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                               <span>{log}</span>
                            </li>
                          ))}
                          {(project.contentLog || []).length === 0 && <li className="text-gray-400 italic font-medium">কোনো লগ নেই</li>}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => onNavigate?.(`project-details:${selectedClient.id}:${project.id}:clients`)}
                        className="w-full text-sm bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all duration-300"
                      >
                        বিস্তারিত দেখুন
                      </button>
                    </div>
                  </div>
                ))}
                {(!selectedClient.projects || selectedClient.projects.length === 0) && (
                  <div className="col-span-1 md:col-span-2 text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="font-bold text-gray-500">কোনো প্রজেক্ট নেই</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center text-center text-gray-500 h-[calc(100vh-12rem)] min-h-[500px]">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ক্লায়েন্ট নির্বাচন করুন</h2>
              <p className="text-gray-500 max-w-sm">বাম দিকের তালিকা থেকে একটি ক্লায়েন্ট নির্বাচন করুন অথবা নতুন ক্লায়েন্ট যোগ করুন।</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="নতুন ক্লায়েন্ট যোগ করুন">
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
            <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">কোম্পানি</label>
            <input required type="text" value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নাম্বার (ঐচ্ছিক)</label>
            <input type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
            <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফেসবুক পেজ লিংক (ঐচ্ছিক)</label>
            <input type="url" value={newClient.facebook} onChange={e => setNewClient({...newClient, facebook: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://facebook.com/..." />
          </div>
          {canSee('project-financials') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মোট বাজেট</label>
              <input required type="number" value={newClient.totalBudget} onChange={e => setNewClient({...newClient, totalBudget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          )}
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="নতুন প্রজেক্ট যোগ করুন">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্টের নাম</label>
            <input required type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <select required value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">নির্বাচন করুন</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
              <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Planning">Planning</option>
                <option value="Shooting">Shooting</option>
                <option value="Editing">Editing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">গুরুত্ব (Priority)</label>
              <select value={newProject.priority || 'Normal'} onChange={e => setNewProject({...newProject, priority: e.target.value as 'Urgent' | 'Normal'})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Normal">নরমাল (Normal)</option>
                <option value="Urgent">জরুরী (Urgent)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট থাম্বনেইল (ঐচ্ছিক)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            />
            {newProject.thumbnailUrl && (
              <div className="mt-2">
                <img src={newProject.thumbnailUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>
          {canSee('project-financials') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মোট বাজেট</label>
                  <input required type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডভান্স</label>
                  <input type="number" value={newProject.clientAdvance} onChange={e => setNewProject({...newProject, clientAdvance: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মডেল পেমেন্ট</label>
                  <input type="number" value={newProject.modelPayment} onChange={e => setNewProject({...newProject, modelPayment: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত খরচ</label>
                  <input type="number" value={newProject.extraExpenses} onChange={e => setNewProject({...newProject, extraExpenses: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </>
          )}
          {canSee('project-team') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
              <select multiple value={newProject.models} onChange={e => setNewProject({...newProject, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24">
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          {canSee('project-content') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট লগ (কমা দিয়ে আলাদা করুন)</label>
              <input type="text" value={newProject.contentLog.join(', ')} onChange={e => setNewProject({...newProject, contentLog: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="যেমন: Photoshoot Day 1, Video Ad Draft" />
            </div>
          )}

          {canSee('project-scripts') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ভিডিও ফরম্যাট</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_FORMATS.map(fmt => (
                    <label key={fmt} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                      <input 
                        type="checkbox" 
                        checked={(newProject.formats || []).includes(fmt)}
                        onChange={e => {
                          const currentFormats = newProject.formats || [];
                          const newFormats = e.target.checked 
                            ? [...currentFormats, fmt] 
                            : currentFormats.filter((f: string) => f !== fmt);
                          setNewProject({...newProject, formats: newFormats});
                        }}
                        className="text-blue-600 rounded"
                      />
                      {fmt}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট টাইপ</label>
                  <select 
                    value={newProject.contentType || ''} 
                    onChange={e => setNewProject({...newProject, contentType: e.target.value, framework: ''})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                {newProject.contentType && FRAMEWORKS_MAP[newProject.contentType] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ফ্রেমওয়ার্ক</label>
                    <select 
                      value={newProject.framework || ''} 
                      onChange={e => setNewProject({...newProject, framework: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {FRAMEWORKS_MAP[newProject.contentType].map(fw => <option key={fw} value={fw}>{fw}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {canSee('project-team') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট রাইটার (ঐচ্ছিক)</label>
                <select 
                  value={newProject.contentWriterId || ''} 
                  onChange={e => setNewProject({...newProject, contentWriterId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">নির্বাচন করুন</option>
                  {eligibleWriters.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও এডিটর (ঐচ্ছিক)</label>
                <select 
                  value={newProject.editorId || ''} 
                  onChange={e => setNewProject({...newProject, editorId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">নির্বাচন করুন</option>
                  {eligibleEditors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {canSee('project-scripts') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">ভিডিও স্ক্রিপ্ট (ঐচ্ছিক)</label>
                <button type="button" onClick={() => setNewProject({...newProject, scripts: [...newProject.scripts, { id: Date.now().toString(), title: '', content: '' }]})} className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center">
                  <Plus size={14} className="mr-1" /> যোগ করুন
                </button>
              </div>
              {newProject.scripts.map((script, index) => (
                <div key={script.id} className="mb-3 border border-gray-200 rounded-lg p-3 relative">
                  <button type="button" onClick={() => {
                    const newScripts = [...newProject.scripts];
                    newScripts.splice(index, 1);
                    setNewProject({...newProject, scripts: newScripts});
                  }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                  <input type="text" value={script.title} onChange={e => {
                    const newScripts = [...newProject.scripts];
                    newScripts[index].title = e.target.value;
                    setNewProject({...newProject, scripts: newScripts});
                  }} placeholder="স্ক্রিপ্ট টাইটেল..." className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none pr-8" />
                  <textarea value={script.content} onChange={e => {
                    const newScripts = [...newProject.scripts];
                    newScripts[index].content = e.target.value;
                    setNewProject({...newProject, scripts: newScripts});
                  }} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none h-20" placeholder="স্ক্রিপ্ট কনটেন্ট..." />
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {canSee('project-scripts') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও ডিউরেশন (ঐচ্ছিক)</label>
                <input type="text" value={newProject.videoDuration || ''} onChange={e => setNewProject({...newProject, videoDuration: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="যেমন: ৩ মিনিট" />
              </div>
            )}
            {canSee('project-links') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">রেকোমেন্ডেশন লিংক (ঐচ্ছিক)</label>
                <input type="url" value={newProject.recommendationLink || ''} onChange={e => setNewProject({...newProject, recommendationLink: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
              </div>
            )}
          </div>
          {canSee('project-dates') && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট শুরু (ঐচ্ছিক)</label>
                <input type="date" value={newProject.startDate || ''} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট শেষ (ঐচ্ছিক)</label>
                <input type="date" value={newProject.endDate || ''} onChange={e => setNewProject({...newProject, endDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          )}
          {canSee('project-links') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট লিঙ্ক (ঐচ্ছিক)</label>
              <input type="url" value={newProject.link || ''} onChange={e => setNewProject({...newProject, link: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}
