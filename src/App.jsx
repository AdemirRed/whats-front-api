// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSession } from './SessionContext'; // Importe o contexto
import './App.css';

const App = () => {
  const [sessionId, setSessionId] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSessionId: setGlobalSessionId } = useSession(); // Obtenha a função para definir o sessionId global

  useEffect(() => {
    // Verifica o sessionId ao iniciar o componente
    const checkSessionOnLoad = async () => {
      const storedSessionId = localStorage.getItem('sessionId');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        const sessionExists = await checkSessionStatus(storedSessionId);
        if (sessionExists) {
          navigate('/outra-pagina');
        } else {
          // Se a sessão não estiver conectada, limpe o localStorage e exiba um erro
          localStorage.removeItem('sessionId');
          setError('Sessão expirada ou inválida. Por favor, crie uma nova sessão.');
        }
      }
    };
    checkSessionOnLoad();
  }, [navigate]);

  const handleSessionIdChange = (e) => {
    setSessionId(e.target.value);
  };

  const checkSessionStatus = async (id) => {
    try {
      const response = await axios.get(`/session/status/${id}`);
      if (response.data.success && response.data.state === 'CONNECTED') {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao verificar o status da sessão:', err);
      return false;
    }
  };

  const startSession = async () => {
    try {
      const response = await axios.get(`/session/start/${sessionId}`);
      if (response.status === 200) {
        await generateQrCode();
      } else {
        setError(`Erro ao iniciar a sessão. Código de status: ${response.status}`);
      }
    } catch (err) {
      if (err.response && err.response.data.error && err.response.data.error.startsWith('Session already exists for:')) {
        const sessionExists = await checkSessionStatus(sessionId);
        if (!sessionExists) {
          await generateQrCode();
        }
      } else {
        console.error('Erro ao iniciar a sessão:', err.response ? err.response.data : err.message);
        setError(`Erro ao iniciar a sessão. Mensagem: ${err.response ? err.response.data.error : err.message}`);
      }
    }
  };

  const generateQrCode = async () => {
    try {
      // Gera a URL completa para a solicitação do QR Code
      const qrUrl = `http://redblackspy.ddns.net:200/session/qr/${sessionId}/image`;
      setQrImage(qrUrl);
      setError(null);

      // Verifica o status da sessão em um loop
      let sessionConnected = false;
      while (!sessionConnected) {
        sessionConnected = await checkSessionStatus(sessionId);
        if (!sessionConnected) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos antes de tentar novamente
        }
      }
    } catch (err) {
      console.error('Erro ao gerar o QR Code:', err);
      setError('Falha ao gerar o QR Code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Primeiro, tenta verificar o status da sessão
    const sessionExists = await checkSessionStatus(sessionId);

    if (!sessionExists) {
      // Se a sessão não estiver conectada, cria uma nova
      await startSession();
    }

    // Salve o sessionId no localStorage
    localStorage.setItem('sessionId', sessionId);

    // Defina o sessionId no contexto global
    setGlobalSessionId(sessionId);

    // Navegue para a outra página
    navigate('/outra-pagina');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className='texto-gradiente'>Obter QR Code do WhatsApp</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Digite o Session ID"
            value={sessionId}
            onChange={handleSessionIdChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : 'Obter QR Code'}
          </button>
        </form>
        {qrImage && <img className="qr-code-image" src={qrImage} alt="QR Code" />}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>
    </div>
  );
};

export default App;
