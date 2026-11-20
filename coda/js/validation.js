export function validateReading(data) {
    const errors = [];
    if (!data.bookId || isNaN(data.bookId)) {
        errors.push('Selecione um livro válido.');
    }
    if (!['Read', 'Paused', 'Want to read'].includes(data.status)) {
        errors.push('Selecione um status de leitura válido.');
    }
    if (data.yearRead !== null && (data.yearRead < 1900 || data.yearRead > 2030)) {
        errors.push('O ano de leitura deve estar entre 1900 e 2030.');
    }
    if (data.grade !== null && (data.grade < 0 || data.grade > 10)) {
        errors.push('A nota deve ser um valor entre 0 e 10.');
    }
    if (data.status === 'Want to read' && data.grade !== null) {
        errors.push('Livros marcados como "Quero Ler" não devem ter nota atribuída.');
    }
    return errors;
}

export function validateBook(data) {
    const errors = [];
    if (!data.title || data.title.trim().length < 2) {
        errors.push('O título do livro deve ter pelo menos 2 caracteres.');
    }
    if (!data.authorIds || data.authorIds.length === 0 || isNaN(data.authorIds[0])) {
        errors.push('Selecione pelo menos um autor.');
    }
    if (data.publicationYear !== null && (data.publicationYear < -3000 || data.publicationYear > 2030)) {
        errors.push('Ano de publicação inválido.');
    }
    return errors;
}

export function validateAuthor(data) {
    const errors = [];
    if (!data.name || data.name.trim().length < 2) {
        errors.push('O nome do autor deve ter pelo menos 2 caracteres.');
    }
    if (!data.countryId || isNaN(data.countryId)) {
        errors.push('Selecione o país de origem do autor.');
    }
    return errors;
}