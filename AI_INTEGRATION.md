# NVIDIA NIM AI Integration Guide

## Overview

TenantHub now includes **NVIDIA NIM AI** integration for intelligent business assistance. The AI can help with:

- Business management queries
- Tenant operations support
- Analytics insights
- Customer management advice
- Task and appointment optimization
- General platform assistance

---

## Features

### 1. AI Chat Widget

A floating chat widget is available on both **Admin** and **Tenant** dashboards.

**Location:** Bottom-right corner of the screen

**Features:**
- Real-time AI responses
- Conversation history
- Thinking mode enabled for detailed answers
- Streaming responses for better UX

### 2. Context-Aware Assistance

- **Admin Dashboard:** Platform management, tenant oversight, analytics
- **Tenant Dashboard:** Business operations, customer management, appointments

---

## Usage

### Opening the AI Chat

1. Click the **green robot icon** in the bottom-right corner
2. Type your question in the chat input
3. Press Enter or click the send button
4. Wait for the AI response (streaming in real-time)

### Example Queries

**For Tenants:**
- "How do I add a new customer?"
- "What's the best way to manage appointments?"
- "Can you help me understand my business analytics?"
- "How do I create and assign tasks?"

**For Admins:**
- "How do I create a new tenant?"
- "What are the platform-wide statistics?"
- "How can I optimize tenant engagement?"
- "Best practices for multi-tenant management?"

---

## Technical Implementation

### Files Added/Modified

1. **`nvidia-ai.js`** - Core AI module
   - `NvidiaAIAssistant` class - Backend communication
   - `AIChatWidget` class - UI component

2. **`server.js`** - Added AI proxy endpoint
   - `POST /api/ai/chat` - Server-side AI proxy

3. **`admin.html`** - Admin dashboard integration
4. **`tenant.html`** - Tenant dashboard integration

### API Configuration

**Model:** `moonshotai/kimi-k2.5`

**Endpoint:** `https://integrate.api.nvidia.com/v1/chat/completions`

**Parameters:**
- `max_tokens`: 16384
- `temperature`: 1.0
- `top_p`: 1.0
- `thinking`: true (enables reasoning)
- `stream`: true (real-time responses)

### Environment Variables (Optional)

For production, store your API key securely:

```bash
NVIDIA_API_KEY=nvapi-your-key-here
```

---

## Customization

### Change AI Context

Modify the context when initializing the widget:

```javascript
new AIChatWidget('ai-chat-container', {
    context: 'Your custom system prompt here...'
});
```

### Disable Streaming

```javascript
new AIChatWidget('ai-chat-container', {
    stream: false
});
```

### Adjust Conversation History

```javascript
const assistant = new NvidiaAIAssistant();
assistant.maxHistoryLength = 20; // Default: 10
```

---

## CSS Fixes Applied

### Black-on-Black Text Issues Fixed

1. **Admin Dashboard (`admin.html`)**
   - Body background and color now use CSS variables
   - Proper dark mode support added
   - Theme transition smoothing

2. **Tenant Dashboard (`tenant.html`)**
   - Body background and color now use CSS variables
   - Sidebar colors respect theme
   - Header colors respect theme
   - Proper dark mode support added

### Changes Made

```css
/* Before */
body {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    color: var(--gray-900);
}

/* After */
body {
    background: var(--bg-primary, linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%));
    color: var(--text-primary, #111827);
    transition: all 0.3s ease;
}

[data-theme="dark"] body {
    background: var(--bg-primary, #0a0e1a);
    color: var(--text-primary, #ffffff);
}
```

---

## Troubleshooting

### AI Chat Not Appearing

1. Ensure `nvidia-ai.js` is loaded
2. Check browser console for errors
3. Verify the `#ai-chat-container` div exists

### API Errors

1. Check API key validity
2. Verify network connectivity
3. Check browser console for error messages
4. Ensure CORS is properly configured

### Theme Issues

1. Clear browser cache
2. Check CSS variable definitions
3. Verify theme toggle functionality

---

## Security Notes

⚠️ **Important:** The API key is currently exposed in client-side code.

**For Production:**
1. Use the server-side proxy (`/api/ai/chat`)
2. Store API key in environment variables
3. Implement rate limiting
4. Add authentication checks

**Example Server Usage:**

```javascript
const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: 'Your question here',
        context: 'Optional custom context'
    })
});
```

---

## Performance Considerations

- **Streaming:** Enabled by default for better UX
- **History:** Limited to 10 messages (configurable)
- **Token Limit:** 16384 max tokens per response
- **Rate Limiting:** Consider implementing on server-side

---

## Future Enhancements

Potential improvements:

1. **Voice Input/Output** - Speech-to-text integration
2. **Multi-language Support** - Translate responses
3. **Custom Training** - Fine-tune for specific business types
4. **Analytics Integration** - AI-powered insights dashboard
5. **Automated Workflows** - AI-triggered actions
6. **Email Drafting** - AI-assisted email composition

---

## Support

For issues or questions:

1. Check browser console for errors
2. Review NVIDIA API documentation
3. Verify API key permissions
4. Contact TenantHub support

---

**Built with NVIDIA NIM API** 🚀

**Model:** MoonshotAI Kimi K2.5

**Documentation:** https://docs.nvidia.com/nim/
