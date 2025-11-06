# Frontend Example - AI Email Designer

This document provides example React components for the frontend.

## Setup New React Project

```bash
# Create new Vite + React + TypeScript project
npm create vite@latest client -- --template react-ts
cd client
npm install

# Install dependencies
npm install axios zustand react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Example Components

### 1. API Client (`src/api/client.ts`)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Klaviyo API
export const klaviyoAPI = {
  connect: (privateKey: string) =>
    api.post('/klaviyo/connect', { privateKey }),
  
  getStatus: () =>
    api.get('/klaviyo/status'),
  
  syncTemplates: () =>
    api.post('/klaviyo/sync-templates'),
};

// Brand API
export const brandAPI = {
  analyzeWebsite: (websiteUrl: string) =>
    api.post('/brand/analyze-website', { websiteUrl }),
  
  getAnalysisStatus: (jobId: string) =>
    api.get(`/brand/analysis-status/${jobId}`),
  
  getProfile: () =>
    api.get('/brand/profile'),
  
  uploadAssets: (files: FileList, options: any) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    Object.entries(options).forEach(([key, value]) => 
      formData.append(key, value as string)
    );
    return api.post('/brand/upload-assets', formData);
  },
};

// Email API
export const emailAPI = {
  generate: (data: {
    campaignBrief: string;
    campaignType?: string;
    tone?: string;
  }) =>
    api.post('/emails/generate', data),
  
  getGenerationStatus: (jobId: string) =>
    api.get(`/emails/generation-status/${jobId}`),
  
  getEmails: (params?: any) =>
    api.get('/emails', { params }),
  
  getEmailById: (emailId: string) =>
    api.get(`/emails/${emailId}`),
  
  updateEmail: (emailId: string, data: any) =>
    api.patch(`/emails/${emailId}`, data),
};
```

### 2. Login Component (`src/components/Login.tsx`)

```typescript
import { useState } from 'react';
import { authAPI } from '../api/client';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">AI Email Designer</h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 3. Email Generator Component (`src/components/EmailGenerator.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { emailAPI } from '../api/client';

export function EmailGenerator() {
  const [campaignBrief, setCampaignBrief] = useState('');
  const [campaignType, setCampaignType] = useState('promotional');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await emailAPI.generate({
        campaignBrief,
        campaignType,
        tone,
      });
      
      setJobId(response.data.jobId);
    } catch (error) {
      console.error('Generation failed:', error);
      setLoading(false);
    }
  };

  // Poll for status updates
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await emailAPI.getGenerationStatus(jobId);
        setStatus(response.data);

        if (response.data.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generate Email</h1>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Brief
          </label>
          <textarea
            value={campaignBrief}
            onChange={(e) => setCampaignBrief(e.target.value)}
            rows={4}
            placeholder="e.g., 25% off all pottery for spring sale"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Type
            </label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="promotional">Promotional</option>
              <option value="product_launch">Product Launch</option>
              <option value="newsletter">Newsletter</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="luxury">Luxury</option>
              <option value="casual">Casual</option>
              <option value="playful">Playful</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Generating...' : 'Generate Email'}
        </button>
      </form>

      {/* Progress Indicator */}
      {loading && status && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Generating your email...</span>
            <span className="text-indigo-600 font-bold">{status.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600">{status.currentStep}</p>
        </div>
      )}

      {/* Success State */}
      {status?.status === 'completed' && (
        <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-green-800 mb-2">
            ✅ Email Generated Successfully!
          </h3>
          <a
            href={`/emails/${status.emailId}`}
            className="text-indigo-600 hover:underline"
          >
            View your generated email →
          </a>
        </div>
      )}
    </div>
  );
}
```

### 4. Brand Setup Component (`src/components/BrandSetup.tsx`)

```typescript
import { useState } from 'react';
import { brandAPI, klaviyoAPI } from '../api/client';

export function BrandSetup() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [klaviyoKey, setKlaviyoKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'klaviyo' | 'brand' | 'complete'>('klaviyo');

  const handleKlaviyoConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await klaviyoAPI.connect(klaviyoKey);
      setStep('brand');
    } catch (error) {
      console.error('Klaviyo connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await brandAPI.analyzeWebsite(websiteUrl);
      // Poll for completion
      const jobId = response.data.jobId;
      
      const interval = setInterval(async () => {
        const status = await brandAPI.getAnalysisStatus(jobId);
        if (status.data.status === 'completed') {
          clearInterval(interval);
          setStep('complete');
          setLoading(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Brand analysis failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Setup Your Account</h1>
        <p className="text-gray-600 mb-8">
          Let's get you started in 2 simple steps
        </p>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex-1 ${step === 'klaviyo' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <span className="text-sm">Connect Klaviyo</span>
            </div>
          </div>
          <div className={`flex-1 ${step === 'brand' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <span className="text-sm">Analyze Brand</span>
            </div>
          </div>
        </div>

        {/* Step 1: Klaviyo */}
        {step === 'klaviyo' && (
          <form onSubmit={handleKlaviyoConnect} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klaviyo Private API Key
              </label>
              <input
                type="text"
                value={klaviyoKey}
                onChange={(e) => setKlaviyoKey(e.target.value)}
                placeholder="pk_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Find your API key in Klaviyo Settings → API Keys
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Klaviyo'}
            </button>
          </form>
        )}

        {/* Step 2: Brand */}
        {step === 'brand' && (
          <form onSubmit={handleBrandAnalysis} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                We'll analyze your website to learn your brand style
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Brand'}
            </button>
          </form>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">All Set!</h2>
            <p className="text-gray-600 mb-6">
              Your account is ready. Let's generate your first email!
            </p>
            <a
              href="/generate"
              className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700"
            >
              Generate First Email
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Environment Variables (`.env` in client folder)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Full App Structure

```
client/
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── BrandSetup.tsx
│   │   ├── EmailGenerator.tsx
│   │   ├── EmailList.tsx
│   │   └── EmailPreview.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

This provides a complete starting point for the frontend. Customize the styling, add more features, and integrate with your design system!

