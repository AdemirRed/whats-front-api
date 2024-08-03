import React from 'react'; // Import necessário para usar React.Fragment

// Funções para verificar o tipo de mídia
export const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
export const isSticker = (url) => /\.webp$/i.test(url);
export const isAudio = (url) => /\.(mp3|wav)$/i.test(url);
export const isVideo = (url) => /\.(mp4|mov)$/i.test(url);
export const isUnsupported = (type) => !['chat', 'image', 'sticker', 'audio', 'poll_creation', 'revoked'].includes(type);

// Função para formatar o texto com quebras de linha
export const formatText = (text) => {
    if (!text) return text;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
};
