// api.js

export const fetchContatos = async (sessionId) => {
    try {
      const response = await fetch(`/client/getChats/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.chats) {
          return data.chats.map(chat => ({
            id: chat.id._serialized,
            name: chat.name || 'Sem nome',
            lastMessage: chat.lastMessage?.body || 'Sem mensagens',
            isGroup: chat.isGroup || false
          }));
        } else {
          throw new Error('O JSON não contém o campo "chats".');
        }
      } else {
        throw new Error('Falha ao obter contatos. Status: ' + response.status);
      }
    } catch (err) {
      throw new Error(`Erro ao obter contatos. Mensagem: ${err.message || 'Erro desconhecido'}`);
    }
  };
  
  export const fetchMensagens = async (sessionId, chatId, limit, offset) => {
    try {
      const response = await fetch(`/chat/fetchMessages/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          searchOptions: { limit, offset },
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.messages) {
          return data.messages.map(msg => ({
            body: msg.body,
            fromMe: msg.fromMe,
            timestamp: msg.timestamp,
            type: msg.type,
            media: msg.directPath || msg.deprecatedMms3Url, // URL da mídia
          }));
        } else {
          throw new Error('O JSON não contém o campo "messages".');
        }
      } else {
        throw new Error('Falha ao obter mensagens do chat. Status: ' + response.status);
      }
    } catch (err) {
      throw new Error(`Erro ao obter mensagens do chat. Mensagem: ${err.message || 'Erro desconhecido'}`);
    }
  };
  