import React, { useState, useEffect } from 'react';
import { Globe, Plus, Search, Edit2, Trash2, Send, Copy, Link as LinkIcon, Settings, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ClientProfile } from './AllClients';

interface WebsiteRecord {
  id: string;
  clientId?: string;
  clientName: string;
  whatsappNumber: string;
  provider: string;
  url: string;
  username: string;
  password: string;
  createdAt: string;
}

export default function WebsiteInfo() {
  const [records, setRecords] = useState<WebsiteRecord[]>(() => {
    return JSON.parse(localStorage.getItem('websiteRecords') || '[]');
  });
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    return JSON.parse(localStorage.getItem('allClientsProfiles') || '[]');
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState<Partial<WebsiteRecord>>({});
  
  useEffect(() => {
    localStorage.setItem('websiteRecords', JSON.stringify(records));
  }, [records]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.url) return;

    if (formData.id) {
      setRecords(records.map(r => r.id === formData.id ? { ...r, ...formData } as WebsiteRecord : r));
    } else {
      setRecords([...records, { 
        ...formData, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      } as WebsiteRecord]);
    }
    
    setIsModalOpen(false);
    setFormData({});
  };

  const handleEdit = (record: WebsiteRecord) => {
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই রেকর্ডটি ডিলিট করতে চান?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId: client.id,
        clientName: client.businessName,
        whatsappNumber: client.whatsappNumber || '',
        url: client.websiteUrl || '' // from recent updates
      });
    }
  };

  const filteredRecords = records.filter(r => 
    r.clientName.toLowerCase().includes(search.toLowerCase()) || 
    r.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Globe className="text-indigo-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ওয়েবসাইট ইনফো</h1>
            <p className="text-sm text-gray-500">ক্লায়েন্টদের ওয়েবসাইটের ডিটেইলস সংরক্ষণ করুন</p>
          </div>
        </div>
        <button 
          onClick={() => { setFormData({}); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-md font-medium"
        >
          <Plus size={20} /> নতুন ইনফো যুক্ত করুন
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ক্লায়েন্টের নাম বা ওয়েবসাইট খুঁজুন..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition outline-none"
            />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map(record => (
            <div key={record.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="p-5 border-b bg-gray-50/50 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {record.clientName}
                  </h3>
                  <a href={record.url.startsWith('http') ? record.url : `https://${record.url}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                    <LinkIcon size={14} />
                    {record.url}
                  </a>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(record)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Settings size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 mb-0.5">প্রোভাইডার</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{record.provider || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Globe size={16} />
                  </div>
                  <div className="overflow-hidden w-full flex justify-between items-center group/item">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">ইউজারনেম / ইমেইল</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{record.username || 'N/A'}</p>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(record.username); alert('ইউজারনেম কপি করা হয়েছে!'); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 opacity-0 group-hover/item:opacity-100 transition"
                      title="Copy Username"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <Globe size={16} />
                  </div>
                  <div className="overflow-hidden w-full flex justify-between items-center group/item">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">পাসওয়ার্ড</p>
                      <p className="text-sm font-medium text-gray-900 truncate select-all">{record.password || 'N/A'}</p>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(record.password); alert('পাসওয়ার্ড কপি করা হয়েছে!'); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 opacity-0 group-hover/item:opacity-100 transition"
                      title="Copy Password"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                <button 
                  onClick={() => {
                    const text = `Hello ${record.clientName},\n\nHere are your website details:\nURL: ${record.url}\nProvider: ${record.provider}\nUsername: ${record.username}\nPassword: ${record.password}\n\nPlease keep this information secure.\nThank you!`;
                    navigator.clipboard.writeText(text);
                    alert('মেসেজ কপি করা হয়েছে!');
                  }}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  <Copy size={16} /> কপি মেসেজ
                </button>
                {record.whatsappNumber && (
                  <a 
                    href={`https://wa.me/${record.whatsappNumber}?text=${encodeURIComponent(`Hello ${record.clientName},\n\nHere are your website details:\nURL: ${record.url}\nProvider: ${record.provider}\nUsername: ${record.username}\nPassword: ${record.password}\n\nPlease keep this information secure.\nThank you!`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
                  >
                    <Send size={16} /> WhatsApp এ পাঠান
                  </a>
                )}
              </div>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500">
              <Globe className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">কোনো ওয়েবসাইট ইনফো পাওয়া যায়নি</p>
              <p className="text-sm">নতুন ইনফো যুক্ত করতে উপরের বাটনে ক্লিক করুন।</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pt-20 z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b shrink-0 bg-gray-50/80">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <Globe size={24} className="text-indigo-600" />
                {formData.id ? 'ইনফো এডিট করুন' : 'নতুন ওয়েবসাইট ইনফো'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">পূর্বের ক্লায়েন্ট নির্বাচন করুন (ঐচ্ছিক)</label>
                <select 
                  className="w-full border-gray-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-100"
                  onChange={e => handleClientSelect(e.target.value)}
                  value={formData.clientId || ''}
                >
                  <option value="">-- নতুন ক্লায়েন্ট --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্টের নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.clientName || ''} 
                  onChange={e => setFormData({...formData, clientName: e.target.value})} 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-100" 
                  placeholder="ক্লায়েন্ট/প্রতিষ্ঠানের নাম"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হোয়াটসঅ্যাপ নাম্বার</label>
                <input 
                  type="text" 
                  value={formData.whatsappNumber || ''} 
                  onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-100" 
                  placeholder="e.g. +8801XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রোভাইডার</label>
                <input 
                  type="text" 
                  value={formData.provider || ''} 
                  onChange={e => setFormData({...formData, provider: e.target.value})} 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-100" 
                  placeholder="e.g. Hostinger, Namecheap, GoDaddy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইটের লিংক <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.url || ''} 
                  onChange={e => setFormData({...formData, url: e.target.value})} 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-100" 
                  placeholder="www.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ইউজারনেম / ইমেইল</label>
                  <input 
                    type="text" 
                    value={formData.username || ''} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-100" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                  <input 
                    type="text" 
                    value={formData.password || ''} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-100" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t font-sans">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 border rounded-xl hover:bg-gray-50 transition"
                >
                  বাতিল
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
