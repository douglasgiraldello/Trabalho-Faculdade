# Reading Tracker - Delivery 1

Aplicação web interativa desenvolvida em HTML5, CSS3 e JavaScript (ES6 Modules) para gerenciamento de leituras, catálogo de livros, autores, países e temas.

## Funcionalidades Implementadas
- **Dashboard Estatístico:** Contagem dinâmica de livros cadastrados, lidos, pausados, lista de desejos e média geral de avaliações.
- **CRUD Completo com Persistência:** Criação, leitura, edição e exclusão de registros de leitura, livros e autores salvos no `localStorage`.
- **Carga Inicial (`seed.json`):** Importação automática da base relacional inicial com opção de restauração a qualquer momento.
- **Filtros e Busca em Tempo Real:** Filtragem por status de leitura e pesquisa instantânea por título, autor, país ou observações.
- **Validação de Dados:** Módulo dedicado (`js/validation.js`) para garantir integridade de notas (0 a 10), anos e campos obrigatórios.

## Como Executar
1. Abra a pasta do projeto no **VS Code**.
2. Utilize a extensão **Live Server** clicando com o botão direito em `index.html` > **Open with Live Server** (necessário para carregamento via `fetch` e módulos ES6).

## Autor
- **Douglas Gonçalves Carlos Giraldello** — Ciência da Computação (UNIFAL-MG)