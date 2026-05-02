import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

// Since this preview environment doesn't provide a running MySQL instance with credentials,
// we setup Sequelize using SQLite as a drop-in replacement so it works immediately.
// Users can easily change dialects to 'mysql' and provide credentials when they move to production.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false,
});

// Real SQL Tables matching application entities
const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING },
  permissions: { type: DataTypes.TEXT, get() { const v = this.getDataValue('permissions'); return v ? JSON.parse(v) : []; }, set(v) { this.setDataValue('permissions', JSON.stringify(v)); } },
  phone: { type: DataTypes.STRING },
  salary: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  joiningDate: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }
});

const Client = sequelize.define('Client', {
  id: { type: DataTypes.STRING, primaryKey: true },
  businessName: { type: DataTypes.STRING, allowNull: false },
  websiteUrl: { type: DataTypes.STRING },
  whatsappNumber: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  serviceType: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  facebookPageLink: { type: DataTypes.STRING },
  adAccountId: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.STRING },
  fbAdStartDate: { type: DataTypes.STRING },
  fbAdEndDate: { type: DataTypes.STRING },
  fbAdCampaignType: { type: DataTypes.STRING },
  fbAdCampaignName: { type: DataTypes.STRING },
  fbAdCampaignBudget: { type: DataTypes.STRING },
  websiteUsername: { type: DataTypes.STRING },
  websitePassword: { type: DataTypes.STRING },
  websiteProvider: { type: DataTypes.STRING }
});

const ClientComment = sequelize.define('ClientComment', {
  id: { type: DataTypes.STRING, primaryKey: true },
  clientId: { type: DataTypes.STRING },
  text: { type: DataTypes.TEXT },
  authorId: { type: DataTypes.STRING },
  authorName: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.STRING }
});

const ClientReminder = sequelize.define('ClientReminder', {
  id: { type: DataTypes.STRING, primaryKey: true },
  clientId: { type: DataTypes.STRING },
  text: { type: DataTypes.TEXT },
  assignedToId: { type: DataTypes.STRING },
  dueDate: { type: DataTypes.STRING },
  isFbAdEndReminder: { type: DataTypes.BOOLEAN }
});

const WebsiteRecord = sequelize.define('WebsiteRecord', {
  id: { type: DataTypes.STRING, primaryKey: true },
  clientId: { type: DataTypes.STRING },
  clientName: { type: DataTypes.STRING },
  whatsappNumber: { type: DataTypes.STRING },
  provider: { type: DataTypes.STRING },
  url: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.STRING }
});

const Lead = sequelize.define('Lead', {
  id: { type: DataTypes.STRING, primaryKey: true },
  clientName: { type: DataTypes.STRING },
  businessName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  source: { type: DataTypes.STRING },
  serviceInterest: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  followUpDate: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.STRING }
});

// For complex dynamic nested structures, we use a key-value store to ensure "no data is left out"
// like models, schedules, invoices, work logs, etc.
const Store = sequelize.define('Store', {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT } // stringified JSON
});

// Map of storage keys to actual tables (for seamless localStorage migration)
const entityMap: Record<string, any> = {
  'studio_employees': Employee,
  'allClientsData': Client,
  'allClientsComments': ClientComment,
  'allClientsReminders': ClientReminder,
  'websiteRecords': WebsiteRecord,
  'studio_leads': Lead,
};

async function syncDatabase() {
  await sequelize.sync();
  // Create default admin if Employee table is empty
  const adminCount = await Employee.count();
  if (adminCount === 0) {
    await Employee.create({
      id: "1",
      name: "Admin",
      role: "admin",
      permissions: [],
      phone: "",
      salary: "",
      password: "pass",
      joiningDate: new Date().toISOString(),
      status: "Active"
    });
  }
}

async function startServer() {
  await syncDatabase();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' })); // Support large base64 images

  // Dump all data for frontend boot
  app.get("/api/sync", async (req, res) => {
    try {
      const result: Record<string, any> = {};
      
      // Fetch all dynamic key-values
      const stores = await Store.findAll();
      stores.forEach((s: any) => {
        try {
          result[s.key] = JSON.parse(s.value);
        } catch(e) {
          result[s.key] = s.value;
        }
      });

      // Fetch all explicit tables
      for (const [key, Model] of Object.entries(entityMap)) {
        const records = await Model.findAll();
        result[key] = records.map((r: any) => r.toJSON());
      }
      
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/sync', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Universal GET
  app.get("/api/store/:key", async (req, res) => {
    const key = req.params.key;
    try {
      if (entityMap[key]) {
        const Model = entityMap[key];
        const records = await Model.findAll();
        // Return raw data exactly as frontend expects
        res.json(records.map((r: any) => r.toJSON()));
      } else {
        const record: any = await Store.findByPk(key);
        res.json(record ? JSON.parse(record.value) : null);
      }
    } catch (err: any) {
      console.error('Error fetching ' + key, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Universal SET (Upsert array of objects for bulk sync)
  app.post("/api/store/:key", async (req, res) => {
    const key = req.params.key;
    const body = req.body; // Expects the array of objects or single value
    
    try {
      if (entityMap[key]) {
        if (!Array.isArray(body)) {
          return res.status(400).json({ error: "Expected array for " + key });
        }
        const Model = entityMap[key];
        // Destroy existing for simple full sync replacement, or use bulkCreate with updateOnDuplicate
        // To be perfectly safe with "dumb" array updates from frontend, truncate and recreate:
        await Model.destroy({ where: {}, truncate: true });
        if (body.length > 0) {
          await Model.bulkCreate(body);
        }
        res.json({ success: true });
      } else {
        let valueToStore = typeof body === 'string' ? body : JSON.stringify(body);
        await Store.upsert({ key, value: valueToStore });
        res.json({ success: true });
      }
    } catch (err: any) {
      console.error('Error saving ' + key, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Universal DELETE single item
  app.delete("/api/store/:key", async (req, res) => {
    const key = req.params.key;
    try {
      if (entityMap[key]) {
        // Can't delete whole table array item by key easily without ID, so reject.
        res.status(400).json({ error: "Cannot delete entire table collection using DELETE, use POST with empty array." });
      } else {
        await Store.destroy({ where: { key } });
        res.json({ success: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
});
