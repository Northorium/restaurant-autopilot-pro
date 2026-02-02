# 🚀 Deployment Options

## 🚂 Railway (Recommended for Demo/MVP)

**Perfect for:** Quick demos, MVPs, prototypes  
**Cost:** $5 free credit/month, then ~$3-5/month  
**Time:** 2-5 minutes  

**Steps:**
1. Run `railway-setup.bat` (Windows) or `railway-setup.sh` (Mac/Linux)
2. Or follow [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md)
3. Done! Your API is live.

**Pros:**
- ✅ Easiest deployment
- ✅ Free tier available
- ✅ Auto-scaling
- ✅ Built-in PostgreSQL
- ✅ Great for demos

**Cons:**
- ⚠️ Can be more expensive at scale
- ⚠️ US/EU regions only

---

## ▲ Vercel (For Frontend)

**Perfect for:** Static frontend hosting  
**Cost:** Free  
**Time:** 1 minute  

**Steps:**
1. Push `frontend-manual/` folder to GitHub
2. Connect to Vercel
3. Set `API_URL` environment variable
4. Deploy!

**Pros:**
- ✅ Free forever
- ✅ Best performance (CDN)
- ✅ Perfect for frontend
- ✅ Auto-deployments

---

## 🐳 Docker + VPS

**Perfect for:** Full control, cost optimization  
**Cost:** $5-20/month (DigitalOcean, Hetzner)  
**Time:** 30-60 minutes  

**Files included:**
- `Dockerfile` (create if needed)
- `docker-compose.yml` (create if needed)

**Steps:**
```bash
# Build
docker build -t restaurant-autopilot .

# Run
docker run -p 3001:3001 \
  -e JWT_SECRET=your-secret \
  -e NODE_ENV=production \
  restaurant-autopilot
```

---

## 🔵 DigitalOcean App Platform

**Perfect for:** Managed hosting with good pricing  
**Cost:** $5/month (basic app)  
**Time:** 10 minutes  

**Steps:**
1. Connect GitHub repo
2. Select "Web Service"
3. Set environment variables
4. Deploy!

---

## ☁️ AWS / Google Cloud / Azure

**Perfect for:** Enterprise, high scale  
**Cost:** Variable (can be expensive)  
**Time:** 1-2 hours  

**Use when:**
- Need enterprise features
- High traffic expected
- Complex infrastructure
- Already using their services

---

## 📊 Recommended Setup

**For Demo/Client Presentation:**
- **Backend:** Railway ($0-5/month)
- **Frontend:** Vercel (Free)
- **Total:** ~$5/month

**For MVP/Startup:**
- **Backend:** Railway or DigitalOcean
- **Frontend:** Vercel
- **Database:** Railway PostgreSQL or Supabase
- **Total:** ~$10-20/month

**For Production/Scale:**
- **Backend:** AWS/GCP with load balancing
- **Frontend:** Vercel or Cloudflare
- **Database:** AWS RDS or managed PostgreSQL
- **Total:** ~$100-500/month

---

## 🎯 Quick Deploy Checklist

### Before Deploying:

- [ ] Set up GitHub repo
- [ ] Create `.env` file with secrets
- [ ] Test locally (`npm start`)
- [ ] Update `FRONTEND_URL` in backend
- [ ] Update `API_URL` in frontend

### Railway Deploy:

- [ ] Install Railway CLI (`npm i -g @railway/cli`)
- [ ] Run `railway-setup.bat`
- [ ] Set environment variables in dashboard
- [ ] Run `railway up`
- [ ] Test API endpoint

### Frontend Deploy (Vercel):

- [ ] Push frontend folder to GitHub
- [ ] Connect to Vercel
- [ ] Set `API_URL` environment variable
- [ ] Deploy
- [ ] Update backend `FRONTEND_URL` CORS

### Post-Deploy:

- [ ] Test login at frontend URL
- [ ] Verify API calls work
- [ ] Check CORS settings
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

---

## 🆘 Troubleshooting

**"CORS error"**
→ Update `FRONTEND_URL` in backend environment variables

**"Connection refused"**
→ Check backend is running, verify Railway URL

**"502 Bad Gateway"**
→ Backend crashed, check Railway logs

**"Build failed"**
→ Check `package.json` scripts, verify Node version

---

## 📞 Support

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Project README: [README.md](README.md)
- Railway deploy guide: [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md)

---

**Choose Railway for fastest demo deployment!** 🚂
