# Fresh Khoj Setup - Ready for Work from Home

This directory contains a clean, working Khoj setup with DeepSeek API integration.

## 🚀 Quick Start

1. **Start Khoj**: 
   ```bash
   docker-compose up -d
   ```

2. **Access Khoj**: 
   - Web Interface: http://localhost:42110/
   - Admin Panel: http://localhost:42110/server/admin
   - Settings: http://localhost:42110/settings

3. **Test the setup**:
   ```bash
   docker exec khoj-fresh-server-1 curl -f http://127.0.0.1:42110/api/health
   ```

## ✅ What's Configured

- **AI Model**: DeepSeek Chat (deepseek-chat)
- **API Key**: Configured in docker-compose.yml
- **Anonymous Mode**: Enabled for easy testing
- **Database**: PostgreSQL with pgvector
- **Search**: SearxNG integration
- **Sandbox**: Terrarium for code execution

## 🔧 Files Included

- `docker-compose.yml` - Main Docker configuration
- `README.md` - This setup guide

## 🏠 Work from Home Ready

This setup is optimized for remote work with:
- Simple Docker deployment
- No complex configurations
- Anonymous mode enabled
- All services containerized

Enjoy your AI assistant! 🎉