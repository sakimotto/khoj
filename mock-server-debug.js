// Enhanced mock server with detailed logging for debugging
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 42110;

// Enable detailed CORS and request logging
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// DeepSeek API configuration
const DEEPSEEK_API_KEY = 'sk-b85b8d6099c640e6ac414b85d0781fda';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Mock user data for anonymous mode
app.get('/api/v1/user', (req, res) => {
    console.log('User endpoint called - returning anonymous user data');
    res.json({
        email: "anonymous@localhost",
        username: "Anonymous User",
        photo: null,
        is_active: true,
        has_documents: false,
        detail: "Anonymous user for testing",
        khoj_version: "2.0.0-beta.24"
    });
});

// Mock user configuration
app.get('/api/settings', (req, res) => {
    console.log('Settings endpoint called');
    res.json({
        username: "Anonymous User",
        user_photo: null,
        is_active: true,
        given_name: "Anonymous",
        phone_number: "",
        is_phone_number_verified: false,
        enabled_content_source: {
            computer: false,
            github: false,
            notion: false
        },
        has_documents: false,
        notion_token: null,
        enable_memory: false,
        server_memory_mode: "disabled",
        search_model_options: [],
        selected_search_model_config: 0,
        chat_model_options: [
            {
                id: 1,
                name: "DeepSeek Chat",
                tier: "free",
                description: "DeepSeek AI model",
                strengths: "Advanced reasoning and coding"
            }
        ],
        selected_chat_model_config: 1,
        paint_model_options: [],
        selected_paint_model_config: 0,
        voice_model_options: [],
        selected_voice_model_config: 0,
        subscription_state: "trial",
        subscription_renewal_date: null,
        subscription_enabled_trial_at: new Date().toISOString(),
        billing_enabled: false,
        is_eleven_labs_enabled: false,
        is_twilio_enabled: false,
        khoj_version: "2.0.0-beta.24",
        anonymous_mode: true,
        notion_oauth_url: "",
        detail: "Anonymous user configuration",
        length_of_free_trial: 30
    });
});

// Mock chat model options
app.get('/api/model/chat/options', (req, res) => {
    console.log('Chat model options endpoint called');
    res.json([
        {
            id: 1,
            name: "DeepSeek Chat",
            tier: "free",
            description: "DeepSeek AI model",
            strengths: "Advanced reasoning and coding"
        }
    ]);
});

// Mock chat history
app.get('/api/chat/history', (req, res) => {
    console.log('Chat history endpoint called');
    res.json({
        conversation_id: "test-conv-123",
        chat_history: []
    });
});

// Mock chat options
app.get('/api/chat/options', (req, res) => {
    console.log('Chat options endpoint called');
    res.json({
        conversation_starters: [
            "What can you help me with?",
            "Tell me about yourself",
            "How do I get started?"
        ]
    });
});

// Mock chat sessions endpoint (fixes 404 error and TypeError)
app.get('/api/chat/sessions', (req, res) => {
    console.log('Chat sessions endpoint called - returning empty array');
    res.json([]);
});

// Mock create new conversation endpoint
app.post('/api/chat/sessions', (req, res) => {
    console.log('Create chat session endpoint called with body:', req.body);
    res.json({
        conversation_id: "new-conv-" + Date.now(),
        slug: "new-conversation",
        title: "New Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
});

// Real AI chat endpoint with DeepSeek integration
app.post('/api/chat', async (req, res) => {
    const { q, stream, conversation_id } = req.body;
    console.log(`Chat endpoint called - message: "${q}", stream: ${stream}`);
    
    if (!q) {
        console.log('ERROR: No message content provided');
        return res.status(400).json({ error: 'Missing question parameter' });
    }

    try {
        if (stream === true) {
            // Handle streaming response from DeepSeek
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            console.log('Starting streaming response from DeepSeek...');
            
            const response = await axios.post(DEEPSEEK_API_URL, {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are Khoj, a helpful AI assistant. Respond in a friendly and informative way."
                    },
                    {
                        role: "user",
                        content: q
                    }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            });

            // Stream the response to the client
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            res.write('data: [DONE]\n\n');
                        } else {
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content || '';
                                if (content) {
                                    res.write(`data: ${content} `);
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            });

            response.data.on('end', () => {
                console.log('Streaming response completed');
                res.end();
            });

            response.data.on('error', (error) => {
                console.error('Stream error:', error);
                res.write('data: [ERROR]\n\n');
                res.end();
            });

        } else {
            // Handle regular JSON response from DeepSeek
            console.log('Getting non-streaming response from DeepSeek...');
            
            const response = await axios.post(DEEPSEEK_API_URL, {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are Khoj, a helpful AI assistant. Respond in a friendly and informative way."
                    },
                    {
                        role: "user",
                        content: q
                    }
                ],
                stream: false,
                temperature: 0.7,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiResponse = response.data.choices[0].message.content;
            console.log('DeepSeek response:', aiResponse.substring(0, 100) + '...');
            
            res.json({
                response: aiResponse,
                conversation_id: conversation_id || "deepseek-conv-" + Date.now(),
                message_id: "deepseek-msg-" + Date.now()
            });
        }
    } catch (error) {
        console.error('DeepSeek API error:', error.response?.data || error.message);
        
        // Fallback to mock response if API fails
        const fallbackResponse = "I'm currently experiencing connectivity issues with the AI service. Please try again in a moment.";
        
        if (stream === true) {
            res.write(`data: ${fallbackResponse} `);
            res.write('data: [DONE]\n\n');
            res.end();
        } else {
            res.status(500).json({
                response: fallbackResponse,
                conversation_id: conversation_id || "error-conv-" + Date.now(),
                message_id: "error-msg-" + Date.now()
            });
        }
    }
});

// Mock search endpoint
app.get('/api/search', (req, res) => {
    console.log('Search endpoint called with query:', req.query.q);
    res.json({
        results: [],
        query: req.query.q || ""
    });
});

// Mock health check
app.get('/api/health', (req, res) => {
    console.log('Health check endpoint called');
    res.json({ status: 'healthy', ai_service: 'deepseek' });
});

// Serve static files (mock)
app.use('/static', express.static('public'));

console.log(`Khoj server with DeepSeek AI integration running on http://localhost:${PORT}`);
console.log('Available endpoints:');
console.log('  GET  /api/v1/user - User info');
console.log('  GET  /api/settings - User settings');
console.log('  POST /api/chat - AI chat endpoint (supports streaming with DeepSeek)');
console.log('  GET  /api/search - Search endpoint');
console.log('  GET  /api/health - Health check');
console.log('');
console.log('🤖 DeepSeek AI integration enabled!');
console.log('');
console.log('🔍 Debug mode enabled - all requests will be logged');

app.listen(PORT);