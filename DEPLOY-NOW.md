# 🚀 Deploy Restaurant Autopilot Pro - LIVE URL in 3 Minutes

## GitHub Repo (Ready!)
✅ https://github.com/Northorium/restaurant-autopilot-pro

---

## Step 1: Deploy Backend to Railway (2 minutes)

### Method A: Via Dashboard (Easiest!)

1. **Go to:** https://railway.app/new
2. **Click:** "Deploy from GitHub repo"
3. **Select:** `Northorium/restaurant-autopilot-pro`
4. **Railway auto-deploys!** ✅
5. **Copy your Railway URL:** `https://your-app-name.up.railway.app`

### Method B: Via CLI

```bash
cd restaurant-autopilot-pro
railway login
railway init
railway up
```

**Result:** You get a live backend API URL!

---

## Step 2: Deploy Frontend to Vercel (1 minute - FREE!)

1. **Go to:** https://vercel.com/new
2. **Import:** `Northorium/restaurant-autopilot-pro`
3. **Root Directory:** `frontend-manual`
4. **Click:** Deploy
5. **Done!** You get: `https://your-app.vercel.app`

### Update API URL in Frontend

After Railway deployment, edit this line in `frontend-manual/app.js`:

```javascript
: 'https://restaurant-autopilot-pro-production.up.railway.app/api'; 
```

Replace with YOUR Railway URL, then:

```bash
git add frontend-manual/app.js
git commit -m "Update API URL"
git push
```

Vercel auto-redeploys! ✅

---

## Step 3: Test Your Live URLs

### Backend API
```bash
curl https://your-railway-url.railway.app/health
```

**Expected:** `{"status":"healthy"}`

### Frontend
Open: `https://your-vercel-app.vercel.app`

**Login:** demo@restaurant.com / demo123

---

## 🎯 Quick Deploy (For You)

Since you have the Railway account:

### Backend (Railway)
```bash
cd C:\Users\kiman.KIM\clawd\projects\restaurant-autopilot-pro
railway login
railway init
railway up
```

### Frontend (Vercel)
```bash
cd frontend-manual
vercel
# Follow prompts
```

**Done in 3 minutes!** 🚀

---

## Alternative: All-in-One Railway Deploy

Railway can host BOTH backend + frontend:

1. Deploy normally (backend runs automatically)
2. Add static site service for `frontend-manual` folder
3. Set environment variable: `API_URL` to point to backend

**Cost:** Still ~$5/month total

---

## URLs You'll Get

**Backend API:**
- Railway: `https://restaurant-autopilot-pro-production.up.railway.app`
- Health check: `/health`
- API docs: All endpoints at `/api/*`

**Frontend:**
- Vercel: `https://restaurant-autopilot-XXXX.vercel.app`
- Or Railway static: `https://restaurant-autopilot-frontend.up.railway.app`

**Login:**
- Email: demo@restaurant.com
- Password: demo123

---

## Cost Breakdown

**Backend (Railway):**
- $5 free credit
- Then ~$3-5/month
- Scales automatically

**Frontend (Vercel):**
- FREE forever
- Unlimited bandwidth
- Auto-deploy on git push

**Total: ~$5/month (or free with Railway credit!)**

---

## 🐛 Troubleshooting

### Backend won't deploy
- Check Railway logs
- Verify `backend/package.json` exists
- Node version: 18+ required

### Frontend shows connection error
- Update API_URL in `frontend-manual/app.js`
- Make sure Railway backend is running
- Check CORS (already configured for all origins)

### Login doesn't work
- Credentials: demo@restaurant.com / demo123
- Check backend health endpoint
- Verify API URL is correct

---

## 📱 Share Demo Link

Once deployed, share:

**Live Demo:** https://your-vercel-app.vercel.app

**Login:**
- demo@restaurant.com
- demo123

**Features to show:**
- Dashboard with stats
- 10 live reviews
- AI response generator
- Analytics charts
- Platform integrations

---

## 🎉 READY TO SHARE!

1. Deploy backend to Railway (2 min)
2. Deploy frontend to Vercel (1 min)
3. Share URL with client!

**Everything works out of the box!** ✅

---

**Need help deploying?**
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- GitHub repo: https://github.com/Northorium/restaurant-autopilot-pro
