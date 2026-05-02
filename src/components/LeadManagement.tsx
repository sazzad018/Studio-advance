import React, { useState, useEffect } from 'react';
import { UserPlus, Facebook, Phone, Briefcase, Clock, DollarSign, Target, AlertCircle, Globe, MessageSquare, Plus, Search, User as UserIcon, Trash2, Edit2, FileText, LayoutGrid, List, Loader } from 'lucide-react';
import Modal from './Modal';
import { parseLeadData } from '../services/ai';

export interface Lead {
  id: string;
  conversationId: string;
  clientName: string;
  facebookPageLink: string;
  whatsappNumber: string;
  businessType: string;
  businessDuration: string;
  averageProductPrice: string;
  dailyMarketingBudget: string;
  currentProblems: string;
  websiteStatus: string;
  mainGoal: string;
  notes?: string;
  createdAt: string;
}

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('studio_leads');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
    return [
      {
        id: 'mock-lead-1',
        conversationId: '#10520',
        clientName: 'Rahul Ahmed',
        facebookPageLink: 'https://facebook.com/rahulsboutique',
        whatsappNumber: '01711000001',
        businessType: 'Clothing/Retail',
        businessDuration: '2 Years',
        averageProductPrice: '1500 BDT',
        dailyMarketingBudget: '10$',
        currentProblems: 'Sales are dropping, ROAS is very low.',
        websiteStatus: 'No',
        mainGoal: 'Increase Sales and ROAS',
        notes: 'Needs urgent consultation about ad account structure.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-lead-2',
        conversationId: '#10521',
        clientName: 'Sabrina Rahman',
        facebookPageLink: 'https://facebook.com/sabrinascosmetics',
        whatsappNumber: '01811000002',
        businessType: 'Cosmetics',
        businessDuration: '6 Months',
        averageProductPrice: '800 BDT',
        dailyMarketingBudget: '5$',
        currentProblems: 'Page has low messaging response rate.',
        websiteStatus: 'Yes, looking to connect pixel',
        mainGoal: 'More Website Purchases',
        notes: 'Has a Shopify website, needs help tracking conversions.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-lead-3',
        conversationId: '#10522',
        clientName: 'Tanvir Hasan',
        facebookPageLink: 'https://facebook.com/tanvirtechgadgets',
        whatsappNumber: '01911000003',
        businessType: 'Electronics/Gadgets',
        businessDuration: '3 Years',
        averageProductPrice: '3500 BDT',
        dailyMarketingBudget: '20$',
        currentProblems: 'Ads are getting rejected frequently.',
        websiteStatus: 'Yes',
        mainGoal: 'Account Unban and Scale Sales',
        notes: 'Client is frustrated with FB policy issues.',
        createdAt: new Date().toISOString()
      }
    ];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const defaultFormData: Omit<Lead, 'id' | 'createdAt'> = {
    conversationId: '',
    clientName: '',
    facebookPageLink: '',
    whatsappNumber: '',
    businessType: '',
    businessDuration: '',
    averageProductPrice: '',
    dailyMarketingBudget: '',
    currentProblems: '',
    websiteStatus: '',
    mainGoal: '',
    notes: ''
  };

  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt'>>(defaultFormData);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    localStorage.setItem('studio_leads', JSON.stringify(leads));
  }, [leads]);

  const openAddModal = () => {
    setEditingLead(null);
    setFormData(defaultFormData);
    setRawText('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      conversationId: lead.conversationId,
      clientName: lead.clientName,
      facebookPageLink: lead.facebookPageLink,
      whatsappNumber: lead.whatsappNumber,
      businessType: lead.businessType,
      businessDuration: lead.businessDuration,
      averageProductPrice: lead.averageProductPrice,
      dailyMarketingBudget: lead.dailyMarketingBudget,
      currentProblems: lead.currentProblems,
      websiteStatus: lead.websiteStatus,
      mainGoal: lead.mainGoal,
      notes: lead.notes || ''
    });
    setRawText('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই লিড মুছে ফেলতে চান?')) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const parseRawText = async () => {
    if (!rawText) return;
    
    setIsParsing(true);
    try {
      const extractedData = await parseLeadData(rawText);
      if (extractedData) {
        const newFormData = { ...formData, ...extractedData };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? { ...formData, id: l.id, createdAt: l.createdAt } : l));
    } else {
      const newLead: Lead = {
        ...formData,
        id: `lead_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setLeads([newLead, ...leads]);
    }
    setIsModalOpen(false);
  };

  const filteredLeads = leads.filter(l => 
    l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.whatsappNumber.includes(searchTerm) ||
    l.conversationId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center w-full sm:w-auto">
          <UserPlus className="w-8 h-8 mr-3 text-indigo-600" />
          লিড ম্যানেজমেন্ট
        </h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="লিস্ট ভিউ"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md flex items-center transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="গ্রিড ভিউ"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={20} className="mr-2" />
            নতুন লিড যোগ করুন
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="ক্লায়েন্টের নাম, হোয়াটসঅ্যাপ বা কনভারসেশন আইডি দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">কোন লিড পাওয়া যায়নি</p>
            <p className="text-sm">নতুন লিড যোগ করতে 'নতুন লিড যোগ করুন' বাটনে ক্লিক করুন।</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1">
                    <MessageSquare size={12} />
                    <span>কনভারসেশন: {lead.conversationId || 'N/A'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <UserIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                    {lead.clientName || 'নামহীন লিড'}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openEditModal(lead)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4 flex-grow text-sm">
                <div className="flex items-start">
                  <Phone className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 font-medium">WhatsApp Number</div>
                    <div className="text-gray-900">{lead.whatsappNumber || '-'}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Facebook className="w-4 h-4 mr-3 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Facebook Page</div>
                    {lead.facebookPageLink ? (
                      <a href={lead.facebookPageLink.startsWith('http') ? lead.facebookPageLink : `https://${lead.facebookPageLink}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                        {lead.facebookPageLink}
                      </a>
                    ) : (
                      <span className="text-gray-900">-</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                      <Briefcase className="w-3 h-3 mr-1" /> Business
                    </div>
                    <div className="text-gray-900 line-clamp-1" title={lead.businessType}>{lead.businessType || '-'}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                      <Clock className="w-3 h-3 mr-1" /> Duration
                    </div>
                    <div className="text-gray-900">{lead.businessDuration || '-'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                      <DollarSign className="w-3 h-3 mr-1" /> Product Price
                    </div>
                    <div className="text-gray-900">{lead.averageProductPrice || '-'}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                      <Target className="w-3 h-3 mr-1" /> Ad Budget
                    </div>
                    <div className="text-gray-900">{lead.dailyMarketingBudget || '-'}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50/50 border-t border-indigo-50 space-y-3">
                <div>
                  <div className="flex items-center text-xs text-indigo-800 font-semibold mb-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> বর্তমান সমস্যা
                  </div>
                  <div className="text-sm text-indigo-900">{lead.currentProblems || '-'}</div>
                </div>
                <div>
                  <div className="flex items-center text-xs text-emerald-800 font-semibold mb-1">
                    <Target className="w-3.5 h-3.5 mr-1" /> Main Goal
                  </div>
                  <div className="text-sm text-emerald-900">{lead.mainGoal || '-'}</div>
                </div>
                <div className="flex items-center text-xs">
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                  <span className="text-gray-600 mr-2">Website:</span>
                  <span className={`font-semibold ${lead.websiteStatus.toLowerCase().includes('yes') || lead.websiteStatus.toLowerCase().includes('হ্যাঁ') ? 'text-green-600' : 'text-amber-600'}`}>
                    {lead.websiteStatus || 'জানা নেই'}
                  </span>
                </div>
              </div>
              
              {lead.notes && (
                <div className="p-4 bg-yellow-50/50 border-t border-yellow-50 space-y-2 flex-grow-0">
                  <div className="flex items-center text-xs text-yellow-800 font-semibold mb-1">
                    <FileText className="w-3.5 h-3.5 mr-1" /> অন্যান্য তথ্য (Notes)
                  </div>
                  <div className="text-sm text-yellow-900 whitespace-pre-wrap">{lead.notes}</div>
                </div>
              )}
            </div>
          ))}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ক্লায়েন্ট / কন্টাক্ট</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ব্যবসা</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">সমস্যা ও লক্ষ্য</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                       <div className="font-bold text-gray-900 flex items-center">
                         <UserIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                         {lead.clientName || 'নামহীন লিড'}
                       </div>
                       <div className="text-xs text-indigo-600 mt-1 flex items-center">
                         <MessageSquare className="w-3 h-3 mr-1" />
                         #{lead.conversationId || 'N/A'}
                       </div>
                       <div className="mt-3 space-y-1">
                         <div className="flex items-center text-gray-700 text-xs">
                           <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400"/> {lead.whatsappNumber || '-'}
                         </div>
                         {lead.facebookPageLink && (
                           <div className="flex items-center text-indigo-600 text-xs">
                             <Facebook className="w-3.5 h-3.5 mr-1.5"/>
                             <a href={lead.facebookPageLink.startsWith('http') ? lead.facebookPageLink : `https://${lead.facebookPageLink}`} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-[150px] truncate" title={lead.facebookPageLink}>Page Link</a>
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="px-5 py-4">
                       <div className="text-gray-900 font-medium truncate max-w-[200px]" title={lead.businessType}>{lead.businessType || '-'}</div>
                       <div className="text-xs text-gray-500 mt-1 space-y-1">
                         {lead.businessDuration && <div className="flex items-center"><Clock className="w-3 h-3 mr-1 flex-shrink-0" />{lead.businessDuration}</div>}
                         {lead.averageProductPrice && <div className="flex items-center"><DollarSign className="w-3 h-3 mr-1 flex-shrink-0" />{lead.averageProductPrice}</div>}
                         {lead.dailyMarketingBudget && <div className="flex items-center"><Target className="w-3 h-3 mr-1 flex-shrink-0" />Budget: {lead.dailyMarketingBudget}</div>}
                       </div>
                    </td>
                    <td className="px-5 py-4">
                       <div className="text-red-700 text-xs font-medium space-y-1 max-w-[200px]">
                         <div className="flex items-start" title={lead.currentProblems}>
                           <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0 mt-0.5" />
                           <span className="line-clamp-2">{lead.currentProblems || '-'}</span>
                         </div>
                       </div>
                       <div className="text-green-700 text-xs font-medium mt-2 space-y-1 max-w-[200px]">
                         <div className="flex items-start" title={lead.mainGoal}>
                           <Target className="w-3.5 h-3.5 mr-1 flex-shrink-0 mt-0.5" />
                           <span className="line-clamp-2">{lead.mainGoal || '-'}</span>
                         </div>
                         <div className="flex items-center pt-1" title={lead.websiteStatus}>
                           <Globe className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                           <span className={lead.websiteStatus.toLowerCase().includes('yes') || lead.websiteStatus.toLowerCase().includes('হ্যাঁ') ? 'text-green-600' : 'text-amber-600'}>
                             Web: {lead.websiteStatus || 'জানা নেই'}
                           </span>
                         </div>
                       </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium align-middle">
                       <div className="flex justify-end space-x-2">
                         <button onClick={() => openEditModal(lead)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors">
                           <Edit2 size={16} />
                         </button>
                         <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors">
                           <Trash2 size={16} />
                         </button>
                       </div>
                       {lead.notes && (
                         <div className="mt-2 flex justify-end">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800" title={lead.notes}>
                              <FileText className="w-3 h-3 mr-1" />
                              নোট আছে
                            </span>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLead ? 'লিড এডিট করুন' : 'নতুন লিড যোগ করুন'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editingLead && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                ইমেইল থেকে প্রাপ্ত টেক্সট পেস্ট করুন (Auto-fill)
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="এখানে লিডের সম্পূর্ণ ডিটেইলস পেস্ট করুন..."
                  className="w-full text-sm p-3 border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={parseRawText}
                  disabled={isParsing || !rawText.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {isParsing ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  Parse
                </button>
              </div>
              <p className="text-xs text-indigo-600 mt-2">
                * Parse বাটনে ক্লিক করলে নিচের ঘরগুলো স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে।
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-full">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">প্রাথমিক তথ্য</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্টের নাম</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><UserIcon size={16} /></div>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="ক্লায়েন্টের নাম" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conversation ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MessageSquare size={16} /></div>
                <input type="text" value={formData.conversationId} onChange={e => setFormData({...formData, conversationId: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. #48100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                <input required type="text" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="01XXXXXXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page Link</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Facebook size={16} /></div>
                <input type="text" value={formData.facebookPageLink} onChange={e => setFormData({...formData, facebookPageLink: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="https://facebook.com/..." />
              </div>
            </div>

            <div className="col-span-full mt-2">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">ব্যবসার তথ্য</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business/Product Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Briefcase size={16} /></div>
                <input type="text" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Clothing, Real Estate" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Duration</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Clock size={16} /></div>
                <input type="text" value={formData.businessDuration} onChange={e => setFormData({...formData, businessDuration: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 1 year" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average Product Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={16} /></div>
                <input type="text" value={formData.averageProductPrice} onChange={e => setFormData({...formData, averageProductPrice: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Variable, 500-1000 TK" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Marketing Budget</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={16} /></div>
                <input type="text" value={formData.dailyMarketingBudget} onChange={e => setFormData({...formData, dailyMarketingBudget: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 6-7 USD" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">বর্তমান সমস্যা (Current Problem)</label>
              <input type="text" value={formData.currentProblems} onChange={e => setFormData({...formData, currentProblems: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. No sales, no messages" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Website আছে কি না?</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Globe size={16} /></div>
                <input type="text" value={formData.websiteStatus} onChange={e => setFormData({...formData, websiteStatus: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Yes / No" />
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Goal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Target size={16} /></div>
                <input type="text" value={formData.mainGoal} onChange={e => setFormData({...formData, mainGoal: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Brand building and healthy sales" />
              </div>
            </div>

            <div className="col-span-full mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-1 text-gray-400" />
                অন্যান্য তথ্য (Notes)
              </label>
              <textarea 
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-y" 
                placeholder="অতিরিক্ত তথ্য বা পয়েন্ট এখানে লিখবেন..." 
              />
            </div>

          </div>

          <div className="pt-4 border-t mt-6 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center">
              <Plus size={18} className="mr-2" />
              {editingLead ? 'আপডেট করুন' : 'লিড সেভ করুন'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

