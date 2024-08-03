// PollComponent.jsx
import React from 'react';

// Componente para renderizar a enquete
const PollComponent = ({ pollName, pollOptions, allowMultipleAnswers }) => {
  // Estado para armazenar as respostas selecionadas
  const [selectedOptions, setSelectedOptions] = React.useState([]);

  // Função para manipular a seleção das opções
  const handleSelect = (localId) => {
    setSelectedOptions((prevSelected) => {
      if (allowMultipleAnswers) {
        // Se permitir múltiplas respostas
        if (prevSelected.includes(localId)) {
          return prevSelected.filter((id) => id !== localId);
        } else {
          return [...prevSelected, localId];
        }
      } else {
        // Se permitir apenas uma resposta
        return [localId];
      }
    });
  };

  // Função para enviar as respostas
  const handleVote = () => {
    if (selectedOptions.length > 0) {
      // Aqui você pode enviar a seleção para o servidor ou processar conforme necessário
      console.log(`Selecionado(s): ${selectedOptions.join(', ')}`);
    }
  };

  return (
    <div className="poll-container">
      <h3>{pollName}</h3>
      <div className="poll-options">
        {pollOptions.map((option) => (
          <div key={option.localId} className="poll-option">
            <input
              type={allowMultipleAnswers ? 'checkbox' : 'radio'}
              id={`option-${option.localId}`}
              name="poll"
              value={option.localId}
              checked={selectedOptions.includes(option.localId)}
              onChange={() => handleSelect(option.localId)}
            />
            <label htmlFor={`option-${option.localId}`}>{option.name}</label>
          </div>
        ))}
      </div>
      <button onClick={handleVote} disabled={selectedOptions.length === 0}>
        Votar
      </button>
    </div>
  );
};

export default PollComponent;
