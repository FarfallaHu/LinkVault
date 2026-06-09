import React, { useState, useEffect, useRef } from 'react';
import { 
  Link2, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Download, 
  Upload, 
  Sun, 
  Moon, 
  Globe, 
  X,
  Check, 
  AlertCircle, 
  Info,
  Bookmark,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';

// Default initial bookmarks in English
const DEFAULT_LINKS = [
  {
    id: '1',
    url: 'https://github.com',
    title: 'GitHub',
    starred: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: '2',
    url: 'https://react.dev',
    title: 'React',
    starred: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: '3',
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS',
    starred: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: '4',
    url: 'https://notion.so',
    title: 'Notion',
    starred: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: '5',
    url: 'https://vercel.com',
    title: 'Vercel',
    starred: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Helper to generate consistent background color for monogram avatar based on title
const getMonogramColor = (text) => {
  const colors = [
    '#ff3b30', // Apple Red
    '#ff9500', // Apple Orange
    '#ffcc00', // Apple Yellow
    '#34c759', // Apple Green
    '#5ac8fa', // Apple Teal
    '#0071e3', // Apple Blue
    '#5856d6', // Apple Purple
    '#ff2d55'  // Apple Pink
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Tiered Favicon component with a Safari-style monogram fallback
function Favicon({ url, title }) {
  const [srcIndex, setSrcIndex] = useState(0);
  
  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = 'example.com';
  }

  // Tiered sources:
  // 1. Google Chrome High-Res FaviconV2 API (Retina quality 128x128)
  // 2. Direct favicon.ico from website root
  // 3. DuckDuckGo API (alternative fallback)
  const sources = [
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`,
    `https://${domain}/favicon.ico`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ];

  const handleErr = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setSrcIndex(-1); // Switch to monogram fallback
    }
  };

  if (srcIndex === -1) {
    const letter = title.trim() ? title.trim().charAt(0).toUpperCase() : 'L';
    const bgColor = getMonogramColor(title);
    return (
      <div 
        className="favicon-fallback" 
        style={{ 
          backgroundColor: bgColor,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '22%'
        }}
      >
        {letter}
      </div>
    );
  }

  return (
    <div className="favicon-wrapper">
      <img
        src={sources[srcIndex]}
        alt=""
        className="favicon-img"
        onError={handleErr}
      />
    </div>
  );
}

function App() {
  // --- States ---
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem('linkvault_links');
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('linkvault_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'starred'
  const [toastList, setToastList] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('linkvault_is_admin') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // URL Input State
  const [urlInput, setUrlInput] = useState('');

  // Modal Editing Form State
  const [modalInput, setModalInput] = useState({
    title: '',
    url: ''
  });

  const dialogRef = useRef(null);
  const tokenDialogRef = useRef(null);
  const loginDialogRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('linkvault_links', JSON.stringify(links));
  }, [links]);

  // Fetch links.json from server on mount and merge with local changes
  useEffect(() => {
    const fetchServerLinks = async () => {
      try {
        // Try fetching raw GitHub file content for real-time updates across multiple hosting platforms
        const response = await fetch(`https://raw.githubusercontent.com/FarfallaHu/LinkVault/main/public/links.json?t=${Date.now()}`);
        let data;
        if (response.ok) {
          data = await response.json();
        } else {
          // Fallback to local server paths
          const localResponse = await fetch('./links.json');
          if (localResponse.ok) {
            data = await localResponse.json();
          }
        }
        
        if (data && Array.isArray(data)) {
          setLinks((prevLinks) => {
            const serverUrls = new Set(data.map(l => l.url.toLowerCase()));
            const serverIds = new Set(data.map(l => l.id));
            const localOnlyLinks = prevLinks.filter(l => !serverUrls.has(l.url.toLowerCase()) && !serverIds.has(l.id));
            return [...data, ...localOnlyLinks];
          });
        }
      } catch (err) {
        console.warn('Could not fetch server links.json, falling back to local storage.');
      }
    };
    fetchServerLinks();
  }, []);

  useEffect(() => {
    localStorage.setItem('linkvault_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (editingLink) {
      setModalInput({
        title: editingLink.title,
        url: editingLink.url
      });
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [editingLink]);

  useEffect(() => {
    if (showTokenModal) {
      tokenDialogRef.current?.showModal();
      const savedToken = localStorage.getItem('linkvault_github_token') || '';
      setTokenInput(savedToken);
    } else {
      tokenDialogRef.current?.close();
    }
  }, [showTokenModal]);

  useEffect(() => {
    if (showLoginModal) {
      loginDialogRef.current?.showModal();
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } else {
      loginDialogRef.current?.close();
    }
  }, [showLoginModal]);

  // --- Cloud Sync Logic ---
  const handleCloudSync = async () => {
    if (!isAdmin) {
      addToast('Admin login required to sync to cloud', 'error');
      return;
    }
    const token = localStorage.getItem('linkvault_github_token');
    if (!token) {
      setShowTokenModal(true);
      return;
    }

    addToast('Syncing with GitHub...', 'info');

    try {
      // 1. Get current SHA of public/links.json to replace it
      const getRes = await fetch(
        'https://api.github.com/repos/FarfallaHu/LinkVault/contents/public/links.json',
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      let sha = '';
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 2. Put updated JSON file back to GitHub
      const jsonString = JSON.stringify(links, null, 2);
      const contentBase64 = btoa(unescape(encodeURIComponent(jsonString)));

      const putRes = await fetch(
        'https://api.github.com/repos/FarfallaHu/LinkVault/contents/public/links.json',
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'update links via LinkVault CMS',
            content: contentBase64,
            sha: sha || undefined
          })
         }
      );

      if (putRes.ok) {
        addToast('Synced successfully! Changes are live.', 'success');
      } else {
        const errData = await putRes.json();
        if (putRes.status === 401 || putRes.status === 403) {
          addToast('Session expired. Please check your GitHub token.', 'error');
          localStorage.removeItem('linkvault_github_token');
          setShowTokenModal(true);
        } else {
          addToast(`Sync failed: ${errData.message || 'Unknown error'}`, 'error');
        }
      }
    } catch (err) {
      addToast('Network error during sync', 'error');
    }
  };

  const handleSaveToken = (e) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      addToast('Token cannot be empty', 'error');
      return;
    }
    localStorage.setItem('linkvault_github_token', cleanToken);
    setShowTokenModal(false);
    addToast('GitHub Token saved locally', 'success');
    
    setTimeout(() => {
      handleCloudSync();
    }, 500);
  };

  // --- Admin Login Actions ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginEmail.trim().toLowerCase() === 'farfallahu@gmail.com' && loginPassword === 'Hudie1022') {
      setIsAdmin(true);
      localStorage.setItem('linkvault_is_admin', 'true');
      setShowLoginModal(false);
      addToast('Welcome back, Farfalla Hu!', 'success');
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out as Admin?')) {
      setIsAdmin(false);
      localStorage.removeItem('linkvault_is_admin');
      addToast('Logged out of Admin session', 'info');
    }
  };

  const handleLoginDialogClick = (e) => {
    if (e.target === loginDialogRef.current) {
      const rect = loginDialogRef.current.getBoundingClientRect();
      const isInside = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInside) {
        setShowLoginModal(false);
      }
    }
  };

  // --- Toast Handler ---
  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToastList((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastList((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToastList((prev) => prev.filter((t) => t.id !== id));
  };

  // --- URL Sanitation ---
  const sanitizeUrl = (str) => {
    let trimmed = str.trim();
    if (!trimmed) return null;
    
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        new URL(trimmed);
        return trimmed;
      } catch (e) {
        return null;
      }
    }
    
    if (!/\s/.test(trimmed) && trimmed.includes('.')) {
      const withProtocol = `https://${trimmed}`;
      try {
        new URL(withProtocol);
        return withProtocol;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const extractDomainName = (urlStr) => {
    try {
      const url = new URL(urlStr);
      let hostname = url.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      const parts = hostname.split('.');
      if (parts.length > 0) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
      return hostname;
    } catch (e) {
      return 'New Link';
    }
  };

  // --- Actions ---

  // Add Link
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('Admin login required', 'error');
      return;
    }
    const cleanUrl = sanitizeUrl(urlInput);
    if (!cleanUrl) {
      addToast('Please enter a valid URL', 'error');
      return;
    }

    // Check duplicate
    if (links.some(l => l.url.toLowerCase() === cleanUrl.toLowerCase())) {
      addToast('This link is already in your list', 'info');
    }

    const title = extractDomainName(cleanUrl);
    const newLink = {
      id: Date.now().toString(),
      url: cleanUrl,
      title,
      starred: false,
      createdAt: new Date().toISOString()
    };

    setLinks((prev) => [newLink, ...prev]);
    addToast('Link added successfully', 'success');
    setUrlInput('');
  };

  // One-Click Add from Clipboard
  const handleClipboardImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanUrl = sanitizeUrl(text);

      if (!cleanUrl) {
        addToast('No valid URL found in clipboard', 'error');
        return;
      }

      const isDuplicate = links.some(l => l.url.toLowerCase() === cleanUrl.toLowerCase());
      if (isDuplicate) {
        addToast('This link is already in your list', 'info');
        return;
      }

      const title = extractDomainName(cleanUrl);
      const newLink = {
        id: Date.now().toString(),
        url: cleanUrl,
        title,
        starred: false,
        createdAt: new Date().toISOString()
      };

      setLinks((prev) => [newLink, ...prev]);
      addToast(`Added: ${title}`, 'success');
    } catch (err) {
      addToast('Unable to read clipboard. Please check browser permissions.', 'error');
    }
  };

  // Toggle Starred
  const handleToggleStar = (id) => {
    setLinks((prev) => 
      prev.map((link) => 
        link.id === id ? { ...link, starred: !link.starred } : link
      )
    );
  };

  // Delete Link
  const handleDeleteLink = (id) => {
    if (!isAdmin) {
      addToast('Admin login required', 'error');
      return;
    }
    const link = links.find(l => l.id === id);
    if (confirm(`Delete "${link?.title || 'this link'}"?`)) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      addToast('Link deleted', 'success');
    }
  };

  // Edit Link Details
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('Admin login required', 'error');
      return;
    }
    const cleanUrl = sanitizeUrl(modalInput.url);
    if (!cleanUrl) {
      addToast('Invalid URL', 'error');
      return;
    }

    setLinks((prev) => 
      prev.map((l) => 
        l.id === editingLink.id 
          ? {
              ...l,
              url: cleanUrl,
              title: modalInput.title.trim() || extractDomainName(cleanUrl)
            }
          : l
      )
    );

    addToast('Link updated', 'success');
    setEditingLink(null);
  };

  // Export to JSON
  const handleExportData = () => {
    if (!isAdmin) {
      addToast('Admin login required', 'error');
      return;
    }
    try {
      const dataStr = JSON.stringify(links, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LinkVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Backup exported successfully', 'success');
    } catch (e) {
      addToast('Export failed', 'error');
    }
  };

  // Import from JSON File
  const handleImportData = (e) => {
    if (!isAdmin) {
      addToast('Admin login required', 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          const valid = imported.every(item => item && typeof item === 'object' && item.url && item.title);
          if (valid) {
            const existingUrls = new Set(links.map(l => l.url.toLowerCase()));
            const newItems = imported.filter(item => !existingUrls.has(item.url.toLowerCase())).map(item => ({
              ...item,
              id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
              createdAt: item.createdAt || new Date().toISOString()
            }));

            if (newItems.length === 0) {
              addToast('All imported links are already in your list', 'info');
            } else {
              setLinks(prev => [...newItems, ...prev]);
              addToast(`Imported ${newItems.length} new links`, 'success');
            }
          } else {
            addToast('Invalid file format. Missing required fields.', 'error');
          }
        } else {
          addToast('File content must be an array of links', 'error');
        }
      } catch (err) {
        addToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear All
  const handleClearAll = () => {
    if (!isAdmin) {
      addToast('Admin login required', 'error');
      return;
    }
    if (confirm('Warning: This will permanently delete all your links. Are you sure?')) {
      setLinks([]);
      addToast('All data cleared', 'info');
    }
  };

  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      const isInside = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInside) {
        setEditingLink(null);
      }
    }
  };

  // --- Filtering & Searching ---
  const filteredLinks = links
    .filter((link) => {
      if (filterMode === 'starred') return link.starred;
      return true;
    })
    .filter((link) => {
      const search = searchQuery.toLowerCase().trim();
      if (!search) return true;
      return (
        link.title.toLowerCase().includes(search) ||
        link.url.toLowerCase().includes(search)
      );
    });

  return (
    <div className="app-container">
      {/* Toast Overlay */}
      <div className="toast-container">
        {toastList.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
            {toast.type === 'success' && <Check className="toast-icon" />}
            {toast.type === 'error' && <AlertCircle className="toast-icon" />}
            {toast.type === 'info' && <Info className="toast-icon" />}
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Bookmark size={20} fill="currentColor" />
          </div>
          <h1 className="logo-text">
            LinkVault
            <span className="logo-version">v1.0</span>
          </h1>
        </div>
        
        <div className="header-actions">
          <div className="stats-badge">
            <span>{links.length} bookmarks</span>
          </div>
          {isAdmin ? (
            <button 
              className="btn-icon"
              onClick={handleLogout}
              title="Log Out (Admin Mode)"
              aria-label="Log out admin"
            >
              <Unlock size={16} />
            </button>
          ) : (
            <button 
              className="btn-icon"
              onClick={() => setShowLoginModal(true)}
              title="Admin Log In"
              aria-label="Admin log in"
            >
              <Lock size={16} />
            </button>
          )}
          <button 
            className="btn-icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Main Core */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section className="hero-section">
          <h2 className="hero-title">Keep your inspiration</h2>
          <p className="hero-desc">An ultra-minimalist space to collect web pages. Copy any URL and paste it instantly to save it locally.</p>
        </section>

        {/* Minimal Adding Card */}
        {isAdmin && (
          <section className="quick-import-card">
            <form onSubmit={handleAddSubmit}>
              <div className="paste-action-wrapper">
                <div className="paste-input-container">
                  <Link2 className="paste-input-icon" />
                  <input
                    type="text"
                    className="url-input"
                    placeholder="Paste URL here..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Minimal Search & Filter Pills */}
        <section className="search-filter-section">
          <div className="search-bar-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-pills-container">
            <button
              className={`filter-pill ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All Bookmarks
              <span className="filter-pill-count">{links.length}</span>
            </button>
            
            <button
              className={`filter-pill ${filterMode === 'starred' ? 'active' : ''}`}
              onClick={() => setFilterMode('starred')}
            >
              <Star size={13} fill={filterMode === 'starred' ? 'currentColor' : 'none'} style={{ color: filterMode === 'starred' ? 'inherit' : 'var(--star)' }} />
              Favorites
              <span className="filter-pill-count">{links.filter(l => l.starred).length}</span>
            </button>
          </div>
        </section>

        {/* Grid List */}
        {filteredLinks.length > 0 ? (
          <section className="links-grid">
            {filteredLinks.map((link) => (
              <div 
                key={link.id} 
                className="link-card"
              >
                <div className="link-card-body">
                  <Favicon url={link.url} title={link.title} />
                  
                  <div className="link-card-info">
                    <h3 className="link-title" title={link.title}>{link.title}</h3>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url" title={link.url}>
                      {new URL(link.url).hostname}
                    </a>
                  </div>
                </div>

                <div className="link-card-footer">
                  <span className="link-date">
                    {new Date(link.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  
                  <div className="card-actions">
                    <button
                      className={`btn-card-action btn-star ${link.starred ? 'starred' : ''}`}
                      onClick={() => handleToggleStar(link.id)}
                      title={link.starred ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                      <Star size={14} fill={link.starred ? 'var(--star)' : 'none'} />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          className="btn-card-action"
                          onClick={() => setEditingLink(link)}
                          title="Edit Details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn-card-action btn-delete"
                          onClick={() => handleDeleteLink(link.id)}
                          title="Delete Bookmark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-open-link"
                      title="Open Link"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-state-icon">
              <Search size={20} />
            </div>
            <h3 className="empty-state-title">No bookmarks found</h3>
            <p className="empty-state-desc">
              {searchQuery 
                ? 'Try matching other keywords or clearing filters.' 
                : 'Your list is empty. Paste a URL above to save your first bookmark!'}
            </p>
            {searchQuery && (
              <button className="btn-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            )}
          </section>
        )}
      </main>

      {/* Admin Login Dialog */}
      <dialog 
        ref={loginDialogRef} 
        onClick={handleLoginDialogClick}
        aria-labelledby="loginModalTitle"
      >
        <div className="modal-header">
          <h3 id="loginModalTitle" className="modal-title">Admin Login</h3>
          <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleLoginSubmit}>
          <div className="modal-body">
            {loginError && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="farfallahu@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Log In
            </button>
          </div>
        </form>
      </dialog>

      {/* Edit Dialog Modal (URL and Title only, ultra-clean) */}
      <dialog 
        ref={dialogRef} 
        onClick={handleDialogClick}
        aria-labelledby="modalTitle"
      >
        <div className="modal-header">
          <h3 id="modalTitle" className="modal-title">Edit Bookmark</h3>
          <button className="modal-close-btn" onClick={() => setEditingLink(null)}>
            <X size={18} />
          </button>
        </div>
        
        {editingLink && (
          <form onSubmit={handleEditSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={modalInput.title}
                  onChange={(e) => setModalInput({ ...modalInput, title: e.target.value })}
                  placeholder="Website name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link Address (URL)</label>
                <input
                  type="text"
                  className="form-input"
                  value={modalInput.url}
                  onChange={(e) => setModalInput({ ...modalInput, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setEditingLink(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* GitHub Token Setup Modal */}
      <dialog 
        ref={tokenDialogRef} 
        onClick={(e) => {
          if (e.target === tokenDialogRef.current) {
            const rect = tokenDialogRef.current.getBoundingClientRect();
            const isInside = (
              rect.top <= e.clientY &&
              e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX &&
              e.clientX <= rect.left + rect.width
            );
            if (!isInside) {
              setShowTokenModal(false);
            }
          }
        }}
        aria-labelledby="tokenModalTitle"
      >
        <div className="modal-header">
          <h3 id="tokenModalTitle" className="modal-title">Cloud Sync Settings</h3>
          <button className="modal-close-btn" onClick={() => setShowTokenModal(false)}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSaveToken}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
              To save links directly to your website without downloading files, enter your GitHub Personal Access Token (PAT).
            </p>
            <div className="form-group">
              <label className="form-label">GitHub Access Token</label>
              <input
                type="password"
                className="form-input"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_..."
                required
              />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: '1.3' }}>
              * Security Note: The token is saved strictly inside your browser's private local storage. It is never sent to any server except the official GitHub API.
            </p>
          </div>

          <div className="modal-footer">
            {localStorage.getItem('linkvault_github_token') && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ color: 'var(--danger)', marginRight: 'auto' }}
                onClick={() => {
                  localStorage.removeItem('linkvault_github_token');
                  setTokenInput('');
                  setShowTokenModal(false);
                  addToast('Token removed', 'info');
                }}
              >
                Remove Token
              </button>
            )}
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowTokenModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save & Sync
            </button>
          </div>
        </form>
      </dialog>

      {/* Bottom Data Center */}
      <footer className="app-footer">
        <div className="settings-bar">
          <div className="footer-credits">
            <span>Powered by React & LocalStorage</span>
            <span>•</span>
            <span>Made with 🤍 by</span>
            <a href="https://farfallahu.com" target="_blank" rel="noopener noreferrer" className="credit-link">
              Farfalla Hu
            </a>
          </div>

          {isAdmin && (
            <div className="settings-actions">
              <button className="btn-secondary" onClick={handleCloudSync} style={{ color: 'var(--primary)' }}>
                <RefreshCw size={13} />
                Sync to Cloud
              </button>

              <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={13} />
                Import Backup
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  onChange={handleImportData} 
                />
              </label>
              
              <button className="btn-secondary" onClick={handleExportData}>
                <Download size={13} />
                Export Backup
              </button>
              
              <button className="btn-secondary" onClick={handleClearAll} style={{ color: 'var(--danger)', borderColor: 'rgba(255, 59, 48, 0.2)' }}>
                <Trash2 size={13} />
                Clear All
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
