const STORAGE_KEY = 'reading_tracker_data';

// Carrega os dados do localStorage ou faz o seed inicial a partir do seed.json
async function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }

    const response = await fetch('./data/seed.json');
    if (!response.ok) {
        throw new Error('Falha ao carregar o arquivo data/seed.json');
    }
    const seedData = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
}

export async function getCountries() {
    const data = await loadData();
    return data.countries || [];
}

export async function getAuthors() {
    const data = await loadData();
    return data.authors || [];
}

export async function getThemes() {
    const data = await loadData();
    return data.themes || [];
}

export async function getBooks() {
    const data = await loadData();
    return data.books || [];
}

export async function getReadings() {
    const data = await loadData();
    return data.readings || [];
}