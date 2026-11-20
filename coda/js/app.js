import { getBooks, getAuthors, getReadings } from './store.js';

async function init() {
    try {
        const books = await getBooks();
        const authors = await getAuthors();
        const readings = await getReadings();

        const loadingMsg = document.getElementById('loading-msg');
        loadingMsg.textContent = 'Dados carregados com sucesso do localStorage / seed.json!';

        const statsList = document.getElementById('stats-list');
        statsList.innerHTML = `
            <li>Total de Autores: ${authors.length}</li>
            <li>Total de Livros: ${books.length}</li>
            <li>Total de Leituras: ${readings.length}</li>
        `;
    } catch (error) {
        console.error('Erro ao iniciar:', error);
        document.getElementById('loading-msg').textContent = 'Erro ao carregar os dados.';
    }
}

init();