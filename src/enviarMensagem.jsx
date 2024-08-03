import React, { useState } from 'react';
import axios from 'axios';

const EnviarMensagem = ({ sessionId, chatId, onMessageSent }) => {
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEnvioMensagem = async () => {
    if (!mensagem.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(`/client/sendMessage/${sessionId}`, {
        chatId: chatId,
        contentType: 'string', // Ajuste conforme necessário para o tipo de conteúdo
        content: mensagem,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}` // Ajuste conforme necessário para autenticação
        }
      });

      if (response.status === 200) {
        setMensagem('');
        setError(null);
        onMessageSent(); // Callback para atualizar o chat após o envio
      } else {
        setError('Erro ao enviar a mensagem');
      }
    } catch (err) {
      setError('Erro ao enviar a mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campo-envio">
      <textarea
        rows="3"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Digite uma mensagem..."
      />
      <div className="campo-envio-botoes">
        <button onClick={handleEnvioMensagem} disabled={loading || !mensagem.trim()}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
        <button className="anexar">📎</button>
        <button className="emoji">😊</button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default EnviarMensagem;
