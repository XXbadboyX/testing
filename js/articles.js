const API_BASE_URL = 'http://localhost:5000'; // IMPORTANT: Update for deployment
let currentPage = 1;
const articlesPerPage = 10; // Main articles pagination limit

// DOM Elements
const articlesContainer = document.getElementById('articles-container');
const pageInfoSpan = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResultsContainer = document.getElementById('search-results-container');
const latestNewsContainer = document.getElementById('latest-news-container');


// --- Main Article Loading Function ---
async function loadArticles(searchQuery = '', page = currentPage, limit = articlesPerPage) {
    articlesContainer.innerHTML = '<p class="loading-message">Loading news...</p>';
    
    let url = `${API_BASE_URL}/news?page=${page}&limit=${limit}`;
    if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
            const articles = result.data;
            const totalPages = result.pages;
            articlesContainer.innerHTML = ''; // Clear loading message

            if (articles.length === 0 && page === 1 && !searchQuery) {
                articlesContainer.innerHTML = '<p class="no-articles">No news articles available yet.</p>';
                prevPageBtn.disabled = true;
                nextPageBtn.disabled = true;
                pageInfoSpan.textContent = 'Page 0 of 0';
                return;
            } else if (articles.length === 0 && page > 1) {
                currentPage = Math.max(1, currentPage - 1);
                loadArticles(searchQuery); // Reload previous page if current page has no articles
                return;
            } else if (articles.length === 0 && searchQuery) {
                articlesContainer.innerHTML = '<p class="no-articles">No articles found for your search.</p>';
                prevPageBtn.disabled = true;
                nextPageBtn.disabled = true;
                pageInfoSpan.textContent = 'Page 0 of 0';
                return;
            }

            articles.forEach(article => {
                const articleLink = document.createElement('a');
                articleLink.className = 'article-card';
                articleLink.href = `single-article.html?id=${article._id}`;

                let thumbnailUrl = '';
                if (article.imageUrl) {
                    thumbnailUrl = article.imageUrl;
                } else if (article.videoUrl) {
                    thumbnailUrl = 'https://via.placeholder.com/120x90?text=Video';
                } else {
                    thumbnailUrl = 'https://via.placeholder.com/120x90?text=No+Media';
                }

                articleLink.innerHTML = `
                    <img src="${thumbnailUrl}" alt="Thumbnail" class="thumbnail">
                    <div class="content-preview">
                        <h2>${article.title}</h2>
                        <p>${article.content}</p>
                        <span class="date">Published: ${new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                `;
                articlesContainer.appendChild(articleLink);
            });

            pageInfoSpan.textContent = `Page ${page} of ${totalPages}`;
            prevPageBtn.disabled = page === 1;
            nextPageBtn.disabled = page === totalPages;

        } else {
            articlesContainer.innerHTML = `<p class="error-message">Error loading news: ${result.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        articlesContainer.innerHTML = '<p class="error-message">Network error or server unavailable.</p>';
    }
}

// --- Search Functionality ---
async function performSearch() {
    const query = searchInput.value.trim();
    // Clear main articles and pagination if a search is performed
    articlesContainer.innerHTML = '';
    pageInfoSpan.textContent = 'Page 0 of 0';
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;

    if (query.length === 0) {
        searchResultsContainer.innerHTML = '<p class="no-results">Please enter a search term.</p>';
        loadArticles(); // Reload all articles if search is cleared
        return;
    }

    searchResultsContainer.innerHTML = '<p class="loading-message">Searching...</p>';

    try {
        // Fetch only search results, no pagination for this specific search display
        const response = await fetch(`${API_BASE_URL}/news?search=${encodeURIComponent(query)}&limit=10`); // Limit search results to 10 for sidebar
        const result = await response.json();

        if (response.ok && result.data) {
            const articles = result.data;
            searchResultsContainer.innerHTML = '';

            if (articles.length === 0) {
                searchResultsContainer.innerHTML = '<p class="no-results">No results found for your search.</p>';
            } else {
                articles.forEach(article => {
                    const articleLink = document.createElement('a');
                    articleLink.className = 'article-card'; // Reuse some styling
                    articleLink.href = `single-article.html?id=${article._id}`;

                    let thumbnailUrl = '';
                    if (article.imageUrl) {
                        thumbnailUrl = article.imageUrl;
                    } else if (article.videoUrl) {
                        thumbnailUrl = 'https://via.placeholder.com/80x60?text=Video'; // Smaller placeholder for search results
                    } else {
                        thumbnailUrl = 'https://via.placeholder.com/80x60?text=No+Media';
                    }

                    articleLink.innerHTML = `
                        <img src="${thumbnailUrl}" alt="Thumbnail" class="thumbnail" style="width: 80px; height: 60px;">
                        <div class="content-preview">
                            <h3 style="font-size: 1em; margin-bottom: 0;">${article.title}</h3>
                            <p style="font-size: 0.8em; -webkit-line-clamp: 1;">${article.content}</p>
                        </div>
                    `;
                    searchResultsContainer.appendChild(articleLink);
                });
            }
        } else {
            searchResultsContainer.innerHTML = `<p class="error-message">Error searching: ${result.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error performing search:', error);
        searchResultsContainer.innerHTML = '<p class="error-message">Network error or search unavailable.</p>';
    }
}

// --- Latest News Functionality ---
async function loadLatestNews() {
    latestNewsContainer.innerHTML = '<p class="loading-message" style="font-size: 0.9em;">Loading latest news...</p>';
    try {
        // Fetch latest 5 articles
        const response = await fetch(`${API_BASE_URL}/news?latest=true&limit=5`);
        const result = await response.json();

        if (response.ok && result.data) {
            const articles = result.data;
            latestNewsContainer.innerHTML = '';

            if (articles.length === 0) {
                latestNewsContainer.innerHTML = '<p class="no-results">No latest news available.</p>';
            } else {
                articles.forEach(article => {
                    const newsItemDiv = document.createElement('div');
                    newsItemDiv.className = 'latest-news-item';
                    newsItemDiv.innerHTML = `
                        <a href="single-article.html?id=${article._id}">
                            <h3>${article.title}</h3>
                            <span class="date">${new Date(article.createdAt).toLocaleDateString()}</span>
                        </a>
                    `;
                    latestNewsContainer.appendChild(newsItemDiv);
                });
            }
        } else {
            latestNewsContainer.innerHTML = `<p class="error-message" style="font-size: 0.9em;">Error loading latest: ${result.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error fetching latest news:', error);
        latestNewsContainer.innerHTML = '<p class="error-message" style="font-size: 0.9em;">Network error or server unavailable.</p>';
    }
}

// --- Pagination and Initial Load ---
function changePage(direction) {
    const totalPagesText = pageInfoSpan.textContent;
    const totalPagesMatch = totalPagesText.match(/of (\d+)/);
    const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1]) : 1;

    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadArticles(); // Reload main articles (without search query if not active)
    }
}

// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));


// Initial loads when the page opens
document.addEventListener('DOMContentLoaded', () => {
    loadArticles(); // Load main paginated articles
    loadLatestNews(); // Load latest news for the sidebar
});
