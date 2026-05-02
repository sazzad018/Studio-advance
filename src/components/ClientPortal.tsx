import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Send, LayoutDashboard, Wallet, Receipt, CreditCard, Video, FileText, CheckCircle2, Clock, CalendarIcon, ExternalLink, MessageCircle } from 'lucide-react';

const ClientProjectCard: React.FC<{ project: any, clientName: string, clientId: string }> = ({ project, clientName, clientId }) => {
  const { updateProject } = useData();
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderName: clientName,
      content: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(project.messages || []), newMessage];

    updateProject(clientId, project.id, { messages: updatedMessages });
    setCommentText('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                project.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                project.status === 'Shooting' ? 'bg-indigo-100 text-indigo-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {project.status === 'Completed' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {project.status === 'Shooting' && <Video className="w-3 h-3 inline mr-1" />}
                {project.status === 'Planning' && <Clock className="w-3 h-3 inline mr-1" />}
                {project.status}
              </span>
              {project.priority === 'Urgent' && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
                  🔥 Urgent
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
              <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                <LayoutDashboard className="w-4 h-4 mr-2 text-gray-400" />
                {project.category}
              </span>
              {project.startDate && (
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                  শুরু: {new Date(project.startDate).toLocaleDateString('en-GB')}
                </span>
              )}
              {project.endDate && (
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-gray-400" />
                  শেষ: {new Date(project.endDate).toLocaleDateString('en-GB')}
                </span>
              )}
            </div>
          </div>
        </div>

        {project.thumbnailUrl && (
          <div className="mb-8 rounded-xl overflow-hidden border border-gray-100 h-64 md:h-80 relative group">
            <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Details Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              প্রজেক্ট ডিটেইলস
            </h4>
            <dl className="space-y-4 text-sm">
              {project.contentType && (
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <dt className="text-gray-500">কনটেন্ট টাইপ</dt>
                  <dd className="font-bold text-gray-900 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">{project.contentType}</dd>
                </div>
              )}
              {project.framework && (
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <dt className="text-gray-500">ফ্রেমওয়ার্ক</dt>
                  <dd className="font-bold text-gray-900">{project.framework}</dd>
                </div>
              )}
              {project.videoDuration && (
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <dt className="text-gray-500">ভিডিও ডিউরেশন</dt>
                  <dd className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">{project.videoDuration}</dd>
                </div>
              )}
            </dl>

            {project.formats && project.formats.length > 0 && (
              <div className="mt-5">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ভিডিও ফরম্যাট</h5>
                <div className="flex flex-wrap gap-2">
                  {project.formats.map((fmt: string) => (
                    <span key={fmt} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress & Links */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <Clock className="w-5 h-5 mr-2 text-emerald-500" />
              কাজের অগ্রগতি
            </h4>
            {project.contentLog && project.contentLog.length > 0 ? (
              <div className="space-y-4">
                {project.contentLog.map((log: string, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="mt-0.5 bg-emerald-100 p-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-gray-800 font-medium leading-relaxed">{log}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 italic">এখনও কাজের অগ্রগতি আপডেট করা হয়নি।</p>
              </div>
            )}
            
            {project.link && (
              <div className="mt-6 pt-5 border-t border-gray-200">
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 py-3 px-4 rounded-xl text-sm font-bold transition-colors">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  চূড়ান্ত প্রজেক্ট লিংক দেখুন
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Scripts Section */}
        <div className="pt-8 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 mb-5 flex items-center text-xl tracking-tight">
            <Video className="w-6 h-6 mr-3 text-purple-600 p-1 bg-purple-100 rounded-lg" />
            ভিডিও স্ক্রিপ্ট সমূহ
          </h4>
          
          {project.scripts && project.scripts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {project.scripts.map((script: any, index: number) => (
                <div key={script.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <h5 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                    <span className="bg-purple-100 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">
                      {index + 1}
                    </span>
                    {script.title || 'Untitled Script'}
                  </h5>
                  <div className="pl-9">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{script.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : project.script ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium pl-3">{project.script}</p>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-gray-500 font-medium">এখনও কোনো ভিডিও স্ক্রিপ্ট যোগ করা হয়নি।</p>
            </div>
          )}
        </div>

        {/* Chat / Comments Section */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl tracking-tight">
            <MessageCircle className="w-6 h-6 mr-3 text-blue-600 p-1 bg-blue-100 rounded-lg" />
            পরস্পর আলোচনা
          </h4>
          
          <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100">
            {/* Messages Area */}
            <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {project.messages && project.messages.length > 0 ? (
                project.messages.map((msg: any) => {
                  const isClient = msg.senderName === clientName;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        isClient 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                      }`}>
                        <div className={`flex items-baseline justify-between gap-4 mb-1.5 ${isClient ? 'text-indigo-100' : 'text-gray-500'}`}>
                          <span className={`text-xs font-bold uppercase tracking-wider ${isClient ? 'text-white' : 'text-gray-900'}`}>{msg.senderName}</span>
                          <span className="text-[10px] opacity-80 whitespace-nowrap">{new Date(msg.timestamp).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isClient ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                  <MessageCircle className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">প্রথম মেসেজটি শুরু করুন!</p>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="flex gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                className="flex-1 resize-none p-3 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400 min-h-[50px] max-h-[120px]"
                placeholder="আপনার মন্তব্য বা প্রশ্ন লিখুন (Enter চাপলে সেন্ড হবে)..."
                rows={1}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors self-end flex items-center justify-center h-[50px] w-[50px]"
                title="পাঠান"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ClientPortal({ clientId }: { clientId: string }) {
  const { clients } = useData();
  const client = clients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">ক্লায়েন্ট পাওয়া যায়নি</h2>
          <p className="text-gray-500 leading-relaxed">আপনার দেওয়া লিংকটি সঠিক নয় অথবা সিস্টেম থেকে ক্লায়েন্ট প্রোফাইল ডিলিট করা হয়েছে।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans selection:bg-indigo-100">
      {/* Fancy Header */}
      <div className="bg-indigo-900 text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-indigo-400 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wider uppercase mb-4 shadow-sm border border-white/10">
              Client Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">স্বাগতম, {client.name}</h1>
            <p className="text-indigo-200 text-lg md:text-xl font-medium">{client.company}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
                <div>
                   <p className="text-indigo-200 text-xs font-medium mb-1">Status</p>
                   <p className="font-bold flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Active Client</p>
                </div>
                 <div>
                   <p className="text-indigo-200 text-xs font-medium mb-1">Projects</p>
                   <p className="font-bold text-sm tracking-wide">{client.projects?.length || 0} Total</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        {/* Financial Info Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-indigo-100/50 border border-gray-100 flex items-center transform transition-transform hover:-translate-y-1">
            <div className="bg-indigo-50 p-3 rounded-xl mr-4">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">মোট বাজেট</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">৳{client.totalBudget?.toLocaleString() || 0}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-emerald-100/50 border border-gray-100 flex items-center transform transition-transform hover:-translate-y-1">
            <div className="bg-emerald-50 p-3 rounded-xl mr-4">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">মোট অ্যাডভান্স</span>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                ৳{client.projects?.reduce((sum, p) => sum + (p.clientAdvance || 0), 0).toLocaleString() || 0}
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-rose-100/50 border border-gray-100 flex items-center transform transition-transform hover:-translate-y-1">
             <div className="bg-rose-50 p-3 rounded-xl mr-4">
              <CreditCard className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">বাকি পেমেন্ট</span>
              <span className="text-2xl font-black text-rose-600 tracking-tight">
                ৳{((client.totalBudget || 0) - (client.projects?.reduce((sum, p) => sum + (p.clientAdvance || 0), 0) || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-blue-100/50 border border-gray-100 flex items-center transform transition-transform hover:-translate-y-1">
            <div className="bg-blue-50 p-3 rounded-xl mr-4">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">মোট প্রজেক্ট</span>
              <span className="text-2xl font-black text-blue-600 tracking-tight">{client.projects?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex items-center justify-between mb-8 px-2">
           <h2 className="text-3xl font-black text-gray-900 tracking-tight">আপনার প্রজেক্ট সমূহ</h2>
           {client.projects && client.projects.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">{client.projects.length} Active</span>
           )}
        </div>
        
        {client.projects && client.projects.length > 0 ? (
          <div className="space-y-8">
            {client.projects.map((project) => (
              <ClientProjectCard key={project.id} project={project} clientName={client.name} clientId={clientId} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">কোন প্রজেক্ট নেই</h3>
            <p className="text-gray-500 text-lg">আপনার এখনও কোন প্রজেক্ট তৈরি করা হয়নি। নতুন কাজ শুরু হলে এখানে দেখতে পাবেন।</p>
          </div>
        )}

      </div>
    </div>
  );
}
