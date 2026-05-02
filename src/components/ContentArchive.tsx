import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Filter, Image as ImageIcon, Search, Plus } from 'lucide-react';
import Modal from './Modal';

export default function ContentArchive() {
  const { content, clients, categories: contextCategories, addContent, addCategory } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState({ title: '', category: '', imageUrl: '', projectId: '' });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const categories = ['All', ...Array.from(new Set([...contextCategories, ...content.map(c => c.category)]))];

  const filteredContent = content.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    addContent({
      ...newContent,
      imageUrl: newContent.imageUrl || `https://picsum.photos/seed/${newContent.title}/400/300`
    });
    setIsModalOpen(false);
    setNewContent({ title: '', category: '', imageUrl: '', projectId: '' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
    }
  };

  const allProjects = clients.flatMap(c => c.projects);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ক্যাটাগরি-ভিত্তিক কনটেন্ট সংগ্রহ</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg flex items-center hover:bg-indigo-50 transition-colors"
          >
            <Plus size={20} className="mr-2" /> নতুন ক্যাটাগরি
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} className="mr-2" /> নতুন কনটেন্ট
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="কনটেন্ট খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContent.map((item) => {
          const client = clients.find(c => (c.projects || []).some(p => p.id === item.projectId));
          const project = client?.projects?.find(p => p.id === item.projectId);

          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  {item.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 truncate mb-3">
                  {project?.title || 'Unknown Project'} ({client?.company || 'Unknown Client'})
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
                    বিস্তারিত দেখুন
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">কোনো কনটেন্ট পাওয়া যায়নি</h3>
          <p className="text-gray-500 mt-1">অন্য ক্যাটাগরি বা সার্চ টার্ম চেষ্টা করুন।</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন কনটেন্ট যোগ করুন">
        <form onSubmit={handleAddContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">টাইটেল</label>
            <input required type="text" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <select required value={newContent.category} onChange={e => setNewContent({...newContent, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">নির্বাচন করুন</option>
              {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট নির্বাচন করুন</label>
            <select required value={newContent.projectId} onChange={e => setNewContent({...newContent, projectId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">নির্বাচন করুন</option>
              {allProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ছবির URL (ঐচ্ছিক)</label>
            <input type="url" value={newContent.imageUrl} onChange={e => setNewContent({...newContent, imageUrl: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="নতুন ক্যাটাগরি যোগ করুন">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির নাম</label>
            <input required type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: Campaign, Social Media" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}
