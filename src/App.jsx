import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa o hook useNavigate
import './App.css';

const App = () => {
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Inicializa o hook de navegação

  const getQrCode = async () => {
    try {
      const response = await axios.get('/session/qr/fran/image', {
        headers: {
          'x-api-key': 'redblack',
          'accept': '*/*'
        },
        responseType: 'arraybuffer' // Espera um buffer de imagem
      });

      if (response.status === 200) {
        const data = response.data;
        const base64 = btoa(
          new Uint8Array(data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        // Ajusta a verificação de mensagem conforme necessário
        const responseText = new TextDecoder().decode(new Uint8Array(data));
        if (responseText.includes('qr code not ready or already scanned')) {
          setError('QR Code não está pronto ou já foi escaneado.');
          setQrImage(null);
          return; // Não navega para a próxima página
        }

        // Define a imagem do QR code e limpa o erro
        setQrImage(`data:image/png;base64,${base64}`);
        setError(null);

        // Navega para a próxima página somente quando o QR code for válido
        navigate('/outra-pagina');
      } else {
        setError(`Erro ao obter o QR code. Código de status: ${response.status}`);
        setQrImage(null);
      }
    } catch (err) {
      console.error('Erro detalhado:', err.response || err);
      setError(`Erro ao obter o QR code. Mensagem: ${err.response ? err.response.data.message : err.message}`);
      setQrImage(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className='texto-gradiente'>Obter QR Code do WhatsApp</h1>
        <button onClick={getQrCode}>Obter QR Code</button>
        {qrImage && <img src={qrImage} alt="QR Code" />}
        {error && <p>{error}</p>}
      </header>
    </div>
  );
};

export default App;
