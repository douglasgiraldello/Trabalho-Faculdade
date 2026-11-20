import {
    getAllData,
    addReading,
    updateReading,
    deleteReading,
    addBook,
    updateBook,
    deleteBook,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    resetDatabase
} from './store.js';

import {
    validateReading,
    validateBook,
    validateAuthor
} from './validation.js';

let appData = { countries: [], authors: [], themes: [], books: [], readings: [] };

// Utilitários relacionais
function getBookTitle(bookId) {
    return appData.books.find(b => b.id === bookId)?.title || 'Livro desconhecido';
}

function getBookAuthors(bookId) {
    const book = appData.books.find(b => b.id === bookId);
    if (!book || !book.authorIds?.length) return 'Desconhecido';
    return book.authorIds
        .map(id => appData.authors.find(a => a.id === id)?.name || 'Desconhecido')
        .join(', ');
}

function getAuthorNamesByIds(authorIds) {
    if (!authorIds?.length) return 'Desconhecido';
    return authorIds
        .map(id => appData.authors.find(a => a.id === id)?.name || 'Desconhecido')
        .join(', ');
}

function getThemeBadges(themeIds) {
    if (!themeIds?.length) return '-';
    return themeIds
        .map(id => {
            const theme = appData.themes.find(t => t.id === id);
            return theme ? `<span class="theme-tag">${theme.name}</span>` : '';
        })
        .join('');
}

function getCountryName(countryId) {
    return appData.countries.find(c => c.id === countryId)?.name || 'Não informado';
}

function showErrors(elementId, errors) {
    const el = document.getElementById(elementId);
    if (errors.length > 0) {
        el.innerHTML = errors.join('<br>');
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
        el.innerHTML = '';
    }
}

// Dashboard
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

// Selects dos formulários
function populateSelects() {
    document.getElementById('reading-book').innerHTML = appData.books
        .map(b => `<option value="${b.id}">${b.title}</option>`)
        .join('');

    document.getElementById('book-author').innerHTML = appData.authors
        .map(a => `<option value="${a.id}">${a.name}</option>`)
        .join('');

    document.getElementById('book-theme').innerHTML =
        `<option value="">-- Sem tema específico --</option>` +
        appData.themes.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    document.getElementById('author-country').innerHTML = appData.countries
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join('');
}

// Renderizações das Tabelas
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

    document.getElementById('table-readings').innerHTML = filtered.map(r => {
        let badgeClass = 'badge-want';
        let statusLabel = 'Quero Ler';

        if (r.status === 'Read') {
            badgeClass = 'badge-read';
            statusLabel = 'Lido';
        } else if (r.status === 'Paused') {
            badgeClass = 'badge-paused';
            statusLabel = 'Pausado';
        }

        return `
            <tr>
                <td><strong>${getBookTitle(r.bookId)}</strong></td>
                <td>${getBookAuthors(r.bookId)}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                <td>${r.yearRead || '-'}</td>
                <td>${r.grade !== null ? r.grade : '-'}</td>
                <td>${r.notes || (r.recommendedBy ? `Indicado por: ${r.recommendedBy}` : '-')}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit" data-edit-reading="${r.id}">Editar</button>
                    <button class="btn btn-danger" data-delete-reading="${r.id}">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

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
            <td>${getThemeBadges(b.themeIds)}</td>
            <td>${b.publicationYear || '-'}</td>
            <td>${b.form || '-'}</td>
            <td class="actions-cell">
                <button class="btn btn-edit" data-edit-book="${b.id}">Editar</button>
                <button class="btn btn-danger" data-delete-book="${b.id}">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function renderAuthors() {
    const search = document.getElementById('search-author').value.toLowerCase();
    const filtered = appData.authors.filter(a =>
        a.name.toLowerCase().includes(search) ||
        getCountryName(a.countryId).toLowerCase().includes(search)
    );

    document.getElementById('table-authors').innerHTML = filtered.map(a => `
        <tr>
            <td><strong>${a.name}</strong></td>
            <td>${getCountryName(a.countryId)}</td>
            <td>${a.birthDate || '-'}</td>
            <td class="actions-cell">
                <button class="btn btn-edit" data-edit-author="${a.id}">Editar</button>
                <button class="btn btn-danger" data-delete-author="${a.id}">Excluir</button>
            </td>
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

// Funções de reset dos modos de edição
function resetReadingForm() {
    document.getElementById('form-reading').reset();
    document.getElementById('reading-edit-id').value = '';
    document.getElementById('form-reading-title').textContent = 'Registrar Nova Leitura / Wishlist';
    document.getElementById('btn-submit-reading').textContent = 'Salvar Registro';
    document.getElementById('btn-cancel-reading').classList.add('hidden');
    showErrors('error-reading', []);
}

function resetBookForm() {
    document.getElementById('form-book').reset();
    document.getElementById('book-edit-id').value = '';
    document.getElementById('form-book-title').textContent = 'Cadastrar Novo Livro';
    document.getElementById('btn-submit-book').textContent = 'Adicionar Livro';
    document.getElementById('btn-cancel-book').classList.add('hidden');
    showErrors('error-book', []);
}

function resetAuthorForm() {
    document.getElementById('form-author').reset();
    document.getElementById('author-edit-id').value = '';
    document.getElementById('form-author-title').textContent = 'Cadastrar Novo Autor';
    document.getElementById('btn-submit-author').textContent = 'Adicionar Autor';
    document.getElementById('btn-cancel-author').classList.add('hidden');
    showErrors('error-author', []);
}

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

function setupEvents() {
    // Submit Leitura (Criar ou Editar)
    document.getElementById('form-reading').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('reading-edit-id').value;
        const yearVal = document.getElementById('reading-year').value;
        const gradeVal = document.getElementById('reading-grade').value;

        const payload = {
            bookId: Number(document.getElementById('reading-book').value),
            status: document.getElementById('reading-status').value,
            yearRead: yearVal ? Number(yearVal) : null,
            grade: gradeVal !== '' ? Number(gradeVal) : null,
            notes: document.getElementById('reading-notes').value.trim() || null
        };

        const errors = validateReading(payload);
        if (errors.length > 0) {
            showErrors('error-reading', errors);
            return;
        }

        if (editId) {
            await updateReading(Number(editId), payload);
        } else {
            await addReading({ ...payload, recommendedBy: null, priority: null });
        }

        resetReadingForm();
        await refreshUI();
    });

    // Submit Livro (Criar ou Editar)
    document.getElementById('form-book').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('book-edit-id').value;
        const yearVal = document.getElementById('book-year').value;
        const themeVal = document.getElementById('book-theme').value;

        const payload = {
            title: document.getElementById('book-title').value.trim(),
            authorIds: [Number(document.getElementById('book-author').value)],
            themeIds: themeVal ? [Number(themeVal)] : [],
            publicationYear: yearVal ? Number(yearVal) : null,
            form: document.getElementById('book-form').value
        };

        const errors = validateBook(payload);
        if (errors.length > 0) {
            showErrors('error-book', errors);
            return;
        }

        if (editId) {
            await updateBook(Number(editId), payload);
        } else {
            await addBook({ ...payload, mode: 'Prose', content: 'Fiction' });
        }

        resetBookForm();
        await refreshUI();
    });

    // Submit Autor (Criar ou Editar)
    document.getElementById('form-author').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('author-edit-id').value;
        const payload = {
            name: document.getElementById('author-name').value.trim(),
            countryId: Number(document.getElementById('author-country').value),
            birthDate: document.getElementById('author-birth').value || null
        };

        const errors = validateAuthor(payload);
        if (errors.length > 0) {
            showErrors('error-author', errors);
            return;
        }

        if (editId) {
            await updateAuthor(Number(editId), payload);
        } else {
            await addAuthor({ ...payload, deathDate: null });
        }

        resetAuthorForm();
        await refreshUI();
    });

    // Botões Cancelar Edição
    document.getElementById('btn-cancel-reading').addEventListener('click', resetReadingForm);
    document.getElementById('btn-cancel-book').addEventListener('click', resetBookForm);
    document.getElementById('btn-cancel-author').addEventListener('click', resetAuthorForm);

    // Filtros
    document.getElementById('filter-status').addEventListener('change', renderReadings);
    document.getElementById('search-reading').addEventListener('input', renderReadings);
    document.getElementById('search-book').addEventListener('input', renderBooks);
    document.getElementById('search-author').addEventListener('input', renderAuthors);

    // Cliques em Editar e Excluir nas tabelas
    document.body.addEventListener('click', async (e) => {
        // Excluir
        const delReading = e.target.getAttribute('data-delete-reading');
        if (delReading) {
            await deleteReading(Number(delReading));
            await refreshUI();
        }
        const delBook = e.target.getAttribute('data-delete-book');
        if (delBook) {
            await deleteBook(Number(delBook));
            await refreshUI();
        }
        const delAuthor = e.target.getAttribute('data-delete-author');
        if (delAuthor) {
            await deleteAuthor(Number(delAuthor));
            await refreshUI();
        }

        // Editar Leitura
        const editReadingId = e.target.getAttribute('data-edit-reading');
        if (editReadingId) {
            const item = appData.readings.find(r => r.id === Number(editReadingId));
            if (item) {
                document.getElementById('reading-edit-id').value = item.id;
                document.getElementById('reading-book').value = item.bookId;
                document.getElementById('reading-status').value = item.status;
                document.getElementById('reading-year').value = item.yearRead || '';
                document.getElementById('reading-grade').value = item.grade ?? '';
                document.getElementById('reading-notes').value = item.notes || '';
                document.getElementById('form-reading-title').textContent = 'Editando Registro de Leitura';
                document.getElementById('btn-submit-reading').textContent = 'Atualizar Registro';
                document.getElementById('btn-cancel-reading').classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Editar Livro
        const editBookId = e.target.getAttribute('data-edit-book');
        if (editBookId) {
            const book = appData.books.find(b => b.id === Number(editBookId));
            if (book) {
                document.getElementById('book-edit-id').value = book.id;
                document.getElementById('book-title').value = book.title;
                document.getElementById('book-author').value = book.authorIds?.[0] || '';
                document.getElementById('book-theme').value = book.themeIds?.[0] || '';
                document.getElementById('book-year').value = book.publicationYear || '';
                document.getElementById('book-form').value = book.form || 'Novel';
                document.getElementById('form-book-title').textContent = 'Editando Livro';
                document.getElementById('btn-submit-book').textContent = 'Atualizar Livro';
                document.getElementById('btn-cancel-book').classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Editar Autor
        const editAuthorId = e.target.getAttribute('data-edit-author');
        if (editAuthorId) {
            const author = appData.authors.find(a => a.id === Number(editAuthorId));
            if (author) {
                document.getElementById('author-edit-id').value = author.id;
                document.getElementById('author-name').value = author.name;
                document.getElementById('author-country').value = author.countryId;
                document.getElementById('author-birth').value = author.birthDate || '';
                document.getElementById('form-author-title').textContent = 'Editando Autor';
                document.getElementById('btn-submit-author').textContent = 'Atualizar Autor';
                document.getElementById('btn-cancel-author').classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

setupNavigation();
setupEvents();
refreshUI();