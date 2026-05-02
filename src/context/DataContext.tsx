import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Model, Content, ScheduleEvent, Project, Invoice, mockClients, mockModels, mockContent, mockSchedule, mockCategories } from '../data/mockData';
import { api } from '../services/api';
import { USE_MOCK_FALLBACK } from '../config';

type DataContextType = {
  clients: Client[];
  models: Model[];
  content: Content[];
  schedule: ScheduleEvent[];
  categories: string[];
  invoices: Invoice[];
  addClient: (client: Omit<Client, 'id' | 'projects'>) => Promise<void>;
  addProject: (clientId: string, project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (clientId: string, projectId: string, projectData: Partial<Project>, newClientId?: string) => Promise<void>;
  addModel: (model: Omit<Model, 'id'>) => Promise<void>;
  addContent: (contentItem: Omit<Content, 'id'>) => Promise<void>;
  addScheduleEvent: (event: Omit<ScheduleEvent, 'id'>) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('studio_clients');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : mockClients;
    }
    return mockClients;
  });
  const [models, setModels] = useState<Model[]>(() => {
    const saved = localStorage.getItem('studio_models');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : mockModels;
    }
    return mockModels;
  });
  const [content, setContent] = useState<Content[]>(() => {
    const saved = localStorage.getItem('studio_content');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : mockContent;
    }
    return mockContent;
  });
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('studio_schedule');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : mockSchedule;
    }
    return mockSchedule;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('studio_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : mockCategories;
    }
    return mockCategories;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('studio_invoices');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('studio_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('studio_models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem('studio_content', JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem('studio_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('studio_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('studio_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Fetch initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apiClients, apiModels, apiContent, apiSchedule, apiCategories, apiInvoices] = await Promise.all([
          api.getClients(),
          api.getModels(),
          api.getContent(),
          api.getSchedule(),
          api.getCategories(),
          api.getInvoices()
        ]);
        
        if (Array.isArray(apiClients)) setClients(apiClients);
        if (Array.isArray(apiModels)) setModels(apiModels);
        if (Array.isArray(apiContent)) setContent(apiContent);
        if (Array.isArray(apiSchedule)) setSchedule(apiSchedule);
        if (Array.isArray(apiCategories)) setCategories(apiCategories);
        if (Array.isArray(apiInvoices)) setInvoices(apiInvoices);
      } catch (error) {
        if (!USE_MOCK_FALLBACK) {
          console.warn('API connection failed. Using local/mock data.', error);
        } else {
          console.log('Using local storage/mock data (API connection bypassed or failed).');
        }
        // If USE_MOCK_FALLBACK is true, we just keep the initial state (localStorage/mock)
      }
    };

    loadData();
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'projects'>) => {
    try {
      const newClient = await api.addClient(clientData);
      setClients([...clients, newClient]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newClient: Client = {
          ...clientData,
          id: `c${Date.now()}`,
          projects: [],
        };
        setClients([...clients, newClient]);
      }
    }
  };

  const addProject = async (clientId: string, projectData: Omit<Project, 'id'>) => {
    let createdProject: Project;
    try {
      createdProject = await api.addProject(clientId, projectData);
    } catch (error) {
      if (!USE_MOCK_FALLBACK) throw error;
      createdProject = {
        ...projectData,
        id: `p${Date.now()}`,
      };
    }

    setClients(clients.map(c => {
      if (c.id === clientId) {
        return { ...c, projects: [...c.projects, createdProject] };
      }
      return c;
    }));

    // Sync models
    if (projectData.models && projectData.models.length > 0) {
      setModels(prevModels => prevModels.map(m => {
        if (projectData.models.includes(m.id)) {
          return { ...m, projects: [...m.projects, createdProject.id] };
        }
        return m;
      }));
    }

    // Auto-schedule options
    if (projectData.startDate) {
      addScheduleEvent({
        title: `Project Start: ${projectData.title}`,
        date: projectData.startDate,
        type: 'Shoot',
        models: projectData.models || [],
        crew: [],
        projectId: createdProject.id
      });
    }
    if (projectData.endDate && projectData.endDate !== projectData.startDate) {
      addScheduleEvent({
        title: `Project Deadline: ${projectData.title}`,
        date: projectData.endDate,
        type: 'Deadline',
        models: projectData.models || [],
        crew: [],
        projectId: createdProject.id
      });
    }
  };

  const updateProject = async (clientId: string, projectId: string, projectData: Partial<Project>, newClientId?: string) => {
    try {
      await api.updateProject(clientId, projectId, projectData, newClientId);
      // Proceed with local update if API succeeds
    } catch (error) {
      if (!USE_MOCK_FALLBACK) return;
    }

    // Find old models
    const client = clients.find(c => c.id === clientId);
    const project = client?.projects?.find(p => p.id === projectId);
    const oldModels = project?.models || [];

    setClients(clients.map(c => {
      // If client changed, remove from old client and add to new client
      if (newClientId && newClientId !== clientId) {
        if (c.id === clientId) {
          return { ...c, projects: (c.projects || []).filter(p => p.id !== projectId) };
        }
        if (c.id === newClientId && project) {
          return { ...c, projects: [...c.projects, { ...project, ...projectData }] };
        }
        return c;
      }

      // If client didn't change, just update the project in the current client
      if (c.id === clientId) {
        return {
          ...c,
          projects: (c.projects || []).map(p => p.id === projectId ? { ...p, ...projectData } : p)
        };
      }
      return c;
    }));

    // Sync models
    if (projectData.models) {
      const newModels = projectData.models;
      setModels(prevModels => prevModels.map(m => {
        const wasInProject = oldModels.includes(m.id);
        const isInProject = newModels.includes(m.id);
        
        if (wasInProject && !isInProject) {
          return { ...m, projects: (m.projects || []).filter(id => id !== projectId) };
        } else if (!wasInProject && isInProject) {
          return { ...m, projects: [...m.projects, projectId] };
        }
        return m;
      }));
    }
  };

  const addModel = async (modelData: Omit<Model, 'id'>) => {
    try {
      const newModel = await api.addModel(modelData);
      setModels([...models, newModel]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newModel: Model = {
          ...modelData,
          id: `m${Date.now()}`,
        };
        setModels([...models, newModel]);
      }
    }
  };

  const addContent = async (contentData: Omit<Content, 'id'>) => {
    try {
      const newContent = await api.addContent(contentData);
      setContent(prev => [...prev, newContent]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newContent: Content = {
          ...contentData,
          id: `ct${Date.now()}`,
        };
        setContent(prev => [...prev, newContent]);
      }
    }
  };

  const addScheduleEvent = async (eventData: Omit<ScheduleEvent, 'id'>) => {
    try {
      const newEvent = await api.addScheduleEvent(eventData);
      setSchedule(prev => [...prev, newEvent]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newEvent: ScheduleEvent = {
          ...eventData,
          id: `s${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        };
        setSchedule(prev => [...prev, newEvent]);
      }
    }
  };

  const addCategory = async (category: string) => {
    try {
      await api.addCategory(category);
      if (!categories.includes(category)) {
        setCategories([...categories, category]);
      }
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        if (!categories.includes(category)) {
          setCategories([...categories, category]);
        }
      }
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await api.addInvoice(invoiceData);
      setInvoices([newInvoice, ...invoices]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newInvoice: Invoice = {
          ...invoiceData,
          id: `inv${Date.now()}`,
        };
        setInvoices([newInvoice, ...invoices]);
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        setInvoices(invoices.filter(inv => inv.id !== id));
      }
    }
  };

  return (
    <DataContext.Provider value={{ clients, models, content, schedule, categories, invoices, addClient, addProject, updateProject, addModel, addContent, addScheduleEvent, addCategory, addInvoice, deleteInvoice }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
