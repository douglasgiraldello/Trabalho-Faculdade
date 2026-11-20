import {
    getAllData,
    addReading,
    deleteReading,
    addBook,
    deleteBook,
    addAuthor,
    resetDatabase
} from './store.js';

let appData = { countries: [], authors: [], themes: [], books: [], readings: [] };

// Utilitários para cruzar os IDs
function getBookTitle(bookId) {
    const book = appData.books.find(b => b.id === bookId);
    return book ? book.title : 'Livro desconhecido';
}

function getBookAuthors(bookId) {
    const book = appData.books.find(b => b.id === bookId);
    if (!book || !book.authorIds || book.authorIds.length === 0) return 'Desconhecido';
    return book.authorIds
        .map(id => appData.authors.find(a => a.id === id)?.name || 'Desconhecido')
        .join(', ');
}

function getAuthorNamesByIds(authorIds) {
    if (!authorIds || authorIds.length === 0) return 'Desconhecido';
    return authorIds
        .map(id => appData.authors.find(a => a.id === id)?.name || 'Desconhecido')
        .join(', ');
}

function getCountryName(countryId) {
    return appData.countries.find(c => c.id === countryId)?.name || 'Não informado';
}

// Renderização do Dashboard
function renderStats() {
    const totalBooks = appData.books.length;
    const readCount = appData.readings.filter(r => r.status === 'Read').length;
    const pausedCount = appData.readings.filter(r => r.status === 'Paused').length;
    const wantCount = appData.readings.filter(r => r.status === 'Want to read').length;

    const graded = appData.readings.filter(r => r.grade !== null && r.grade !== undefined);
    const avgGrade = graded.length
        ? (graded.reduce((sum, r) => sum + Number(r.grade), 0) / graded.length).toFixed(1)
        : '-';

    document.getElementById('dashboard-stats').innerHTML = `
        <div class="stat-card"><h3>Total de Livros</h3><p>${totalBooks}</p></div>
        <div class="stat-card"><h3>Livros Lidos</h3><p>${readCount}</p></div>
        <div class="stat-card"><h3>Pausados</h3><p>${pausedCount}</p></div>
        <div class="stat-card"><h3>Quero Ler</h3><p>${wantCount}</p></div>
        <div class="stat-card"><h3>Média de Notas</h3><p>${avgGrade}</p></div>
    `;
}

// Preenche os selects dos formulários
function populateSelects() {
    const bookSelect = document.getElementById('reading-book');
    bookSelect.innerHTML = appData.books
        .map(b => `<option value="${b.id}">${b.title}</option>`)
        .join('');

    const authorSelect = document.getElementById('book-author');
    authorSelect.innerHTML = appData.authors
        .map(a => `<option value="${a.id}">${a.name}</option>`)
        .join('');

    const countrySelect = document.getElementById('author-country');
    countrySelect.innerHTML = appData.countries
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join('');
}

// Renderiza tabela de Leituras
function renderReadings() {
    const statusFilter = document.getElementById('filter-status').value;
    const search = document.getElementById('search-reading').value.toLowerCase();

    const filtered = appData.readings.filter(r => {
        const title = getBookTitle(r.bookId).toLowerCase();
        const notes = (r.notes || '').toLowerCase();
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesText = title.includes(search) || notes.includes(search);
        return matchesStatus && matchesText;
    });

    const tbody = document.getElementById('table-readings');
    tbody.innerHTML = filtered.map(r => {
        let badgeClass = 'badge-want';
        if (r.status === 'Read') badgeClass = 'badge-read';
        if (r.status === 'Paused') badgeClass = 'badge-paused';

        return `
            <tr>
                <td><strong>${getBookTitle(r.bookId)}</strong></td>
                <td>${getBookAuthors(r.bookId)}</td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td>${r.yearRead || '-'}</td>
                <td>${r.grade !== null ? r.grade : '-'}</td>
                <td>${r.notes || (r.recommendedBy ? `Indicado por: ${r.recommendedBy}` : '-')}</td>
                <td>
                    <button class="btn btn-danger" data-delete-reading="${r.id}">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Renderiza tabela de Livros
function renderBooks() {
    const search = document.getElementById('search-book').value.toLowerCase();
    const filtered = appData.books.filter(b =>
        b.title.toLowerCase().includes(search) ||
        getAuthorNamesByIds(b.authorIds).toLowerCase().includes(search)
    );

    document.getElementById('table-books').innerHTML = filtered.map(b => `
        <tr>
            <td><strong>${b.title}</strong></td>
            <td>${getAuthorNamesByIds(b.authorIds)}</td>
            <td>${b.publicationYear || '-'}</td>
            <td>${b.form || '-'}</td>
            <td>
                <button class="btn btn-danger" data-delete-book="${b.id}">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Renderiza tabela de Autores
function renderAuthors() {
    const search = document.getElementById('search-author').value.toLowerCase();
    const filtered = appData.authors.filter(a => a.name.toLowerCase().includes(search));

    document.getElementById('table-authors').innerHTML = filtered.map(a => `
        <tr>
            <td><strong>${a.name}</strong></td>
            <td>${getCountryName(a.countryId)}</td>
            <td>${a.birthDate || '-'}</td>
        </tr>
    `).join('');
}

async function refreshUI() {
    appData = await getAllData();
    renderStats();
    populateSelects();
    renderReadings();
    renderBooks();
    renderAuthors();
}

// Controle de Abas
function setupNavigation() {
    const tabs = [
        { btn: 'tab-readings', view: 'view-readings' },
        { btn: 'tab-books', view: 'view-books' },
        { btn: 'tab-authors', view: 'view-authors' }
    ];

    tabs.forEach(({ btn, view }) => {
        document.getElementById(btn).addEventListener('click', () => {
            tabs.forEach(t => {
                document.getElementById(t.btn).classList.remove('active');
                document.getElementById(t.view).classList.add('hidden');
            });
            document.getElementById(btn).classList.add('active');
            document.getElementById(view).classList.remove('hidden');
        });
    });

    document.getElementById('btn-reset').addEventListener('click', async () => {
        if (confirm('Deseja restaurar todos os dados originais do seed.json?')) {
            await resetDatabase();
            await refreshUI();
        }
    });
}

// Eventos de Formulários e Filtros
function setupEvents() {
    document.getElementById('form-reading').addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = Number(document.getElementById('reading-book').value);
        const status = document.getElementById('reading-status').value;
        const yearVal = document.getElementById('reading-year').value;
        const gradeVal = document.getElementById('reading-grade').value;
        const notes = document.getElementById('reading-notes').value.trim();

        await addReading({
            bookId,
            status,
            yearRead: yearVal ? Number(yearVal) : null,
            grade: gradeVal !== '' ? Number(gradeVal) : null,
            recommendedBy: null,
            priority: null,
            notes: notes || null
        });

        e.target.reset();
        await refreshUI();
    });

    document.getElementById('form-book').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('book-title').value.trim();
        const authorId = Number(document.getElementById('book-author').value);
        const yearVal = document.getElementById('book-year').value;
        const form = document.getElementById('book-form').value;

        await addBook({
            title,
            authorIds: [authorId],
            publicationYear: yearVal ? Number(yearVal) : null,
            form,
            mode: 'Prose',
            content: 'Fiction'
        });

        e.target.reset();
        await refreshUI();
    });

    document.getElementById('form-author').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('author-name').value.trim();
        const countryId = Number(document.getElementById('author-country').value);
        const birthDate = document.getElementById('author-birth').value || null;

        await addAuthor({ name, countryId, birthDate, deathDate: null });
        e.target.reset();
        await refreshUI();
    });

    // Filtros em tempo real
    document.getElementById('filter-status').addEventListener('change', renderReadings);
    document.getElementById('search-reading').addEventListener('input', renderReadings);
    document.getElementById('search-book').addEventListener('input', renderBooks);
    document.getElementById('search-author').addEventListener('input', renderAuthors);

    // Delegação de eventos para botões de excluir
    document.body.addEventListener('click', async (e) => {
        const readingId = e.target.getAttribute('data-delete-reading');
        if (readingId) {
            await deleteReading(Number(readingId));
            await refreshUI();
        }

        const bookId = e.target.getAttribute('data-delete-book');
        if (bookId) {
            await deleteBook(Number(bookId));
            await refreshUI();
        }
    });
}

// Inicialização
setupNavigation();
setupEvents();
refreshUI();