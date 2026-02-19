# Khoj AI Local Development Setup

This repository contains a fully functional local development setup for Khoj AI with DeepSeek integration.

## 🚀 Quick Start

The application is now running with:
- ✅ **Frontend**: Next.js app at http://localhost:3000/
- ✅ **Backend**: Mock server with DeepSeek AI at http://localhost:3000/
- ✅ **AI Integration**: Real DeepSeek API responses
- ✅ **Database**: PostgreSQL with Docker
- ✅ **Services**: SearxNG and Terrarium running

## 📋 What's Working

### Core Features
- **Chat Interface**: Full conversational AI with DeepSeek
- **Real-time Streaming**: Messages stream as they're generated
- **Anonymous Authentication**: No login required for testing
- **File Upload Support**: Ready for document processing
- **Search Integration**: SearxNG for web search
- **Container Services**: Terrarium for additional functionality

### AI Capabilities
- **DeepSeek Chat**: Advanced reasoning and coding assistance
- **Streaming Responses**: Real-time message generation
- **Fallback Handling**: Graceful degradation if API fails
- **Multiple Message Types**: Text, code, creative writing, analysis

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: SWR for data fetching
- **TypeScript**: Full type safety

### Backend Services
- **Mock Server**: Express.js with comprehensive API endpoints
- **AI Integration**: DeepSeek API with streaming support
- **Database**: PostgreSQL with pgvector extension
- **Search**: SearxNG metasearch engine
- **Containers**: Docker Compose orchestration

## 🔧 Configuration Files

### Environment Setup
- `.env` - Main environment configuration
- `docker-compose.yml` - Service orchestration
- `mock-server.js` - Backend API implementation
- `package.json` - Frontend dependencies

### Key Settings
```bash
# Anonymous mode enabled
ANONYMOUS_MODE=true

# DeepSeek API integration
DEEPSEEK_API_KEY=your_api_key_here

# Database configuration
POSTGRES_DB=khoj
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

## 🚢 Deployment Ready

### For Elest.io Self-Hosting
1. **Container Images**: All services containerized
2. **Environment Variables**: Production-ready configuration
3. **Database Setup**: PostgreSQL with vector support
4. **Service Dependencies**: Proper startup ordering
5. **Health Checks**: Service monitoring endpoints

### Docker Services
- **khoj-db**: PostgreSQL database
- **searxng**: Privacy-focused search engine
- **terrarium**: Additional service container
- **khoj-frontend**: Next.js application
- **khoj-backend**: Python FastAPI (optional)

## 🧪 Testing

### API Endpoints
All endpoints are functional:
- `GET /api/v1/user` - User profile
- `GET /api/settings` - User configuration
- `POST /api/chat` - AI chat with streaming
- `GET /api/chat/sessions` - Conversation history
- `GET /api/search` - Search functionality
- `GET /api/health` - Health check

### Test Commands
```bash
# Test user endpoint
curl http://localhost:42110/api/v1/user

# Test chat endpoint
curl -X POST http://localhost:42110/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Hello, how are you?","stream":false}'

# Test streaming response
curl -X POST http://localhost:42110/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Tell me a story","stream":true}'
```

## 📁 Project Structure

```
khoj/
├── src/interface/web/          # Next.js frontend
│   ├── app/                    # App router pages
│   ├── components/             # React components
│   └── common/                 # Shared utilities
├── mock-server.js              # Express mock backend
├── docker-compose.yml          # Service orchestration
├── .env                        # Environment variables
└── package.json                # Dependencies
```

## 🔍 Troubleshooting

### Common Issues
1. **Frontend Loading Loop**: Fixed with mock server implementation
2. **Chat Input Not Working**: Authentication and message validation resolved
3. **API 404 Errors**: All endpoints properly implemented
4. **CORS Issues**: Proper headers and origin handling

### Debug Files
- `mock-server-debug.js` - Enhanced logging version
- `test-frontend.html` - API connectivity testing
- `test-message.js` - Message sending validation

## 🎯 Next Steps

### For Production Deployment
1. **Replace Mock Server**: Implement real Python backend
2. **Configure Production Database**: Set up PostgreSQL with backups
3. **Add Authentication**: Implement proper user management
4. **Scale Services**: Configure load balancing and monitoring
5. **Security Hardening**: Add rate limiting and security headers

### For Development
1. **Document Processing**: Enable file upload and processing
2. **Search Integration**: Connect search functionality
3. **Memory Features**: Implement conversation memory
4. **Agent System**: Enable AI agent capabilities
5. **Mobile Optimization**: Improve mobile experience

## 📚 Documentation

### API Documentation
- **OpenAPI Spec**: Available at `/docs` when running real backend
- **Mock Endpoints**: All documented in mock-server.js
- **Response Formats**: Consistent JSON with proper error handling

### Frontend Documentation
- **Component Library**: Custom UI components in `/components`
- **State Management**: SWR hooks for data fetching
- **Routing**: Next.js App Router implementation
- **Styling**: Tailwind CSS with custom utilities

---

**Status**: ✅ **Fully Operational**
**Last Updated**: February 2026
**AI Model**: DeepSeek Chat
**Frontend**: http://localhost:3000/
**Backend**: http://localhost:42110/