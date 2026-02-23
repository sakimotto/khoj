# 🛠️ Troubleshooting Guide - Message Persistence & Chat History

## 🚨 Common Issues & Solutions

### Issue 1: Messages Disappear After Sending
**Problem**: Messages send but disappear immediately, no chat history builds

**Root Cause**: Frontend expects specific streaming format and conversation management

**Solution**: Enhanced mock server with proper message persistence format

### Issue 2: Chat History Not Building
**Problem**: Each message starts fresh conversation, no context maintained

**Root Cause**: Missing conversation ID tracking and message state management

**Solution**: Implement proper conversation flow with metadata

## 🔧 Technical Implementation

### Enhanced Message Format
The frontend expects messages in this format:
```json
{
  "type": "message",
  "data": "response text",
  "conversationId": "conv-123",
  "turnId": "turn-456"
}
```

### Streaming Response Structure
```
{"type": "status", "data": "Thinking..."}
{"type": "message", "data": "Hello"}
{"type": "message", "data": " World!"}
{"type": "metadata", "data": {"conversationId": "conv-123", "turnId": "turn-456"}}
{"type": "status", "data": "Completed"}
{"type": "status", "data": "[DONE]"}
```

### Message State Management
- **Local State**: Frontend maintains current conversation
- **Server State**: Mock server tracks conversation flow
- **Persistence**: Messages stored in memory during session
- **Recovery**: Fallback responses for API failures

## 🎯 Step-by-Step Fix

### 1. Check Service Status
```bash
# Check if mock server is running
curl http://localhost:42110/api/health

# Check if frontend is running
curl http://localhost:3000/api/health

# Check Docker services
docker ps -a
```

### 2. Test API Endpoints
```bash
# Test user endpoint
curl http://localhost:3000/api/v1/user

# Test chat sessions
curl http://localhost:3000/api/chat/sessions

# Test streaming chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Hello","stream":true}'
```

### 3. Check Browser Console
1. Open browser console (F12)
2. Check for JavaScript errors
3. Monitor network requests
4. Look for WebSocket connections

### 4. Verify Message Flow
1. **User Input** → ChatInputArea
2. **Message Send** → ChatBodyData
3. **API Request** → Mock Server
4. **Streaming Response** → Frontend
5. **Message Display** → ChatHistory
6. **State Update** → Local Storage

## 🚀 Advanced Debugging

### Enable Debug Logging
Modify mock-server.js to add detailed logging:
```javascript
// Add request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body) console.log('Body:', req.body);
    next();
});
```

### Monitor WebSocket Connections
Check if frontend is properly handling streaming:
```javascript
// In browser console
console.log('WebSocket state:', ws.readyState);
console.log('Message chunks received:', messageChunks);
```

### Test Message Persistence
```bash
# Send test message and monitor response
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Test message persistence","stream":true,"conversation_id":"test-conv-123"}'
```

## 📊 Performance Monitoring

### Check Response Times
```bash
# Measure API response time
time curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"q":"Performance test","stream":false}'
```

### Monitor Memory Usage
```bash
# Check Node.js process memory
ps aux | grep node

# Monitor Docker container resources
docker stats
```

## 🔍 Common Error Patterns

### Error: "Cannot read property 'forEach' of undefined"
**Solution**: Added proper chat sessions endpoint returning empty array

### Error: "Service Unavailable"
**Solution**: Ensure all services are running and ports are available

### Error: Messages disappear immediately
**Solution**: Implement proper streaming format with metadata

### Error: No conversation context
**Solution**: Add conversation ID and turn ID tracking

## 🎉 Success Indicators

✅ **Working System Signs:**
- Messages appear in chat interface
- AI responses stream in real-time
- Chat history persists during session
- Conversation context maintained
- No JavaScript errors in console
- API endpoints respond correctly

✅ **Expected Response Format:**
```
{"type": "status", "data": "Thinking..."}
{"type": "message", "data": "Hello! I'm working correctly."}
{"type": "metadata", "data": {"conversationId": "conv-123", "turnId": "turn-456"}}
{"type": "status", "data": "[DONE]"}
```

## 📞 Support Resources

- **GitHub Repository**: https://github.com/sakimotto/khoj
- **Documentation**: LOCAL_SETUP.md, WORK_FROM_HOME.md
- **Debug Files**: debug-auth.html, test-frontend.html
- **Test Scripts**: test-message.js

---

**🎯 When everything works:** Messages will persist, chat history will build, and you'll have a fully functional AI conversation system!