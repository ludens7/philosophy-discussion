// ==========================================================================
// Philosophy & Literature Discussion Workspace - Application Logic
// ==========================================================================

// 1. Core Data: Loaded globally from data.js

// 2. Application State Management
let state = {
    currentView: 'dashboard-view',
    selectedConcept: null,
    activePhilosophyIndex: 0,
    activeCategory: 'all',
    collectedQuotes: [],
    outlines: [],
    // Holds currently edited outline in the Debate Prep Board
    currentOutlineDraft: {
        valueId: '',
        topic: '',
        thesis: '',
        arguments: '',
        rebuttals: '',
        conclusion: ''
    }
};

// 2-1. Category Classification Map
const CATEGORY_MAP = {
    negative: [
        'anxiety', 'fear', 'anger', 'jealousy', 'sadness', 'boredom', 'loneliness', 'guilt', 
        'despair', 'shame', 'humiliation', 'hatred', 'longing', 'burnout', 'regret', 'contempt',
        'emptiness', 'alienation', 'envy', 'melancholy', 'vanity', 'ressentiment', 'suspicion', 'grief',
        'cynicism', 'horror', 'ennui'
    ],
    positive: [
        'happiness', 'gratitude', 'joy', 'hope', 'love', 'courage', 'compassion', 'solidarity', 
        'relief', 'serenity', 'awe', 'wonder', 'pride', 'contentment', 'ecstasy', 'inspiration',
        'elation', 'consolation', 'peace', 'intimacy', 'flow', 'optimism', 'anticipation', 'delight',
        'sublime', 'autarky', 'humor'
    ],
    values: [
        'justice', 'friendship', 'freedom', 'acceptance', 'greed', 'hubris', 'forgiveness', 'beauty', 
        'truth', 'responsibility', 'wisdom', 'tolerance', 'temperance', 'creativity', 'dignity', 'duty',
        'sincerity', 'mercy', 'hospitality', 'humility', 'trust', 'patience', 'fairness', 'autonomy',
        'honesty', 'non-violence', 'honor'
    ],
    existential: [
        'death', 'nihilism', 'doubt', 'passion', 'inferiority', 'identity', 'time', 'memory', 
        'meaning', 'the-other', 'fate', 'labor', 'power', 'language', 'play', 'body',
        'absurdity', 'existence', 'history', 'consciousness', 'transcendence', 'nothingness', 'choice', 'having',
        'solitude', 'technology', 'desire', 'contingency'
    ]
};

// 3. LocalStorage Helpers
const STORAGE_KEYS = {
    QUOTES: 'wisdom_library_quotes',
    OUTLINES: 'wisdom_library_outlines',
    QUICK_NOTES: 'wisdom_library_quick_notes_'
};

function saveStateToStorage() {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.collectedQuotes));
    localStorage.setItem(STORAGE_KEYS.OUTLINES, JSON.stringify(state.outlines));
}

function loadStateFromStorage() {
    try {
        const quotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
        const outlines = localStorage.getItem(STORAGE_KEYS.OUTLINES);
        
        state.collectedQuotes = quotes ? JSON.parse(quotes) : [];
        state.outlines = outlines ? JSON.parse(outlines) : [];
    } catch (e) {
        console.error("로컬 저장소 로딩 실패:", e);
        state.collectedQuotes = [];
        state.outlines = [];
    }
}

// 4. UI Elements Cache
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    sidebar: document.querySelector('.sidebar'),
    sidebarBrand: document.querySelector('.sidebar-brand'),
    mobileToggle: document.querySelector('.mobile-toggle'),
    currentViewTitle: document.getElementById('current-view-title'),
    appOverlay: document.getElementById('app-overlay'),
    
    // Toast
    toast: document.getElementById('app-toast'),
    
    // View Panels
    viewPanels: document.querySelectorAll('.view-panel'),
    dashboardView: document.getElementById('dashboard-view'),
    conceptExplorerView: document.getElementById('concept-explorer-view'),
    debateBoardView: document.getElementById('debate-board-view'),
    reflectionJournalView: document.getElementById('reflection-journal-view'),
    
    // Badge Counts
    quoteCountBadges: document.querySelectorAll('#quote-count'),
    journalCountBadge: document.getElementById('journal-count'),
    
    // Dashboard Components
    valuesGrid: document.getElementById('values-grid'),
    dashboardSearchInput: document.getElementById('dashboard-search-input'),
    
    // Concept Explorer Components
    btnBackToDashboard: document.getElementById('btn-back-to-dashboard'),
    conceptEngTitle: document.getElementById('concept-eng-title'),
    conceptTitle: document.getElementById('concept-title'),
    conceptPhilosophicalQuestion: document.getElementById('concept-philosophical-question'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Material Tabs Detail
    philPerspectivesNav: document.getElementById('phil-perspectives-nav'),
    philAuthor: document.getElementById('phil-author'),
    philSource: document.getElementById('phil-source'),
    philPassage: document.getElementById('phil-passage'),
    philCommentary: document.getElementById('phil-commentary'),
    philConcepts: document.getElementById('phil-concepts'),
    philConceptsContainer: document.getElementById('phil-concepts-container'),
    btnCollectPhil: document.getElementById('btn-collect-phil'),
    
    litAuthor: document.getElementById('lit-author'),
    litSource: document.getElementById('lit-source'),
    litPassage: document.getElementById('lit-passage'),
    litCommentary: document.getElementById('lit-commentary'),
    btnCollectLit: document.getElementById('btn-collect-lit'),
    
    promptsList: document.getElementById('prompts-list'),
    
    // Quick Note
    quickNoteTextarea: document.getElementById('quick-note-textarea'),
    quickSaveStatus: document.getElementById('quick-save-status'),
    btnGoToDebateBoard: document.getElementById('btn-go-to-debate-board'),
    
    // Debate Workspace Components
    debateTopicSelect: document.getElementById('debate-topic-select'),
    debateTitleInput: document.getElementById('debate-title-input'),
    outlineThesis: document.getElementById('outline-thesis'),
    outlineArguments: document.getElementById('outline-arguments'),
    outlineRebuttals: document.getElementById('outline-rebuttals'),
    outlineConclusion: document.getElementById('outline-conclusion'),
    
    // Debate Workspace Actions
    btnResetOutline: document.getElementById('btn-reset-outline'),
    btnSaveOutline: document.getElementById('btn-save-outline'),
    btnExportMarkdown: document.getElementById('btn-export-markdown'),
    workspaceQuotesList: document.getElementById('workspace-quotes-list'),
    btnClearQuotes: document.getElementById('btn-clear-quotes'),
    
    // Reflection Journal Archive
    journalGridContainer: document.getElementById('journal-grid-container'),
    journalSearchInput: document.getElementById('journal-search-input'),
    
    // Slideout for Quotes
    collectedQuotesToggle: document.getElementById('collected-quotes-toggle'),
    quotesSlideout: document.getElementById('quotes-slideout'),
    btnCloseSlideout: document.getElementById('btn-close-slideout'),
    slideoutQuotesList: document.getElementById('slideout-quotes-list')
};

// 5. Toast Notification System
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 6. Navigation Logic
function switchView(viewId, customTitle = null) {
    elements.viewPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(viewId);
    if (targetPanel) {
        targetPanel.classList.add('active');
        state.currentView = viewId;
        
        // Update menu active styling
        elements.navItems.forEach(item => {
            if (item.getAttribute('data-target') === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Special case: if loading debate-board, refresh workspace
        if (viewId === 'debate-board-view') {
            // Check if draft needs loading
            loadDraftToEditor();
            renderWorkspaceQuotes();
        } else if (viewId === 'reflection-journal-view') {
            renderJournalGrid();
        }
        
        // Set breadcrumb title
        if (customTitle) {
            elements.currentViewTitle.textContent = customTitle;
        } else {
            const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
            elements.currentViewTitle.textContent = navBtn ? navBtn.querySelector('span').textContent : '지혜의 서재';
        }
        
        // Auto-close sidebar on mobile
        elements.sidebar.classList.remove('open');
        elements.appOverlay.classList.remove('show');
        
        // Scroll back to top of main content
        document.querySelector('.main-content').scrollTop = 0;
    }
}

// 7. Render Keyword Table on Dashboard
const CAT_META = {
    negative:    { label: '부정적 감정', icon: 'cloud-rain', color: '#fb7185' },
    positive:    { label: '긍정적 감정', icon: 'sun',        color: '#34d399' },
    values:      { label: '가치와 덕목', icon: 'star',       color: '#fbbf24' },
    existential: { label: '실존적 개념', icon: 'infinity',   color: '#a78bfa' }
};

const TRENDING_KEYWORDS = new Set([
    // 부정적 감정 (15)
    "anxiety", "burnout", "helplessness", "loneliness", "nihilism", "envy", "jealousy", "anger", "guilt", "grief", "alienation", "obsession", "impatience", "loss", "embarrassment",
    // 긍정적 감정 (15)
    "comfort", "accomplishment", "excitement", "liberation", "generosity", "joy", "gratitude", "serenity", "hope", "solidarity", "love", "pride", "relief", "awe", "mercy",
    // 가치와 덕목 (15)
    "inclusiveness", "respect", "authenticity", "frugality", "minimalism", "consideration", "coexistence", "justice", "sincerity", "temperance", "courage", "responsibility", "trust", "wisdom", "humility",
    // 실존적 개념 (15)
    "freedom", "being", "essence", "finitude", "death", "identity", "isolation", "meaning", "choice", "decision", "time", "solitude", "absurdity", "transcendence", "selfhood"
]);

function makeRow(item) {
    const row = document.createElement('div');
    row.className = 'kw-row';
    if (TRENDING_KEYWORDS.has(item.id)) {
        row.classList.add('kw-trending');
    }
    row.setAttribute('data-id', item.id);
    row.innerHTML = `
        <i data-lucide="${item.icon}" class="kw-icon"></i>
        <span class="kw-kr">${item.title}</span>
        <i data-lucide="chevron-right" class="kw-arrow"></i>
    `;
    row.addEventListener('click', () => loadConceptExplorer(item.id));
    return row;
}

function renderDashboardCards(searchQuery = '') {
    elements.valuesGrid.innerHTML = '';
    elements.valuesGrid.className = 'kw-table-wrap';

    let base = valuesData;

    // Search filter
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        base = base.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.engTitle.toLowerCase().includes(q) ||
            item.hook.toLowerCase().includes(q)
        );
    }

    if (base.length === 0) {
        elements.valuesGrid.innerHTML = `
            <div class="empty-archive-state" style="padding:60px 20px;">
                <i data-lucide="help-circle"></i>
                <p>일치하는 감정이나 가치가 없습니다.<br>다른 단어로 검색해 보세요.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    if (state.activeCategory === 'all') {
        // 4-column side-by-side table
        const grid = document.createElement('div');
        grid.className = 'kw-all-grid';

        Object.entries(CATEGORY_MAP).forEach(([cat, ids]) => {
            const meta = CAT_META[cat];
            const col = document.createElement('div');
            col.className = 'kw-col';

            const header = document.createElement('div');
            header.className = 'kw-col-header';
            header.style.setProperty('--cat-color', meta.color);
            header.innerHTML = `<i data-lucide="${meta.icon}"></i><span>${meta.label}</span>`;
            col.appendChild(header);

            const items = base.filter(item => ids.includes(item.id));
            items.forEach(item => col.appendChild(makeRow(item)));

            if (items.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'kw-empty';
                empty.textContent = '검색 결과 없음';
                col.appendChild(empty);
            }

            grid.appendChild(col);
        });

        elements.valuesGrid.appendChild(grid);
    } else {
        // Single category: 2-column list
        const ids = CATEGORY_MAP[state.activeCategory] || [];
        const meta = CAT_META[state.activeCategory];
        const items = base.filter(item => ids.includes(item.id));

        const header = document.createElement('div');
        header.className = 'kw-col-header kw-single-header';
        header.style.setProperty('--cat-color', meta.color);
        header.innerHTML = `<i data-lucide="${meta.icon}"></i><span>${meta.label}</span><em>${items.length}개</em>`;
        elements.valuesGrid.appendChild(header);

        const list = document.createElement('div');
        list.className = 'kw-single-grid';
        items.forEach(item => list.appendChild(makeRow(item)));
        elements.valuesGrid.appendChild(list);
    }

    lucide.createIcons();
}


// Helper to render active philosophy perspective
function renderPhilosophyPerspective(concept) {
    const phil = concept.philosophies[state.activePhilosophyIndex];
    if (!phil) return;
    
    const escapedAuthor = encodeURIComponent(phil.author.trim());
    elements.philAuthor.innerHTML = `${phil.author} <a href="https://daily-philosopher.pages.dev/index.html?name=${escapedAuthor}" target="_blank" class="philosopher-link" title="daily-philosopher에서 자세히 보기" style="display: inline-flex; align-items: center; text-decoration: none;"><i data-lucide="external-link" style="width: 14px; height: 14px; margin-left: 6px; color: var(--accent-gold); cursor: pointer;"></i></a>`;
    
    elements.philSource.textContent = phil.source;
    elements.philPassage.textContent = phil.passage;
    elements.philCommentary.textContent = phil.commentary;
    
    if (phil.concepts) {
        elements.philConcepts.textContent = phil.concepts;
        elements.philConceptsContainer.style.display = 'block';
    } else {
        elements.philConcepts.textContent = '';
        elements.philConceptsContainer.style.display = 'none';
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 8. Concept Explorer Detail View Logic
function loadConceptExplorer(conceptId) {
    const concept = valuesData.find(v => v.id === conceptId);
    if (!concept) return;
    
    state.selectedConcept = concept;
    
    // Set Header Info
    elements.conceptEngTitle.textContent = concept.engTitle;
    elements.conceptTitle.textContent = concept.title;
    elements.conceptPhilosophicalQuestion.textContent = `"${concept.question}"`;
    
    // Apply styling variations
    if (concept.theme === 'gold') {
        elements.conceptEngTitle.style.color = 'var(--accent-gold)';
        elements.conceptPhilosophicalQuestion.style.borderLeftColor = 'var(--accent-gold)';
    } else {
        elements.conceptEngTitle.style.color = 'var(--accent-indigo)';
        elements.conceptPhilosophicalQuestion.style.borderLeftColor = 'var(--accent-indigo)';
    }
    
    // Set Philosophy Perspectives Sub-tabs
    elements.philPerspectivesNav.innerHTML = '';
    state.activePhilosophyIndex = 0;
    
    concept.philosophies.forEach((phil, index) => {
        const btn = document.createElement('button');
        btn.className = `perspective-btn ${index === 0 ? 'active' : ''}`;
        btn.innerHTML = `<i data-lucide="user"></i> ${phil.author}`;
        btn.addEventListener('click', () => {
            state.activePhilosophyIndex = index;
            // Update active pill styling
            document.querySelectorAll('.perspective-btn').forEach((b, idx) => {
                if (idx === index) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
            renderPhilosophyPerspective(concept);
        });
        elements.philPerspectivesNav.appendChild(btn);
    });
    
    // Render initial perspective
    renderPhilosophyPerspective(concept);
    
    // Set Literature Tab
    elements.litAuthor.textContent = concept.literature.author;
    elements.litSource.textContent = concept.literature.source;
    elements.litPassage.textContent = concept.literature.passage;
    elements.litCommentary.textContent = concept.literature.commentary;
    
    // Set Prompts Tab
    elements.promptsList.innerHTML = '';
    concept.prompts.forEach((prompt, index) => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <h4><i data-lucide="help-circle"></i> ${prompt.title}</h4>
            <p>${prompt.desc}</p>
            <div class="prompt-card-action">
                <i data-lucide="copy"></i> 복사
            </div>
        `;
        
        // Clicking prompt copies it to clipboard and toast notification
        card.addEventListener('click', () => {
            const promptText = `[토론 화두] ${prompt.title}\n- ${prompt.desc}`;
            navigator.clipboard.writeText(promptText)
                .then(() => {
                    showToast('발제 질문이 클립보드에 복사되었습니다.');
                    // Also auto collect it to the workspace!
                    collectQuote(concept.id, concept.title, `발제 질문`, promptText);
                })
                .catch(err => {
                    console.error('클립보드 복사 실패:', err);
                });
        });
        
        elements.promptsList.appendChild(card);
    });
    
    // Load Quick Reflection Memo
    const savedQuickNote = localStorage.getItem(STORAGE_KEYS.QUICK_NOTES + conceptId) || '';
    elements.quickNoteTextarea.value = savedQuickNote;
    
    // Reset tab navigation
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    elements.tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector('.tab-btn[data-tab="philosophy-tab"]').classList.add('active');
    document.getElementById('philosophy-tab').classList.add('active');
    
    // Refresh icons
    lucide.createIcons();
    
    // Move view
    switchView('concept-explorer-view', `가치 성찰: ${concept.title}`);
}

// 9. Collect Quote Logic
function collectQuote(valueId, valueTitle, source, text) {
    // Prevent duplicate quote additions
    const exists = state.collectedQuotes.some(q => q.text === text);
    if (exists) {
        showToast('이미 수집된 구절입니다.');
        return;
    }
    
    const newQuote = {
        id: Date.now().toString(),
        valueId,
        valueTitle,
        source,
        text
    };
    
    state.collectedQuotes.push(newQuote);
    saveStateToStorage();
    updateBadges();
    renderSlideoutQuotes();
    
    showToast('수집한 구절 보관함에 추가되었습니다.');
}

function removeQuote(quoteId) {
    state.collectedQuotes = state.collectedQuotes.filter(q => q.id !== quoteId);
    saveStateToStorage();
    updateBadges();
    renderSlideoutQuotes();
    renderWorkspaceQuotes();
    
    showToast('수집한 구절이 제거되었습니다.');
}

// 10. Update Badge Counters
function updateBadges() {
    const count = state.collectedQuotes.length;
    elements.quoteCountBadges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
    
    // Reflection outlines count
    elements.journalCountBadge.textContent = state.outlines.length;
}

// 11. Render Quote Lists in Slide-out & Workspace
function renderSlideoutQuotes() {
    elements.slideoutQuotesList.innerHTML = '';
    
    if (state.collectedQuotes.length === 0) {
        elements.slideoutQuotesList.innerHTML = `
            <div class="empty-quote-state">
                <i data-lucide="info"></i>
                <p>수집한 구절이 없습니다.<br>철학이나 문학 본문 아래 버튼을 눌러보세요.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    state.collectedQuotes.forEach(q => {
        const item = document.createElement('div');
        item.className = 'collected-quote-item';
        item.innerHTML = `
            <p>${q.text}</p>
            <div class="quote-source">
                <span>[${q.valueTitle}] ${q.source}</span>
                <button class="quote-remove-btn" data-id="${q.id}" title="제거">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        
        // Remove handler
        item.querySelector('.quote-remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeQuote(q.id);
        });
        
        // Copy to clipboard on item click
        item.addEventListener('click', () => {
            navigator.clipboard.writeText(q.text)
                .then(() => showToast('클립보드에 복사되었습니다! 개요서에 활용하세요.'))
                .catch(err => console.error(err));
        });
        
        elements.slideoutQuotesList.appendChild(item);
    });
    
    lucide.createIcons();
}

function renderWorkspaceQuotes() {
    elements.workspaceQuotesList.innerHTML = '';
    
    if (state.collectedQuotes.length === 0) {
        elements.workspaceQuotesList.innerHTML = `
            <div class="empty-quote-state">
                <i data-lucide="info"></i>
                <p>수집한 구절이 없습니다.<br>대시보드에서 가치를 선택하고 구절을 수집해보세요.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    state.collectedQuotes.forEach(q => {
        const item = document.createElement('div');
        item.className = 'collected-quote-item';
        item.innerHTML = `
            <p>${q.text}</p>
            <div class="quote-source">
                <span>[${q.valueTitle}] ${q.source}</span>
                <button class="quote-remove-btn" data-id="${q.id}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        
        item.querySelector('.quote-remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeQuote(q.id);
        });
        
        // Click copies text and highlights
        item.addEventListener('click', () => {
            navigator.clipboard.writeText(q.text)
                .then(() => showToast('클립보드에 복사되었습니다! 개요서 양식에 붙여넣어 보세요.'))
                .catch(err => console.error(err));
        });
        
        elements.workspaceQuotesList.appendChild(item);
    });
    
    lucide.createIcons();
}

// 12. Auto-saving Quick Notes
let quickNoteTimeout;
elements.quickNoteTextarea.addEventListener('input', () => {
    if (!state.selectedConcept) return;
    
    // Show saving status
    elements.quickSaveStatus.textContent = "저장 중...";
    elements.quickSaveStatus.classList.add('show');
    
    // Save to LocalStorage (Debounced for performance)
    clearTimeout(quickNoteTimeout);
    quickNoteTimeout = setTimeout(() => {
        const valueId = state.selectedConcept.id;
        const text = elements.quickNoteTextarea.value;
        localStorage.setItem(STORAGE_KEYS.QUICK_NOTES + valueId, text);
        
        elements.quickSaveStatus.textContent = "자동 저장됨";
        setTimeout(() => {
            elements.quickSaveStatus.classList.remove('show');
        }, 1500);
    }, 800);
});

// 13. Debate Prep Workspace Logic
function populateTopicSelector() {
    elements.debateTopicSelect.innerHTML = '';
    
    // Add default empty option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- 가치 선택 --';
    elements.debateTopicSelect.appendChild(defaultOpt);
    
    valuesData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.title;
        elements.debateTopicSelect.appendChild(option);
    });
}

function loadDraftToEditor() {
    const valSelect = elements.debateTopicSelect.value;
    if (!valSelect) return;
    
    // Fill values based on draft
    elements.debateTitleInput.value = state.currentOutlineDraft.topic;
    elements.outlineThesis.value = state.currentOutlineDraft.thesis;
    elements.outlineArguments.value = state.currentOutlineDraft.arguments;
    elements.outlineRebuttals.value = state.currentOutlineDraft.rebuttals;
    elements.outlineConclusion.value = state.currentOutlineDraft.conclusion;
}

function syncFormToDraft() {
    state.currentOutlineDraft.valueId = elements.debateTopicSelect.value;
    state.currentOutlineDraft.topic = elements.debateTitleInput.value;
    state.currentOutlineDraft.thesis = elements.outlineThesis.value;
    state.currentOutlineDraft.arguments = elements.outlineArguments.value;
    state.currentOutlineDraft.rebuttals = elements.outlineRebuttals.value;
    state.currentOutlineDraft.conclusion = elements.outlineConclusion.value;
}

// Add event listeners on input/textarea change to sync state
[elements.debateTitleInput, elements.outlineThesis, elements.outlineArguments, elements.outlineRebuttals, elements.outlineConclusion].forEach(input => {
    input.addEventListener('input', syncFormToDraft);
});

// Switch dropdown value
elements.debateTopicSelect.addEventListener('change', () => {
    const valSelect = elements.debateTopicSelect.value;
    state.currentOutlineDraft.valueId = valSelect;
    
    if (valSelect) {
        // Look up if quick notes exist for this value, and pre-populate if nothing written yet
        const quickNoteText = localStorage.getItem(STORAGE_KEYS.QUICK_NOTES + valSelect) || '';
        
        // Load outline default recommendations
        const concept = valuesData.find(v => v.id === valSelect);
        if (concept && !elements.debateTitleInput.value) {
            elements.debateTitleInput.value = `[토론] ${concept.title}에 관한 고찰`;
        }
        
        if (quickNoteText && !elements.outlineThesis.value && !elements.outlineArguments.value) {
            // Pre-fill thesis/argument with note if it's there
            elements.outlineThesis.value = quickNoteText;
        }
        
        syncFormToDraft();
    }
});

// Save Outline to Archive
function saveOutline() {
    const valueId = elements.debateTopicSelect.value;
    const topic = elements.debateTitleInput.value.trim();
    const thesis = elements.outlineThesis.value.trim();
    
    if (!valueId) {
        showToast('성찰할 가치를 먼저 선택해 주세요.');
        elements.debateTopicSelect.focus();
        return;
    }
    
    if (!topic) {
        showToast('토론 주제 또는 제목을 입력해 주세요.');
        elements.debateTitleInput.focus();
        return;
    }
    
    const concept = valuesData.find(v => v.id === valueId);
    
    const newOutline = {
        id: Date.now().toString(),
        valueId,
        valueTitle: concept ? concept.title : '기타',
        topic,
        thesis,
        arguments: elements.outlineArguments.value,
        rebuttals: elements.outlineRebuttals.value,
        conclusion: elements.outlineConclusion.value,
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    
    // Check if we are updating an existing outline (if we re-loaded an archived one)
    if (state.currentOutlineDraft.id) {
        newOutline.id = state.currentOutlineDraft.id;
        state.outlines = state.outlines.map(o => o.id === newOutline.id ? newOutline : o);
        showToast('토론 개요서가 업데이트되었습니다.');
    } else {
        state.outlines.unshift(newOutline);
        showToast('생각 보관함에 저장되었습니다.');
    }
    
    saveStateToStorage();
    updateBadges();
    
    // Reset draft info
    resetOutlineForm(false); // don't wipe everything if user wants to keep editing
}

function resetOutlineForm(wipeAll = true) {
    elements.debateTitleInput.value = '';
    elements.outlineThesis.value = '';
    elements.outlineArguments.value = '';
    elements.outlineRebuttals.value = '';
    elements.outlineConclusion.value = '';
    
    if (wipeAll) {
        elements.debateTopicSelect.value = '';
        state.currentOutlineDraft = {
            valueId: '',
            topic: '',
            thesis: '',
            arguments: '',
            rebuttals: '',
            conclusion: ''
        };
    } else {
        // Keep ID if we were editing
        const savedId = state.currentOutlineDraft.id;
        syncFormToDraft();
        if (savedId) {
            state.currentOutlineDraft.id = savedId;
        }
    }
}

// 14. Export Outline to Markdown File
function exportOutlineMarkdown(outlineData = null) {
    // If no direct data passed, gather from current editor
    let data = outlineData;
    
    if (!data) {
        const valueId = elements.debateTopicSelect.value;
        const topic = elements.debateTitleInput.value.trim();
        
        if (!valueId || !topic) {
            showToast('다운로드할 개요서 내용을 먼저 작성하고 가치를 선택해 주세요.');
            return;
        }
        
        const concept = valuesData.find(v => v.id === valueId);
        
        data = {
            valueTitle: concept ? concept.title : '기타',
            topic,
            thesis: elements.outlineThesis.value,
            arguments: elements.outlineArguments.value,
            rebuttals: elements.outlineRebuttals.value,
            conclusion: elements.outlineConclusion.value,
            date: new Date().toLocaleDateString('ko-KR')
        };
    }
    
    // Build Markdown Contents
    const mdContent = `# [토론 개요서] ${data.topic}

* **토론 가치:** ${data.valueTitle}
* **작성 일자:** ${data.date}

---

## 1. 나의 핵심 주장 (Thesis / Claim)
${data.thesis || '_아직 작성되지 않았습니다._'}

---

## 2. 핵심 논거 및 고전 인용 (Arguments & Evidence)
${data.arguments || '_아직 작성되지 않았습니다._'}

---

## 3. 상대방 예상 반론 및 나의 반박 (Counterarguments & Rebuttals)
${data.rebuttals || '_아직 작성되지 않았습니다._'}

---

## 4. 종합 결론 (Synthesis / Conclusion)
${data.conclusion || '_아직 작성되지 않았습니다._'}

---
*지혜의 서재 | 철학 & 문학 토론 워크스페이스에서 작성된 문서입니다.*
`;

    // Create Download Link
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Clean filename
    const fileName = `${data.valueTitle}_토론개요서_${data.topic.replace(/[\s\?\\\/\|\*\:\<\>]/g, '_')}.md`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('마크다운 파일 다운로드가 시작되었습니다.');
}

// 15. Reflection Journal Archive Logic
function renderJournalGrid(searchQuery = '') {
    elements.journalGridContainer.innerHTML = '';
    
    let filteredOutlines = state.outlines;
    
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredOutlines = state.outlines.filter(o => 
            o.topic.toLowerCase().includes(query) || 
            o.valueTitle.toLowerCase().includes(query) ||
            o.thesis.toLowerCase().includes(query)
        );
    }
    
    if (filteredOutlines.length === 0) {
        elements.journalGridContainer.innerHTML = `
            <div class="empty-archive-state">
                <i data-lucide="archive"></i>
                <p>${searchQuery ? '검색 결과에 맞는 개요서가 없습니다.' : '보관된 토론 개요서가 없습니다.'}<br>토론 준비실에서 소중한 사유를 기록해 보세요.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    filteredOutlines.forEach(o => {
        const card = document.createElement('div');
        card.className = 'journal-card';
        card.innerHTML = `
            <div class="journal-card-header">
                <span class="journal-tag tag-${o.valueId}">${o.valueTitle}</span>
                <span class="journal-date">${o.date.split('일')[0] + '일'}</span>
            </div>
            <h3>${o.topic}</h3>
            <p class="journal-preview">${o.thesis || '주장이 아직 입력되지 않았습니다.'}</p>
            <div class="journal-actions">
                <button class="btn btn-secondary btn-sm btn-load" data-id="${o.id}">
                    <i data-lucide="edit-3"></i> 불러오기
                </button>
                <button class="btn btn-secondary btn-sm btn-export" data-id="${o.id}">
                    <i data-lucide="download"></i> 내보내기
                </button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${o.id}">
                    <i data-lucide="trash-2"></i> 삭제
                </button>
            </div>
        `;
        
        // Hook up actions
        card.querySelector('.btn-load').addEventListener('click', () => {
            loadOutlineToWorkspace(o.id);
        });
        
        card.querySelector('.btn-export').addEventListener('click', () => {
            exportOutlineMarkdown(o);
        });
        
        card.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm('이 토론 개요서를 삭제하시겠습니까?')) {
                deleteOutline(o.id);
            }
        });
        
        elements.journalGridContainer.appendChild(card);
    });
    
    lucide.createIcons();
}

function loadOutlineToWorkspace(outlineId) {
    const outline = state.outlines.find(o => o.id === outlineId);
    if (!outline) return;
    
    // Sync to editor state
    state.currentOutlineDraft = { ...outline };
    
    // Set UI fields
    elements.debateTopicSelect.value = outline.valueId;
    elements.debateTitleInput.value = outline.topic;
    elements.outlineThesis.value = outline.thesis;
    elements.outlineArguments.value = outline.arguments;
    elements.outlineRebuttals.value = outline.rebuttals;
    elements.outlineConclusion.value = outline.conclusion;
    
    switchView('debate-board-view');
    showToast('개요서를 편집할 수 있도록 토론 준비실로 불러왔습니다.');
}

function deleteOutline(outlineId) {
    state.outlines = state.outlines.filter(o => o.id !== outlineId);
    saveStateToStorage();
    updateBadges();
    
    // If the currently edited draft is the deleted one, clear editor
    if (state.currentOutlineDraft.id === outlineId) {
        resetOutlineForm(true);
    }
    
    renderJournalGrid(elements.journalSearchInput.value);
    showToast('개요서가 삭제되었습니다.');
}

// 16. Event Listeners Setup
function initEventListeners() {
    // Left Sidebar Navigation Clicks
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

    // Sidebar brand click to return to dashboard
    if (elements.sidebarBrand) {
        elements.sidebarBrand.addEventListener('click', () => {
            switchView('dashboard-view');
        });
    }

    // Mobile Sidebar Toggle
    elements.mobileToggle.addEventListener('click', () => {
        elements.sidebar.classList.add('open');
        elements.appOverlay.classList.add('show');
    });

    // Overlay click (closes menus)
    elements.appOverlay.addEventListener('click', () => {
        elements.sidebar.classList.remove('open');
        elements.quotesSlideout.classList.remove('open');
        elements.appOverlay.classList.remove('show');
    });

    // Back button in Explorer
    elements.btnBackToDashboard.addEventListener('click', () => {
        switchView('dashboard-view');
    });

    // Welcome header click to return to dashboard
    const welcomeHeader = document.getElementById('common-welcome-header');
    if (welcomeHeader) {
        welcomeHeader.addEventListener('click', () => {
            switchView('dashboard-view');
        });
    }

    // Explorer Tabs toggling
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            elements.tabButtons.forEach(b => b.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Quote collection triggers
    elements.btnCollectPhil.addEventListener('click', () => {
        if (!state.selectedConcept) return;
        const concept = state.selectedConcept;
        const phil = concept.philosophies[state.activePhilosophyIndex];
        if (!phil) return;
        collectQuote(
            concept.id,
            concept.title,
            phil.source,
            phil.passage
        );
    });

    elements.btnCollectLit.addEventListener('click', () => {
        if (!state.selectedConcept) return;
        const concept = state.selectedConcept;
        collectQuote(
            concept.id,
            concept.title,
            concept.literature.source,
            concept.literature.passage
        );
    });

    // Switch from Explorer Quick Prep to full Debate Board Workspace
    elements.btnGoToDebateBoard.addEventListener('click', () => {
        if (!state.selectedConcept) return;
        
        elements.debateTopicSelect.value = state.selectedConcept.id;
        state.currentOutlineDraft.valueId = state.selectedConcept.id;
        
        // Trigger select change logic manually to prep form
        const event = new Event('change');
        elements.debateTopicSelect.dispatchEvent(event);
        
        switchView('debate-board-view');
    });

    // Quote Slide-out display handlers
    elements.collectedQuotesToggle.addEventListener('click', () => {
        renderSlideoutQuotes();
        elements.quotesSlideout.classList.add('open');
        elements.appOverlay.classList.add('show');
    });

    elements.btnCloseSlideout.addEventListener('click', () => {
        elements.quotesSlideout.classList.remove('open');
        elements.appOverlay.classList.remove('show');
    });

    // Debate board workspace triggers
    elements.btnResetOutline.addEventListener('click', () => {
        if (confirm('작성 중인 개요서 내용을 모두 초기화하시겠습니까?')) {
            resetOutlineForm(true);
            showToast('내용이 초기화되었습니다.');
        }
    });

    elements.btnSaveOutline.addEventListener('click', saveOutline);
    elements.btnExportMarkdown.addEventListener('click', () => exportOutlineMarkdown(null));
    
    elements.btnClearQuotes.addEventListener('click', () => {
        if (state.collectedQuotes.length === 0) return;
        if (confirm('수집한 모든 구절을 삭제하시겠습니까?')) {
            state.collectedQuotes = [];
            saveStateToStorage();
            updateBadges();
            renderWorkspaceQuotes();
            renderSlideoutQuotes();
            showToast('구절 보관함이 비워졌습니다.');
        }
    });

    // Search input filtering for journal archive
    elements.journalSearchInput.addEventListener('input', () => {
        renderJournalGrid(elements.journalSearchInput.value);
    });

    // Search input filtering for dashboard
    elements.dashboardSearchInput.addEventListener('input', () => {
        renderDashboardCards(elements.dashboardSearchInput.value);
    });

    // Category tab filtering for dashboard
    document.getElementById('category-tabs').addEventListener('click', (e) => {
        const tab = e.target.closest('.cat-tab');
        if (!tab) return;
        document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.getAttribute('data-cat');
        elements.dashboardSearchInput.value = '';
        renderDashboardCards();
    });
}

// 17-1. Render category count badges on tabs
function renderCategoryBadges() {
    const allCount = valuesData.length;
    document.querySelector('.cat-tab[data-cat="all"]').innerHTML =
        `<i data-lucide="layout-grid"></i> <span class="tab-text-full">전체</span><span class="tab-text-short">전체</span> <span class="cat-count">${allCount}</span>`;

    Object.entries(CATEGORY_MAP).forEach(([cat, ids]) => {
        const tab = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
        if (!tab) return;
        const count = valuesData.filter(item => ids.includes(item.id)).length;
        const labelMap = {
            negative: '<i data-lucide="cloud-rain"></i> <span class="tab-text-full">부정적 감정</span><span class="tab-text-short">부정</span>',
            positive: '<i data-lucide="sun"></i> <span class="tab-text-full">긍정적 감정</span><span class="tab-text-short">긍정</span>',
            values:   '<i data-lucide="star"></i> <span class="tab-text-full">가치와 덕목</span><span class="tab-text-short">가치</span>',
            existential: '<i data-lucide="infinity"></i> <span class="tab-text-full">실존적 개념</span><span class="tab-text-short">실존</span>'
        };
        tab.innerHTML = `${labelMap[cat]} <span class="cat-count">${count}</span>`;
    });
    lucide.createIcons();
}

// 17. Initialization
function init() {
    loadStateFromStorage();
    updateBadges();
    populateTopicSelector();
    renderDashboardCards();
    renderCategoryBadges();
    initEventListeners();
    
    // Check if there is an active workspace view from storage (default to dashboard)
    switchView('dashboard-view');
}

// Fire app
document.addEventListener('DOMContentLoaded', init);

// PWA Installation & Modal Control
(function() {
    let deferredPrompt = null;
    
    window.addEventListener('load', () => {
        const installBtn = document.getElementById('pwa-install-btn');
        const pwaModal = document.getElementById('pwa-modal');
        const pwaModalClose = document.getElementById('pwa-modal-close');
        const pwaModalBtnAction = document.getElementById('pwa-modal-btn-action');

        // 이미 standalone 모드로 구동 중인 경우 버튼 감춤
        if (window.matchMedia('(display-mode: standalone)').matches) {
            if (installBtn) installBtn.style.display = 'none';
        }

        // 브라우저가 PWA 설치를 지원하고 준비가 된 경우
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (installBtn) {
                installBtn.style.display = 'inline-flex';
            }
        });

        // 설치 버튼 클릭 핸들링
        if (installBtn) {
            installBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // welcome-header 클릭 이벤트 방지
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`PWA user choice outcome: ${outcome}`);
                    deferredPrompt = null;
                } else {
                    // 직접 설치가 불가능한 환경(예: iOS 사파리)인 경우 안내 모달 노출
                    if (pwaModal) pwaModal.style.display = 'flex';
                }
            });
        }

        // 모달 닫기 제어
        function closePwaModal() {
            if (pwaModal) pwaModal.style.display = 'none';
        }

        if (pwaModalClose) pwaModalClose.addEventListener('click', closePwaModal);
        if (pwaModalBtnAction) pwaModalBtnAction.addEventListener('click', closePwaModal);
        if (pwaModal) {
            pwaModal.addEventListener('click', (e) => {
                if (e.target === pwaModal) closePwaModal();
            });
        }

        // 설치 완료 시 버튼 감춤
        window.addEventListener('appinstalled', () => {
            console.log('PWA app successfully installed!');
            if (installBtn) installBtn.style.display = 'none';
            closePwaModal();
        });
    });
})();
