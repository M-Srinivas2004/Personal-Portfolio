/**
 * NexaAI - Intelligent Web Workspace & AI Developer Assistant
 * Full Application Script with Dual Engine (Gemini API + Offline Dev Engine),
 * Live Code Sandbox, Prompt Library, and Session Persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let sessions = JSON.parse(localStorage.getItem('nexa_sessions')) || [];
  let currentSessionId = localStorage.getItem('nexa_current_session') || null;
  let apiKey = localStorage.getItem('nexa_gemini_key') || '';
  let selectedModel = localStorage.getItem('nexa_model') || 'gemini-1.5-flash';
  let activeTheme = localStorage.getItem('nexa_theme') || 'dark';

  // --- DOM Elements ---
  const html = document.documentElement;
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const btnNewChat = document.getElementById('btnNewChat');
  const sessionsList = document.getElementById('sessionsList');
  const messagesContainer = document.getElementById('messagesContainer');
  const promptInput = document.getElementById('promptInput');
  const btnSend = document.getElementById('btnSend');
  const engineStatusText = document.getElementById('engineStatusText');
  const engineStatusDot = document.getElementById('engineStatusDot');
  
  // Sandbox Elements
  const sandboxPane = document.getElementById('sandboxPane');
  const toggleSandboxBtn = document.getElementById('toggleSandboxBtn');
  const closeSandboxBtn = document.getElementById('closeSandboxBtn');
  const sandboxIframe = document.getElementById('sandboxIframe');
  const sandboxEmpty = document.getElementById('sandboxEmpty');
  const refreshSandboxBtn = document.getElementById('refreshSandboxBtn');

  // Modals
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const modelSelect = document.getElementById('modelSelect');

  const promptModal = document.getElementById('promptModal');
  const openPromptsBtn = document.getElementById('openPromptsBtn');
  const closePromptsBtn = document.getElementById('closePromptsBtn');
  const promptModalGrid = document.getElementById('promptModalGrid');
  const exportChatBtn = document.getElementById('exportChatBtn');

  let currentSandboxCode = '';

  // --- 1. Initialization ---
  setTheme(activeTheme);
  updateEngineStatus();
  initSessions();
  renderPromptLibrary();

  // --- 2. Theme Handling ---
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('nexa_theme', theme);
    activeTheme = theme;
  }

  themeToggleBtn.addEventListener('click', () => {
    setTheme(activeTheme === 'dark' ? 'light' : 'dark');
  });

  // --- 3. Sidebar Navigation ---
  function toggleSidebar() {
    sidebar.classList.toggle('closed');
  }

  if (toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('closed'));

  // --- 4. Sandbox Toggling & Runner ---
  function toggleSandbox(show = null) {
    if (show === true) {
      sandboxPane.classList.remove('closed');
    } else if (show === false) {
      sandboxPane.classList.add('closed');
    } else {
      sandboxPane.classList.toggle('closed');
    }
  }

  if (toggleSandboxBtn) toggleSandboxBtn.addEventListener('click', () => toggleSandbox());
  if (closeSandboxBtn) closeSandboxBtn.addEventListener('click', () => toggleSandbox(false));

  function runInSandbox(code) {
    currentSandboxCode = code;
    toggleSandbox(true);
    sandboxEmpty.style.display = 'none';
    sandboxIframe.style.display = 'block';

    // Build standalone HTML preview with modern styles
    let completeHtml = code;
    if (!code.toLowerCase().includes('<html')) {
      completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 1.5rem; background: #0b0f19; color: #f8fafc; }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
    }

    sandboxIframe.srcdoc = completeHtml;
  }

  if (refreshSandboxBtn) {
    refreshSandboxBtn.addEventListener('click', () => {
      if (currentSandboxCode) runInSandbox(currentSandboxCode);
    });
  }

  // --- 5. Engine Status ---
  function updateEngineStatus() {
    if (apiKey && apiKey.trim().length > 10) {
      engineStatusText.textContent = 'Gemini Live API';
      engineStatusDot.style.backgroundColor = '#10b981';
      engineStatusDot.style.boxShadow = '0 0 8px #10b981';
    } else {
      engineStatusText.textContent = 'Offline Dev Engine';
      engineStatusDot.style.backgroundColor = '#3b82f6';
      engineStatusDot.style.boxShadow = '0 0 8px #3b82f6';
    }
  }

  // --- 6. Session Management ---
  function initSessions() {
    if (sessions.length === 0) {
      createNewSession();
    } else {
      if (!currentSessionId || !sessions.find(s => s.id === currentSessionId)) {
        currentSessionId = sessions[0].id;
      }
      renderSessionsList();
      renderCurrentSessionMessages();
    }
  }

  function createNewSession() {
    const newSession = {
      id: 'session_' + Date.now(),
      title: 'New Dev Session',
      createdAt: new Date().toISOString(),
      messages: []
    };
    sessions.unshift(newSession);
    currentSessionId = newSession.id;
    saveSessions();
    renderSessionsList();
    renderCurrentSessionMessages();
  }

  function saveSessions() {
    localStorage.setItem('nexa_sessions', JSON.stringify(sessions));
    localStorage.setItem('nexa_current_session', currentSessionId);
  }

  function renderSessionsList() {
    sessionsList.innerHTML = '';
    sessions.forEach(session => {
      const item = document.createElement('div');
      item.className = `session-item ${session.id === currentSessionId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="session-title-wrap">
          <i class="fa-regular fa-message"></i>
          <span>${escapeHtml(session.title)}</span>
        </div>
        <button class="session-del-btn" title="Delete Chat" data-id="${session.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.session-del-btn')) return;
        currentSessionId = session.id;
        saveSessions();
        renderSessionsList();
        renderCurrentSessionMessages();
      });

      const delBtn = item.querySelector('.session-del-btn');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSession(session.id);
      });

      sessionsList.appendChild(item);
    });
  }

  function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    if (sessions.length === 0) {
      createNewSession();
    } else {
      if (currentSessionId === id) {
        currentSessionId = sessions[0].id;
      }
      saveSessions();
      renderSessionsList();
      renderCurrentSessionMessages();
    }
  }

  btnNewChat.addEventListener('click', createNewSession);

  // --- 7. Render Messages & Welcome Screen ---
  function getCurrentSession() {
    return sessions.find(s => s.id === currentSessionId);
  }

  function renderCurrentSessionMessages() {
    messagesContainer.innerHTML = '';
    const session = getCurrentSession();
    if (!session || session.messages.length === 0) {
      renderWelcomeScreen();
      return;
    }

    session.messages.forEach(msg => {
      appendMessageToDOM(msg.role, msg.content, msg.time, false);
    });

    scrollToBottom();
  }

  function renderWelcomeScreen() {
    const welcome = document.createElement('div');
    welcome.className = 'welcome-hero';
    welcome.innerHTML = `
      <div class="welcome-badge">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI-Accelerated Web Engineering</span>
      </div>
      <h2 class="welcome-title">Welcome to <span class="highlight-ai">NexaAI</span> Workspace</h2>
      <p class="welcome-desc">
        Your intelligent pair-programming environment engineered with modern web standards, code generation, and prompt engineering tools.
      </p>

      <div class="quick-prompts-grid">
        <div class="quick-prompt-card" data-prompt="Build a modern responsive navigation bar using HTML5, modern CSS flexbox, and vanilla JavaScript with dark mode toggle.">
          <i class="fa-brands fa-html5 qp-icon"></i>
          <div class="qp-info">
            <h4>Responsive Navbar</h4>
            <p>Generate clean HTML/CSS/JS with mobile drawer.</p>
          </div>
        </div>

        <div class="quick-prompt-card" data-prompt="Write a production-ready custom React Hook 'useFetchWithCache' with TypeScript types and cleanup handling.">
          <i class="fa-brands fa-react qp-icon"></i>
          <div class="qp-info">
            <h4>React Custom Hook</h4>
            <p>TypeScript, caching, and state management.</p>
          </div>
        </div>

        <div class="quick-prompt-card" data-prompt="Design a PostgreSQL relational schema for an e-commerce platform with users, products, orders, and index optimizations.">
          <i class="fa-solid fa-database qp-icon"></i>
          <div class="qp-info">
            <h4>PostgreSQL Schema</h4>
            <p>Tables, constraints, foreign keys, and indexes.</p>
          </div>
        </div>

        <div class="quick-prompt-card" data-prompt="Explain the JavaScript Event Loop (Call Stack, Task Queue, Microtask Queue) in simple visual terms with an example.">
          <i class="fa-solid fa-brain qp-icon"></i>
          <div class="qp-info">
            <h4>JS Event Loop Breakdown</h4>
            <p>Microtasks vs Macrotasks & execution order.</p>
          </div>
        </div>
      </div>
    `;

    welcome.querySelectorAll('.quick-prompt-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = card.getAttribute('data-prompt');
        promptInput.value = text;
        sendMessage();
      });
    });

    messagesContainer.appendChild(welcome);
  }

  function appendMessageToDOM(role, content, time = null, animate = true) {
    const isUser = role === 'user';
    const messageBubble = document.createElement('div');
    messageBubble.className = `message-bubble ${isUser ? 'user-message' : 'assistant-message'}`;

    const formattedTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageBubble.innerHTML = `
      <div class="message-avatar">
        <i class="${isUser ? 'fa-regular fa-user' : 'fa-solid fa-bolt'}"></i>
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-author">${isUser ? 'You' : 'NexaAI'}</span>
          <span class="message-time">${formattedTime}</span>
        </div>
        <div class="message-text">
          ${renderMarkdown(content)}
        </div>
      </div>
    `;

    // Attach click events for Copy Code & Run in Sandbox
    messageBubble.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeBlock = btn.closest('.code-block-wrapper').querySelector('pre code');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.innerText).then(() => {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
            setTimeout(() => btn.innerHTML = originalHtml, 2000);
          });
        }
      });
    });

    messageBubble.querySelectorAll('.btn-run-sandbox').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeBlock = btn.closest('.code-block-wrapper').querySelector('pre code');
        if (codeBlock) {
          runInSandbox(codeBlock.innerText);
        }
      });
    });

    messagesContainer.appendChild(messageBubble);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // --- 8. Message Submission & AI Execution ---
  async function sendMessage() {
    const text = promptInput.value.trim();
    if (!text) return;

    const session = getCurrentSession();
    if (!session) return;

    // First user message sets the session title
    if (session.messages.length === 0) {
      session.title = text.slice(0, 32) + (text.length > 32 ? '...' : '');
      renderSessionsList();
    }

    // Append User Message
    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    session.messages.push(userMsg);
    saveSessions();

    // Clear welcome hero if present
    const welcome = messagesContainer.querySelector('.welcome-hero');
    if (welcome) welcome.remove();

    appendMessageToDOM('user', userMsg.content, userMsg.time);

    promptInput.value = '';
    promptInput.style.height = 'auto';
    btnSend.disabled = true;

    // Show Typing Indicator
    const typingIndicator = showTypingIndicator();

    try {
      let aiResponseText = '';
      if (apiKey && apiKey.trim().length > 10) {
        aiResponseText = await callGeminiAPI(session.messages);
      } else {
        aiResponseText = await generateOfflineDevResponse(text);
      }

      typingIndicator.remove();

      // Append Assistant Message
      const assistantMsg = {
        role: 'assistant',
        content: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      session.messages.push(assistantMsg);
      saveSessions();

      appendMessageToDOM('assistant', assistantMsg.content, assistantMsg.time);
    } catch (err) {
      typingIndicator.remove();
      const errMsg = `⚠️ **Error generating response**: ${err.message || 'Check your network or API Key settings.'}`;
      appendMessageToDOM('assistant', errMsg);
    } finally {
      btnSend.disabled = false;
    }
  }

  btnSend.addEventListener('click', sendMessage);

  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize input
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
  });

  function showTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble assistant-message typing-indicator-bubble';
    bubble.innerHTML = `
      <div class="message-avatar">
        <i class="fa-solid fa-bolt"></i>
      </div>
      <div class="message-content">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  // --- 9. Live Gemini API Caller ---
  async function callGeminiAPI(conversation) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;

    // System instruction
    const systemPrompt = "You are NexaAI, an elite Full-Stack Web Developer and AI Engineer assistant created by Malladi Srinivas. You write clean, modern, efficient, and beautifully formatted code (HTML5, modern CSS, ES6+ JavaScript, React, Python, PostgreSQL). Format your answers using clear markdown and syntax-highlighted code blocks.";

    const contents = conversation.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const payload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP status ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    return candidate?.content?.parts?.[0]?.text || "No response text received from Gemini.";
  }

  // --- 10. Intelligent Offline Dev Engine ---
  async function generateOfflineDevResponse(query) {
    // Artificial latency for authentic assistant feel
    await new Promise(r => setTimeout(r, 600));

    const q = query.toLowerCase();

    // Check for HTML/Navbar/UI Card request
    if (q.includes('navbar') || q.includes('navigation') || q.includes('header')) {
      return `Here is a modern, responsive navigation bar featuring clean semantic HTML5, glassmorphism CSS, and smooth mobile hamburger drawer logic:

\`\`\`html
<nav class="preview-navbar">
  <div class="nav-brand">&lt;Nexa<span>AI</span>/&gt;</div>
  <ul class="nav-items" id="previewNavLinks">
    <li><a href="#" class="active">Overview</a></li>
    <li><a href="#">Capabilities</a></li>
    <li><a href="#">Docs</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <button class="nav-btn" onclick="alert('Action clicked!')">Deploy App</button>
</nav>

<style>
  .preview-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(17, 24, 39, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #fff;
  }
  .nav-brand { font-weight: 800; font-size: 1.25rem; }
  .nav-brand span { color: #3b82f6; }
  .nav-items { display: flex; list-style: none; gap: 1.5rem; margin: 0; padding: 0; }
  .nav-items a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
  .nav-items a:hover, .nav-items a.active { color: #38bdf8; }
  .nav-btn {
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    color: #fff;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
\`\`\`

> **Pro Tip**: Click the **Run in Sandbox** button on the code block above to preview this live in the Sandbox pane!`;
    }

    if (q.includes('react') || q.includes('hook')) {
      return `Here is a custom **React Hook** (\`useFetchWithCache\`) written with full TypeScript support, memory caching, and cleanup handling:

\`\`\`typescript
import { useState, useEffect, useRef } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const cache = new Map<string, any>();

export function useFetchWithCache<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: cache.get(url) || null,
    loading: !cache.has(url),
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (cache.has(url)) {
      setState({ data: cache.get(url), loading: false, error: null });
      return;
    }

    setState({ data: null, loading: true, error: null });

    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        const json = await response.json();
        cache.set(url, json);
        if (isMounted.current) {
          setState({ data: json, loading: false, error: null });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted.current) {
          setState({ data: null, loading: false, error: err });
        }
      }
    }

    fetchData();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [url]);

  return state;
}
\`\`\`

### Key Architectural Strengths:
1. **Module-level In-Memory Cache**: Eliminates redundant network calls for previously fetched endpoints.
2. **AbortController**: Gracefully aborts stale network requests when the component unmounts or the URL changes.
3. **Mounted Guard**: Prevents React memory leak warnings on unmounted states.`;
    }

    if (q.includes('sql') || q.includes('database') || q.includes('postgres')) {
      return `Here is a normalized, indexed **PostgreSQL** schema engineered for an e-commerce platform with high read concurrency:

\`\`\`sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')),
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
\`\`\`

### Schema Highlights:
- **UUID Primary Keys**: Prevents sequential ID enumeration attacks.
- **Data Integrity Constraints**: Enforces positive pricing and validated order statuses at the database layer.
- **B-Tree Indexes**: Placed on foreign keys and timestamps for fast joins and pagination.`;
    }

    if (q.includes('event loop') || q.includes('javascript')) {
      return `### Understanding the JavaScript Event Loop

JavaScript is **single-threaded**, meaning it executes one operation at a time on its single **Call Stack**. The Event Loop orchestrates asynchronous operations using three primary structures:

1. **Call Stack**: Executes synchronous code (LIFO: Last In, First Out).
2. **Microtask Queue** *(High Priority)*: \`Promise.then()\`, \`async/await\`, \`queueMicrotask()\`.
3. **Macrotask Queue (Task Queue)** *(Standard Priority)*: \`setTimeout\`, \`setInterval\`, DOM I/O events.

#### Execution Order Example:
\`\`\`javascript
console.log('1. Synchronous');

setTimeout(() => {
  console.log('2. Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Microtask (Promise)');
});

console.log('4. Synchronous');
\`\`\`

#### Output:
\`\`\`
1. Synchronous
4. Synchronous
3. Microtask (Promise)
2. Macrotask (setTimeout)
\`\`\`

> **Rule**: The Event Loop **always** empties the entire Microtask Queue before moving to the next Macrotask!`;
    }

    // Default intelligent developer response
    return `### NexaAI Dev Analysis

Thank you for your prompt: **"${escapeHtml(query)}"**.

I have analyzed your request based on modern full-stack web standards and AI integration practices:

\`\`\`javascript
// Solution Architecture Snippet
function optimizeWorkflow(developerInput) {
  const stack = ['HTML5/CSS3', 'React.js', 'Node.js', 'PostgreSQL', 'Gemini API'];
  return {
    status: 'Ready',
    architecture: 'Clean & Modular',
    recommendation: 'Use prompt-driven components with reactive state management'
  };
}
\`\`\`

### Recommendations:
1. **Frontend Architecture**: Ensure state is localized and responsive layouts utilize CSS Flexbox/Grid with mobile breakpoints.
2. **Backend Services**: Validate payloads via schemas (e.g., Zod) and maintain predictable JSON error formats.
3. **AI Enhancement**: Structure prompts with clear constraints, input schemas, and expected outputs.

*(Tip: You can add your Google Gemini API key in **Settings (⚙️)** to switch from this offline developer engine to live Gemini 1.5 model reasoning!)*`;
  }

  // --- 11. Markdown Parser ---
  function renderMarkdown(raw) {
    if (!raw) return '';

    // Code blocks with language
    let html = raw.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = (lang || 'code').trim();
      const escapedCode = escapeHtml(code.trim());
      const isRenderable = ['html', 'htm', 'css', 'javascript', 'js'].includes(language.toLowerCase());

      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span class="code-lang">${language}</span>
            <div class="code-actions">
              ${isRenderable ? `<button class="btn-code-action btn-run-sandbox"><i class="fa-solid fa-play"></i> <span>Run in Sandbox</span></button>` : ''}
              <button class="btn-code-action btn-copy-code"><i class="fa-regular fa-copy"></i> <span>Copy</span></button>
            </div>
          </div>
          <pre><code>${escapedCode}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^>\s?(.*)$/gm, '<blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 1rem; color: var(--text-secondary); margin: 0.75rem 0;">$1</blockquote>');

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    return paragraphs.map(p => {
      p = p.trim();
      if (p.startsWith('<div class="code-block-wrapper"') || p.startsWith('<blockquote') || p.startsWith('<ul>') || p.startsWith('<ol>')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- 12. Prompt Library Modal ---
  function renderPromptLibrary() {
    if (typeof PROMPT_LIBRARY === 'undefined') return;
    promptModalGrid.innerHTML = '';
    PROMPT_LIBRARY.forEach(item => {
      const card = document.createElement('div');
      card.className = 'prompt-template-card';
      card.innerHTML = `
        <span class="pt-tag">${item.category}</span>
        <h4 class="pt-title"><i class="${item.icon}"></i> ${item.title}</h4>
        <p class="pt-desc">${item.desc}</p>
      `;

      card.addEventListener('click', () => {
        promptInput.value = item.prompt;
        promptInput.focus();
        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
        closeModal(promptModal);
      });

      promptModalGrid.appendChild(card);
    });
  }

  if (openPromptsBtn) openPromptsBtn.addEventListener('click', () => openModal(promptModal));
  if (closePromptsBtn) closePromptsBtn.addEventListener('click', () => closeModal(promptModal));

  // --- 13. Settings Modal ---
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      apiKeyInput.value = apiKey;
      modelSelect.value = selectedModel;
      openModal(settingsModal);
    });
  }

  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      apiKey = apiKeyInput.value.trim();
      selectedModel = modelSelect.value;
      localStorage.setItem('nexa_gemini_key', apiKey);
      localStorage.setItem('nexa_model', selectedModel);
      updateEngineStatus();
      closeModal(settingsModal);
    });
  }

  function openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target);
    }
  });

  // --- 14. Export Chat ---
  if (exportChatBtn) {
    exportChatBtn.addEventListener('click', () => {
      const session = getCurrentSession();
      if (!session || session.messages.length === 0) {
        alert('No messages to export in the current session.');
        return;
      }

      let markdown = `# ${session.title}\n*Exported from NexaAI Workspace on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
      session.messages.forEach(msg => {
        const author = msg.role === 'user' ? '### 👤 User' : '### 🤖 NexaAI';
        markdown += `${author} (${msg.time || ''})\n\n${msg.content}\n\n---\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
});
