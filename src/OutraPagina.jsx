import React, { useState, useEffect } from 'react';
import './OutraPagina.css'; // Arquivo de estilos

const OutraPagina = () => {
  const [contatos, setContatos] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento

  useEffect(() => {
    const fetchContatos = async () => {
      try {
        console.log('Iniciando a requisição GET para contacts.json');
        const response = await fetch('/contacts.json'); // URL do arquivo JSON no diretório público
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dados recebidos', data);
          
          if (data.contacts) {
            const contatosProcessados = data.contacts.map(contato => ({
              id: contato.id._serialized,
              pushname: contato.pus
              
            }));
            setContatos(contatosProcessados);
            console.log('Contatos processados', contatosProcessados);
          } else {
            throw new Error('O JSON não contém o campo "contacts".');
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

  const handleContatoClick = (contato) => {
    setContatoSelecionado(contato);
  };

  return (
    <div className="container">
      <div className="lista-contatos">
        <h2>Contatos</h2>
        {loading && <p>Carregando contatos...</p>}
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
                  <h3>Nome: {contato.name || 'Desconhecido'}</h3>
                  <p>Nome Exibido: {contato.pushname || 'Desconhecido'}</p>
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
          <div>
            <h2>Chat com {contatoSelecionado.name || 'Desconhecido'}</h2>
            {/* Adicione a interface do chat aqui */}
          </div>
        ) : (
          <div className="imagem-aleatoria">
            <img
              src={`https://picsum.photos/1920/1080`}
              alt="Imagem aleatória"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutraPagina;
