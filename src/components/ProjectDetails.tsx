import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, DollarSign, FileText, Users, Briefcase, Camera, Link as LinkIcon, Video, Printer, Clock, ThumbsUp, PenTool, Edit3 } from 'lucide-react';

type ProjectDetailsProps = {
  clientId: string;
  projectId: string;
  onBack: () => void;
};

export default function ProjectDetails({ clientId, projectId, onBack }: ProjectDetailsProps) {
  const { clients, models, updateProject } = useData();
  const { users, currentUser } = useAuth();
  const [isScriptExpanded, setIsScriptExpanded] = React.useState(false);

  const [commentText, setCommentText] = React.useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderName: currentUser?.name || 'Studio Member',
      content: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(project.messages || []), newMessage];

    // Note: Assuming updateProject is from useData
    updateProject(clientId, project.id, { messages: updatedMessages });
    setCommentText('');
  };

  const client = clients.find(c => c.id === clientId);
  const project = client?.projects?.find(p => p.id === projectId);
  
  const contentWriter = users.find(u => u.id === project?.contentWriterId);
  const editor = users.find(u => u.id === project?.editorId);

  const canSee = (permId: string) => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return true;
    return currentUser?.projectPermissions?.includes(permId) ?? false;
  };

  if (!client || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">প্রজেক্ট পাওয়া যায়নি।</p>
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium">
          ফিরে যান
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?client-portal=${clientId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('ক্লায়েন্ট পোর্টাল লিংক কপি করা হয়েছে!');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{project.title}</h1>
            <p className="text-gray-500 flex items-center mt-2 font-medium">
              <Briefcase className="w-5 h-5 mr-1.5 text-blue-500" />
              {client.name} ({client.company})
            </p>
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 hover:border-transparent"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          পোর্টাল লিংক কপি করুন
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full -z-10"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">প্রজেক্ট ওভারভিউ</h2>
              <div className="flex gap-2">
                {project.priority === 'Urgent' && (
                  <span className="px-4 py-1.5 text-xs font-black rounded-full bg-red-100 text-red-700 uppercase tracking-wider border border-red-200 flex items-center shadow-sm">
                    🔥 জরুরী (Urgent)
                  </span>
                )}
                <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-wider shadow-sm border ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                  project.status === 'Shooting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>

            {project.thumbnailUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
                <img 
                  src={project.thumbnailUrl} 
                  alt={project.title} 
                  className="w-full h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {canSee('project-financials') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">মোট বাজেট</span>
                  <span className="text-xl font-black text-gray-900">৳{(project.budget || 0).toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 block mb-1">অ্যাডভান্স</span>
                  <span className="text-xl font-black text-emerald-700">৳{(project.clientAdvance || 0).toLocaleString()}</span>
                </div>
                <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 block mb-1">মডেল পেমেন্ট</span>
                  <span className="text-xl font-black text-purple-700">৳{(project.modelPayment || 0).toLocaleString()}</span>
                </div>
                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600 block mb-1">অতিরিক্ত খরচ</span>
                  <span className="text-xl font-black text-rose-700">৳{(project.extraExpenses || 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            {canSee('project-team') && (
              <div className="mb-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2 text-indigo-500" />
                মডেলসমূহ
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.models.map(modelId => {
                  const model = models.find(m => m.id === modelId);
                  return model ? (
                    <div key={modelId} className="flex items-center bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black mr-3 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {model.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{model.name}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{model.category}</p>
                      </div>
                    </div>
                  ) : null;
                })}
                {project.models.length === 0 && (
                  <p className="text-sm text-gray-500 italic font-medium">কোনো মডেল নির্বাচন করা হয়নি।</p>
                )}
              </div>
            </div>
            )}

            {canSee('project-team') && (contentWriter || editor) && (
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                  এসাইনড টিম
                </h3>
                <div className="flex flex-wrap gap-4">
                  {contentWriter && (
                    <div className="flex items-center bg-white border border-blue-100 px-5 py-4 rounded-2xl shadow-sm flex-1 min-w-[200px]">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mr-4 border border-blue-100">
                        <PenTool className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-1">কনটেন্ট রাইটার</p>
                        <p className="text-base font-black text-gray-900">{contentWriter.name}</p>
                      </div>
                    </div>
                  )}
                  {editor && (
                    <div className="flex items-center bg-white border border-emerald-100 px-5 py-4 rounded-2xl shadow-sm flex-1 min-w-[200px]">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mr-4 border border-emerald-100">
                        <Edit3 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-1">ভিডিও এডিটর</p>
                        <p className="text-base font-black text-gray-900">{editor.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {canSee('project-content') && (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden">
             {/* decorative blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2.5 text-blue-500" />
                কনটেন্ট লগ
              </h3>
              <div className="space-y-3 relative z-10">
                {(project.contentLog || []).map((log, index) => (
                  <div key={index} className="flex items-start bg-gray-50/80 p-4 rounded-2xl border border-gray-100 transform transition-transform hover:translate-x-1 duration-200">
                     <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-3 flex-shrink-0 shadow-sm shadow-blue-200"></span>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{log}</p>
                  </div>
                ))}
                {(project.contentLog || []).length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">কোনো কনটেন্ট লগ নেই।</p>
                )}
              </div>
            </div>
          )}

          {((canSee('project-scripts')) || (canSee('project-links') && (project.link || project.recommendationLink))) && (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 space-y-8">
              
              {canSee('project-scripts') && ((project.formats && project.formats.length > 0) || project.contentType) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {project.contentType && (
                     <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100/50">
                        <span className="text-[10px] uppercase tracking-wider text-indigo-800 font-bold block mb-1">কনটেন্ট টাইপ</span>
                        <span className="text-lg font-black text-gray-900">{project.contentType}</span>
                        {project.framework && (
                          <div className="mt-3 text-xs bg-white/50 p-2.5 rounded-xl border border-indigo-100/30">
                            <span className="text-indigo-600 block font-bold mb-0.5">ফ্রেমওয়ার্ক:</span>
                            <span className="font-semibold text-gray-700">{project.framework}</span>
                          </div>
                        )}
                     </div>
                  )}
                  {project.formats && project.formats.length > 0 && (
                     <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-2xl border border-teal-100/50">
                        <span className="text-[10px] uppercase tracking-wider text-teal-800 font-bold block mb-3">ভিডিও ফরম্যাট</span>
                        <div className="flex flex-wrap gap-2">
                          {project.formats.map(f => (
                            <span key={f} className="px-3 py-1 bg-white border border-teal-200 text-teal-700 text-xs rounded-lg font-bold shadow-sm">{f}</span>
                          ))}
                        </div>
                     </div>
                  )}
                </div>
              )}

              {((canSee('project-scripts') && project.videoDuration) || (canSee('project-links') && project.recommendationLink)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {canSee('project-scripts') && project.videoDuration && (
                    <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-100 flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-purple-800 font-bold block mb-0.5">ভিডিও ডিউরেশন</span>
                        <span className="text-xl font-black text-gray-900">{project.videoDuration}</span>
                      </div>
                    </div>
                  )}
                  {canSee('project-links') && project.recommendationLink && (
                    <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 flex items-center overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mr-4 flex-shrink-0">
                        <ThumbsUp className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden w-full">
                        <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold block mb-0.5">রেকোমেন্ডেশন লিংক</span>
                        <a href={project.recommendationLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline truncate block transition-colors">{project.recommendationLink}</a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canSee('project-scripts') && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 flex items-center">
                    <Video className="w-6 h-6 mr-2.5 text-purple-500" />
                    ভিডিও স্ক্রিপ্টসমূহ
                  </h3>

                  {project.scripts && project.scripts.length > 0 ? (
                    project.scripts.map((sc, idx) => (
                      <div key={sc.id} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-md">
                         <h4 className="font-extrabold text-gray-900 mb-4 pr-24 text-lg">{sc.title || `স্ক্রিপ্ট ${idx + 1}`}</h4>
                         <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-medium">{sc.content}</div>
                         <button
                          onClick={() => {
                            const printWindow = window.open('', '', 'height=600,width=800');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>${sc.title || 'ভিডিও স্ক্রিপ্ট'} - ${project.title}</title>
                                    <style>
                                      body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                                      h1 { font-size: 24px; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-bottom: 5px; }
                                      h3 { font-size: 18px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                                      p { white-space: pre-wrap; font-size: 16px; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>${project.title}</h1>
                                    <h3>${sc.title || 'ভিডিও স্ক্রিপ্ট'}</h3>
                                    <div><p>${sc.content?.replace(/\n/g, '<br/>') || ''}</p></div>
                                    <script>
                                      setTimeout(function() {
                                        window.print();
                                        window.close();
                                      }, 500);
                                    </script>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }
                          }}
                          className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider flex items-center text-purple-700 hover:text-purple-900 transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট
                        </button>
                      </div>
                    ))
                  ) : project.script ? (
                     <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap text-sm text-gray-700 relative font-medium leading-relaxed group transition-all hover:bg-white hover:shadow-md">
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => {
                            const printWindow = window.open('', '', 'height=600,width=800');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>ভিডিও স্ক্রিপ্ট - ${project.title}</title>
                                    <style>
                                      body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                                      h1 { font-size: 24px; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
                                      p { white-space: pre-wrap; font-size: 16px; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>ভিডিও স্ক্রিপ্ট - ${project.title}</h1>
                                    <div><p>${project.script?.replace(/\n/g, '<br/>') || ''}</p></div>
                                    <script>
                                      setTimeout(function() {
                                        window.print();
                                        window.close();
                                      }, 500);
                                    </script>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }
                          }}
                          className="text-xs font-bold uppercase tracking-wider flex items-center text-purple-700 hover:text-purple-900 transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট
                        </button>
                      </div>
                      <div className="pt-6">
                        {project.script.length > 500 && !isScriptExpanded ? (
                          <>
                            {project.script.substring(0, 500)}...
                            <button
                              onClick={() => setIsScriptExpanded(true)}
                              className="text-purple-600 font-bold hover:text-purple-800 ml-2 uppercase tracking-wide text-xs"
                            >
                              আরো দেখুন
                            </button>
                          </>
                        ) : (
                          <>
                            {project.script}
                            {project.script.length > 500 && (
                              <div className="mt-4 text-right">
                                <button
                                  onClick={() => setIsScriptExpanded(false)}
                                  className="text-purple-600 font-bold hover:text-purple-800 uppercase tracking-wide text-xs"
                                >
                                  সংকোচন করুন
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">এখনও কোনো ভিডিও স্ক্রিপ্ট যোগ করা হয়নি।</div>
                  )}
                </div>
              )}

              {canSee('project-links') && project.link && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                    <LinkIcon className="w-6 h-6 mr-2.5 text-emerald-500" />
                    প্রজেক্ট লিঙ্ক
                  </h3>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-between items-center p-4 bg-emerald-50/80 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors text-sm break-all font-bold group"
                  >
                    <span className="flex items-center w-full">
                       <LinkIcon className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-600 group-hover:text-emerald-800 transition-colors" />
                       <span className="truncate pr-4 group-hover:text-emerald-900 transition-colors">{project.link}</span>
                    </span>
                    <span className="bg-white px-3 py-1 text-[10px] rounded-full uppercase tracking-wider text-emerald-600 border border-emerald-200 flex-shrink-0 whitespace-nowrap shadow-sm">
                      Visit Link
                    </span>
                  </a>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 border border-blue-100">
                <span className="text-xl">💬</span>
              </div>
              মতামত ও মেসেজ
            </h3>
            
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-6">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-3 custom-scrollbar">
                {project.messages && project.messages.length > 0 ? (
                  project.messages.map((msg: any) => {
                    const isOwnMessage = msg.senderName === currentUser?.name;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                           {isOwnMessage ? (
                              <>
                               <span className="text-[10px] font-bold text-gray-400">{new Date(msg.timestamp).toLocaleString('en-GB')}</span>
                               <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>
                              </>
                           ) : (
                              <>
                                <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>
                                <span className="text-[10px] font-bold text-gray-400">{new Date(msg.timestamp).toLocaleString('en-GB')}</span>
                              </>
                           )}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[85%] ${isOwnMessage ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-200' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200 shadow-sm'}`}>
                          <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl opacity-50">✍️</span>
                     </div>
                     <p className="text-sm font-bold text-gray-500">কোনো মেসেজ নেই।</p>
                     <p className="text-xs text-gray-400 mt-1">প্রথম মেসেজটি শুরু করুন...</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex bg-white rounded-2xl p-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-transparent border-none p-3 text-sm font-medium text-gray-900 focus:ring-0 resize-none h-[52px] custom-scrollbar"
                placeholder="মতামত বা মেসেজ লিখুন..."
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-blue-600 text-white px-6 w-auto h-[52px] rounded-xl font-bold text-sm tracking-wide hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap ml-2 shadow-sm uppercase"
              >
                পাঠান
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
