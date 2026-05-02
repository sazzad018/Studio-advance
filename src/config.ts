// src/config.ts

// এখানে আপনার PHP API এর মূল URL দিন।
// উদাহরণ: 'https://yourdomain.com/api' বা 'http://localhost/myproject/api'
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost/api';

// যদি true থাকে, তাহলে API কল ফেইল করলে লোকাল স্টোরেজ/মক ডাটা ব্যবহার করবে।
// প্রোডাকশনে যাওয়ার সময় এবং PHP ব্যাকএন্ড রেডি হলে এটি false করে দিতে পারেন।
export const USE_MOCK_FALLBACK = true;
