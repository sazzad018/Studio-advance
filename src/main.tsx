import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function initApp() {
  try {
    // 1. Fetch entire database state (SQL tables + Store values)
    const response = await fetch('/api/sync');
    if (response.ok) {
      const data = await response.json();
      
      // 2. Clear current local storage and replace with fresh DB data to ensure syncing
      localStorage.clear();
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    }
  } catch (err) {
    console.error('Failed to sync with backend DB. App will run in offline/local mode.', err);
  }

  // 3. Monkey patch localStorage to automatically pipe saves to our SQL backend
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments as any); // Update local cache synchronously
    
    // Fire-and-forget sync to backend
    fetch(`/api/store/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: value
    }).catch(console.error);
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    originalRemoveItem.apply(this, arguments as any);
    
    fetch(`/api/store/${key}`, { 
      method: 'DELETE' 
    }).catch(console.error);
  };

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

initApp();

