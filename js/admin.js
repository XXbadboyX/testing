const API_BASE_URL = 'http://localhost:5000'; // IMPORTANT: Update for deployment
let token = localStorage.getItem('adminToken');
let currentPage = 1;
const articlesPerPage = 5;

// Elements (global for easier access)
const loginSection = document.getElementById('login-section');
const adminContentSection = document.getElementById('admin-content-section');
const loginMessage = document.getElementById('login-message');
const formModeTitle = document.getElementById('form-mode-title');
const articleIdInput = document.getElementById('article-id');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');
const videoInput = document.getElementById('video');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formMessage = document.getElementById('form-message');
const formError = document.getElementById('form-error');
const currentImagePreview = document.getElementById('current-image-preview');
const currentVideoPreview = document.getElementById('current-video-preview');
const newsListDiv = document.getElementById('news-list');
const pageInfoSpan = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');


function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.style.display = 'block';
    element.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

async function checkAuthAndDisplayContent() {
    if (token) {
        loginSection.style.display = 'none';
        adminContentSection.style.display = 'block';
        loadNews();
    } else {
        loginSection.style.display = 'block';
        adminContentSection.style.display = 'none';
        loginMessage.textContent = '';
    }
}

async function login() {
    const password = document.getElementById('password').value;
    loginMessage.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            showMessage(loginMessage, 'Login successful!');
            setTimeout(() => {
                checkAuthAndDisplayContent();
            }, 500);
        } else {
            showMessage(loginMessage, data.error || 'Login failed', true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(loginMessage, 'Network error or server unavailable.', true);
    }
}

function logout() {
    token = null;
    localStorage.removeItem('adminToken');
    showMessage(loginMessage, 'Logged out successfully!', false);
    checkAuthAndDisplayContent();
    resetForm();
}

function resetForm() {
    articleIdInput.value = '';
    titleInput.value = '';
    contentInput.value = '';
    imageInput.value = '';
    videoInput.value = '';
    currentImagePreview.innerHTML = '';
    currentImagePreview.style.display = 'none';
    currentVideoPreview.innerHTML = '';
    currentVideoPreview.style.display = 'none';
    formModeTitle.textContent = 'Create New';
    submitBtn.textContent = 'Create Article';
    submitBtn.onclick = submitArticle;
    cancelEditBtn.style.display = 'none';
    formMessage.style.display = 'none';
    formError.style.display = 'none';
}

async function submitArticle() {
    const articleId = articleIdInput.value;
    const url = articleId ? `${API_BASE_URL}/news/${articleId}` : `${API_BASE_URL}/news`;
    const method = articleId ? 'PUT' : 'POST';

    formMessage.style.display = 'none';
    formError.style.display = 'none';
    formMessage.textContent = '';
    formError.textContent = '';

    const formData = new FormData();
    formData.append('title', titleInput.value);
    formData.append('content', contentInput.value);

    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    } else if (articleId && !currentImagePreview.querySelector('img')) {
        formData.append('clearImage', 'true');
    }

    if (videoInput.files[0]) {
        formData.append('video', videoInput.files[0]);
    } else if (articleId && !currentVideoPreview.querySelector('video')) {
        formData.append('clearVideo', 'true');
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(formMessage, data.message || (articleId ? 'Article updated successfully!' : 'Article created successfully!'));
            resetForm();
            loadNews();
        } else {
            const errorMessage = data.errors ? data.errors.map(err => err.msg || err.message).join(', ') : (data.error || 'Operation failed.');
            showMessage(formError, errorMessage, true);
        }
    } catch (error) {
        console.error('Article operation error:', error);
        showMessage(formError, 'Network error or server unavailable.', true);
    }
}

async function editArticle(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/news/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (response.ok && result.data) {
            const article = result.data;
            articleIdInput.value = article._id;
            titleInput.value = article.title;
            contentInput.value = article.content;

            currentImagePreview.innerHTML = '';
            currentVideoPreview.innerHTML = '';
            currentImagePreview.style.display = 'none';
            currentVideoPreview.style.display = 'none';

            if (article.imageUrl) {
                currentImagePreview.style.display = 'block';
                currentImagePreview.innerHTML = `
                    <img src="${article.imageUrl}" alt="Current Image">
                    <button class="clear-media-btn" onclick="clearMedia('image')">Clear Image</button>
                `;
            }
            if (article.videoUrl) {
                currentVideoPreview.style.display = 'block';
                currentVideoPreview.innerHTML = `
                    <video src="${article.videoUrl}" controls></video>
                    <button class="clear-media-btn" onclick="clearMedia('video')">Clear Video</button>
                `;
            }

            formModeTitle.textContent = 'Edit';
            submitBtn.textContent = 'Update Article';
            submitBtn.onclick = submitArticle;
            cancelEditBtn.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (response.status === 401) {
            showMessage(formError, 'Authentication failed. Please log in again.', true);
            logout();
        } else {
            showMessage(formError, result.error || 'Failed to fetch article for editing.', true);
        }
    } catch (error) {
        console.error('Error fetching article for edit:', error);
        showMessage(formError, 'Network error or server unavailable.', true);
    }
}

function clearMedia(type) {
    if (type === 'image') {
        imageInput.value = '';
        currentImagePreview.innerHTML = '';
        currentImagePreview.style.display = 'none';
    } else if (type === 'video') {
        videoInput.value = '';
        currentVideoPreview.innerHTML = '';
        currentVideoPreview.style.display = 'none';
    }
}

function cancelEdit() {
    resetForm();
}

async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/news/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(formMessage, data.message || 'Article deleted successfully!');
            loadNews();
        } else if (response.status === 401) {
            showMessage(formError, 'Authentication failed. Please log in again.', true);
            logout();
        } else {
            showMessage(formError, data.error || 'Failed to delete article.', true);
        }
    } catch (error) {
        console.error('Delete article error:', error);
        showMessage(formError, 'Network error or server unavailable.', true);
    }
}

async function loadNews() {
    newsListDiv.innerHTML = '<p style="text-align: center;">Loading articles...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/news?page=${currentPage}&limit=${articlesPerPage}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (response.ok) {
            const articles = result.data;
            const totalPages = result.pages;
            newsListDiv.innerHTML = '';

            if (articles.length === 0) {
                newsListDiv.innerHTML = '<p style="text-align: center;">No articles found.</p>';
                prevPageBtn.disabled = true;
                nextPageBtn.disabled = true;
                pageInfoSpan.textContent = 'Page 0 of 0';
                return;
            }

            articles.forEach(article => {
                const newsItemDiv = document.createElement('div');
                newsItemDiv.className = 'news-item';
                newsItemDiv.innerHTML = `
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="News Image">` : (article.videoUrl ? `<video src="${article.videoUrl}" alt="News Video" controls></video>` : '<span class="no-media">No media</span>')}
                    <div class="news-content">
                        <h3>${article.title}</h3>
                        <p>${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                        <small>Created: ${new Date(article.createdAt).toLocaleDateString()}</small>
                        <div class="news-actions">
                            <button class="btn" onclick="editArticle('${article._id}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteArticle('${article._id}')">Delete</button>
                        </div>
                    </div>
                `;
                newsListDiv.appendChild(newsItemDiv);
            });

            pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;

        } else if (response.status === 401) {
            newsListDiv.innerHTML = '<p style="text-align: center; color: red;">Authentication failed. Please log in again.</p>';
            logout();
        } else {
            newsListDiv.innerHTML = `<p style="text-align: center; color: red;">Error loading articles: ${result.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error loading news:', error);
        newsListDiv.innerHTML = '<p style="text-align: center; color: red;">Network error or server unavailable.</p>';
    }
}

function changePage(direction) {
    const totalPagesText = pageInfoSpan.textContent;
    const totalPagesMatch = totalPagesText.match(/of (\d+)/);
    const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1]) : 1;

    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadNews();
    }
}

// Initial check for authentication when the page loads
document.addEventListener('DOMContentLoaded', checkAuthAndDisplayContent);