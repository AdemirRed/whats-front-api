// src/OutraPagina.jsx
import React, { useState, useEffect } from 'react';
import './OutraPagina.css'; // Arquivo de estilos

const OutraPagina = () => {
  const [contatos, setContatos] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [contatoDetalhes, setContatoDetalhes] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContatos = async () => {
      const sessionId = localStorage.getItem('sessionId');

      if (!sessionId) {
        setError('Session ID não encontrado.');
        setLoading(false);
        return;
      }

      try {
        console.log('Iniciando a requisição GET para /client/getChats/');
        const response = await fetch(`/client/getChats/${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dados recebidos', data);

          if (data.chats) {
            const contatosProcessados = data.chats.map(chat => ({
              id: chat.id._serialized,
              name: chat.name || 'Sem nome',
              lastMessage: chat.lastMessage?.body || 'Sem mensagens',
              isGroup: chat.isGroup || false
            }));
            setContatos(contatosProcessados);
            console.log('Contatos processados', contatosProcessados);
          } else {
            throw new Error('O JSON não contém o campo "chats".');
          }
        } else {
          throw new Error('Falha ao obter contatos. Status: ' + response.status);
        }
      } catch (err) {
        console.error('Erro ao obter contatos:', err.message || 'Erro desconhecido');
        setError(`Erro ao obter contatos. Mensagem: ${err.message || 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContatos();
  }, []);

  useEffect(() => {
    const fetchContatoDetalhes = async () => {
      if (!contatoSelecionado) return;

      const sessionId = localStorage.getItem('sessionId');

      if (!sessionId) {
        setError('Session ID não encontrado.');
        return;
      }

      try {
        console.log(`Iniciando a requisição POST para /client/getChatById/${sessionId}`);
        const response = await fetch(`/client/getChatById/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId: contatoSelecionado.id })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Detalhes do contato recebidos', data);
          setContatoDetalhes(data.chat);
          setMensagens([data.chat.lastMessage]); // Aqui estamos assumindo que a última mensagem é a única para simplicidade
        } else {
          throw new Error('Falha ao obter detalhes do contato. Status: ' + response.status);
        }
      } catch (err) {
        console.error('Erro ao obter detalhes do contato:', err.message || 'Erro desconhecido');
        setError(`Erro ao obter detalhes do contato. Mensagem: ${err.message || 'Erro desconhecido'}`);
      }
    };

    fetchContatoDetalhes();
  }, [contatoSelecionado]);

  const handleContatoClick = (contato) => {
    setContatoSelecionado(contato);
  };

  const handleEnvioMensagem = async () => {
    if (!mensagem.trim()) return;

    // Simulação de envio de mensagem
    setMensagens([...mensagens, { body: mensagem, fromMe: true }]);
    setMensagem('');
  };

  return (
    <div className="container">
      <div className="lista-contatos">
        <h2>Contatos</h2>
        {loading && (
          <div className="barra-carregamento">
            {/* A barra de carregamento é visível enquanto `loading` é verdadeiro */}
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && contatos.length > 0 ? (
          <div className="contatos-list">
            {contatos.map(contato => (
              <div
                key={contato.id}
                className={`contato ${contatoSelecionado?.id === contato.id ? 'ativo' : ''}`}
                onClick={() => handleContatoClick(contato)}
              >
                <div className="contato-info">
                  <h3>{contato.isGroup ? `Nome do Grupo: ${contato.name}` : `Nome do Contato: ${contato.name}`}</h3>
                  <p>Última Mensagem: {contato.lastMessage}</p>
                  <p>ID Serializado: {contato.id}</p>
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
            <div className="mensagens">
              {mensagens.map((msg, index) => (
                <div
                  key={index}
                  className={`mensagem ${msg.fromMe ? 'minha' : 'do-contato'}`}
                >
                  {msg.body}
                </div>
              ))}
            </div>
            <div className="campo-envio">
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
              />
              <button onClick={handleEnvioMensagem}>Enviar</button>
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
