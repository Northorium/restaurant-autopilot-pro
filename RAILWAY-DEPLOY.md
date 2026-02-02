# 🚂 Railway Deployment Guide

## Quick Deploy

### Option 1: Deploy via Railway CLI (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd restaurant-autopilot-pro
railway init

# Deploy backend
railway up
```

### Option 2: Deploy via GitHub

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Restaurant Autopilot Pro"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway will auto-detect and deploy!

## Environment Variables

Set these in Railway dashboard:

```env
# Required
NODE_ENV=production
PORT=3001

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-random-string-here

# Google Business Profile API (optional for demo)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Meta Business API (optional for demo)
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret

# OpenAI API (optional for demo)
OPENAI_API_KEY=your-openai-api-key

# Frontend URL (set to your Railway frontend domain)
FRONTEND_URL=https://your-frontend.railway.app
```

## Deploy Backend + Frontend Separately

### Backend Deployment

1. **Root directory settings:**
   - Root Directory: `/backend`
   - Start Command: `node server.js`
   - Build Command: `npm install`

### Frontend Deployment (Static)

1. **Deploy frontend separately:**
   - Root Directory: `/frontend-manual`
   - Use Railway's Static Site template
   - Or use Vercel/Netlify for frontend

2. **Update CORS in backend:**
   - Set `FRONTEND_URL` env var to your frontend domain

## One-Click Deploy (Combined)

Railway will detect `package.json` in root and:
- Run `npm install`
- Run `npm run build` (installs backend deps)
- Run `npm start` (starts backend on port 3001)

**Your API will be available at:**
`https://your-app-name.railway.app`

## Post-Deployment

1. **Test the API:**
```bash
curl https://your-app-name.railway.app/health
```

2. **Update frontend:**
   - Change `API_URL` in `frontend-manual/app.js` to your Railway backend URL

3. **Deploy frontend to Vercel/Netlify:**
   - Point to `frontend-manual` folder
   - Set environment variable: `API_URL=https://your-backend.railway.app`

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure real API keys (Google, Meta, OpenAI)
- [ ] Set up PostgreSQL/MongoDB database
- [ ] Enable Railway's built-in metrics
- [ ] Set up custom domain
- [ ] Configure SSL (auto with Railway)
- [ ] Set up monitoring/alerts

## Cost Estimate

**Railway Pricing:**
- ✅ **Free Tier:** $5 free credit/month
- ✅ **Hobby Plan:** $5/month + usage
- ✅ **Pro Plan:** $20/month + usage

**This app on Railway:**
- Backend: ~$3-5/month (small usage)
- Perfect for demos & MVP!

## Troubleshooting

### Port Issues
Railway sets `PORT` automatically. The app uses `process.env.PORT || 3001`.

### CORS Errors
Make sure `FRONTEND_URL` env var matches your frontend domain.

### Build Fails
Check Railway logs. Usually missing dependencies or wrong Node version.

### Database Connection
For production, add Railway's PostgreSQL plugin and update connection string.

---

**Deploy in 2 minutes!** 🚀
