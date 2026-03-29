/**
 * NVIDIA NIM AI Integration Module
 * Provides AI-powered assistance for TenantHub platform
 * Uses NVIDIA API for intelligent chat, business insights, and automation
 */

class NvidiaAIAssistant {
    constructor(options = {}) {
        this.apiKey = options.apiKey || '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';
        this.invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
        this.model = 'moonshotai/kimi-k2.5';
        this.stream = options.stream !== undefined ? options.stream : true;
        this.context = options.context || 'You are a helpful business assistant for TenantHub, a multi-tenant management platform. Help users with business management, tenant operations, analytics, and general inquiries.';
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
    }

    /**
     * Send a message to the AI and get a response
     * @param {string} message - User message
     * @param {object} options - Additional options
     * @returns {Promise<string>} AI response
     */
    async chat(message, options = {}) {
        const {
            temperature = 1.0,
            topP = 1.0,
            maxTokens = 16384,
            enableThinking = true,
            systemContext = this.context
        } = options;

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Keep history within limit
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }

        // Build messages array with system context
        const messages = [
            { role: 'system', content: systemContext },
            ...this.conversationHistory
        ];

        const payload = {
            model: this.model,
            messages: messages,
            max_tokens: maxTokens,
            temperature: temperature,
            top_p: topP,
            stream: this.stream,
            chat_template_kwargs: {
                thinking: enableThinking
            }
        };

        try {
            if (this.stream) {
                return await this._streamingRequest(payload);
            } else {
                return await this._nonStreamingRequest(payload);
            }
        } catch (error) {
            console.error('NVIDIA AI Error:', error);
            throw error;
        }
    }

    /**
     * Make streaming request to NVIDIA API
     */
    async _streamingRequest(payload) {
        const response = await fetch(this.invokeUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullResponse = '';
        let content = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) {
                            content += delta;
                            fullResponse += delta;
                            // Emit event for real-time updates
                            this._onChunk(content);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        // Add AI response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString()
        });

        return fullResponse;
    }

    /**
     * Make non-streaming request to NVIDIA API
     */
    async _nonStreamingRequest(payload) {
        const response = await fetch(this.invokeUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Add AI response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString()
        });

        return content;
    }

    /**
     * Handle streaming chunks (override in subclasses for UI updates)
     */
    _onChunk(content) {
        // Override this method to handle real-time updates
        // For example, update UI element with partial content
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Set system context
     */
    setContext(context) {
        this.context = context;
    }

    /**
     * Generate business insights
     */
    async generateInsights(data, type = 'general') {
        const prompt = `Analyze this business data and provide actionable insights:

Data Type: ${type}
Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Key observations
2. Trends and patterns
3. Recommendations for improvement
4. Potential risks or opportunities`;

        return await this.chat(prompt);
    }

    /**
     * Generate automated responses for common queries
     */
    async generateResponse(query, context = {}) {
        const prompt = `Generate a helpful response for this business query:

Query: "${query}"
Context: ${JSON.stringify(context)}

Provide a clear, professional, and actionable response.`;

        return await this.chat(prompt);
    }

    /**
     * Analyze sentiment in messages
     */
    async analyzeSentiment(text) {
        const prompt = `Analyze the sentiment of this text and provide a detailed assessment:

Text: "${text}"

Please provide:
1. Overall sentiment (positive/negative/neutral)
2. Confidence level
3. Key emotional indicators
4. Suggested response approach`;

        return await this.chat(prompt);
    }

    /**
     * Generate reports
     */
    async generateReport(data, reportType = 'summary') {
        const prompt = `Generate a ${reportType} report based on this data:

${JSON.stringify(data, null, 2)}

Structure the report with:
1. Executive Summary
2. Key Metrics
3. Analysis
4. Recommendations
5. Action Items`;

        return await this.chat(prompt);
    }
}

/**
 * AI Chat Widget for UI Integration
 */
class AIChatWidget {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.assistant = new NvidiaAIAssistant(options);
        this.isOpen = false;
        this.isLoading = false;
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('AI Chat Widget: Container not found');
            return;
        }

        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-chat-widget">
                <button class="ai-chat-toggle" onclick="aiChatWidget.toggle()">
                    <i class="fas fa-robot"></i>
                    <span class="ai-badge">AI</span>
                </button>
                
                <div class="ai-chat-panel" style="display: none;">
                    <div class="ai-chat-header">
                        <div class="ai-chat-title">
                            <i class="fas fa-robot"></i>
                            <span>AI Assistant</span>
                        </div>
                        <button class="ai-close" onclick="aiChatWidget.toggle()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="ai-chat-messages" id="ai-chat-messages">
                        <div class="ai-welcome-message">
                            <i class="fas fa-robot"></i>
                            <p>Hello! I'm your AI business assistant. How can I help you today?</p>
                        </div>
                    </div>
                    
                    <div class="ai-chat-input">
                        <input 
                            type="text" 
                            id="ai-message-input" 
                            placeholder="Type your message..."
                            onkeypress="aiChatWidget.handleKeyPress(event)"
                        />
                        <button class="ai-send-btn" onclick="aiChatWidget.sendMessage()" ${this.isLoading ? 'disabled' : ''}>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.id = 'ai-chat-styles';
        style.textContent = `
            .ai-chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }

            .ai-chat-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
                border: none;
                color: #0a0e1a;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
                transition: all 0.3s ease;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0, 255, 136, 0.6);
            }

            .ai-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff006e;
                color: white;
                font-size: 0.6rem;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                border: 2px solid #0a0e1a;
            }

            .ai-chat-panel {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                height: 550px;
                background: var(--bg-card, #13182e);
                border: 2px solid var(--border-color, #2a3555);
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .ai-chat-header {
                padding: 16px 20px;
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%);
                border-bottom: 1px solid var(--border-color, #2a3555);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-chat-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 700;
                color: var(--text-primary, #ffffff);
                font-size: 1.1rem;
            }

            .ai-chat-title i {
                color: var(--neon-green, #00ff88);
            }

            .ai-close {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: transparent;
                border: none;
                color: var(--text-secondary, #b4c6e7);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-close:hover {
                background: rgba(255, 56, 96, 0.2);
                color: var(--neon-red, #ff3860);
            }

            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .ai-welcome-message {
                text-align: center;
                padding: 20px;
                color: var(--text-secondary, #b4c6e7);
            }

            .ai-welcome-message i {
                font-size: 3rem;
                color: var(--neon-cyan, #00d4ff);
                margin-bottom: 10px;
            }

            .ai-message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 16px;
                line-height: 1.5;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .ai-message.user {
                align-self: flex-end;
                background: linear-gradient(135deg, var(--neon-green, #00ff88) 0%, var(--neon-cyan, #00d4ff) 100%);
                color: var(--bg-primary, #0a0e1a);
                border-bottom-right-radius: 4px;
            }

            .ai-message.assistant {
                align-self: flex-start;
                background: var(--bg-tertiary, #1a1f3a);
                color: var(--text-primary, #ffffff);
                border: 1px solid var(--border-color, #2a3555);
                border-bottom-left-radius: 4px;
            }

            .ai-message.thinking {
                opacity: 0.7;
                font-style: italic;
            }

            .ai-chat-input {
                padding: 16px;
                border-top: 1px solid var(--border-color, #2a3555);
                display: flex;
                gap: 10px;
            }

            .ai-chat-input input {
                flex: 1;
                padding: 12px 16px;
                background: var(--bg-input, #0d1120);
                border: 2px solid var(--border-color, #2a3555);
                border-radius: 12px;
                color: var(--text-primary, #ffffff);
                font-size: 0.9rem;
                outline: none;
                transition: all 0.3s ease;
            }

            .ai-chat-input input:focus {
                border-color: var(--neon-cyan, #00d4ff);
                box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
            }

            .ai-send-btn {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: linear-gradient(135deg, var(--neon-green, #00ff88) 0%, var(--neon-cyan, #00d4ff) 100%);
                border: none;
                color: var(--bg-primary, #0a0e1a);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-send-btn:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
            }

            .ai-send-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                background: var(--neon-cyan, #00d4ff);
                border-radius: 50%;
                animation: bounce 1.4s infinite ease-in-out;
            }

            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            /* Scrollbar styling */
            .ai-chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .ai-chat-messages::-webkit-scrollbar-track {
                background: var(--bg-input, #0d1120);
            }

            .ai-chat-messages::-webkit-scrollbar-thumb {
                background: var(--border-color, #2a3555);
                border-radius: 3px;
            }

            .ai-chat-messages::-webkit-scrollbar-thumb:hover {
                background: var(--neon-cyan, #00d4ff);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .ai-chat-panel {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 200px);
                    bottom: 90px;
                    right: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Event listeners are handled via inline onclick attributes
    }

    toggle() {
        const panel = this.container.querySelector('.ai-chat-panel');
        this.isOpen = !this.isOpen;
        panel.style.display = this.isOpen ? 'flex' : 'none';

        if (this.isOpen) {
            setTimeout(() => {
                const input = document.getElementById('ai-message-input');
                if (input) input.focus();
            }, 100);
        }
    }

    async sendMessage() {
        const input = document.getElementById('ai-message-input');
        const message = input?.value.trim();

        if (!message || this.isLoading) return;

        // Clear input
        input.value = '';

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Disable send button
        this.isLoading = true;
        this.updateSendButton();

        try {
            // Get AI response
            const response = await this.assistant.chat(message);

            // Remove typing indicator
            this.removeTypingIndicator();

            // Add AI response
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            console.error('AI Error:', error);
        } finally {
            this.isLoading = false;
            this.updateSendButton();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        // Remove welcome message if it exists
        const welcomeMsg = messagesContainer.querySelector('.ai-welcome-message');
        if (welcomeMsg) welcomeMsg.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        messageDiv.textContent = content;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        const indicator = document.createElement('div');
        indicator.className = 'ai-message assistant thinking';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    updateSendButton() {
        const btn = document.querySelector('.ai-send-btn');
        if (btn) {
            btn.disabled = this.isLoading;
        }
    }
}

// Global instance
let aiChatWidget;

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Auto-initialize if container exists
        const container = document.getElementById('ai-chat-container');
        if (container && !aiChatWidget) {
            aiChatWidget = new AIChatWidget('ai-chat-container');
        }
    });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NvidiaAIAssistant, AIChatWidget };
}
