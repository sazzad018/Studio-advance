import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { FileText, Plus, Trash2, Printer, Download, Save, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export default function InvoiceSystem() {
  const { clients, addInvoice, invoices, deleteInvoice } = useData();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Math.floor(Math.random() * 10000)}`);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 }
  ]);
  
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem('invoiceLogo') || '');
  const [notes, setNotes] = useState<string>('পেমেন্ট ক্লিয়ার করতে হবে। ভিডিও হ্যান্ডওভার করার পর ওই ভিডিওতে অন্য কোন কারেকশন করা যাবে না।');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  const SUGGESTIONS = [
    "Facebook Marketing Services - Ad Campaign Management, Audience Targeting & Optimization",
    "Website Development - Complete Setup including Domain, Hosting, Meta Pixel & Server-Side Tracking",
    "Video Marketing & Editing - Promotional Video Creation, Optimization & Advertising",
    "Search Engine Optimization (SEO) - On-Page, Off-Page, Technical SEO & Content Strategy",
    "Social Media Management - Content Creation, Posting & Community Engagement",
    "Online Course Enrollment - Premium Access to Course Materials & Direct Support",
    "Digital Product - Premium PDF E-Book / Educational Guide",
    "Digital Assets Sales - Software License, Tools & Configurations",
    "Graphic Design - Logo Design, Brand Identity & Social Media Banners"
  ];

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedProject = selectedClient?.projects.find(p => p.id === selectedProjectId);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem('invoiceLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;

  const handlePrint = () => {
    window.print();
  };

  const handlePrintInvoice = (inv: any) => {
    handleViewInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleViewInvoice = (inv: any) => {
    setSelectedClientId(inv.clientId);
    setSelectedProjectId(inv.projectId || '');
    setInvoiceNumber(inv.invoiceNumber);
    setInvoiceDate(inv.date);
    setDueDate(inv.dueDate || '');
    setItems(inv.items || []);
    setTaxRate(inv.taxRate || 0);
    setDiscount(inv.discount || 0);
    if (inv.notes !== undefined) {
      setNotes(inv.notes);
    }
    setActiveTab('create');
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = (inv: any) => {
    setIsDownloading(true);
    setMessage({ text: 'পিডিএফ তৈরি হচ্ছে... (ডাউনলোড না হলে অ্যাপটি নতুন ট্যাবে ওপেন করুন)', type: 'success' });
    
    handleViewInvoice(inv);
    
    // Wait for the DOM to update with the new invoice data
    setTimeout(() => {
      const element = document.getElementById('invoice-preview');
      if (!element) {
        setIsDownloading(false);
        setMessage({ text: 'পিডিএফ তৈরি করতে সমস্যা হয়েছে।', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      
      const opt: any = {
        margin:       10,
        filename:     `Invoice_${inv.invoiceNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          onclone: (clonedDoc: Document) => {
            const textareas = clonedDoc.querySelectorAll('textarea');
            textareas.forEach(ta => {
              const div = clonedDoc.createElement('div');
              div.className = ta.className;
              div.style.cssText = ta.style.cssText;
              div.style.whiteSpace = 'pre-wrap';
              div.style.wordBreak = 'break-word';
              div.textContent = ta.value;
              ta.parentNode?.replaceChild(div, ta);
            });
            const inputs = clonedDoc.querySelectorAll('input');
            inputs.forEach(input => {
              if (input.type === 'text' || input.type === 'number') {
                const div = clonedDoc.createElement('div');
                div.className = input.className;
                div.style.cssText = input.style.cssText;
                div.textContent = input.value;
                input.parentNode?.replaceChild(div, input);
              }
            });
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      try {
        // @ts-ignore
        const generatePDF = typeof html2pdf === 'function' ? html2pdf : html2pdf.default || window.html2pdf;
        
        if (!generatePDF) {
          throw new Error("html2pdf library not found");
        }
        
        generatePDF().set(opt).from(element).save().then(() => {
          setIsDownloading(false);
          setTimeout(() => setMessage(null), 4000);
        }).catch((err: any) => {
          throw err;
        });
      } catch (error) {
        console.error("PDF generation error:", error);
        setIsDownloading(false);
        setMessage({ text: 'ডাউনলোড ব্লক করা হয়েছে। দয়া করে অ্যাপটি নতুন ট্যাবে ওপেন করে আবার চেষ্টা করুন।', type: 'error' });
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      }
    }, 1500);
  };

  const handleDeleteInvoice = async (id: string) => {
    setInvoiceToDelete(id);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      await deleteInvoice(invoiceToDelete);
      setInvoiceToDelete(null);
    }
  };

  const handleSaveInvoice = async () => {
    if (!selectedClientId) {
      setMessage({ text: 'অনুগ্রহ করে একজন ক্লায়েন্ট নির্বাচন করুন', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      await addInvoice({
        clientId: selectedClientId,
        projectId: selectedProjectId,
        invoiceNumber,
        date: invoiceDate,
        dueDate,
        items,
        subtotal,
        taxRate,
        discount,
        total,
        status: 'Unpaid',
        notes
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Reset for next invoice
      setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000)}`);
    } catch (error) {
      console.error('Failed to save invoice', error);
      setMessage({ text: 'ইনভয়েস সেভ করতে সমস্যা হয়েছে', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}
      
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ইনভয়েস মুছুন</h3>
            <p className="text-gray-600 mb-6">আপনি কি নিশ্চিত যে এই ইনভয়েসটি মুছে ফেলতে চান? এই কাজটি বাতিল করা যাবে না।</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                বাতিল
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 text-indigo-600" />
          ইনভয়েস জেনারেটর
        </h1>
        
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            নতুন ইনভয়েস
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            সংরক্ষিত ইনভয়েস ({invoices.length})
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">সংরক্ষিত ইনভয়েস তালিকা</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">ইনভয়েস নম্বর</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">ক্লায়েন্ট</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">তারিখ</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">মোট (৳)</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">স্ট্যাটাস</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      কোনো ইনভয়েস সংরক্ষিত নেই
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const client = clients.find(c => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 font-medium text-gray-900">#{inv.invoiceNumber}</td>
                        <td className="py-3 px-6 text-gray-600">{client?.name || 'অজানা ক্লায়েন্ট'}</td>
                        <td className="py-3 px-6 text-gray-600">{new Date(inv.date).toLocaleDateString('bn-BD')}</td>
                        <td className="py-3 px-6 font-medium text-gray-900">{inv.total.toLocaleString('bn-BD')}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                            inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewInvoice(inv)}
                              title="বিস্তারিত দেখুন"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => handlePrintInvoice(inv)}
                              title="প্রিন্ট / সেভ অ্যাজ পিডিএফ"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Printer size={18} />
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(inv)}
                              disabled={isDownloading}
                              title="সরাসরি ডাউনলোড"
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Download size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteInvoice(inv.id)}
                              title="ইনভয়েস মুছুন"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel (Hidden when printing) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden lg:col-span-1 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">ইনভয়েস সেটিংস</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveInvoice}
                  disabled={isSaving || !selectedClientId}
                  className={`px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    saveSuccess 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {saveSuccess ? (
                    <><CheckCircle size={16} className="mr-1" /> সেভ হয়েছে</>
                  ) : (
                    <><Save size={16} className="mr-1" /> {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</>
                  )}
                </button>
                <button 
                  onClick={handlePrint}
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Printer size={16} className="mr-1" /> প্রিন্ট / সেভ পিডিএফ
                </button>
              </div>
            </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্ট নির্বাচন করুন</label>
              <select 
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedProjectId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">ক্লায়েন্ট নির্বাচন করুন</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট নির্বাচন করুন (ঐচ্ছিক)</label>
                <select 
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">প্রজেক্ট নির্বাচন করুন</option>
                  {selectedClient.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইনভয়েস নম্বর</label>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ (Due Date)</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভ্যাট/ট্যাক্স (%)</label>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ডিসকাউন্ট (৳)</label>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">কোম্পানির লোগো</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              {logoUrl && (
                <button 
                  onClick={() => {
                    setLogoUrl('');
                    localStorage.removeItem('invoiceLogo');
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  লোগো মুছুন
                </button>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">কোম্পানির নোট (শর্তাবলী)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="ইনভয়েসের নিচে প্রদর্শিত নোট..."
              />
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#f3f4f6] p-8 lg:col-span-2 print:col-span-3 print:shadow-none print:border-none print:p-0" id="invoice-preview">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#e5e7eb] pb-6 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#111827]">INVOICE</h2>
              <p className="text-[#6b7280] mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-12 object-contain ml-auto mb-2" />
              ) : (
                <h3 className="font-bold text-[#111827] text-xl">স্টুডিও প্রো</h3>
              )}
              <p className="text-[#4b5563] text-sm mt-1">১২৩ স্টুডিও রোড, ঢাকা</p>
              <p className="text-[#4b5563] text-sm">contact@studiopro.com</p>
              <p className="text-[#4b5563] text-sm">+880 1234 567890</p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-[#6b7280] font-medium mb-1">প্রাপক:</p>
              {selectedClient ? (
                <>
                  <p className="font-bold text-[#111827]">{selectedClient.name}</p>
                  <p className="text-[#4b5563]">{selectedClient.company}</p>
                  {selectedClient.email && <p className="text-[#4b5563] text-sm">{selectedClient.email}</p>}
                  {selectedClient.phone && <p className="text-[#4b5563] text-sm">{selectedClient.phone}</p>}
                </>
              ) : (
                <p className="text-[#9ca3af] italic">ক্লায়েন্ট নির্বাচন করুন</p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm text-[#6b7280] font-medium inline-block mr-2">তারিখ:</p>
                <p className="font-medium text-[#111827] inline-block">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('bn-BD') : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[#6b7280] font-medium inline-block mr-2">মেয়াদ:</p>
                <p className="font-medium text-[#111827] inline-block">{dueDate ? new Date(dueDate).toLocaleDateString('bn-BD') : '-'}</p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          {selectedProject && (
            <div className="mb-6 bg-[#f9fafb] p-4 rounded-lg">
              <p className="text-sm text-[#6b7280] font-medium mb-1">প্রজেক্ট:</p>
              <p className="font-bold text-[#111827]">{selectedProject.title}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#e5e7eb]">
                  <th className="py-3 text-sm font-semibold text-[#374151]">বিবরণ</th>
                  <th className="py-3 text-sm font-semibold text-[#374151] text-center w-24">পরিমাণ</th>
                  <th className="py-3 text-sm font-semibold text-[#374151] text-right w-32">রেট (৳)</th>
                  <th className="py-3 text-sm font-semibold text-[#374151] text-right w-32">মোট (৳)</th>
                  <th className="py-3 w-10 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-[#f3f4f6] align-top">
                    <td className="py-3 pr-4 relative">
                      <textarea 
                        value={item.description}
                        onChange={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                          handleItemChange(item.id, 'description', e.target.value);
                        }}
                        onFocus={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                          setFocusedItemId(item.id);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setFocusedItemId(current => current === item.id ? null : current);
                          }, 200);
                        }}
                        placeholder="কাজের বিবরণ..."
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-200 rounded-md p-1 -ml-1 text-[#111827] resize-none overflow-hidden"
                        rows={1}
                        style={{ minHeight: '24px' }}
                      />
                      {focusedItemId === item.id && (
                        <div className="absolute top-full left-0 min-w-[300px] sm:w-[450px] bg-white border border-gray-200 shadow-xl rounded-md mt-1 z-50 max-h-64 overflow-y-auto print:hidden">
                          <div className="sticky top-0 p-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100 flex justify-between items-center shadow-sm">
                            <span>প্রস্তাবিত বিবরণ নির্বাচন করুন</span>
                            <span className="text-gray-400 font-normal italic">অথবা নিজে লিখুন</span>
                          </div>
                          {SUGGESTIONS.filter(s => s.toLowerCase().includes((item.description || '').toLowerCase())).length > 0 ? (
                            SUGGESTIONS.filter(s => s.toLowerCase().includes((item.description || '').toLowerCase())).map((suggestion, idx) => (
                              <button
                                key={idx}
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition border-b border-gray-50 last:border-0 leading-tight"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleItemChange(item.id, 'description', suggestion);
                                  setFocusedItemId(null);
                                }}
                              >
                                {suggestion}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-sm text-center text-gray-500">
                              কোনো সাজেশন পাওয়া যায়নি
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-center text-[#111827]"
                        min="1"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <input 
                        type="number" 
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-[#111827]"
                        min="0"
                      />
                    </td>
                    <td className="py-3 text-right font-medium text-[#111827]">
                      {(item.quantity * item.rate).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 text-right print:hidden">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[#f87171] hover:text-[#dc2626]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button 
              onClick={handleAddItem}
              className="mt-4 text-sm text-[#4f46e5] font-medium flex items-center hover:text-[#3730a3] print:hidden"
            >
              <Plus size={16} className="mr-1" /> নতুন আইটেম যোগ করুন
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-[#4b5563]">
                <span>সাবটোটাল:</span>
                <span>৳ {subtotal.toLocaleString('bn-BD')}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-[#4b5563]">
                  <span>ভ্যাট/ট্যাক্স ({taxRate}%):</span>
                  <span>৳ {taxAmount.toLocaleString('bn-BD')}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-[#4b5563]">
                  <span>ডিসকাউন্ট:</span>
                  <span className="text-[#dc2626]">- ৳ {discount.toLocaleString('bn-BD')}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-[#111827] border-t border-[#e5e7eb] pt-3">
                <span>সর্বমোট:</span>
                <span>৳ {total.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mt-12 text-[#4b5563] text-sm whitespace-pre-wrap">
              <span className="font-semibold text-[#111827] block mb-1">নোট ও শর্তাবলী:</span>
              <p>{notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-[#e5e7eb] text-center text-[#6b7280] text-sm">
            <p>আমাদের সাথে কাজ করার জন্য ধন্যবাদ!</p>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}
