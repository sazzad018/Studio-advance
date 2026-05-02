import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MessageSquare, Clock, Plus, Settings, ChevronRight, CheckCircle, ExternalLink, Calendar as CalendarIcon, Phone, Loader } from 'lucide-react';
import { parseClientData } from '../services/ai';

export type ServiceCategory = 'Website' | 'Automation' | 'Course' | 'Marketing';
export type ClientStatus = 'Active' | 'Inactive';

export interface ClientProfile {
  id: string;
  businessName: string;
  websiteUrl: string;
  whatsappNumber: string;
  email: string;
  serviceType: ServiceCategory;
  status: ClientStatus;
  facebookPageLink: string;
  adAccountId: string;
  createdAt: string;
  
  // Facebook Ads Specific
  fbAdStartDate?: string;
  fbAdEndDate?: string;
  fbAdCampaignType?: string;
  fbAdCampaignName?: string;
  fbAdCampaignBudget?: string;
  
  // Website Specific
  websiteUsername?: string;
  websitePassword?: string;
  websiteProvider?: string;
}

export interface ClientComment {
  id: string;
  clientId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface ClientReminder {
  id: string;
  clientId: string;
  text: string;
  assignedToId: string;
  dueDate: string;
  isFbAdEndReminder?: boolean;
}

export default function AllClients({ onNavigate, categoryProp = 'All' }: { onNavigate?: (tab: string) => void, categoryProp?: ServiceCategory | 'All' }) {
  const { currentUser, users } = useAuth();
  
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('allClientsData');
    return saved ? JSON.parse(saved) : [];
  });
  const [comments, setComments] = useState<ClientComment[]>(() => {
    const saved = localStorage.getItem('allClientsComments');
    return saved ? JSON.parse(saved) : [];
  });
  const [reminders, setReminders] = useState<ClientReminder[]>(() => {
    const saved = localStorage.getItem('allClientsReminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>(categoryProp);

  useEffect(() => {
    setActiveCategory(categoryProp);
    setSelectedClientId(null);
  }, [categoryProp]);

  const [activeStatusFilter, setActiveStatusFilter] = useState<ClientStatus | 'All'>('All');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    serviceType: 'Marketing',
    status: 'Active'
  });
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const parseRawText = async () => {
    if (!rawText) return;
    
    setIsParsing(true);
    try {
      const extractedData = await parseClientData(rawText);
      if (extractedData) {
        const newFormData = { ...formData, ...extractedData };
        
        // Attempt to map extracted service type to our enums if possible
        if (newFormData.serviceType && typeof newFormData.serviceType === 'string') {
           const st = newFormData.serviceType.toLowerCase();
           if (st.includes('web')) newFormData.serviceType = 'Website';
           else if (st.includes('auto')) newFormData.serviceType = 'Automation';
           else if (st.includes('course')) newFormData.serviceType = 'Course';
           else newFormData.serviceType = 'Marketing';
        }
    
        setFormData(newFormData);
      } else {
        alert('অটো-ফিল ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } catch (e) {
      console.error(e);
      alert('অটো-ফিল ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsParsing(false);
    }
  };

  // Save changes
  useEffect(() => {
    localStorage.setItem('allClientsData', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem('allClientsComments', JSON.stringify(comments));
  }, [comments]);
  useEffect(() => {
    localStorage.setItem('allClientsReminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName) return;

    let clientId = formData.id;
    if (formData.id) {
      setClients(clients.map(c => c.id === formData.id ? { ...c, ...formData } as ClientProfile : c));
    } else {
      clientId = Date.now().toString();
      setClients([...clients, { ...formData, id: clientId, createdAt: new Date().toISOString() } as ClientProfile]);
    }
    
    // Auto-create notification for Facebook Ads End Date
    if ((formData.serviceType === 'Course' || formData.serviceType === 'Marketing') && formData.fbAdEndDate) {
      const exists = reminders.find(r => r.clientId === clientId && r.isFbAdEndReminder);
      if (!exists && currentUser) {
        const text = `Facebook Ad Campaign (Type: ${formData.fbAdCampaignType || 'N/A'}) Ending today for ${formData.businessName}. Please contact the client immediately!\n\nMessage template: \n"Hello, your Facebook Ads campaign ends today. Please let us know if you want to renew the campaign!"`;
        setReminders([...reminders, {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          clientId: clientId!,
          text,
          assignedToId: currentUser.id,
          dueDate: formData.fbAdEndDate,
          isFbAdEndReminder: true
        }]);
      }
    }

    setIsModalOpen(false);
    setFormData({ serviceType: 'Marketing', status: 'Active' });
  };

  const filteredClients = clients.filter(c => {
    if (activeCategory !== 'All' && c.serviceType !== activeCategory) return false;
    if (activeStatusFilter !== 'All' && c.status !== activeStatusFilter) return false;
    return true;
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar for Client List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{activeCategory === 'All' ? 'অল লিড / ক্লায়েন্ট' : `${activeCategory} ক্লায়েন্ট`}</h2>
            <button 
              onClick={() => { setFormData({ serviceType: activeCategory !== 'All' ? activeCategory as ServiceCategory : 'Marketing', status: 'Active' }); setRawText(''); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {categoryProp === 'All' && (
            <div className="flex flex-wrap gap-2">
              {['All', 'Website', 'Automation', 'Course', 'Marketing'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-3 py-1 text-sm rounded-full ${activeCategory === cat ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <button 
              onClick={() => setActiveStatusFilter('All')}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${activeStatusFilter === 'All' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveStatusFilter('Active')}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${activeStatusFilter === 'Active' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveStatusFilter('Inactive')}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${activeStatusFilter === 'Inactive' ? 'border-gray-500 text-gray-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">কোনো ক্লায়েন্ট পাওয়া যায়নি</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between group ${selectedClientId === client.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{client.businessName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {client.status}
                      </span>
                      <span className="text-sm text-gray-500">{client.serviceType}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className={`text-gray-400 group-hover:text-indigo-500 ${selectedClientId === client.id ? 'text-indigo-600' : ''}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
        {selectedClient ? (
          <ClientDetail 
            client={selectedClient} 
            users={users}
            currentUser={currentUser}
            comments={comments.filter(c => c.clientId === selectedClient.id)}
            reminders={reminders.filter(r => r.clientId === selectedClient.id)}
            onAddComment={(text) => {
              if(!currentUser) return;
              setComments([{ id: Date.now().toString(), clientId: selectedClient.id, text, authorId: currentUser.id, authorName: currentUser.name, createdAt: new Date().toISOString() }, ...comments]);
            }}
            onAddReminder={(text, assignedToId, dueDate, isFbAdEndReminder) => {
              setReminders([{ id: Date.now().toString(), clientId: selectedClient.id, text, assignedToId, dueDate, isFbAdEndReminder }, ...reminders]);
            }}
            onDeleteReminder={(id) => setReminders(reminders.filter(r => r.id !== id))}
            onEditClient={(data) => {
               setFormData(data);
               setRawText('');
               setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-200" />
              <p>বিস্তারিত দেখতে বাম পাশ থেকে একটি ক্লায়েন্ট নির্বাচন করুন</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">{formData.id ? 'ক্লায়েন্ট প্রোফাইল সম্পাদনা করুন' : 'নতুন লিড/ক্লায়েন্ট যোগ করুন'}</h2>
            </div>
            
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <label className="block text-sm font-semibold text-indigo-900 mb-2">স্মার্ট পেস্ট (Smart Paste) ✨</label>
                <div className="flex gap-2">
                  <textarea 
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="পুরো টেক্সট এখানে পেস্ট করুন, তারপর অটো-ফিল বাটনে ক্লিক করুন..."
                    className="w-full h-20 text-sm border-indigo-200 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={parseRawText}
                    disabled={isParsing || !rawText.trim()}
                    className="shrink-0 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium text-sm flex flex-col items-center justify-center gap-1"
                  >
                    {isParsing ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>অটো</span>
                        <span>ফিল</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিজনেস নাম *</label>
                  <input type="text" required value={formData.businessName || ''} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইট URL</label>
                  <input type="url" value={formData.websiteUrl || ''} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp নাম্বার</label>
                  <input type="text" value={formData.whatsappNumber || ''} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" placeholder="+880..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">সার্ভিস টাইপ</label>
                  <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value as any})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white">
                    <option value="Website">Website</option>
                    <option value="Automation">Automation</option>
                    <option value="Course">Course</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফেসবুক পেজ লিংক</label>
                  <input type="url" value={formData.facebookPageLink || ''} onChange={e => setFormData({...formData, facebookPageLink: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাড অ্যাকাউন্ট আইডি (Ad Account ID)</label>
                  <input type="text" value={formData.adAccountId || ''} onChange={e => setFormData({...formData, adAccountId: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                
                {(formData.serviceType === 'Course' || formData.serviceType === 'Marketing') && (
                  <>
                    <div className="col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">Facebook Ads Setup</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইন শুরুর তারিখ</label>
                      <input type="date" value={formData.fbAdStartDate || ''} onChange={e => setFormData({...formData, fbAdStartDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইন শেষের তারিখ</label>
                      <input type="date" value={formData.fbAdEndDate || ''} onChange={e => setFormData({...formData, fbAdEndDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইনের ধরন</label>
                      <select value={formData.fbAdCampaignType || ''} onChange={e => setFormData({...formData, fbAdCampaignType: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border bg-white">
                        <option value="">ফাঁকা (নির্বাচন করুন)</option>
                        <option value="Message">Message</option>
                        <option value="Sales">Sales</option>
                        <option value="Engagement">Engagement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাম্পেইনের নাম</label>
                      <input type="text" value={formData.fbAdCampaignName || ''} onChange={e => setFormData({...formData, fbAdCampaignName: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" placeholder="e.g. Eid Mega Sale" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">বাজেট (Dollar $)</label>
                      <input type="number" value={formData.fbAdCampaignBudget || ''} onChange={e => setFormData({...formData, fbAdCampaignBudget: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" placeholder="e.g. 100" />
                    </div>
                  </>
                )}
                
                {formData.serviceType === 'Website' && (
                  <>
                    <div className="col-span-2 mt-4"><hr/><p className="mt-2 text-sm font-bold text-indigo-700">Website Setup Details</p></div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">প্রোভাইডার (কোথা থেকে কেনা)</label>
                      <input type="text" value={formData.websiteProvider || ''} onChange={e => setFormData({...formData, websiteProvider: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" placeholder="e.g. Hostinger, Namecheap" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইটের লিংক</label>
                      <input type="url" value={formData.websiteUrl || ''} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" placeholder="https://" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ইউজারনেম / ইমেইল</label>
                      <input type="text" value={formData.websiteUsername || ''} onChange={e => setFormData({...formData, websiteUsername: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                      <input type="text" value={formData.websitePassword || ''} onChange={e => setFormData({...formData, websitePassword: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientDetail({ client, users, currentUser, comments, reminders, onAddComment, onAddReminder, onDeleteReminder, onEditClient }: any) {
  const [newComment, setNewComment] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderAssignee, setReminderAssignee] = useState('');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if(newReminder && reminderDate && reminderAssignee) {
      onAddReminder(newReminder, reminderAssignee, reminderDate, false);
      setNewReminder('');
      setReminderDate('');
      setReminderAssignee('');
    }
  };

  const handleSetFbAdReminder = () => {
    if(client.fbAdEndDate) {
      alert('সফলভাবে ক্যাম্পেইন শেষের রিমাইন্ডার সেট করা হয়েছে!');
      onAddReminder(
        `Facebook Ad Campaign Ending today for ${client.businessName}. Please contact the client immediately!\n\nMessage template: \n"Hello, your Facebook Ads campaign ends today. Please let us know if you want to renew the campaign!"`,
        currentUser.id, // Or assign to specific
        client.fbAdEndDate,
        true
      );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white shadow-sm z-10 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.businessName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {client.status}
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-indigo-100">
                {client.serviceType}
              </span>
              {client.whatsappNumber && (
                <a href={`https://wa.me/${client.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline bg-green-50 px-2 py-0.5 rounded-md">
                  <Phone size={14} /> WhatsApp
                </a>
              )}
            </div>
          </div>
          <button onClick={() => onEditClient(client)} className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{client.email || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Website</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {client.websiteUrl ? <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">{client.websiteUrl} <ExternalLink size={14} /></a> : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Facebook Page</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {client.facebookPageLink ? <a href={client.facebookPageLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">{client.facebookPageLink} <ExternalLink size={14} /></a> : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Ad Account ID</p>
            <p className="text-sm font-medium text-gray-900">{client.adAccountId || 'N/A'}</p>
          </div>
        </div>

        {client.serviceType === 'Website' && (client.websiteUsername || client.websiteProvider) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-800 font-semibold mb-4">
              <Settings size={18} />
              <span>Website Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Provider</p>
                  <p className="font-medium text-gray-900">{client.websiteProvider || 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Username / Email</p>
                  <p className="font-medium text-gray-900">{client.websiteUsername || 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm text-sm text-ellipsis overflow-hidden">
                  <p className="text-gray-500 text-xs mb-1">Password</p>
                  <p className="font-medium text-gray-900 select-all">{client.websitePassword ? '••••••••' : 'N/A'}</p>
                  {client.websitePassword && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(client.websitePassword!);
                        alert('Password copied!');
                      }}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                       Copy Password
                    </button>
                  )}
               </div>
            </div>
          </div>
        )}

        {(client.serviceType === 'Course' || client.serviceType === 'Marketing') && (client.fbAdStartDate || client.fbAdEndDate) && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-indigo-800 font-semibold">
                <CalendarIcon size={18} />
                <span>Facebook Ads Campaign</span>
              </div>
              {client.fbAdEndDate && (
                <button onClick={handleSetFbAdReminder} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors">
                  অটো রিমাইন্ডার সেট করুন
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Campaign Name</p>
                  <p className="font-medium text-gray-900">{client.fbAdCampaignName || 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Campaign Type</p>
                  <p className="font-medium text-gray-900">{client.fbAdCampaignType || 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Budget</p>
                  <p className="font-medium text-gray-900">{client.fbAdCampaignBudget ? `$${client.fbAdCampaignBudget}` : 'N/A'}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                  <p className="text-gray-500 text-xs mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{client.fbAdStartDate || '?'} to {client.fbAdEndDate || '?'}</p>
               </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-inner">
               <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Campaign Message Preview</p>
               <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed">
{`Hello Boss,
Your Facebook Ads campaign details are as follows:

${client.fbAdCampaignName ? `🏷️ Campaign Name: ${client.fbAdCampaignName}` : ''}
${client.fbAdCampaignType ? `🎯 Type: ${client.fbAdCampaignType}` : ''}
${client.fbAdCampaignBudget ? `💰 Budget: $${client.fbAdCampaignBudget}` : ''}
${client.fbAdStartDate ? `📅 Start Date: ${client.fbAdStartDate}` : ''}
${client.fbAdEndDate ? `⏳ End Date: ${client.fbAdEndDate}` : ''}

Please review this information.
Thank you!`}
               </pre>
               <div className="flex gap-3 mt-3">
                 <button 
                   onClick={() => {
                     const text = `Hello Boss,\nYour Facebook Ads campaign details are as follows:\n\n${client.fbAdCampaignName ? `🏷️ Campaign Name: ${client.fbAdCampaignName}\n` : ''}${client.fbAdCampaignType ? `🎯 Type: ${client.fbAdCampaignType}\n` : ''}${client.fbAdCampaignBudget ? `💰 Budget: $${client.fbAdCampaignBudget}\n` : ''}${client.fbAdStartDate ? `📅 Start Date: ${client.fbAdStartDate}\n` : ''}${client.fbAdEndDate ? `⏳ End Date: ${client.fbAdEndDate}\n` : ''}\nPlease review this information.\nThank you!`;
                     navigator.clipboard.writeText(text);
                     alert('মেসেজ কপি করা হয়েছে!');
                   }}
                   className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                 >
                   কপি করুন
                 </button>
                 {client.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${client.whatsappNumber}?text=${encodeURIComponent(`Hello Boss,\nYour Facebook Ads campaign details are as follows:\n\n${client.fbAdCampaignName ? `🏷️ Campaign Name: ${client.fbAdCampaignName}\n` : ''}${client.fbAdCampaignType ? `🎯 Type: ${client.fbAdCampaignType}\n` : ''}${client.fbAdCampaignBudget ? `💰 Budget: $${client.fbAdCampaignBudget}\n` : ''}${client.fbAdStartDate ? `📅 Start Date: ${client.fbAdStartDate}\n` : ''}${client.fbAdEndDate ? `⏳ End Date: ${client.fbAdEndDate}\n` : ''}\nPlease review this information.\nThank you!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Phone size={16} />
                      WhatsApp-এ পাঠান
                    </a>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Reminders section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" /> રিমাইন্ডার
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <form onSubmit={handleAddReminder} className="p-3 bg-gray-50 border-b border-gray-200 flex gap-2">
              <input type="text" placeholder="রিমাইন্ডার টাইটেল..." value={newReminder} onChange={e => setNewReminder(e.target.value)} className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none" required />
              <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="p-2 text-sm border border-gray-300 rounded w-32 focus:ring-1 focus:ring-indigo-500 outline-none" required />
              <select value={reminderAssignee} onChange={e => setReminderAssignee(e.target.value)} className="p-2 text-sm border border-gray-300 rounded w-32 focus:ring-1 focus:ring-indigo-500 outline-none bg-white" required>
                <option value="">কর্মচারী</option>
                {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button type="submit" className="bg-gray-800 text-white px-4 rounded font-medium text-sm hover:bg-gray-900">+</button>
            </form>
            <div className="p-0">
               {reminders.length === 0 ? (
                 <p className="text-center text-gray-400 text-sm py-4">কোনো রিমাইন্ডার নেই</p>
               ) : (
                 <div className="divide-y divide-gray-100">
                    {reminders.map((r: any) => {
                       const assignedUser = users?.find((u: any) => u.id === r.assignedToId);
                       return (
                       <div key={r.id} className={`p-3 flex justify-between items-start gap-4 ${r.isFbAdEndReminder ? 'bg-orange-50/50' : ''}`}>
                         <div>
                            <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{r.text}</p>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                               <span><strong className="text-gray-600">তারিখ:</strong> {r.dueDate}</span>
                               <span><strong className="text-gray-600">এসাইন:</strong> {assignedUser?.name || 'Unknown'}</span>
                            </div>
                         </div>
                         <button onClick={() => onDeleteReminder(r.id)} className="text-gray-400 hover:text-red-500">
                           <CheckCircle size={18} />
                         </button>
                       </div>
                    )})}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500" /> কমেন্টস ও হিস্টোরি
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col max-h-[400px]">
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">কোনো কমেন্ট বা হিস্টোরি নেই</p>
                ) : (
                  comments.map((c: any) => (
                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg rounded-tl-none relative w-[85%] border border-gray-100">
                       <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.text}</p>
                       <p className="text-[10px] text-gray-500 mt-2 flex justify-between">
                         <span className="font-medium text-gray-700">{c.authorName}</span>
                         <span>{new Date(c.createdAt).toLocaleString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                       </p>
                    </div>
                  ))
                )}
             </div>
             <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
                <textarea 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="নতুন কমেন্ট লিখুন..." 
                  className="flex-1 resize-none h-10 min-h-10 border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={() => { if(newComment) { onAddComment(newComment); setNewComment(''); } }}
                  disabled={!newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  Send
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
