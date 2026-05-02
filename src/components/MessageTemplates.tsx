import React, { useState, useEffect } from 'react';
import { Send, Plus, Edit2, Trash2, Search, Filter, Phone, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { ClientProfile } from './AllClients';

export interface MessageTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
}

const defaultTemplates: MessageTemplate[] = [
  // 1. Payment Details
  {
    id: 't1',
    category: 'Payment',
    title: 'পেমেন্ট ডিটেইলস (বিকাশ/নগদ)',
    content: `অ্যাড রান করার জন্য পেমেন্ট ডিটেইলস:

বিকাশ (পার্সোনাল): 017XXXXXX
নগদ (পার্সোনাল): 017XXXXXX
রকেট: 017XXXXXX

পেমেন্ট করার পর দয়া করে লাস্ট ৪ ডিজিট অথবা স্ক্রিনশট শেয়ার করুন। ধন্যবাদ!`
  },
  {
    id: 't2',
    category: 'Payment',
    title: 'ব্যাংক অ্যাকাউন্ট ডিটেইলস',
    content: `আমাদের ব্যাংক অ্যাকাউন্ট ডিটেইলস:

Account Name: Studio Pro Agency
Account No: XXXXXXXX
Bank Name: XXX Bank Ltd
Branch: XXX Branch
Routing No: XXXXXX

পেমেন্ট এর স্লিপ/স্ক্রিনশট অবশ্যই শেয়ার করবেন।`
  },
  {
    id: 't3',
    category: 'Onboarding',
    title: 'ওয়েবসাইট ইনফরমেশন দিন',
    content: `হ্যালো স্যার/ম্যাম,

যেহেতু আমরা আপনার জন্য কাজ শুরু করতে যাচ্ছি, দয়া করে আপনার ওয়েবসাইটের এডমিন এক্সেস (ইউজারনেম এবং পাসওয়ার্ড) অথবা প্রয়োজনীয় ডিটেইলস শেয়ার করুন যাতে আমরা সেটআপ শুরু করতে পারি।

ধন্যবাদ!
- Studio Pro Team`
  },
  {
    id: 't4',
    category: 'Onboarding',
    title: 'ফেসবুক পেজ এক্সেস দিন',
    content: `হ্যালো স্যার/ম্যাম,
আপনার পেজে কাজ শুরু করার জন্য আমাদের পেজ এক্সেস এবং এড একাউন্ট এক্সেস প্রয়োজন।

দয়া করে Business Manager থেকে 'এসাইন পার্টনার' অপশনে আমাদের পার্টনার আইডি (ID: XXXXXXX) দিন।
অথবা পেজের সেটিংস থেকে আমাদের ইমেইল (admin@email.com) এ এডমিন/এডিটর রিকোয়েস্ট পাঠান।

বুঝতে সমস্যা হলে জানাবেন, আমি স্ক্রিনরেকর্ড দিয়ে দিচ্ছি।`
  },
  {
    id: 't5',
    category: 'Project Update',
    title: 'কাজ শুরু হয়েছে',
    content: `হ্যালো,
আপনার বিজ্ঞাপন/ক্যাম্পেইনের সেটআপ এর কাজ ইতোমধ্যে শুরু হয়ে গিয়েছে। ড্রাফট রেডি হলে আপনাকে চেক করার জন্য পাঠানো হবে।

যেকোনো প্রয়োজনে আমাদের নক করতে পারেন। ধন্যবাদ!`
  },
  {
    id: 't6',
    category: 'Project Update',
    title: 'কাজ কমপ্লিট (ক্যাম্পেইন লাইভ)',
    content: `হ্যালো স্যার/ম্যাম,
আপনার ফেসবুক অ্যাড ক্যাম্পেইন সফলভাবে চালু (Live) করা হয়েছে। কিছুক্ষণ পর থেকে রেজাল্ট আসতে শুরু করবে। 

আপডেট জানতে অথবা যেকোনো পরিবর্তনের প্রয়োজন হলে আমাদের জানাবেন। ধন্যবাদ!`
  },
  {
    id: 't7',
    category: 'Reminder',
    title: 'বিজ্ঞাপনের মেয়াদ শেষ হতে যাচ্ছে',
    content: `হ্যালো স্যার,
আপনার বর্তমান অ্যাড ক্যাম্পেইনের মেয়াদ আগামী কাল শেষ হতে যাচ্ছে। 

আপনি কি একই ক্যাম্পেইনটি আবার কন্টিনিউ করতে চান? দয়া করে কনফার্ম করলে আমরা বাজেট আপডেট করে দিব। ধন্যবাদ!`
  },
  {
    id: 't8',
    category: 'Reminder',
    title: 'পেমেন্ট রিমাইন্ডার',
    content: `হ্যালো স্যার/ম্যাম,
আশা করি ভালো আছেন। আপনার বর্তমান ইনভয়েস এর পেমেন্ট ডিউ আছে। দয়া করে আজ-কালের মধ্যে পেমেন্টটি ক্লিয়ার করার জন্য অনুরোধ করা হলো। 

বিকাশ (পার্সোনাল): 017XXXXXX

পেমেন্ট করে একটু জানাবেন। ধন্যবাদ!`
  },
  {
    id: 't9',
    category: 'Follow-up',
    title: 'নতুন লিড ফলো-আপ (সার্ভিস সম্পর্কিত)',
    content: `হ্যালো স্যার, 
আপনি আমাদের ডিজিটাল মার্কেটিং/ওয়েবসাইট সার্ভিস সম্পর্কিত একটি ম্যাসেজ দিয়েছিলেন। 

আমরা কীভাবে আপনার ব্যবসাকে গ্রো করতে সাহায্য করতে পারি, সেটি নিয়ে একটি ফ্রি কনসালটেশন এর জন্য কখন কল দিতে পারি?`
  },
  {
    id: 't10',
    category: 'Follow-up',
    title: 'অ্যাড রেজাল্ট ফলো-আপ',
    content: `হ্যালো স্যার,
আপনার বর্তমান ক্যাম্পেইন এর রেজাল্ট কেমন পাচ্ছেন? মেসেজ বা সেলস এর পরিমাণ কি আশানুরূপ?

কোনো পরিবর্তনের প্রয়োজন হলে অথবা অপ্টিমাইজেশন করতে চাইলে জানাবেন। আমরা চেক করে দেখছি।`
  },
  {
    id: 't11',
    category: 'Reporting',
    title: 'সাপ্তাহিক রিপোর্ট',
    content: `হ্যালো স্যার/ম্যাম,
আপনার গত ১ সপ্তাহের ক্যাম্পেইন রিপোর্ট নিচে দেওয়া হলো:

• মোট মেসেজ/লিড: 
• মোট খরচ: $
• কস্ট পার মেসেজ/রেজাল্ট: $

রিপোর্টটি চেক করে আপনার মতামত জানাবেন। ধন্যবাদ!`
  },
  {
    id: 't12',
    category: 'Review Request',
    title: 'রিভিউ দিন',
    content: `হ্যালো স্যার,
আমাদের সাথে কাজ করার অভিজ্ঞতা কেমন ছিল তা জানিয়ে যদি আমাদের ফেসবুক পেজে একটি ছোট রিভিউ দিতেন, খুব ভালো হতো!

রিভিউ লিংক: (আপনার পেজ লিংক)
আপনার একটি ভালো ফিডব্যাক আমাদের অনেক অনুপ্রেরণা দেয়। ধন্যবাদ!`
  },
  {
    id: 't13',
    category: 'Greetings',
    title: 'ওয়েলকাম মেসেজ (নতুন ক্লায়েন্ট)',
    content: `হ্যালো! Studio Pro Agency-তে আপনাকে স্বাগতম।
আমরা ডিজিটাল মার্কেটিং, ওয়েবসাইট ডেভেলপমেন্ট, এবং ব্র্যান্ডিং সার্ভিস দিয়ে থাকি।

আপনার ব্যবসার জন্য কোন ধরনের সার্ভিস চাচ্ছেন? দয়া করে বিস্তারিত জানালে আমরা সাহায্য করতে পারবো।`
  },
  {
    id: 't14',
    category: 'Technical Support',
    title: 'ওয়েবসাইট মেইনটেন্যান্স/ডাউন',
    content: `হ্যালো স্যার,
আপনার ওয়েবসাইটটিতে কিছু টেকনিক্যাল আপডেটের কাজ চলছে, তাই আপাতত কিছুক্ষণের জন্য ডাউন থাকতে পারে। কাজ শেষ হতেই আমরা আপনাকে জানাচ্ছি।

সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।`
  },
  {
    id: 't15',
    category: 'Onboarding',
    title: 'মিটিং ইনভাইটেশন',
    content: `হ্যালো স্যার,
আপনার প্রজেক্টটি নিয়ে বিস্তারিত আলোচনার জন্য আমরা একটি জুম/গুগল মিট মিটিং ফিক্স করতে চাচ্ছি। 
আজ অথবা আগামীকাল কখন আপনার জন্য সুবিধা হবে? 

দয়া করে সময়টি জানালে আমরা মিটিং লিংক শেয়ার করবো।`
  },
  {
    id: 't16',
    category: 'Problem Issue',
    title: 'অ্যাড একাউন্ট রেসট্রিক্টেড',
    content: `হ্যালো স্যার,
দুঃখের সাথে জানাচ্ছি যে, ফেসবুকের পলিসি ইস্যুর কারণে আপনার অ্যাড একাউন্টটি সাময়িকভাবে ডিজেবল/রেসট্রিক্ট হয়েছে। 

আমরা ইতোমধ্যে আপিল সাবমিট করেছি। আশা করি খুব দ্রুতই সলভ হয়ে যাবে। দয়া করে একটু সময় দিয়ে সহযোগিতা করুন।`
  },
  {
    id: 't17',
    category: 'Project Update',
    title: 'ভিডিও/গ্রাফিক্স অ্যাপ্রুভাল',
    content: `হ্যালো স্যার,
আপনার প্রজেক্টের ডিজাইন/ভিডিও এর ড্রাফট রেডি করা হয়েছে। 

দয়া করে চেক করে কনফার্ম করুন অথবা কোনো পরিবর্তন লাগলে পয়েন্টগুলো লিস্ট আকারে জানান। ধন্যবাদ!`
  },
  {
    id: 't18',
    category: 'Greetings',
    title: 'ছুটির দিনের নোটিশ',
    content: `হ্যালো স্যার,
জানানো যাচ্ছে যে, আগামী (তারিখ) আমাদের অফিস সরকারি ছুটি/উৎসব উপলক্ষে বন্ধ থাকবে।

তবে যেকোনো জরুরি প্রয়োজনে আমাদের হটলাইনে মেসেজ দিয়ে রাখতে পারেন। অফিস খোলার পর দ্রুত সাপোর্ট দেওয়া হবে।`
  },
  {
    id: 't19',
    category: 'Follow-up',
    title: 'প্রপোজাল রিমাইন্ডার',
    content: `হ্যালো স্যার,
আমরা আপনার সাথে আলোচনার পর একটি প্রজেক্ট প্রপোজাল এবং কোটেশন মেইল/সেন্ড করেছিলাম। 

আপনি কি সেটি চেক করার সুযোগ পেয়েছিলেন? কোনো কনফিউশন থাকলে জানাতে পারেন।`
  },
  {
    id: 't20',
    category: 'Upsell',
    title: 'নতুন সার্ভিস অফার',
    content: `হ্যালো স্যার,
আশা করি ভালো আছেন। আপনার অ্যাডের পাশাপাশি যদি ওয়েবসাইট স্পিড অপ্টিমাইজেশন এবং এসইও (SEO) নিয়ে কাজ করা যায়, তাহলে সেলস আরও বাড়বে।

বর্তমানে আমাদের এসইও প্যাকেজে স্পেশাল অফার চলছে। বিস্তারিত জানতে আগ্রহী হলে টেক্সট দিন।`
  }
];

export default function MessageTemplates() {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem('studio_message_templates');
    return saved ? JSON.parse(saved) : defaultTemplates;
  });
  const [allClientsProfiles, setAllClientsProfiles] = useState<ClientProfile[]>(() => {
    const cp = localStorage.getItem('allClientsData');
    return cp ? JSON.parse(cp) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('studio_message_templates', JSON.stringify(templates));
  }, [templates]);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingTemplate(null);
    setFormData({ category: 'General', title: '', content: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({ category: template.category, title: template.title, content: template.content });
    setIsModalOpen(true);
  };

  const openSendModal = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsSendModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই টেমপ্লেট মুছে ফেলতে চান?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? { ...t, ...formData } : t
      ));
    } else {
      const newTemplate: MessageTemplate = {
        id: 't' + Date.now().toString(),
        ...formData
      };
      setTemplates([newTemplate, ...templates]);
    }
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">মেসেজ টেমপ্লেটস</h1>
          <p className="text-gray-500 mt-1">কুইক মেসেজ এবং পেমেন্ট ডিটেইলস সহজে ক্লায়েন্টকে পাঠান</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          রয়েছে নতুন টেমপ্লেট
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter size={18} className="text-gray-400" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="টেমপ্লেট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                  {template.category}
                </span>
                <h3 className="font-bold text-gray-900 leading-tight">{template.title}</h3>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <button onClick={() => openEditModal(template)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded bg-white border border-gray-200" title="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded bg-white border border-gray-200" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="p-4 flex-1 text-sm text-gray-700 whitespace-pre-wrap bg-white font-mono break-words">
              {template.content.length > 150 ? template.content.substring(0, 150) + '...' : template.content}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
              <button 
                onClick={() => copyToClipboard(template.content, template.id)}
                className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${copiedId === template.id ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {copiedId === template.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copiedId === template.id ? 'কপি হয়েছে' : 'কপি করুন'}
              </button>
              <button 
                onClick={() => openSendModal(template)}
                className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#128C7E] transition-colors"
                title="Send to Contact"
              >
                <Send size={16} /> সেন্ড
              </button>
            </div>
          </div>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            কোনো টেমপ্লেট পাওয়া যায়নি।
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTemplate ? 'টেমপ্লেট এডিট করুন' : 'নতুন টেমপ্লেট যোগ করুন'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <input required type="text" list="categories-list" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Payment, Reminder, Greeting..." />
            <datalist id="categories-list">
              {Array.from(new Set(templates.map(t => t.category))).map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">টাইটেল</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="টেমপ্লেটের টাইটেল" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মেসেজ কনটেন্ট</label>
            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={8} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm" placeholder="এখানে মেসেজ লিখুন..." />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50">বাতিল</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">সেভ করুন</button>
          </div>
        </form>
      </Modal>

      {/* Send Modal */}
      {isSendModalOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Send size={20} className="text-[#25D366]" /> সেন্ড করুন
              </h2>
              <button onClick={() => setIsSendModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-4 bg-gray-50 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto font-mono text-gray-700 border-b border-gray-200">
              {selectedTemplate.content}
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-3">ক্লায়েন্ট নির্বাচন করুন:</h3>
              <div className="space-y-2">
                {allClientsProfiles.length === 0 ? (
                   <p className="text-sm text-gray-500 py-4 text-center">কোন ক্লায়েন্ট পাওয়া যায়নি। প্রথমে "অল ক্লায়েন্ট" সেকশনে ক্লায়েন্ট যোগ করুন।</p>
                ) : (
                  allClientsProfiles.map(client => (
                    <div key={client.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-900">{client.businessName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {client.whatsappNumber || 'নাম্বার নেই'}
                        </p>
                      </div>
                      <a 
                        href={`https://wa.me/${client.whatsappNumber?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(selectedTemplate.content)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${client.whatsappNumber ? 'bg-[#25D366] text-white hover:bg-[#128C7E]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        onClick={(e) => { if(!client.whatsappNumber) e.preventDefault(); }}
                      >
                        <Send size={14} /> WhatsApp
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <a 
                 href={`https://web.whatsapp.com/send?text=${encodeURIComponent(selectedTemplate.content)}`}
                 target="_blank" 
                 rel="noreferrer"
                 className="w-full flex justify-center items-center gap-2 p-3 bg-white border-2 border-[#25D366] text-[#25D366] rounded-xl font-bold hover:bg-[#25D366] hover:text-white transition-colors"
                >
                 লিস্টে নাম্বার না থাকলে WhatsApp Web এ শেয়ার করুন
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
