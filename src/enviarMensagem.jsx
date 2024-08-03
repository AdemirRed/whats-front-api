import React, { useState } from 'react';
import axios from 'axios';
import './OutraPagina.css'; // Certifique-se de que o caminho do arquivo CSS está correto

const EnviarMensagem = ({ sessionId, numeroSelecionado, atualizarMensagens }) => {
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleEnvioMensagem = async () => {
    if (!mensagem.trim()) return;

    setEnviando(true);
    setErro(null);

    try {
      await axios.post(`/client/sendMessage/${sessionId}`, {
        chatId: numeroSelecionado,
        contentType: 'text',
        content: mensagem
      });
      setMensagem('');
      atualizarMensagens(); // Função para atualizar as mensagens após o envio
    } catch (error) {
      setErro('Erro ao enviar mensagem. Tente novamente.');
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="campo-envio">
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Digite uma mensagem..."
        rows="3"
      />
      <div className="campo-envio-botoes">
        <button onClick={handleEnvioMensagem} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      {erro && <p className="error-message">{erro}</p>}
    </div>
  );
};

export default EnviarMensagem;
