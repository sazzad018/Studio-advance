import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Briefcase, DollarSign, Users, Plus, User, FileText, Edit2, LayoutGrid, List, Trash2 } from 'lucide-react';
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

export default function ProjectList({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { clients, models, categories, addProject, updateProject, addCategory } = useData();
  const { currentUser, users } = useAuth();
  
  const contentWriters = users.filter(u => u.role !== 'admin'); // or any specific filtering for writers
  // Actually, any user could be assigned, or we just list all users as options. Let's just use all users for now.
  const eligibleWriters = users; 
  const eligibleEditors = users;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newProject, setNewProject] = useState({ 
    clientId: clients[0]?.id || '', 
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

  const allProjects = clients.flatMap(client => 
    (client.projects || []).map(project => ({ ...project, clientId: client.id, clientName: client.name, company: client.company }))
  );

  const filteredProjects = allProjects.filter(project => {
    // If user is not admin/manager, only show projects assigned to them
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      if (project.contentWriterId !== currentUser.id && project.editorId !== currentUser.id) {
        return false;
      }
    }

    if (selectedCategory === 'All') return true;
    return project.category === selectedCategory;
  });

  const canSee = (permId: string) => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return true;
    return currentUser?.projectPermissions?.includes(permId) ?? false;
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.clientId) {
      const { clientId, ...projectData } = newProject;
      addProject(clientId, projectData);
      setIsModalOpen(false);
      setNewProject({ clientId: clients[0]?.id || '', title: '', category: categories[0] || '', status: 'Planning', budget: 0, clientAdvance: 0, modelPayment: 0, extraExpenses: 0, models: [], contentLog: [], thumbnailUrl: '', script: '', scripts: [], recommendationLink: '', videoDuration: '', formats: [], contentType: '', framework: '', contentWriterId: '', editorId: '', link: '', startDate: '', endDate: '', priority: 'Normal' });
    }
  };

  const openEditModal = (project: any) => {
    setEditingProject({
      ...project,
      clientAdvance: project.clientAdvance || 0,
      modelPayment: project.modelPayment || 0,
      extraExpenses: project.extraExpenses || 0,
      scripts: project.scripts || [],
      formats: project.formats || [],
      contentType: project.contentType || '',
      framework: project.framework || '',
      contentWriterId: project.contentWriterId || '',
      editorId: project.editorId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const { clientId, id, clientName, company, newClientId, ...projectData } = editingProject;
      updateProject(clientId, id, projectData, newClientId);
      setIsEditModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
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
          
          // Compress to JPEG with 0.7 quality
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          
          if (isEdit) {
            setEditingProject({ ...editingProject, thumbnailUrl: base64String });
          } else {
            setNewProject({ ...newProject, thumbnailUrl: base64String });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">প্রজেক্ট লিস্ট</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-xl font-medium flex items-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" /> নতুন ক্যাটাগরি
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold flex items-center hover:bg-blue-700 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" /> নতুন প্রজেক্ট
          </button>
        </div>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          <span className="text-sm font-bold tracking-wide uppercase text-gray-500 mr-2 whitespace-nowrap">ক্যাটাগরি:</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex items-center bg-gray-50 rounded-xl p-1 ml-0 sm:ml-4 flex-shrink-0 border border-gray-100 mt-3 sm:mt-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="গ্রিড ভিউ"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="লিস্ট ভিউ"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6 md:p-8 hover:shadow-md transition-all hover:-translate-y-1 relative group">
              <button 
                onClick={() => openEditModal(project)}
                className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-100 hover:text-blue-600 border border-gray-200 group-hover:border-blue-200"
                title="এডিট করুন"
              >
                <Edit2 size={16} />
              </button>

              <div className="flex justify-between items-start mb-5 pr-12">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900 tracking-tight leading-tight">
                    {project.priority === 'Urgent' && <span className="inline-block mr-2 text-red-600" title="জরুরী (Urgent)">🔥</span>}
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 flex items-center mt-2">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    {project.clientName} ({project.company})
                  </p>
                </div>
              </div>
              
              <div className="mb-5 flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                  project.status === 'Shooting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {project.status}
                </span>
                {project.priority === 'Urgent' && (
                  <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
                    Urgent
                  </span>
                )}
              </div>

              {project.thumbnailUrl && (
                <div className="mb-5 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-colors">
                  <img 
                    src={project.thumbnailUrl} 
                    alt={project.title} 
                    className="w-full h-48 object-cover transform transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {canSee('project-financials') && (
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-5 pt-5 border-t border-gray-100/80">
                  <div className="flex flex-col bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">মোট বাজেট</span>
                    <span className="text-base font-black text-gray-900">৳{(project.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col bg-emerald-50 p-3 rounded-xl border border-emerald-100/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">অ্যাডভান্স</span>
                    <span className="text-base font-black text-emerald-700">৳{(project.clientAdvance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col bg-purple-50 p-3 rounded-xl border border-purple-100/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1">মডেল পেমেন্ট</span>
                    <span className="text-base font-black text-purple-700">৳{(project.modelPayment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col bg-rose-50 p-3 rounded-xl border border-rose-100/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1">অতিরিক্ত খরচ</span>
                    <span className="text-base font-black text-rose-700">৳{(project.extraExpenses || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {canSee('project-content') && (
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 mb-6">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                    কনটেন্ট লগ ({(project.contentLog || []).length})
                  </h5>
                  <ul className="space-y-2">
                    {(project.contentLog || []).slice(0, 2).map((log: string, index: number) => (
                      <li key={index} className="text-sm font-medium text-gray-600 flex items-start">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                         <span className="truncate">{log}</span>
                      </li>
                    ))}
                    {(project.contentLog || []).length > 2 && <li className="text-xs font-bold text-gray-400 pl-3.5 pt-1">...আরও {(project.contentLog || []).length - 2}টি</li>}
                    {(project.contentLog || []).length === 0 && <li className="text-sm text-gray-400 italic">কোনো লগ নেই</li>}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onNavigate?.(`project-details:${project.clientId}:${project.id}:projects`)}
                  className="w-full text-sm bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all duration-300"
                >
                  বিস্তারিত দেখুন
                </button>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                 <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">কোনো প্রজেক্ট পাওয়া যায়নি</h3>
              <p className="text-gray-500 mt-2 font-medium">নতুন প্রজেক্ট যোগ করুন অথবা অন্য ক্যাটাগরি নির্বাচন করুন।</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5">প্রজেক্টের নাম</th>
                  <th className="p-5">ক্লায়েন্ট</th>
                  <th className="p-5">স্ট্যাটাস</th>
                  <th className="p-5">বাজেট</th>
                  <th className="p-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-gray-900 text-base">
                        {project.priority === 'Urgent' && <span className="inline-block mr-2 text-red-600" title="জরুরী (Urgent)">🔥</span>}
                        {project.title}
                      </div>
                      <div className="text-xs font-medium text-gray-500 mt-1">{project.category}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-gray-800">{project.clientName}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">{project.company}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                        project.status === 'Shooting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {canSee('project-financials') ? (
                        <>
                          <div className="text-base font-black text-gray-900">৳{(project.budget || 0).toLocaleString()}</div>
                          <div className="text-xs font-semibold text-emerald-600 mt-1">অ্যাডভান্স: ৳{(project.clientAdvance || 0).toLocaleString()}</div>
                        </>
                      ) : (
                        <div className="text-sm font-medium text-gray-400 italic">লুকানো</div>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => openEditModal(project)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                          title="এডিট করুন"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onNavigate?.(`project-details:${project.clientId}:${project.id}:projects`)}
                          className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 font-medium">
                      কোনো প্রজেক্ট পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="নতুন ক্যাটাগরি যোগ করুন">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির নাম</label>
            <input 
              required 
              type="text" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="যেমন: Wedding, Corporate..."
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>

      {/* Add Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন প্রজেক্ট যোগ করুন">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্ট নির্বাচন করুন</label>
            <select required value={newProject.clientId} onChange={e => setNewProject({...newProject, clientId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="" disabled>ক্লায়েন্ট নির্বাচন করুন</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্টের নাম</label>
            <input required type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <select required value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">নির্বাচন করুন</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
              <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Planning">Planning</option>
                <option value="Shooting">Shooting</option>
                <option value="Editing">Editing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">গুরুত্ব (Priority)</label>
              <select value={newProject.priority || 'Normal'} onChange={e => setNewProject({...newProject, priority: e.target.value as 'Urgent' | 'Normal'})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
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
              onChange={(e) => handleImageUpload(e, false)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
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
                  <input required type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডভান্স</label>
                  <input type="number" value={newProject.clientAdvance} onChange={e => setNewProject({...newProject, clientAdvance: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মডেল পেমেন্ট</label>
                  <input type="number" value={newProject.modelPayment} onChange={e => setNewProject({...newProject, modelPayment: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত খরচ</label>
                  <input type="number" value={newProject.extraExpenses} onChange={e => setNewProject({...newProject, extraExpenses: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </>
          )}
          {canSee('project-team') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
              <select multiple value={newProject.models} onChange={e => setNewProject({...newProject, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24">
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

      {/* Edit Project Modal */}
      {editingProject && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="প্রজেক্ট এডিট করুন">
          <form onSubmit={handleEditProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্ট পরিবর্তন করুন (ঐচ্ছিক)</label>
              <select value={editingProject.newClientId || editingProject.clientId} onChange={e => setEditingProject({...editingProject, newClientId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্টের নাম</label>
              <input required type="text" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
              <select required value={editingProject.category || ''} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">নির্বাচন করুন</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                <select value={editingProject.status} onChange={e => setEditingProject({...editingProject, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Planning">Planning</option>
                  <option value="Shooting">Shooting</option>
                  <option value="Editing">Editing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">গুরুত্ব (Priority)</label>
                <select value={editingProject.priority || 'Normal'} onChange={e => setEditingProject({...editingProject, priority: e.target.value as 'Urgent' | 'Normal'})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
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
                onChange={(e) => handleImageUpload(e, true)} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
              {editingProject.thumbnailUrl && (
                <div className="mt-2">
                  <img src={editingProject.thumbnailUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
            {canSee('project-financials') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">মোট বাজেট</label>
                    <input required type="number" value={editingProject.budget} onChange={e => setEditingProject({...editingProject, budget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডভান্স</label>
                    <input type="number" value={editingProject.clientAdvance} onChange={e => setEditingProject({...editingProject, clientAdvance: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">মডেল পেমেন্ট</label>
                    <input type="number" value={editingProject.modelPayment} onChange={e => setEditingProject({...editingProject, modelPayment: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত খরচ</label>
                    <input type="number" value={editingProject.extraExpenses} onChange={e => setEditingProject({...editingProject, extraExpenses: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </>
            )}
            {canSee('project-team') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
                <select multiple value={editingProject.models} onChange={e => setEditingProject({...editingProject, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24">
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            {canSee('project-content') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট লগ (কমা দিয়ে আলাদা করুন)</label>
                <input type="text" value={editingProject.contentLog.join(', ')} onChange={e => setEditingProject({...editingProject, contentLog: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="যেমন: Photoshoot Day 1, Video Ad Draft" />
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
                          checked={(editingProject.formats || []).includes(fmt)}
                          onChange={e => {
                            const currentFormats = editingProject.formats || [];
                            const newFormats = e.target.checked 
                              ? [...currentFormats, fmt] 
                              : currentFormats.filter((f: string) => f !== fmt);
                            setEditingProject({...editingProject, formats: newFormats});
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
                      value={editingProject.contentType || ''} 
                      onChange={e => setEditingProject({...editingProject, contentType: e.target.value, framework: ''})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  {editingProject.contentType && FRAMEWORKS_MAP[editingProject.contentType] && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ফ্রেমওয়ার্ক</label>
                      <select 
                        value={editingProject.framework || ''} 
                        onChange={e => setEditingProject({...editingProject, framework: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">নির্বাচন করুন</option>
                        {FRAMEWORKS_MAP[editingProject.contentType].map(fw => <option key={fw} value={fw}>{fw}</option>)}
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
                  value={editingProject.contentWriterId || ''} 
                  onChange={e => setEditingProject({...editingProject, contentWriterId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">নির্বাচন করুন</option>
                  {eligibleWriters.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও এডিটর (ঐচ্ছিক)</label>
                <select 
                  value={editingProject.editorId || ''} 
                  onChange={e => setEditingProject({...editingProject, editorId: e.target.value})}
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
                <button type="button" onClick={() => setEditingProject({...editingProject, scripts: [...(editingProject.scripts || []), { id: Date.now().toString(), title: '', content: '' }]})} className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center">
                  <Plus size={14} className="mr-1" /> যোগ করুন
                </button>
              </div>
              {editingProject.scripts?.map((script: any, index: number) => (
                <div key={script.id} className="mb-3 border border-gray-200 rounded-lg p-3 relative">
                  <button type="button" onClick={() => {
                    const newScripts = [...editingProject.scripts];
                    newScripts.splice(index, 1);
                    setEditingProject({...editingProject, scripts: newScripts});
                  }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                  <input type="text" value={script.title} onChange={e => {
                    const newScripts = [...editingProject.scripts];
                    newScripts[index].title = e.target.value;
                    setEditingProject({...editingProject, scripts: newScripts});
                  }} placeholder="স্ক্রিপ্ট টাইটেল..." className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none pr-8" />
                  <textarea value={script.content} onChange={e => {
                    const newScripts = [...editingProject.scripts];
                    newScripts[index].content = e.target.value;
                    setEditingProject({...editingProject, scripts: newScripts});
                  }} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none h-20" placeholder="স্ক্রিপ্ট কনটেন্ট..." />
                </div>
              ))}
              {/* Fallback for old single script if no multi-scripts exist yet */}
              {editingProject.script && (!editingProject.scripts || editingProject.scripts.length === 0) && (
                <div className="mt-2 text-sm text-gray-500">
                  পুরানো স্ক্রিপ্ট (ব্যাকআপ): <br/>
                  <textarea value={editingProject.script} disabled className="w-full p-2 mt-1 bg-gray-50 text-sm border border-gray-200 rounded h-20" />
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {canSee('project-scripts') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও ডিউরেশন (ঐচ্ছিক)</label>
                <input type="text" value={editingProject.videoDuration || ''} onChange={e => setEditingProject({...editingProject, videoDuration: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="যেমন: ৩ মিনিট" />
              </div>
            )}
            {canSee('project-links') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">রেকোমেন্ডেশন লিংক (ঐচ্ছিক)</label>
                <input type="url" value={editingProject.recommendationLink || ''} onChange={e => setEditingProject({...editingProject, recommendationLink: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
              </div>
            )}
          </div>
          {canSee('project-dates') && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট শুরু (ঐচ্ছিক)</label>
                <input type="date" value={editingProject.startDate || ''} onChange={e => setEditingProject({...editingProject, startDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট শেষ (ঐচ্ছিক)</label>
                <input type="date" value={editingProject.endDate || ''} onChange={e => setEditingProject({...editingProject, endDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          )}
          {canSee('project-links') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট লিঙ্ক (ঐচ্ছিক)</label>
              <input type="url" value={editingProject.link || ''} onChange={e => setEditingProject({...editingProject, link: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
            </div>
          )}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">সেভ করুন</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
