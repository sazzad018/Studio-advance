import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Search, Trash2, Folder, ArrowLeft, Facebook, Youtube, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

export interface VideoScript {
  id: string;
  title: string;
  content: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  type: 'Image' | 'Video' | 'Link' | 'Facebook' | 'YouTube';
  url: string;
  category: string;
  recommendationUrl?: string;
  videoDuration?: string;
  videoScripts?: VideoScript[];
}

export default function StudioPortfolio() {
  const { currentUser } = useAuth();
  
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('studio_portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultFormData: Omit<PortfolioItem, 'id'> = {
    title: '',
    description: '',
    type: 'Facebook',
    url: '',
    category: '',
    recommendationUrl: '',
    videoDuration: '',
    videoScripts: []
  };

  const [formData, setFormData] = useState<Omit<PortfolioItem, 'id'>>(defaultFormData);

  useEffect(() => {
    localStorage.setItem('studio_portfolio', JSON.stringify(items));
  }, [items]);

  const openAddModal = (presetType?: 'Facebook' | 'YouTube' | 'Image') => {
    setFormData({
      ...defaultFormData,
      type: presetType || 'Facebook',
      category: selectedCategory || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PortfolioItem = {
      ...formData,
      id: `port_${Date.now()}`
    };
    setItems([newItem, ...items]);
    setIsModalOpen(false);
  };

  const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const categories = Array.from<string>(new Set(items.map(item => item.category || 'Uncategorized')));
  
  const categoryItems = items.filter(item => (item.category || 'Uncategorized') === selectedCategory);
  
  const facebookItems = categoryItems.filter(i => i.type === 'Facebook' || (!['YouTube', 'Image', 'Video'].includes(i.type) && (i.url.toLowerCase().includes('facebook.com') || i.url.toLowerCase().includes('fb.watch'))));
  const youtubeItems = categoryItems.filter(i => i.type === 'YouTube' || i.type === 'Video' || i.url.toLowerCase().includes('youtube.com') || i.url.toLowerCase().includes('youtu.be'));
  const imageItems = categoryItems.filter(i => i.type === 'Image');

  const filteredCategories = categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center w-full sm:w-auto">
          {selectedCategory ? (
            <>
              <button onClick={() => setSelectedCategory(null)} className="mr-3 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                <ArrowLeft size={24} />
              </button>
              <Folder className="w-8 h-8 mr-3 text-indigo-600" />
              {selectedCategory}
            </>
          ) : (
            <>
              <Folder className="w-8 h-8 mr-3 text-indigo-600" />
              স্টুডিও পোর্টফোলিও
            </>
          )}
        </h1>
        {isPrivileged && !selectedCategory && (
          <button
            onClick={() => openAddModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            নতুন ক্যাটাগরি / আইটেম
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {!selectedCategory ? (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ক্যাটাগরি খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">কোন ক্যাটাগরি পাওয়া যায়নি</p>
                {isPrivileged && <p className="text-sm mt-1">নতুন আইটেম যোগ করতে বাটনে ক্লিক করুন।</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredCategories.map(cat => (
                  <div 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center transition-all text-center group"
                  >
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Folder size={32} className="text-indigo-500" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-2">{cat}</h3>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            
            {/* Facebook Section */}
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-xl font-bold flex items-center text-gray-800">
                  <Facebook className="mr-2 text-blue-600" /> 
                  Facebook Links
                </h3>
                {isPrivileged && (
                  <button onClick={() => openAddModal('Facebook')} className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center font-medium hover:bg-blue-100">
                    <Plus size={16} className="mr-1" />
                    লিঙ্ক যুক্ত করুন
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facebookItems.map(item => (
                  <div key={item.id} className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between hover:border-blue-300 transition-colors">
                    <div className="flex-1 pr-4 overflow-hidden mb-3 md:mb-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                      {item.description && <p className="text-sm text-gray-500 truncate">{item.description}</p>}
                      {item.videoDuration && <p className="text-xs text-purple-600 mt-1">⏳ {item.videoDuration}</p>}
                      {item.recommendationUrl && <a href={item.recommendationUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block truncate">👍 {item.recommendationUrl}</a>}
                      {item.videoScripts && item.videoScripts.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-gray-700 block mb-1">ভিডিও স্ক্রিপ্টসমূহ:</span>
                          <ul className="list-disc pl-4 text-gray-600 space-y-1">
                            {item.videoScripts.map(s => (
                              <li key={s.id}>
                                <strong>{s.title || 'Untitled'}:</strong> <span className="line-clamp-1 italic">{s.content}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
                        <ExternalLink size={14} />
                        ওপেন করুন
                      </a>
                      {isPrivileged && (
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {facebookItems.length === 0 && (
                  <div className="col-span-full bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">কোন ফেসবুক লিঙ্ক নেই</div>
                )}
              </div>
            </section>

            {/* YouTube Section */}
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-xl font-bold flex items-center text-gray-800">
                  <Youtube className="mr-2 text-red-600" /> 
                  YouTube Links
                </h3>
                {isPrivileged && (
                  <button onClick={() => openAddModal('YouTube')} className="text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-lg flex items-center font-medium hover:bg-red-100">
                    <Plus size={16} className="mr-1" />
                    লিঙ্ক যুক্ত করুন
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {youtubeItems.map(item => (
                  <div key={item.id} className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between hover:border-red-300 transition-colors">
                    <div className="flex-1 pr-4 overflow-hidden mb-3 md:mb-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                      {item.description && <p className="text-sm text-gray-500 truncate">{item.description}</p>}
                      {item.videoDuration && <p className="text-xs text-purple-600 mt-1">⏳ {item.videoDuration}</p>}
                      {item.recommendationUrl && <a href={item.recommendationUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline mt-1 block truncate">👍 {item.recommendationUrl}</a>}
                      {item.videoScripts && item.videoScripts.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-gray-700 block mb-1">ভিডিও স্ক্রিপ্টসমূহ:</span>
                          <ul className="list-disc pl-4 text-gray-600 space-y-1">
                            {item.videoScripts.map(s => (
                              <li key={s.id}>
                                <strong>{s.title || 'Untitled'}:</strong> <span className="line-clamp-1 italic">{s.content}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition">
                        <ExternalLink size={14} />
                        ওপেন করুন
                      </a>
                      {isPrivileged && (
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {youtubeItems.length === 0 && (
                  <div className="col-span-full bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">কোন ইউটিউব লিঙ্ক নেই</div>
                )}
              </div>
            </section>

            {/* Photos Section */}
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-xl font-bold flex items-center text-gray-800">
                  <ImageIcon className="mr-2 text-green-600" /> 
                  Photos <span className="ml-2 text-sm text-gray-500 font-normal">({Math.min(imageItems.length, 6)}/6 সীমাবদ্ধ)</span>
                </h3>
                {isPrivileged && imageItems.length < 6 && (
                  <button onClick={() => openAddModal('Image')} className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg flex items-center font-medium hover:bg-green-100">
                    <Plus size={16} className="mr-1" />
                    ফটো যুক্ত করুন
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageItems.slice(0, 6).map(item => (
                  <div key={item.id} className="relative group border border-gray-200 rounded-xl overflow-hidden bg-gray-100 aspect-square shadow-sm">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                      {item.title && <h4 className="text-white font-medium text-center mb-3 line-clamp-1">{item.title}</h4>}
                      <div className="flex items-center gap-3">
                        <a href={item.url} target="_blank" rel="noreferrer" className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium hover:bg-white">
                          <ExternalLink size={14} className="mr-1" /> ওপেন
                        </a>
                        {isPrivileged && (
                          <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {imageItems.length === 0 && (
                  <div className="col-span-full bg-gray-50 rounded-xl p-8 text-center text-gray-500 text-sm border border-dashed border-gray-200">কোন ফটো নেই</div>
                )}
              </div>
            </section>

          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন পোর্টফোলিও আইটেম">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ধরণ (Type)</label>
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Facebook">Facebook Link</option>
              <option value="YouTube">YouTube Link</option>
              <option value="Image">Photo URL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <input 
              required
              type="text" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="e.g. Wedding, Product"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">টাইটেল</label>
            <input 
              required 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="Title of the item"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইউআরএল (URL)</label>
            <input 
              required
              type="url" 
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})} 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও ডিউরেশন (ঐচ্ছিক)</label>
            <input 
              type="text" 
              value={formData.videoDuration || ''} 
              onChange={e => setFormData({...formData, videoDuration: e.target.value})} 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="e.g. 5:30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">রেকোমেন্ডেশন লিংক (ঐচ্ছিক)</label>
            <input 
              type="url" 
              value={formData.recommendationUrl || ''} 
              onChange={e => setFormData({...formData, recommendationUrl: e.target.value})} 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="https://..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">ভিডিও স্ক্রিপ্ট (একাধিক)</label>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, videoScripts: [...(formData.videoScripts || []), { id: Date.now().toString(), title: '', content: '' }]})} 
                className="text-sm bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 flex items-center"
              >
                <Plus size={14} className="mr-1" /> যোগ করুন
              </button>
            </div>
            {formData.videoScripts?.map((script, index) => (
              <div key={script.id} className="mb-3 border border-gray-200 rounded-lg p-3 relative">
                <button type="button" onClick={() => {
                  const newScripts = [...(formData.videoScripts || [])];
                  newScripts.splice(index, 1);
                  setFormData({...formData, videoScripts: newScripts});
                }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
                <input type="text" value={script.title} onChange={e => {
                  const newScripts = [...(formData.videoScripts || [])];
                  newScripts[index].title = e.target.value;
                  setFormData({...formData, videoScripts: newScripts});
                }} placeholder="স্ক্রিপ্ট টাইটেল..." className="w-full mb-2 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none pr-8" />
                <textarea value={script.content} onChange={e => {
                  const newScripts = [...(formData.videoScripts || [])];
                  newScripts[index].content = e.target.value;
                  setFormData({...formData, videoScripts: newScripts});
                }} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none h-20" placeholder="স্ক্রিপ্ট কনটেন্ট..." />
              </div>
            ))}
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition mt-6 font-medium">
            সেভ করুন
          </button>
        </form>
      </Modal>
    </div>
  );
}
