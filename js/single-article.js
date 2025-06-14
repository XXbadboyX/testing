const API_BASE_URL = 'http://localhost:5000'; // IMPORTANT: Update for deployment

async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    const articleContentDiv = document.getElementById('articles-container');

    if (!articleId) {
        articleContentDiv.innerHTML = '<p class="error-message">Error: No article ID provided.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/news/${articleId}`);
        const result = await response.json();

        if (response.ok) {
            const article = result.data;
            if (!article) {
                articleContentDiv.innerHTML = '<p class="error-message">Article not found.</p>';
                return;
            }

            articleContentDiv.innerHTML = `
                <h1>${article.title}</h1>
                <span class="date">Published: ${new Date(article.createdAt).toLocaleDateString()} at ${new Date(article.createdAt).toLocaleTimeString()}</span>
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                ${article.videoUrl ? `
                    <video controls>
                        <source src="${article.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                ` : ''}
                <p>${article.content}</p>
            `;
        } else {
            articleContentDiv.innerHTML = `<p class="error-message">Error loading article: ${result.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error fetching single article:', error);
        articleContentDiv.innerHTML = '<p class="error-message">Network error or server unavailable.</p>';
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadArticle);