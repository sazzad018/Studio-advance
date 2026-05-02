import React from 'react';
import { useData } from '../context/DataContext';

export default function Messages() {
  const { clients } = useData();

  // Aggregate messages across all clients and projects
  let allMessages: { id: string; senderName: string; content: string; timestamp: string; clientName: string; projectTitle: string, projectId: string, clientId: string }[] = [];

  clients.forEach(client => {
    client.projects?.forEach(project => {
      if (project.messages && project.messages.length > 0) {
        project.messages.forEach(msg => {
          allMessages.push({
            ...msg,
            clientName: client.name,
            projectTitle: project.title,
            projectId: project.id,
            clientId: client.id
          });
        });
      }
    });
  });

  // Sort by latest timestamp
  allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">মেসেজ বক্স</h1>
        <p className="text-gray-500 mt-1">ক্লায়েন্টদের সব মেসেজ এখানে দেখা যাবে</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {allMessages.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {allMessages.map(msg => (
              <div key={msg.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{msg.senderName}</h3>
                    <p className="text-sm text-indigo-600 font-medium">
                      {msg.clientName} <span className="text-gray-400 font-normal">|</span> {msg.projectTitle}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(msg.timestamp).toLocaleString('en-GB')}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mt-3 bg-white border border-gray-100 p-4 rounded-lg shadow-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500">
            <span className="text-5xl block mb-4">💬</span>
            <p className="text-lg">এখনো কোনো মেসেজ আসেনি।</p>
          </div>
        )}
      </div>
    </div>
  );
}
