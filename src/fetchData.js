import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configurações da URL e do caminho do arquivo
const url = 'http://192.168.0.200:200/client/getContacts/fran';
const filePath = path.join(process.cwd(), 'public', 'contacts.json'); // Ajuste para o diretório de trabalho atual

const fetchAndSaveContacts = async () => {
  try {
    const response = await axios.get(url, {
      headers: {
        'x-api-key': 'redblack',
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2), 'utf8');
      console.log(`Dados salvos com sucesso em ${filePath}`);
    } else {
      console.error(`Falha ao obter contatos. Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Erro ao obter contatos:', err.message || 'Erro desconhecido');
  }
};

fetchAndSaveContacts();
