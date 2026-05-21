(function() {
  const SERVER_URL = "https://chatbot-empresas-production.up.railway.app";

  const styles = `
    #cb-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #185FA5; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: transform 0.2s;
    }
    #cb-btn:hover { transform: scale(1.1); }
    #cb-btn svg { width: 26px; height: 26px; fill: white; }
    #cb-box {
      position: fixed; bottom: 90px; right: 24px;
      width: 370px; height: 540px;
      background: white; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none; flex-direction: column;
      overflow: hidden; z-index: 9998;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #cb-box.open { display: flex; }
    #cb-header {
      background: #185FA5; padding: 14px 16px;
      display: flex; align-items: center; gap: 10px;
    }
    #cb-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #B5D4F4; display: flex; align-items: center;
      justify-content: center; font-weight: 600; font-size: 15px; color: #0C447C;
    }
    #cb-title { font-size: 14px; font-weight: 600; color: white; }
    #cb-status { font-size: 12px; color: #B5D4F4; display:flex; align-items:center; gap:4px; }
    #cb-dot { width:6px; height:6px; border-radius:50%; background:#9FE1CB; display:inline-block; }
    #cb-close {
      margin-left: auto; background: none; border: none;
      color: white; cursor: pointer; font-size: 20px; line-height: 1;
    }
    #cb-msgs {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 8px;
      background: #f8f9fa;
    }
    .cb-bubble {
      max-width: 80%; padding: 9px 13px; border-radius: 14px;
      font-size: 13.5px; line-height: 1.5; word-wrap: break-word;
    }
    .cb-bubble.bot {
      background: white; color: #1a1a2e; align-self: flex-start;
      border-bottom-left-radius: 4px; border: 1px solid #e8e8e8;
    }
    .cb-bubble.user {
      background: #185FA5; color: white; align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .cb-typing {
      align-self: flex-start; background: white; border: 1px solid #e8e8e8;
      border-radius: 14px; border-bottom-left-radius: 4px;
      padding: 10px 14px; display: flex; gap: 4px; align-items: center;
    }
    .cb-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #aaa;
      animation: cb-bounce 1.2s infinite;
    }
    .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cb-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
    #cb-quick {
      display: flex; gap: 6px; flex-wrap: wrap;
      padding: 8px 12px; background: white; border-top: 1px solid #f0f0f0;
    }
    .cb-qbtn {
      font-size: 11.5px; padding: 4px 10px;
      border: 1px solid #185FA5; border-radius: 12px;
      background: transparent; color: #185FA5; cursor: pointer;
    }
    .cb-qbtn:hover { background: #E6F1FB; }
    #cb-input-area {
      padding: 10px 12px; background: white;
      border-top: 1px solid #f0f0f0;
      display: flex; gap: 8px; align-items: flex-end;
    }
    #cb-input {
      flex: 1; border: 1px solid #ddd; border-radius: 18px;
      padding: 8px 12px; font-size: 13px; resize: none;
      font-family: inherit; outline: none; max-height: 70px;
    }
    #cb-input:focus { border-color: #185FA5; }
    #cb-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: #185FA5; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #cb-send:hover { background: #0C447C; }
    #cb-send svg { width: 16px; height: 16px; fill: none; stroke: white; stroke-width: 2; }
    #cb-powered { text-align:center; font-size:10px; color:#bbb; padding:5px; background:white; }
  `;

  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);

  const empresa = window.ChatbotEmpresa || document.title || 'la empresa';

  document.body.insertAdjacentHTML('beforeend', `
    <button id="cb-btn" aria-label="Abrir chat">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <div id="cb-box">
      <div id="cb-header">
        <div id="cb-avatar">${empresa.charAt(0).toUpperCase()}</div>
        <div>
          <div id="cb-title">${empresa}</div>
          <div id="cb-status"><span id="cb-dot"></span> En línea</div>
        </div>
        <button id="cb-close" aria-label="Cerrar">&times;</button>
      </div>
      <div id="cb-msgs"></div>
      <div id="cb-quick">
        <button class="cb-qbtn" onclick="cbSendQuick('¿Cuáles son sus horarios?')">Horarios</button>
        <button class="cb-qbtn" onclick="cbSendQuick('¿Cuáles son sus servicios?')">Servicios</button>
        <button class="cb-qbtn" onclick="cbSendQuick('Quiero hablar con un agente')">Agente</button>
      </div>
      <div id="cb-input-area">
        <textarea id="cb-input" rows="1" placeholder="Escribe tu mensaje..."></textarea>
        <button id="cb-send" onclick="cbSend()">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div id="cb-powered">Powered by Claude AI</div>
    </div>
  `);

  let history = [];
  let loading = false;

  document.getElementById('cb-btn').onclick = () => {
    const box = document.getElementById('cb-box');
    box.classList.toggle('open');
    if (box.classList.contains('open') && history.length === 0) {
      setTimeout(() => cbAddBubble(`¡Hola! Soy el asistente de ${empresa}. ¿En qué puedo ayudarte?`, 'bot'), 400);
    }
  };
  document.getElementById('cb-close').onclick = () => {
    document.getElementById('cb-box').classList.remove('open');
  };

  function cbAddBubble(text, role) {
    const msgs = document.getElementById('cb-msgs');
    const b = document.createElement('div');
    b.className = 'cb-bubble ' + role;
    b.textContent = text;
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function cbShowTyping() {
    const msgs = document.getElementById('cb-msgs');
    const t = document.createElement('div');
    t.className = 'cb-typing'; t.id = 'cb-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function cbRemoveTyping() {
    const t = document.getElementById('cb-typing');
    if (t) t.remove();
  }

  window.cbSend = async function() {
    const input = document.getElementById('cb-input');
    const text = input.value.trim();
    if (!text || loading) return;
    input.value = '';
    loading = true;
    cbAddBubble(text, 'user');
    history.push({ role: 'user', content: text });
    cbShowTyping();
    try {
      const res = await fetch(`${SERVER_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, empresa })
      });
      const data = await res.json();
      cbRemoveTyping();
      const reply = data.reply || 'Error al obtener respuesta.';
      cbAddBubble(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
    } catch(e) {
      cbRemoveTyping();
      cbAddBubble('No pude conectarme. Intenta de nuevo.', 'bot');
    }
    loading = false;
  };

  window.cbSendQuick = function(text) {
    document.getElementById('cb-input').value = text;
    cbSend();
  };

  document.getElementById('cb-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cbSend(); }
  });
})();