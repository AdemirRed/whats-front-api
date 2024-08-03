// apii.js

// Função para formatar a mensagem
const formatarMensagem = (mensagem) => {
  if (!mensagem) return '';

  // Substituir negrito (**) por <strong>
  mensagem = mensagem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Substituir tachado (~~) por <del>
  mensagem = mensagem.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Substituir sublinhado (__) por <u>
  mensagem = mensagem.replace(/__(.*?)__/g, '<u>$1</u>');

  // Substituir texto em código (``) por <code>
  mensagem = mensagem.replace(/`(.*?)`/g, '<code>$1</code>');

  return mensagem;
};

export const downloadMedia = async (sessionId, chatId, messageId) => {
  try {
    const response = await fetch(`/message/downloadMedia/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, messageId }),
    });

    const result = await response.json();

    if (result.success) {
      const { mimetype, data } = result.messageMedia;
      let mediaUrl = '';

      // Converter dados base64 para uma URL
      if (data) {
        mediaUrl = `data:${mimetype};base64,${data}`;
      }

      return { url: mediaUrl, type: mimetype.includes('image') ? 'image' : 'sticker' };
    } else {
      throw new Error('Falha ao baixar mídia');
    }
  } catch (error) {
    console.error('Erro ao baixar mídia:', error);
    return { url: '', type: '' };
  }
};




// Função para buscar contatos
export const fetchContatos = async (sessionId) => {
  try {
    const response = await fetch(`/client/getChats/${sessionId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar contatos: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Contatos carregados:', data);
    return data.chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name || 'Sem nome',
      lastMessage: chat.lastMessage?.body || 'Sem mensagens',
      isGroup: chat.isGroup || false
    }));
  } catch (error) {
    console.error('Erro na requisição fetchContatos:', error);
    throw new Error(`Erro na requisição fetchContatos: ${error.message}`);
  }
};

// Função para buscar novos chats
export const fetchNovosChats = async (sessionId) => {
  try {
    const timestamp = new Date().getTime(); // Adiciona um timestamp único
    const response = await fetch(`/client/getChats/${sessionId}?_=${timestamp}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar novos chats');
    }
    const data = await response.json();
    console.log('Dados de novos chats:', data);
    if (Array.isArray(data.chats)) {
      return data.chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name || 'Sem nome',
        lastMessage: chat.lastMessage?.body || 'Sem mensagens',
        isGroup: chat.isGroup || false
      }));
    } else {
      throw new Error('O JSON não contém um array "chats".');
    }
  } catch (error) {
    console.error('Erro ao buscar novos chats:', error);
    throw new Error(`Erro ao buscar novos chats: ${error.message}`);
  }
};

// Função para buscar mensagens
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
        // Baixar mídias e formatar mensagens
        const mensagensComMidia = await Promise.all(data.messages.map(async (msg) => {
          let body = msg.body;

          // Verificar se é um poll creation
          if (msg.type === 'poll_creation') {
            body = `Poll criado: ${msg.pollName}<br>Opções: ${msg.pollOptions.map(option => option.name).join(', ')}`;
          }

          // Processar a mídia se presente
          let media = null;
          if (msg.directPath || msg.deprecatedMms3Url) {
            media = { url: msg.directPath || msg.deprecatedMms3Url, type: 'media' };
          } else if (msg.mediaUrl) {
            const mediaData = await downloadMedia(sessionId, msg.chatId, msg.messageId);
            media = { url: mediaData.url, type: mediaData.type };
          }

          return {
            body: formatarMensagem(body), // Aplicar a formatação
            fromMe: msg.fromMe,
            timestamp: msg.timestamp,
            type: msg.type,
            media: media
          };
        }));

        return mensagensComMidia;
      } else {
        throw new Error('O JSON não contém o campo "messages".');
      }
    } else {
      throw new Error(`Falha ao obter mensagens do chat. Status: ${response.status}`);
    }
  } catch (err) {
    throw new Error(`Erro ao obter mensagens do chat. Mensagem: ${err.message || 'Erro desconhecido'}`);
  }
};
