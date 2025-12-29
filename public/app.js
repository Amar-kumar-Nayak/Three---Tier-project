// API URL - For local development use http://localhost:3000, for production it will use relative path
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// DOM Elements
const createForm = document.getElementById('createForm');
const pasteForm = document.getElementById('pasteForm');
const successCard = document.getElementById('successCard');
const viewCard = document.getElementById('viewCard');
const errorCard = document.getElementById('errorCard');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        showCreateForm();
    } else {
        const pasteId = path.substring(1).replace('.html', '');
        if (pasteId) {
            loadPaste(pasteId);
        }
    }
    
    setupEventListeners();
});

function setupEventListeners() {
    pasteForm.addEventListener('submit', handleSubmit);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('newPasteBtn').addEventListener('click', createNewPaste);
    document.getElementById('newPasteFromView').addEventListener('click', createNewPaste);
    document.getElementById('homeBtn').addEventListener('click', createNewPaste);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim() || 'Untitled';
    const content = document.getElementById('content').value.trim();
    const expiry = document.getElementById('expiry').value;
    const maxViews = document.getElementById('maxViews').value;
    
    if (!content) {
        showError('Please enter some content');
        return;
    }
    
    setLoading(true);
    hideError();
    
    try {
        const response = await fetch(`${API_URL}/paste`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                expiry: expiry !== 'never' ? expiry : null,
                maxViews: maxViews ? parseInt(maxViews) : null
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create paste');
        }
        
        const shareUrl = `${window.location.origin}/${data.id}`;
        showSuccess(shareUrl);
    } catch (error) {
        console.error('Error creating paste:', error);
        showError(error.message || 'Failed to create paste. Please try again.');
    } finally {
        setLoading(false);
    }
}

async function loadPaste(id) {
    try {
        const response = await fetch(`${API_URL}/paste/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            showErrorCard(data.error || 'Paste not found');
            return;
        }
        
        showPaste(data);
    } catch (error) {
        console.error('Error loading paste:', error);
        showErrorCard('Failed to load paste. Please try again.');
    }
}

function showCreateForm() {
    createForm.style.display = 'block';
    successCard.style.display = 'none';
    viewCard.style.display = 'none';
    errorCard.style.display = 'none';
}

function showSuccess(url) {
    document.getElementById('shareLink').value = url;
    createForm.style.display = 'none';
    successCard.style.display = 'block';
    viewCard.style.display = 'none';
    errorCard.style.display = 'none';
}

function showPaste(data) {
    document.getElementById('pasteTitle').textContent = data.title;
    document.getElementById('pasteContent').textContent = data.content;
    
    const createdDate = new Date(data.createdAt).toLocaleString();
    document.getElementById('pasteDate').textContent = `📅 ${createdDate}`;
    document.getElementById('pasteViews').textContent = `👁️ ${data.views} views`;
    
    if (data.expiresAt) {
        const expiryDate = new Date(data.expiresAt).toLocaleString();
        document.getElementById('pasteExpiry').textContent = `⏱️ Expires: ${expiryDate}`;
    } else {
        document.getElementById('pasteExpiry').textContent = '';
    }
    
    if (data.maxViews) {
        const viewsLeft = data.maxViews - data.views;
        document.getElementById('pasteViews').textContent = `👁️ ${data.views}/${data.maxViews} views (${viewsLeft} left)`;
    }
    
    createForm.style.display = 'none';
    successCard.style.display = 'none';
    viewCard.style.display = 'block';
    errorCard.style.display = 'none';
}

function showErrorCard(message) {
    document.getElementById('errorText').textContent = message;
    createForm.style.display = 'none';
    successCard.style.display = 'none';
    viewCard.style.display = 'none';
    errorCard.style.display = 'block';
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function hideError() {
    errorMsg.style.display = 'none';
}

function setLoading(isLoading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        loader.style.display = 'block';
        submitBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        loader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function copyToClipboard() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(shareLink.value).then(() => {
        const copyText = document.getElementById('copyText');
        copyText.textContent = '✓ Copied!';
        
        setTimeout(() => {
            copyText.textContent = 'Copy';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        document.execCommand('copy');
        const copyText = document.getElementById('copyText');
        copyText.textContent = '✓ Copied!';
        
        setTimeout(() => {
            copyText.textContent = 'Copy';
        }, 2000);
    });
}

function createNewPaste() {
    // Reset form
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('expiry').value = 'never';
    document.getElementById('maxViews').value = '';
    
    // Update URL
    window.history.pushState({}, '', '/');
    
    showCreateForm();
}