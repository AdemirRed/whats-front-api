import React, { useState, useEffect, useRef } from 'react';
import './OutraPagina.css'; // Arquivo de estilos
import { fetchContatos, fetchMensagens, fetchNovosChats, downloadMedia } from './apii';
import EnviarMensagem from './enviarMensagem'; // Importar o componente de envio

// Função para formatar a mensagem
const formatarMensagem = (mensagem) => {
  // Substituir negrito
  let formatada = mensagem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Substituir tachado
  formatada = formatada.replace(/~~(.*?)~~/g, '<del>$1</del>');
  
  // Substituir sublinhado
  formatada = formatada.replace(/__(.*?)__/g, '<u>$1</u>');
  
  // Substituir texto em código
  formatada = formatada.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return formatada;
};

const Mensagem = ({ body, fromMe, media }) => {
  const mensagemFormatada = formatarMensagem(body);

  return (
    <div className={`mensagem ${fromMe ? 'minha' : 'do-contato'}`}>
      {media && media.url && (
        <div className="mensagem-media">
          <span className="media-label">
            {media.type === 'image' ? 'Imagem:' : 'Sticker:'}
          </span>
          <img src={media.url} alt={media.type === 'image' ? 'Imagem' : 'Sticker'} className="media" />
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: mensagemFormatada }} />
    </div>
  );
};


const OutraPagina = () => {
  const [contatos, setContatos] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [abaAtiva, setAbaAtiva] = useState('contatos');
  const mensagensContainerRef = useRef(null);
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
  
      // Atualizar o total de mensagens
      setTotalMensagens(mensagensProcessadas.length);
  
      // Fazer o download da mídia para as mensagens que possuem mídia
      const mensagensComMidia = await Promise.all(
        mensagensProcessadas.map(async (mensagem) => {
          if (mensagem.hasMedia) {
            const media = await downloadMedia(sessionId, contatoSelecionado.id, mensagem.id);
            return { ...mensagem, media };
          }
          return mensagem;
        })
      );
  
      if (increaseLimit) {
        // Adicionar novas mensagens no início da lista existente
        setMensagens(prevMensagens => {
          // Evitar duplicação de mensagens
          const novasMensagens = mensagensComMidia.filter(mensagem => 
            !prevMensagens.some(prevMensagem => prevMensagem.id === mensagem.id)
          );
          return [...novasMensagens, ...prevMensagens];
        });
      } else {
        // Atualizar com novas mensagens apenas
        setMensagens(mensagensComMidia.reverse());
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    const fetchChats = async () => {
      try {
        const novosChats = await fetchNovosChats(sessionId);
        setContatos(novosChats);
      } catch (err) {
        setError(err.message);
      }
    };

    const chatCheckInterval = setInterval(fetchChats, 10000);
    return () => clearInterval(chatCheckInterval);
  }, []);

  useEffect(() => {
    if (contatoSelecionado) {
      fetchMensagensData();
    }
  }, [contatoSelecionado]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (contatoSelecionado) {
        fetchMensagensData();
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

  const handleMessageSent = (novaMensagem) => {
    setMensagens(prevMensagens => [novaMensagem, ...prevMensagens]);
    fetchMensagensData();
  };

  const handleScroll = () => {
    const container = mensagensContainerRef.current;
    const atBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    setScrollingToBottom(atBottom);
  };

  const contatosFiltrados = contatos.filter(contato =>
    abaAtiva === 'contatos' ? !contato.isGroup : contato.isGroup
  );

  return (
    <div className="container">
      <div className="lista-contatos">
        <div className="header">
          <h2>{abaAtiva === 'contatos' ? 'Contatos' : 'Grupos'}</h2>
          <div className="header-actions">
            <button onClick={() => setAbaAtiva(abaAtiva === 'contatos' ? 'grupos' : 'contatos')}>
              {abaAtiva === 'contatos' ? 'Grupos' : 'Contatos'}
            </button>
            <button>⋮</button> 
          </div>
        </div>
        {loading && <div className="barra-carregamento">Carregando...</div>}
        {error && <p className="error-message">{error}</p>}
        {!loading && contatosFiltrados.length > 0 ? (
          <div className="contatos-list">
            {contatosFiltrados.map(contato => (
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
              {mensagens.map((msg, index) => {
                if (!msg || typeof msg !== 'object') return null;

                return (
                  <Mensagem key={index} body={msg.body} fromMe={msg.fromMe} media={msg.media} />
                );
              })}
            </div>
            {mensagens.length >= limit && (
              <button onClick={() => fetchMensagensData(true)}>Carregar mais mensagens</button>
            )}
            <EnviarMensagem
              sessionId={localStorage.getItem('sessionId')}
              chatId={contatoSelecionado.id}
              onMessageSent={handleMessageSent}
            />
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
