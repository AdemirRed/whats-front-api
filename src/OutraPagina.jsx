import React, { useState, useEffect, useRef } from 'react';
import './OutraPagina.css'; // Arquivo de estilos
import { fetchContatos, fetchMensagens } from './apii';
import { isImage, isSticker, isAudio, isUnsupported } from './utils';

const OutraPagina = () => {
  const [contatos, setContatos] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50); // Limite inicial de mensagens
  const [totalMensagens, setTotalMensagens] = useState(0); // Armazenar a quantidade de mensagens
  const mensagensContainerRef = useRef(null); // Ref para o contêiner de mensagens
  const [scrollingToBottom, setScrollingToBottom] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      setError('Session ID não encontrado.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const contatosProcessados = await fetchContatos(sessionId);
        setContatos(contatosProcessados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchMensagensData = async (increaseLimit = false) => {
    if (!contatoSelecionado) return;

    const sessionId = localStorage.getItem('sessionId');
    const newLimit = increaseLimit ? limit + 100 : limit;

    if (!sessionId) {
      setError('Session ID não encontrado.');
      return;
    }

    try {
      const mensagensProcessadas = await fetchMensagens(sessionId, contatoSelecionado.id, newLimit, mensagens.length);
      setLimit(newLimit);
      setTotalMensagens(mensagensProcessadas.length); // Atualizar o total de mensagens

      if (increaseLimit) {
        setMensagens(prevMensagens => [...mensagensProcessadas, ...prevMensagens]);
      } else {
        setMensagens(mensagensProcessadas.reverse());
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (contatoSelecionado) {
      fetchMensagensData();
    }
  }, [contatoSelecionado]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (contatoSelecionado) {
        fetchMensagensData(); // Verificar novas mensagens a cada 10 segundos
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [contatoSelecionado]);

  useEffect(() => {
    if (mensagensContainerRef.current) {
      const container = mensagensContainerRef.current;
      if (scrollingToBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [mensagens, scrollingToBottom]);

  const handleContatoClick = (contato) => {
    setContatoSelecionado(contato);
    setMensagens([]);
    setLimit(50);
  };

  const sendMessage = async (messageContent) => {
    const sessionId = localStorage.getItem('sessionId');
    const chatId = contatoSelecionado?.id;

    if (!sessionId || !chatId) {
      setError('Session ID ou ID do chat não encontrado.');
      return;
    }

    try {
      await fetch(`/client/sendMessage/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          contentType: 'text',
          content: messageContent,
        }),
      });
    } catch (err) {
      setError('Erro ao enviar mensagem: ' + err.message);
    }
  };

  const handleEnvioMensagem = async () => {
    if (!mensagem.trim()) return;

    await sendMessage(mensagem);

    const novaMensagem = { body: mensagem, fromMe: true, type: 'chat', timestamp: new Date().toISOString() };
    setMensagens(prevMensagens => [novaMensagem, ...prevMensagens]);
    setMensagem('');
    setScrollingToBottom(true);
  };

  const handleScroll = () => {
    const container = mensagensContainerRef.current;
    const atBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    setScrollingToBottom(atBottom);
  };

  return (
    <div className="container">
      <div className="lista-contatos">
        <h2>Contatos</h2>
        {loading && <div className="barra-carregamento">Carregando...</div>}
        {error && <p className="error-message">{error}</p>}
        {!loading && contatos.length > 0 ? (
          <div className="contatos-list">
            {contatos.map(contato => (
              <div
                key={contato.id}
                className={`contato ${contatoSelecionado?.id === contato.id ? 'ativo' : ''}`}
                onClick={() => handleContatoClick(contato)}
              >
                <div className="contato-info">
                  <h3>{contato.isGroup ? `Grupo: ${contato.name}` : `Contato: ${contato.name}`}</h3>
                  <p>Última Mensagem: {contato.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>Nenhum contato encontrado.</p>
        )}
      </div>
      <div className="chat">
        {contatoSelecionado ? (
          <div className="chat-container">
            <h2 className="chat-header">{contatoSelecionado.name || 'Desconhecido'}</h2>
            <div className="mensagens" ref={mensagensContainerRef} onScroll={handleScroll}>
              {mensagens.map((msg, index) => (
                <div
                  key={index}
                  className={`mensagem ${msg.fromMe ? 'minha' : 'do-contato'}`}
                >
                  <div className="mensagem-header">
                    {msg.fromMe ? 'Você' : contatoSelecionado?.name}
                  </div>
                  <div className="mensagem-body">
                    {msg.type === 'chat' && <p>{msg.body}</p>}
                    {isImage(msg.media) && (
                      <img src={msg.media} alt="Imagem" className="mensagem-imagem" />
                    )}
                    {isSticker(msg.media) && (
                      <img src={msg.media} alt="Figurinha" className="mensagem-figurinha" />
                    )}
                    {isAudio(msg.media) && (
                      <audio controls>
                        <source src={msg.media} type="audio/mpeg" />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                    )}
                    {msg.type === 'poll_creation' && (
                      <p>Enquete criada: {msg.body}</p>
                    )}
                    {msg.type === 'revoked' && <p>Mensagem apagada</p>}
                    {isUnsupported(msg.type) && (
                      <p>Mensagem não suportada. Verifique no celular.</p>
                    )}
                  </div>
                  <div className="mensagem-footer">
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {mensagens.length >= limit && (
              <button onClick={() => fetchMensagensData(true)}>Carregar mais mensagens</button>
            )}
            <div className="campo-envio">
              <textarea
                rows="3"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
              />
              <div className="campo-envio-botoes">
                <button onClick={handleEnvioMensagem} disabled={!mensagem.trim()}>Enviar</button>
                <button className="anexar">📎</button>
                <button className="emoji">😊</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="imagem-aleatoria">
            <img src={`https://source.unsplash.com/random/300x300`} alt="Imagem aleatória" />
            <p>Selecione um contato para iniciar um chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutraPagina;
