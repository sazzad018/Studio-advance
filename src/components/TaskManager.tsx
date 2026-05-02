import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Clock, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
  createdByRole?: string;
  createdByName?: string;
}

export default function TaskManager() {
  const { currentUser } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('studio_task_manager');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [employees, setEmployees] = useState<{id: string, name: string, email?: string}[]>(() => {
    const saved = localStorage.getItem('studio_employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

  const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const currentUserEmployee = employees.find(emp => 
    emp.name === currentUser?.name || 
    (emp.email && currentUser?.email && emp.email === currentUser?.email)
  );

  useEffect(() => {
    localStorage.setItem('studio_task_manager', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let finalAssignedTo = newTaskAssignedTo;
    let finalAssignedToName = 'Unassigned';

    if (!isPrivileged) {
      if (currentUserEmployee) {
        finalAssignedTo = currentUserEmployee.id;
        finalAssignedToName = currentUserEmployee.name;
      } else {
        finalAssignedToName = currentUser?.name || 'Unassigned';
      }
    } else {
      const assignedEmp = employees.find(emp => emp.id === newTaskAssignedTo);
      if (assignedEmp) {
        finalAssignedToName = assignedEmp.name;
      }
    }

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      assignedTo: finalAssignedTo,
      assignedToName: finalAssignedToName,
      dueDate: newTaskDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
      createdAt: new Date().toISOString(),
      createdByRole: currentUser?.role,
      createdByName: currentUser?.name
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDate('');
    setNewTaskAssignedTo('');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' };
      }
      return task;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই টাস্কটি মুছে ফেলতে চান?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const visibleTasks = tasks.filter(task => {
    if (isPrivileged) return true;
    if (currentUserEmployee && task.assignedTo === currentUserEmployee.id) return true;
    if (task.assignedToName === currentUser?.name) return true;
    return false;
  });

  const pendingTasks = visibleTasks
    .filter(t => t.status === 'Pending')
    .sort((a, b) => {
      const aIsAdminAssigned = (a.createdByRole === 'admin' || a.createdByRole === 'manager') && a.createdByName !== a.assignedToName;
      const bIsAdminAssigned = (b.createdByRole === 'admin' || b.createdByRole === 'manager') && b.createdByName !== b.assignedToName;
      
      if (aIsAdminAssigned && !bIsAdminAssigned) return -1;
      if (!aIsAdminAssigned && bIsAdminAssigned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const completedTasks = visibleTasks
    .filter(t => t.status === 'Completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayedTasks = activeTab === 'Pending' ? pendingTasks : completedTasks;

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-GB', dateOptions);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 rounded-lg p-1.5 flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Tasks</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track your daily work progress.</p>
          </div>
        </div>
        <div className="flex items-center text-gray-500 text-sm font-medium">
          <Calendar className="w-4 h-4 mr-2" />
          {formattedDate}
        </div>
      </div>

      {/* Add Task Input Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleAddTask} className="p-4 sm:p-5 flex flex-col space-y-4">
          <input
            type="text"
            placeholder="What needs to be done today?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full text-lg border border-gray-200 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 sm:text-sm"
              />
            </div>
            
            {isPrivileged && (
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 sm:text-sm appearance-none"
                >
                  <option value="">Assign Employee (Optional)</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-[#5c4fff] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg flex items-center justify-center transition-colors sm:w-auto w-full"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-8">
        <button
          onClick={() => setActiveTab('Pending')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'Pending' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Pending ({pendingTasks.length})
          {activeTab === 'Pending' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('Completed')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'Completed' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Completed ({completedTasks.length})
          {activeTab === 'Completed' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
          )}
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {displayedTasks.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>No tasks found in {activeTab.toLowerCase()}.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {displayedTasks.map((task) => {
              const isAdminAssigned = task.status === 'Pending' && (task.createdByRole === 'admin' || task.createdByRole === 'manager') && task.createdByName !== task.assignedToName;

              return (
              <li key={task.id} className={`flex items-center justify-between py-4 px-5 transition-colors group ${isAdminAssigned ? 'bg-amber-50/60 hover:bg-amber-100 border-l-4 border-amber-500' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-4 overflow-hidden">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      task.status === 'Completed' 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-gray-300 hover:border-indigo-500 bg-white'
                    }`}
                  >
                    {task.status === 'Completed' && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-base truncate transition-all ${
                      task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'
                    }`}>
                      {task.title}
                    </span>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-x-3 gap-y-1">
                      {isAdminAssigned && (
                        <span className="flex items-center text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-semibold border border-amber-200">
                          <UserIcon className="w-3 h-3 mr-1" />
                          Assigned by {task.createdByName || 'Admin'}
                        </span>
                      )}
                      {(task.assignedToName !== 'Unassigned' || task.dueDate) && (
                        <>
                          {task.assignedToName !== 'Unassigned' && (
                            <span className="flex items-center text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              <UserIcon className="w-3 h-3 mr-1" />
                              {task.assignedToName}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString('en-GB')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-shrink-0 ml-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            )})}
          </ul>
        )}
      </div>
    </div>
  );
}

