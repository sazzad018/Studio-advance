export type Client = {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  facebook?: string;
  totalBudget: number;
  projects: Project[];
};

export type Project = {
  id: string;
  title: string;
  category?: string;
  status: 'Planning' | 'Shooting' | 'Editing' | 'Completed';
  budget: number;
  clientAdvance: number;
  modelPayment: number;
  extraExpenses: number;
  models: string[]; // model IDs
  contentLog: string[];
  thumbnailUrl?: string;
  script?: string;
  scripts?: { id: string; title: string; content: string; }[];
  messages?: { id: string; senderName: string; content: string; timestamp: string; }[];
  recommendationLink?: string;
  videoDuration?: string;
  formats?: string[];
  contentType?: string;
  framework?: string;
  contentWriterId?: string;
  editorId?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  priority?: 'Urgent' | 'Normal';
};

export type Model = {
  id: string;
  name: string;
  category: string;
  hourlyRate: number;
  projects: string[]; // project IDs
  imageUrl: string;
  phone?: string;
  email?: string;
  facebook?: string;
  portfolioLinks?: string[];
  portfolioImages?: string[];
};

export type Content = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  projectId: string;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  type: 'Shoot' | 'Meeting' | 'Deadline';
  models: string[];
  crew: string[];
  projectId?: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  discount: number;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  notes?: string;
};

export const mockModels: Model[] = [
  {
    id: 'm1',
    name: 'আরিফ হোসেন',
    category: 'Fashion',
    hourlyRate: 5000,
    projects: ['p1', 'p3'],
    imageUrl: 'https://picsum.photos/seed/model1/200/300',
  },
  {
    id: 'm2',
    name: 'সাদিয়া ইসলাম',
    category: 'Commercial',
    hourlyRate: 6000,
    projects: ['p2'],
    imageUrl: 'https://picsum.photos/seed/model2/200/300',
  },
  {
    id: 'm3',
    name: 'রাকিব হাসান',
    category: 'Fitness',
    hourlyRate: 4500,
    projects: ['p1'],
    imageUrl: 'https://picsum.photos/seed/model3/200/300',
  },
];

export const mockCategories: string[] = ['Fashion', 'Commercial', 'Product', 'Event'];

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'রফিক আহমেদ',
    company: 'Apex Footwear',
    totalBudget: 150000,
    projects: [
      {
        id: 'p1',
        title: 'Summer Collection 2026',
        status: 'Shooting',
        budget: 80000,
        clientAdvance: 40000,
        modelPayment: 15000,
        extraExpenses: 5000,
        models: ['m1', 'm3'],
        contentLog: ['Photoshoot Day 1', 'Video Ad Draft'],
        script: 'Scene 1\n[A sunny beach, vibrant colors. Models walking on the sand wearing the Summer Collection.]\n\nVoiceover: "This summer, step into the light..."\n\nScene 2\n[Close-up of the shoes, with upbeat background music.]',
        scripts: [
          {
            id: 'sc1',
            title: 'Summer Collection Ad - 30s',
            content: 'Scene 1: Sunny beach.\nModels showing off the shoes.\nVoiceover: "Summer is here."'
          }
        ]
      },
    ],
  },
  {
    id: 'c2',
    name: 'নাসরিন আক্তার',
    company: 'Aarong',
    totalBudget: 200000,
    projects: [
      {
        id: 'p2',
        title: 'Eid Special Campaign',
        status: 'Planning',
        budget: 120000,
        clientAdvance: 50000,
        modelPayment: 0,
        extraExpenses: 2000,
        models: ['m2'],
        contentLog: ['Moodboard created', 'Location scouted'],
        script: 'Scene 1\n[Traditional living room, festive decoration. Family gathered around.]\n\nVoiceover: "The joy of Eid is incomplete without Aarong..."\n\nScene 2\n[Family exchanging gifts, smiles all around.]',
        scripts: [
          {
            id: 'sc2',
            title: 'Eid Special - Main TVC',
            content: 'Family gathering scene.\nVoiceover reading out the Eid offers.\nClose up of the new collection.'
          }
        ]
      },
      {
        id: 'p3',
        title: 'Winter Wear Promo',
        status: 'Completed',
        budget: 80000,
        clientAdvance: 80000,
        modelPayment: 20000,
        extraExpenses: 8000,
        models: ['m1'],
        contentLog: ['Final deliverables sent'],
      },
    ],
  },
];

export const mockContent: Content[] = [
  {
    id: 'ct1',
    title: 'Summer Shoes Banner',
    category: 'Footwear',
    imageUrl: 'https://picsum.photos/seed/shoes1/400/300',
    projectId: 'p1',
  },
  {
    id: 'ct2',
    title: 'Eid Saree Promo',
    category: 'Apparel',
    imageUrl: 'https://picsum.photos/seed/saree1/400/300',
    projectId: 'p2',
  },
  {
    id: 'ct3',
    title: 'Winter Jacket Ad',
    category: 'Apparel',
    imageUrl: 'https://picsum.photos/seed/jacket1/400/300',
    projectId: 'p3',
  },
  {
    id: 'ct4',
    title: 'Fitness Gear Shot',
    category: 'Accessories',
    imageUrl: 'https://picsum.photos/seed/fitness1/400/300',
    projectId: 'p1',
  },
];

export const mockSchedule: ScheduleEvent[] = [
  {
    id: 's1',
    title: 'Summer Collection Shoot',
    date: '2026-03-10',
    type: 'Shoot',
    models: ['m1', 'm3'],
    crew: ['Director: Hasan', 'Camera: Jamil', 'Makeup: Rina'],
  },
  {
    id: 's2',
    title: 'Eid Campaign Meeting',
    date: '2026-03-12',
    type: 'Meeting',
    models: [],
    crew: ['Producer: Kamal', 'Client: Nasrin'],
  },
  {
    id: 's3',
    title: 'Winter Promo Final Delivery',
    date: '2026-03-15',
    type: 'Deadline',
    models: [],
    crew: ['Editor: Sumon'],
  },
];
