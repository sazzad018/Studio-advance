import React, { useState } from 'react';
import { FileText, Printer, Save, Upload, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function TermsConditions() {
  const defaultTerms = `📄 Content Production Agreement
(Video, TVC, OVC, Photo & Full Production Services)

🏢 আমাদের সম্পর্কে
আমরা একটি প্রফেশনাল কনটেন্ট প্রোডাকশন স্টুডিও, যেখানে আমরা—
Facebook Ads ভিডিও কনটেন্ট
OVC (Online Video Commercial)
TVC (Television Commercial)
প্রফেশনাল ফটোশুট
ডকুমেন্টারি ভিডিও
এবং সকল ধরনের মিডিয়া প্রোডাকশন সার্ভিস প্রদান করি

📌 ১. পেমেন্ট শর্তাবলী
সকল প্রজেক্ট শুরু করার আগে ৫০% এডভান্স পেমেন্ট আবশ্যক
বাকি পেমেন্ট ক্লায়েন্টকে ড্রাফ্ট ভিডিও দেখানোর পর কনফার্ম করলে প্রদান করতে হবে
সম্পূর্ণ পেমেন্ট সম্পন্ন হলে আমরা Final Drive Link প্রদান করব
Drive Link পাওয়ার পর ৭ দিনের মধ্যে ফাইল ডাউনলোড করতে হবে
নির্ধারিত সময়ের পর ফাইল না পেলে স্টুডিও দায়ী থাকবে না

📌 ২. কাজের সময়সীমা
সাধারণ ভিডিও প্রজেক্ট: ৫ কার্যদিবস
বড় প্রজেক্ট (TVC / Documentary / Campaign): প্রজেক্ট অনুযায়ী সময় নির্ধারিত হবে
জরুরি কাজের ক্ষেত্রে অতিরিক্ত চার্জ প্রযোজ্য

📌 ৩. স্ক্রিপ্ট রাইটিং শর্তাবলী
প্রতিটি ভিডিওর জন্য ৩টি স্ক্রিপ্ট আইডিয়া প্রদান করা হবে
ক্লায়েন্ট একটি নির্বাচন করবে
নির্বাচিত স্ক্রিপ্টে ১–২ বার ফ্রি রিভিশন
সম্পূর্ণ নতুন কনসেপ্ট চাইলে অতিরিক্ত চার্জ প্রযোজ্য
স্ক্রিপ্ট অনুমোদনের পর বড় পরিবর্তন গ্রহণযোগ্য নয়
২–৩ দিনের মধ্যে ফিডব্যাক না দিলে প্রজেক্ট ডিলে হতে পারে

📌 ৪. মডেল ও প্রোডাকশন চার্জ
প্রজেক্ট, লোকেশন, মডেল ও প্রোডাকশন লেভেল অনুযায়ী চার্জ পরিবর্তন হয়
আমাদের সার্ভিস সাধারণত ৩,০০০ টাকা থেকে শুরু
প্রিমিয়াম মডেল ও হাই-এন্ড প্রোডাকশনের ক্ষেত্রে চার্জ বৃদ্ধি পাবে

📌 ৫. রিভিশন পলিসি
ভিডিও/ফটোতে ১–২ বার ফ্রি রিভিশন
অতিরিক্ত পরিবর্তনের জন্য চার্জ প্রযোজ্য

📌 ৬. ক্লায়েন্ট রেসপন্স ও ডিলে
ক্লায়েন্ট সময়মতো ফিডব্যাক না দিলে প্রজেক্ট ডেলিভারি দেরি হতে পারে
এই ক্ষেত্রে স্টুডিও দায়ী থাকবে না

📌 ৭. ব্রিফ পরিবর্তন
কাজ শুরু হওয়ার পর কনসেপ্ট/ব্রিফ পরিবর্তন করলে নতুন প্রজেক্ট হিসেবে গণ্য হবে
অতিরিক্ত চার্জ প্রযোজ্য

📌 ৮. কপিরাইট ও ব্যবহার অধিকার
সম্পূর্ণ পেমেন্টের পর ক্লায়েন্ট কনটেন্ট ব্যবহারের পূর্ণ অধিকার পাবে
স্টুডিও নিজস্ব পোর্টফোলিও/মার্কেটিংয়ে কনটেন্ট ব্যবহার করতে পারবে

📌 ৯. Raw File পলিসি
Raw footage / project file সাধারণত প্রদান করা হয় না
প্রয়োজন হলে অতিরিক্ত চার্জে প্রদান করা যেতে পারে

📌 ১০. শুটিং ঝুঁকি
আবহাওয়া, লোকেশন বা টেকনিক্যাল সমস্যার কারণে শুটিং রিশিডিউল হতে পারে
এতে সময়সীমা পরিবর্তন হতে পারে

📌 ১১. ক্লায়েন্ট প্রদত্ত তথ্য
ক্লায়েন্ট যদি ভুল বা অসম্পূর্ণ তথ্য প্রদান করে, তার দায় ক্লায়েন্টের
এর ফলে সমস্যা হলে স্টুডিও দায়ী থাকবে না

📌 ১২. Cancellation Policy
কাজ শুরু হওয়ার পর প্রজেক্ট বাতিল করলে এডভান্স ফেরতযোগ্য নয়
আংশিক কাজ অনুযায়ী চার্জ কাটা হবে

📌 ১৩. ডেলিভারি শর্ত
সম্পূর্ণ পেমেন্টের পরই ফাইনাল ডেলিভারি প্রদান করা হবে
Google Drive Link এর মাধ্যমে ফাইল দেওয়া হবে

📞 Contact & Company Details
📍 Location: চন্দ্রিমা মডেল টাউন, বাংলাদেশ
📱 WhatsApp: +880 1928-061999
📍 Google Map: https://maps.app.goo.gl/Q3yUAbYWZ62eextYA
🌐 Website: https://socialads.studio/
👥 Facebook Community: https://www.facebook.com/groups/1278886840973847
🎬 Demo Work: আমাদের কাজের ডেমো দেখতে ওয়েবসাইট ভিজিট করুন

✅ Agreement
এই শর্তাবলী অনুযায়ী কাজ শুরু করার মাধ্যমে ক্লায়েন্ট সকল শর্তে সম্মত হয়েছেন বলে গণ্য হবে।

Prepared by:
Social Ads Studio
(Content Production & Marketing Team)`;

  const [terms, setTerms] = useState<string>(() => localStorage.getItem('companyTerms') || defaultTerms);
  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem('companyTermsLogo') || '');
  const [companyName, setCompanyName] = useState<string>(() => localStorage.getItem('companyTermsName') || 'Social Ads Studio');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem('companyTermsLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('companyTerms', terms);
    localStorage.setItem('companyTermsName', companyName);
    setIsEditing(false);
    setMessage({ text: 'কোম্পানির শর্তাবলী সফলভাবে সেভ করা হয়েছে', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-indigo-600" />
          কোম্পানি কন্ডিশন
        </h1>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-emerald-700 transition-colors"
            >
              <Save size={20} className="mr-2" /> সেভ করুন
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
            >
              <FileText size={20} className="mr-2" /> এডিট করুন
            </button>
          )}
          <button
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-900 transition-colors"
          >
            <Printer size={20} className="mr-2" /> প্রিন্ট করুন
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:p-0 print:border-none print:shadow-none max-w-4xl mx-auto">
        {/* Header / Logo section */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6 print:border-b-2">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              {logoUrl ? (
                <div className="relative inline-block w-32 h-20 flex items-center justify-center">
                  <img src={logoUrl} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  <button
                    onClick={() => {
                      setLogoUrl('');
                      localStorage.removeItem('companyTermsLogo');
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="লোগো মুছুন"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="print:hidden w-32">
                  <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg h-20 flex items-center justify-center text-xs text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors px-2 text-center">
                    <span className="flex flex-col items-center">
                      <Upload size={16} className="mb-1" />
                      লোগো আপলোড
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="pt-2">
              {isEditing ? (
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="কোম্পানির নাম লিখুন"
                  className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-300 focus:border-indigo-600 outline-none w-64 bg-transparent pb-1"
                />
              ) : (
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{companyName}</h1>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>

        {/* Content area */}
        <div className="prose max-w-none prose-indigo prose-sm sm:prose-base">
          {isEditing ? (
            <textarea
              value={terms}
              onChange={(e) => {
                setTerms(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              className="w-full min-h-[600px] p-4 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 bg-indigo-50/30 font-sans leading-relaxed resize-none overflow-hidden"
              placeholder="এখানে কোম্পানির শর্তাবলী লিখুন..."
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
              {terms}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm hidden print:block">
           <p>This is a computer generated document. No signature is required.</p>
        </div>
      </div>
    </div>
  );
}
