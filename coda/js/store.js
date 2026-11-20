const STORAGE_KEY = 'reading_tracker_data';

async function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }

    const response = await fetch('./data/seed.json');
    if (!response.ok) {
        throw new Error('Falha ao carregar data/seed.json');
    }
    const seedData = await response.json();
    saveData(seedData);
    return seedData;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getAllData() {
    return await loadData();
}

export async function addReading(reading) {
    const data = await loadData();
    const nextId = data.readings.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    data.readings.unshift({ id: nextId, ...reading });
    saveData(data);
}

export async function updateReadingStatus(id, newStatus, grade = null, yearRead = null) {
    const data = await loadData();
    const item = data.readings.find(r => r.id === id);
    if (item) {
        item.status = newStatus;
        if (grade !== null) item.grade = grade;
        if (yearRead !== null) item.yearRead = yearRead;
        saveData(data);
    }
}

export async function deleteReading(id) {
    const data = await loadData();
    data.readings = data.readings.filter(r => r.id !== id);
    saveData(data);
}

export async function addBook(book) {
    const data = await loadData();
    const nextId = data.books.reduce((max, b) => Math.max(max, b.id), 0) + 1;
    data.books.unshift({ id: nextId, themeIds: [], ...book });
    saveData(data);
}

export async function deleteBook(id) {
    const data = await loadData();
    data.books = data.books.filter(b => b.id !== id);
    data.readings = data.readings.filter(r => r.bookId !== id);
    saveData(data);
}

export async function addAuthor(author) {
    const data = await loadData();
    const nextId = data.authors.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    data.authors.unshift({ id: nextId, ...author });
    saveData(data);
}

export async function resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    return await loadData();
}