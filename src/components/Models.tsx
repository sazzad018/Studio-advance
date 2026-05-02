import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Star, Briefcase, DollarSign, User, Plus, Phone, Mail, Facebook, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function Models() {
  const { models, clients, addModel } = useData();
  const { currentUser } = useAuth();
  const [selectedModel, setSelectedModel] = useState(models[0] || null);

  const canSee = (permId: string) => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return true;
    return currentUser?.projectPermissions?.includes(permId) ?? false;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', category: '', hourlyRate: 0, imageUrl: '', phone: '', email: '', facebook: '', portfolioLinks: [] as string[], portfolioImages: [] as string[], projects: [] as string[] });

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
          setNewModel({ ...newModel, imageUrl: base64String });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
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
            setNewModel(prev => ({ 
              ...prev, 
              portfolioImages: [...prev.portfolioImages, base64String] 
            }));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    addModel({
      ...newModel,
      imageUrl: newModel.imageUrl || `https://picsum.photos/seed/${newModel.name}/200/300`
    });
    setIsModalOpen(false);
    setNewModel({ name: '', category: '', hourlyRate: 0, imageUrl: '', phone: '', email: '', facebook: '', portfolioLinks: [], portfolioImages: [], projects: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">মডেল-ভিত্তিক বিশ্লেষণ</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} className="mr-2" /> নতুন মডেল
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Model List */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 sticky top-0">
            <h2 className="font-bold text-gray-800 flex items-center text-lg">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              মডেল তালিকা
            </h2>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto custom-scrollbar flex-1 p-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full text-left p-4 rounded-xl mb-1 transition-all group flex items-center space-x-4 ${
                  selectedModel?.id === model.id ? 'bg-purple-600 shadow-md shadow-purple-200 translate-x-1' : 'hover:bg-gray-50 hover:translate-x-1'
                }`}
              >
                <img src={model.imageUrl} alt={model.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base truncate transition-colors ${selectedModel?.id === model.id ? 'text-white' : 'text-gray-900 group-hover:text-purple-600'}`}>{model.name}</h3>
                  <p className={`text-sm mt-0.5 truncate transition-colors ${selectedModel?.id === model.id ? 'text-purple-100' : 'text-gray-500'}`}>{model.category}</p>
                </div>
              </button>
            ))}
            {models.length === 0 && (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <User className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium">কোনো মডেল নেই</p>
              </div>
            )}
          </div>
        </div>

        {/* Model Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedModel ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50/50 rounded-bl-full -z-10"></div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                <div className="relative">
                  <img src={selectedModel.imageUrl} alt={selectedModel.name} className="w-36 h-36 rounded-2xl object-cover border-4 border-white shadow-xl" />
                  <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-3">{selectedModel.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-5">
                    <span className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-100 flex items-center">
                      <Briefcase className="w-4 h-4 mr-1.5" /> {selectedModel.category}
                    </span>
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1.5" /> ৳{selectedModel.hourlyRate.toLocaleString()}/ঘন্টা
                    </span>
                  </div>
                  
                  {(selectedModel.phone || selectedModel.email || selectedModel.facebook) && (
                    <div className="flex flex-col items-center md:items-start space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {selectedModel.phone && (
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4 mr-2.5 text-gray-400" />
                          <a href={`tel:${selectedModel.phone}`} className="hover:text-purple-600 transition-colors">{selectedModel.phone}</a>
                        </div>
                      )}
                      {selectedModel.email && (
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4 mr-2.5 text-gray-400" />
                          <a href={`mailto:${selectedModel.email}`} className="hover:text-purple-600 transition-colors">{selectedModel.email}</a>
                        </div>
                      )}
                      {selectedModel.facebook && (
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <Facebook className="w-4 h-4 mr-2.5 text-gray-400" />
                          <a href={selectedModel.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors text-blue-600 hover:underline">ফেসবুক প্রোফাইল</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pt-6 border-t border-gray-100/60">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  প্রজেক্ট পরিচিতি
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedModel.projects || []).map((projectId) => {
                  const client = clients.find(c => (c.projects || []).some(p => p.id === projectId));
                  const project = client?.projects?.find(p => p.id === projectId);
                  
                  if (!project || !client) return null;

                  return (
                    <div key={project.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="pr-4">
                          <h4 className="font-extrabold text-lg text-gray-900 leading-tight mb-2">{project.title}</h4>
                          <p className="text-xs font-medium text-gray-500 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 flex-shrink-0"></span>
                            {client.name} ({client.company})
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider border flex-shrink-0 ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          project.status === 'Shooting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      {project.thumbnailUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-colors">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title} 
                            className="w-full h-32 object-cover transform transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      
                      {canSee('project-content') && (
                        <div className="mt-4 pt-4 border-t border-gray-100/80">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">কাজের বিবরণী:</h5>
                          <ul className="space-y-1.5 text-sm text-gray-600">
                            {project.contentLog.map((log, index) => (
                              <li key={index} className="flex items-start">
                                 <span className="text-gray-300 mr-1.5 mt-0.5">•</span>
                                 <span>{log}</span>
                              </li>
                            ))}
                            {project.contentLog.length === 0 && <li className="text-gray-400 italic">কোনো লগ নেই</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!selectedModel.projects || selectedModel.projects.length === 0) && (
                  <div className="col-span-1 md:col-span-2 text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="font-bold text-gray-500">কোনো প্রজেক্টে যুক্ত নেই</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="bg-white p-12 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center text-center text-gray-500 h-[calc(100vh-12rem)] min-h-[500px]">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                <User className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">মডেল নির্বাচন করুন</h2>
              <p className="text-gray-500 max-w-sm">বাম দিকের তালিকা থেকে একটি মডেল নির্বাচন করুন অথবা নতুন মডেল যোগ করুন।</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন মডেল যোগ করুন">
        <form onSubmit={handleAddModel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
            <input required type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <input required type="text" value={newModel.category} onChange={e => setNewModel({...newModel, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="যেমন: Fashion, Commercial" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ঘণ্টাপ্রতি রেট</label>
            <input required type="number" value={newModel.hourlyRate} onChange={e => setNewModel({...newModel, hourlyRate: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নাম্বার (ঐচ্ছিক)</label>
            <input type="tel" value={newModel.phone} onChange={e => setNewModel({...newModel, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="+8801..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
            <input type="email" value={newModel.email} onChange={e => setNewModel({...newModel, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফেসবুক পেজ/প্রোফাইল (ঐচ্ছিক)</label>
            <input type="url" value={newModel.facebook} onChange={e => setNewModel({...newModel, facebook: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="https://facebook.com/..." />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">পোর্টফলিও লিংক (একাধিক)</label>
              <button 
                type="button" 
                onClick={() => setNewModel({...newModel, portfolioLinks: [...newModel.portfolioLinks, '']})} 
                className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center"
              >
                <Plus size={14} className="mr-1" /> যোগ করুন
              </button>
            </div>
            {newModel.portfolioLinks.map((link, index) => (
              <div key={index} className="flex mb-2 items-center">
                <input 
                  type="url" 
                  value={link} 
                  onChange={e => {
                    const newLinks = [...newModel.portfolioLinks];
                    newLinks[index] = e.target.value;
                    setNewModel({...newModel, portfolioLinks: newLinks});
                  }} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                  placeholder="https://..." 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const newLinks = [...newModel.portfolioLinks];
                    newLinks.splice(index, 1);
                    setNewModel({...newModel, portfolioLinks: newLinks});
                  }} 
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পোর্টফোলিও ইমেজ (একাধিক)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handlePortfolioImagesUpload} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
            />
            {newModel.portfolioImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {newModel.portfolioImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`Portfolio ${index}`} className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                    <button 
                      type="button"
                      onClick={() => {
                        const newImages = [...newModel.portfolioImages];
                        newImages.splice(index, 1);
                        setNewModel({...newModel, portfolioImages: newImages});
                      }}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মডেলের ছবি</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
            {newModel.imageUrl && (
              <div className="mt-2">
                <img src={newModel.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}
