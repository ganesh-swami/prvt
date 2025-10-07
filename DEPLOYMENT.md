# Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Deploy automatically
4. Your app will be at: `https://your-app.vercel.app`

### 2. Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Deploy automatically
4. Your app will be at: `https://your-app.netlify.app`

## Environment Variables Required
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Iframe Embedding
Once deployed, embed with:
```html
<iframe 
  src="https://your-deployed-app.vercel.app" 
  width="100%" 
  height="800px"
  frameborder="0"
  allow="payment">
</iframe>
```

## Local Testing
```bash
npm install
npm run build
npm run preview
```