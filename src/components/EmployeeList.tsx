import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, UserCircle, Briefcase, Calendar } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

export interface Employee {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  joiningDate: string;
  salary: string;
  status: 'Active' | 'Inactive';
}

export default function EmployeeList() {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('studio_employees');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const defaultFormData: Omit<Employee, 'id'> = {
    name: '',
    designation: '',
    phone: '',
    email: '',
    address: '',
    joiningDate: '',
    salary: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(defaultFormData);

  useEffect(() => {
    localStorage.setItem('studio_employees', JSON.stringify(employees));
  }, [employees]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      designation: emp.designation,
      phone: emp.phone,
      email: emp.email,
      address: emp.address,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
      status: emp.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই এমপ্লয়িকে মুছে ফেলতে চান?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...formData, id: emp.id } : emp));
    } else {
      const newEmp: Employee = {
        ...formData,
        id: `emp_${Date.now()}`,
      };
      setEmployees([newEmp, ...employees]);
    }
    setIsModalOpen(false);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.phone.includes(searchTerm) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center w-full sm:w-auto">
          <Users className="w-8 h-8 mr-3 text-indigo-600" />
          এমপ্লয়ি লিস্ট
        </h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {(currentUser?.role === 'admin' || currentUser?.permissions?.includes('employees')) && (
            <button
              onClick={openAddModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm flex-1 sm:flex-none"
            >
              <Plus size={20} className="mr-2" />
              নতুন এমপ্লয়ি যোগ করুন
            </button>
          )}
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
            placeholder="নাম, পদবী বা ফোন নাম্বার দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">কোন এমপ্লয়ি পাওয়া যায়নি</p>
            <p className="text-sm">নতুন এমপ্লয়ি যোগ করতে 'নতুন এমপ্লয়ি যোগ করুন' বাটনে ক্লিক করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                      <div className="text-xs font-semibold text-indigo-600 mt-0.5">{emp.designation || 'পদবী উল্লেখ নেই'}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => openEditModal(emp)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors">
                      <Edit2 size={14} />
                    </button>
                    {(currentUser?.role === 'admin') && (
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-5 space-y-4 flex-grow text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-900">{emp.phone || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-900">{emp.email || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                    <span className="text-gray-900 line-clamp-2">{emp.address || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                        <Calendar className="w-3 h-3 mr-1" /> যোগদানের তারিখ
                      </div>
                      <div className="text-gray-900">{emp.joiningDate || '-'}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-xs text-gray-500 font-medium mb-1">
                        <Briefcase className="w-3 h-3 mr-1" /> বেতন (Salary)
                      </div>
                      <div className="text-gray-900 fill-current">{emp.salary || '-'}</div>
                    </div>
                  </div>
                </div>
                <div className={`px-5 py-3 border-t text-sm font-medium text-center ${emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {emp.status === 'Active' ? 'অ্যাক্টিভ' : 'ইনঅ্যাক্টিভ'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? 'এমপ্লয়ি এডিট করুন' : 'নতুন এমপ্লয়ি যোগ করুন'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">এমপ্লয়ির নাম</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
              placeholder="e.g. Rahim Uddin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পদবী (Designation)</label>
            <input 
              required 
              type="text" 
              value={formData.designation} 
              onChange={e => setFormData({...formData, designation: e.target.value})} 
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
              placeholder="e.g. Editor, Photographer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নাম্বার</label>
              <input 
                required 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
            <input 
              type="text" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">যোগদানের তারিখ</label>
              <input 
                type="date" 
                value={formData.joiningDate} 
                onChange={e => setFormData({...formData, joiningDate: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">বেতন (Salary)</label>
              <input 
                type="text" 
                value={formData.salary} 
                onChange={e => setFormData({...formData, salary: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
            >
              <option value="Active">অ্যাক্টিভ (Active)</option>
              <option value="Inactive">ইনঅ্যাক্টিভ (Inactive)</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition mt-6">
            {editingEmployee ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
