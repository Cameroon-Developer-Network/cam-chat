class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Set();
    this.statusHandlers = new Set();
    this.typingHandlers = new Set();
    this.presenceHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000; // Start with 1 second
    this.isConnecting = false;
  }

  connect(chatId) {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('No JWT token found');
      this.isConnecting = false;
      return;
    }

    const wsUrl = `${process.env.REACT_APP_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8080'}/ws/${chatId}?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          this.messageHandlers.forEach(handler => handler(data.payload));
          break;
        case 'status':
          this.statusHandlers.forEach(handler => handler(data.payload));
          break;
        case 'typing':
          this.typingHandlers.forEach(handler => handler(data.payload));
          break;
        case 'presence':
          this.presenceHandlers.forEach(handler => handler(data.payload));
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.isConnecting = false;
      this.attemptReconnect(chatId);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
    };
  }

  attemptReconnect(chatId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.connect(chatId);
        this.reconnectAttempts++;
        this.reconnectTimeout *= 2; // Exponential backoff
      }, this.reconnectTimeout);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.statusHandlers.clear();
    this.typingHandlers.clear();
    this.presenceHandlers.clear();
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  addStatusHandler(handler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  addTypingHandler(handler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  addPresenceHandler(handler) {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  sendMessage(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        payload: message,
      }));
    } else {
      console.error('WebSocket is not connected');
      throw new Error('WebSocket is not connected');
    }
  }

  sendTypingStatus(isTyping) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        payload: { isTyping },
      }));
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService(); 