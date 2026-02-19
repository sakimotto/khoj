# 🏠 Working from Home - Quick Setup Guide

## 🚀 Quick Start on Your Home PC

### 1. Clone the Repository
```bash
git clone https://github.com/sakimotto/khoj.git
cd khoj
```

### 2. Start Docker Services
```bash
# Start PostgreSQL, SearxNG, and Terrarium
docker-compose up -d
```

### 3. Start the Mock Server
```bash
# Start the enhanced mock server with DeepSeek AI
node mock-server.js
```

### 4. Start the Frontend
```bash
# In a new terminal, start the Next.js frontend
cd src/interface/web
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000/
- **Backend API**: http://localhost:42110/
- **Database**: PostgreSQL on port 5432
- **Search**: SearxNG on port 8080

## ✅ What's Working

- **Real AI Chat**: DeepSeek integration with streaming responses
- **Message History**: Proper chat history building and display
- **File Uploads**: Ready for document processing
- **Search Integration**: SearxNG metasearch engine
- **Anonymous Mode**: No login required for testing

## 🔧 Services Status

| Service | Port | Status |
|---------|------|---------|
| Frontend (Next.js) | 3000 | ✅ Running |
| Backend (Mock Server) | 42110 | ✅ Running |
| PostgreSQL | 5432 | ✅ Running |
| SearxNG Search | 8080 | ✅ Running |
| Terrarium | 8081 | ✅ Running |

## 🎯 Test the AI

Try these commands to test:

```bash
# Test user endpoint
curl http://localhost:42110/api/v1/user

# Test AI chat
curl -X POST http://localhost:42110/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Hello, how are you?","stream":false}'

# Test streaming chat
curl -X POST http://localhost:42110/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Tell me a story","stream":true}'
```

## 📁 Project Structure

```
khoj/
├── mock-server.js              # Enhanced backend with DeepSeek AI
├── docker-compose.yml          # Docker services
├── LOCAL_SETUP.md              # Complete setup documentation
├── ELESTIO_DEPLOYMENT.md       # Production deployment guide
├── src/interface/web/          # Next.js frontend
│   ├── app/                    # App router pages
│   ├── components/             # React components
│   └── common/                 # Shared utilities
└── [Docker containers]         # PostgreSQL, SearxNG, Terrarium
```

## 🚨 Troubleshooting

### If Frontend Shows "Service Unavailable"
1. Check if mock server is running: `node mock-server.js`
2. Check if frontend is running: `npm run dev` in `src/interface/web`
3. Check Docker services: `docker ps -a`

### If Messages Don't Display
1. Check browser console for errors
2. Verify API responses: http://localhost:3000/api/v1/user
3. Check mock server logs in terminal

### If AI Doesn't Respond
1. Check DeepSeek API key in mock-server.js
2. Test API directly: `curl http://localhost:42110/api/chat`
3. Check network tab in browser dev tools

## 🚀 Next Steps

1. **Test Extensively**: Try different types of questions
2. **Test File Uploads**: Upload documents when ready
3. **Customize AI**: Modify prompts in mock-server.js
4. **Add Features**: Implement additional API endpoints
5. **Deploy**: Follow ELESTIO_DEPLOYMENT.md for production

## 📞 Support

- **GitHub Issues**: https://github.com/sakimotto/khoj/issues
- **Documentation**: LOCAL_SETUP.md and ELESTIO_DEPLOYMENT.md
- **Debug Files**: debug-auth.html, test-frontend.html, test-message.js

---

**🎉 Enjoy your fully functional Khoj AI setup!**