# 🍽️ Restaurant Autopilot Pro

Professional Restaurant Management & Review Automation Platform

## ✨ Features

- 📊 **Real-time Analytics Dashboard** - Monitor ratings, reviews, and trends
- 🤖 **AI-Powered Review Responses** - Automatic response generation
- 🔗 **Multi-Platform Integration** - Google Business Profile + Meta Business
- 📱 **Responsive Dark Material Design** - Beautiful, modern interface
- 🔐 **Secure Authentication** - JWT-based auth with role management
- 📈 **Sentiment Analysis** - Understand customer feedback at scale
- ⚡ **Fast & Scalable** - Production-ready architecture

## 🚂 Deploy to Railway (Production)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**1-Click Deploy:**
1. Click button above or go to [Railway.app](https://railway.app)
2. Connect your GitHub repo
3. Railway auto-detects and deploys!
4. Set environment variables (see `RAILWAY-DEPLOY.md`)

**Your API will be live in 2 minutes!**

See [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md) for detailed instructions.

---

## 🚀 Quick Start (Demo Mode)

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd restaurant-autopilot-pro

# Install all dependencies
npm run install:all

# Start development servers (backend + frontend)
npm run dev
```

### Demo Login
- Email: `demo@restaurant.com`
- Password: `demo123`

The app will open at `http://localhost:3000`
API runs at `http://localhost:3001`

## 📦 Project Structure

```
restaurant-autopilot-pro/
├── backend/           # Express API server
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth & validation
│   └── server.js     # Main server file
├── frontend/          # React + Material-UI app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API clients
│   │   └── theme.js     # Dark Material theme
└── package.json
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` in the backend folder and configure:

```env
# Google Business Profile API
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Meta Business API
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret

# OpenAI API (for AI responses)
OPENAI_API_KEY=your-api-key
```

**Note:** Demo mode works without these - sample data is included!

## 🎨 Design System

- **Theme:** Material Design 3 (Dark Mode)
- **Color Scheme:** Black background with accent colors
- **Typography:** Roboto font family
- **Components:** Material-UI (MUI) v5

## 🔐 Security Features

- JWT authentication with 7-day expiry
- Helmet.js security headers
- Rate limiting (100 req/15min)
- CORS protection
- Input validation
- XSS protection

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Business
- `GET /api/business` - Get business info
- `PUT /api/business` - Update business
- `GET /api/business/google/status` - Google connection status
- `GET /api/business/meta/status` - Meta connection status

### Reviews
- `GET /api/reviews` - List all reviews (with filters)
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews/:id/respond` - Respond to review
- `DELETE /api/reviews/:id/respond` - Delete response

### Analytics
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/ratings` - Rating distribution
- `GET /api/analytics/trends` - Review trends over time
- `GET /api/analytics/platforms` - Platform comparison

### AI
- `POST /api/ai/generate-response` - Generate AI review response
- `GET /api/ai/suggestions` - Get response templates
- `POST /api/ai/analyze-sentiment` - Analyze review sentiment

## 🧪 Testing

```bash
# Test backend API
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@restaurant.com","password":"demo123"}'
```

## 🚢 Production Deployment

### Backend
```bash
cd backend
npm install
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build/ folder with nginx or any static host
```

## 📝 License

MIT License - See LICENSE file for details

## 💡 Support

For issues or questions, please contact support.

---

**Built with ❤️ for Restaurant Owners**
