// ===== LANGUAGE SWITCHER =====
let currentLang = 'tg';

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        switchLanguage(currentLang);
    });
});

function switchLanguage(lang) {
    // Update all text elements with data-tg / data-ru
    document.querySelectorAll('[data-tg]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (!text) return;

        // Use innerHTML only for elements that contain HTML (like <br>)
        if (text.includes('&lt;') || text.includes('<br')) {
            el.innerHTML = text;
        } else {
            el.textContent = text;
        }
    });

    // Update placeholders
    document.querySelectorAll(`[data-${lang}-placeholder]`).forEach(el => {
        el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });

    // Update select options
    document.querySelectorAll('option[data-tg]').forEach(opt => {
        const text = opt.getAttribute(`data-${lang}`);
        if (text) opt.textContent = text;
    });

    // Update page title
    document.title = lang === 'tg'
        ? 'Yordam.tj — Хизматрасонӣ дар Тоҷикистон'
        : 'Yordam.tj — Услуги в Таджикистане';

    // Update html lang
    document.documentElement.lang = lang === 'tg' ? 'tg' : 'ru';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = lang === 'tg'
            ? 'Платформаи хизматрасонӣ №1 дар Тоҷикистон. Устодон ва мутахассисонро барои ҳар кор ёбед: таъмир, тозакунӣ, боркашонӣ, IT ва ғайра.'
            : 'Платформа услуг №1 в Таджикистане. Найдите мастеров и специалистов для любой работы: ремонт, уборка, грузоперевозки, IT и другое.';
    }
}

// ===== MODALS =====
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const createTaskModal = document.getElementById('createTaskModal');

// Open login
document.querySelectorAll('.btn-login').forEach(btn => {
    btn.addEventListener('click', () => openModal(loginModal));
});

// Open register
document.querySelectorAll('.btn-register').forEach(btn => {
    btn.addEventListener('click', () => openModal(registerModal));
});

// Switch between login/register
document.querySelectorAll('.link-register').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        setTimeout(() => openModal(registerModal), 200);
    });
});

document.querySelectorAll('.link-login').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        setTimeout(() => openModal(loginModal), 200);
    });
});

// Close modals
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(btn.closest('.modal-overlay'));
    });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
    });
});

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus first input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 300);
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ESC to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m));
    }
});

// ===== REGISTER TABS (Client / Master) =====
const masterFields = document.getElementById('masterFields');

document.querySelectorAll('.reg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.reg-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Show/hide master-specific fields
        if (masterFields) {
            if (tab.dataset.role === 'master') {
                masterFields.classList.add('active');
            } else {
                masterFields.classList.remove('active');
            }
        }
    });
});

// ===== BACKEND API =====
const API_URL = 'http://localhost:3001';

// Сохранить/получить/удалить токен из браузера
function saveToken(token) { localStorage.setItem('yordam_token', token); }
function getToken() { return localStorage.getItem('yordam_token'); }
function saveUser(user) { localStorage.setItem('yordam_user', JSON.stringify(user)); }
function getUser() {
    const u = localStorage.getItem('yordam_user');
    return u ? JSON.parse(u) : null;
}
function logout() {
    localStorage.removeItem('yordam_token');
    localStorage.removeItem('yordam_user');
    updateAuthUI();
}

// ===== UI: ҳолати логин шуда / нашуда =====
function updateAuthUI() {
    const user = getUser();
    const loginBtns = document.querySelectorAll('.btn-login');
    const registerBtns = document.querySelectorAll('.btn-register');
    const userMenus = document.querySelectorAll('.user-menu');

    // Аввал ҳамаи user-menu-ҳои қаблиро тоза мекунем
    userMenus.forEach(m => m.remove());

    if (user) {
        // Юзер логин шудааст: кнопкаҳои "Даромадан"/"Бақайдгирӣ" пинҳон
        loginBtns.forEach(btn => btn.style.display = 'none');
        registerBtns.forEach(btn => {
            btn.style.display = 'none';
            // Пас аз кнопкаи register, user-menu илова мекунем
            const menu = document.createElement('div');
            menu.className = 'user-menu';
            menu.style.cssText = 'display:flex;align-items:center;gap:8px;';
            menu.innerHTML = `
                <span style="font-weight:600;color:#2563eb;">👤 ${user.name}</span>
                <button type="button" class="btn btn-outline btn-logout" style="padding:6px 14px;">Баромадан</button>
            `;
            btn.parentNode.insertBefore(menu, btn.nextSibling);
        });

        // Ба ҳамаи кнопкаҳои "Баромадан" event илова мекунем
        document.querySelectorAll('.btn-logout').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Воқеан мехоҳед бароед?')) {
                    logout();
                }
            });
        });
    } else {
        // Юзер логин нашудааст: кнопкаҳо нишон диҳем
        loginBtns.forEach(btn => btn.style.display = '');
        registerBtns.forEach(btn => btn.style.display = '');
    }
}

// Ҳангоми боркунии саҳифа — тафтиш кардан
document.addEventListener('DOMContentLoaded', updateAuthUI);

// Универсальная функция для запросов к backend
async function apiRequest(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(API_URL + path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Хатогии сервер');
    return data;
}

// ===== FORM SUBMISSIONS =====
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const createTaskForm = document.getElementById('createTaskForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }
        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const data = await apiRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({ phone, password })
            });
            saveToken(data.token);
            saveUser(data.user);
            updateAuthUI();
            alert(`Хуш омадед, ${data.user.name}!`);
            closeModal(loginModal);
            loginForm.reset();
        } catch (err) {
            alert('Хатогӣ: ' + err.message);
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!registerForm.checkValidity()) {
            registerForm.reportValidity();
            return;
        }
        const name = document.getElementById('regName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;

        try {
            const data = await apiRequest('/api/register', {
                method: 'POST',
                body: JSON.stringify({ name, phone, password })
            });
            saveToken(data.token);
            saveUser(data.user);
            updateAuthUI();
            alert(`Сабти ном муваффақ! Хуш омадед, ${data.user.name}!`);
            closeModal(registerModal);
            registerForm.reset();
        } catch (err) {
            alert('Хатогӣ: ' + err.message);
        }
    });
}

if (createTaskForm) {
    createTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!createTaskForm.checkValidity()) {
            createTaskForm.reportValidity();
            return;
        }
        if (!getToken()) {
            alert('Барои фиристодани заявка аввал ворид шавед');
            return;
        }
        const title = document.getElementById('taskName').value.trim();
        const category = document.getElementById('taskCategory').value;
        const description = document.getElementById('taskDesc').value.trim();
        const budget = document.getElementById('taskBudget').value;
        const address = document.getElementById('taskCity').value;

        try {
            await apiRequest('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ title, category, description, budget: Number(budget), address })
            });
            alert('Заявкаи шумо қабул шуд!');
            closeModal(createTaskModal);
            createTaskForm.reset();
        } catch (err) {
            alert('Хатогӣ: ' + err.message);
        }
    });
}

// ===== FILTER BUTTONS (actually filter tasks) =====
const taskCards = document.querySelectorAll('.task-card[data-category]');
const noResults = document.querySelector('.no-results');

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;
        filterTasks(category);
    });
});

function filterTasks(category) {
    let visibleCount = 0;

    taskCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Show/hide "no results" message
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// ===== SEARCH FUNCTIONALITY (actually filters tasks) =====
const searchInput = document.getElementById('heroSearch');
const searchBtn = document.querySelector('.btn-search');

function performSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        // Reset: show all, reset filter buttons
        taskCards.forEach(card => card.classList.remove('hidden'));
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('.filter-btn[data-category="all"]');
        if (allBtn) allBtn.classList.add('active');
        if (noResults) noResults.style.display = 'none';
        return;
    }

    // Scroll to tasks
    const tasksSection = document.getElementById('tasks');
    if (tasksSection) tasksSection.scrollIntoView({ behavior: 'smooth' });

    // Filter tasks by text content
    let visibleCount = 0;
    taskCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}

if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// ===== SMOOTH SCROLL FOR NAV =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu if open
            if (nav && nav.classList.contains('mobile-open')) {
                nav.classList.remove('mobile-open');
                if (mobileMenuBtn) {
                    mobileMenuBtn.textContent = '☰';
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            }
        }
    });
});

// ===== HEADER SCROLL EFFECT =====
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// ===== MOBILE MENU =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('mobile-open');
        mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
}

// ===== CTA BUTTONS =====
document.querySelectorAll('.cta-actions .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        if (text.includes('Усто') || text.includes('мастером')) {
            openModal(registerModal);
            // Switch to master tab
            const masterTab = document.querySelector('.reg-tab[data-role="master"]');
            if (masterTab) masterTab.click();
        } else {
            openModal(createTaskModal);
        }
    });
});

// ===== "Фармоиш додан" buttons on specialist cards =====
document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', () => openModal(createTaskModal));
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// ===== HERO TAGS CLICK =====
document.querySelectorAll('.hero-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchInput) {
            searchInput.value = tag.textContent;
            performSearch();
        }
    });
});

// ===== REGION SELECTOR =====
const regionBtn = document.getElementById('regionBtn');
const regionDropdown = document.getElementById('regionDropdown');
const regionCurrent = document.getElementById('regionCurrent');

if (regionBtn && regionDropdown) {
    regionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = regionDropdown.classList.toggle('open');
        regionBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.region-option').forEach(option => {
        option.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.region-option').forEach(o => {
                o.classList.remove('active');
                o.setAttribute('aria-selected', 'false');
            });
            option.classList.add('active');
            option.setAttribute('aria-selected', 'true');

            // Update button text
            const cityName = option.getAttribute(`data-${currentLang}`) || option.textContent;
            regionCurrent.textContent = cityName;
            regionCurrent.setAttribute('data-tg', option.getAttribute('data-tg'));
            regionCurrent.setAttribute('data-ru', option.getAttribute('data-ru'));

            // Close dropdown
            regionDropdown.classList.remove('open');
            regionBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!regionBtn.contains(e.target) && !regionDropdown.contains(e.target)) {
            regionDropdown.classList.remove('open');
            regionBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ===== CHAT WIDGET =====
const chatFab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const chatBadge = document.getElementById('chatBadge');
const chatFabIcon = document.getElementById('chatFabIcon');

// Chat bot answers
const chatAnswers = {
    tg: {
        'find-master': 'Барои ёфтани усто, шумо метавонед:\n\n1️⃣ Дар сатри ҷустуҷӯ номи хизматро нависед\n2️⃣ Категорияро интихоб кунед\n3️⃣ Ё фармоиши нав созед — устодон худашон ба шумо ҷавоб медиҳанд!',
        'become-master': 'Барои усто шудан:\n\n1️⃣ Тугмаи "Бақайдгирӣ" -ро пахш кунед\n2️⃣ "Усто"-ро интихоб кунед\n3️⃣ Маълумотро пур кунед\n\nБақайдгирӣ ройгон аст! 🎉',
        'how-it-works': 'Yordam.tj хеле осон кор мекунад:\n\n1️⃣ Фармоиш диҳед — корро тавсиф кунед\n2️⃣ Устодон ҷавоб медиҳанд — нарх ва вақтро пешниҳод мекунанд\n3️⃣ Беҳтаринро интихоб кунед — рейтинг ва тавсифотро муқоиса кунед',
        'pricing': 'Барои муштариён — ройгон! 🆓\n\nШумо ягон пардохт намекунед. Фақат устодон барои дастрасӣ ба фармоишҳо обуна мехаранд.\n\nНархи хизматро бо устодон мувофиқа мекунед.',
        'contact': '📞 Телефон: +992 (44) 600-00-00\n📧 Email: info@yordam.tj\n📱 Telegram: @yordamtj\n\nВақти корӣ: 9:00 — 21:00, ҳар рӯз',
        'default': 'Ташаккур барои паём! Мутахассиси мо ба наздикӣ ба шумо ҷавоб хоҳад дод. ⏳\n\nАгар саволи фаврӣ доред, занг занед: +992 (44) 600-00-00'
    },
    ru: {
        'find-master': 'Чтобы найти мастера, вы можете:\n\n1️⃣ Введите название услуги в строке поиска\n2️⃣ Выберите категорию\n3️⃣ Или создайте новое задание — мастера сами откликнутся!',
        'become-master': 'Чтобы стать мастером:\n\n1️⃣ Нажмите кнопку "Регистрация"\n2️⃣ Выберите "Мастер"\n3️⃣ Заполните данные\n\nРегистрация бесплатна! 🎉',
        'how-it-works': 'Yordam.tj работает очень просто:\n\n1️⃣ Создайте задание — опишите работу\n2️⃣ Мастера откликнутся — предложат цену и сроки\n3️⃣ Выберите лучшего — сравните рейтинги и отзывы',
        'pricing': 'Для заказчиков — бесплатно! 🆓\n\nВы не платите ничего. Только мастера покупают подписку для доступа к заданиям.\n\nСтоимость услуг обсуждается с мастером напрямую.',
        'contact': '📞 Телефон: +992 (44) 600-00-00\n📧 Email: info@yordam.tj\n📱 Telegram: @yordamtj\n\nРежим работы: 9:00 — 21:00, ежедневно',
        'default': 'Спасибо за сообщение! Наш специалист скоро ответит вам. ⏳\n\nЕсли вопрос срочный, позвоните: +992 (44) 600-00-00'
    }
};

function getTimeNow() {
    return new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

function addChatMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isUser ? 'chat-message-user' : 'chat-message-bot'}`;
    msgDiv.innerHTML = `
        <div class="chat-msg-bubble">
            <p>${text.replace(/\n/g, '<br>')}</p>
            <span class="chat-msg-time">${getTimeNow()}</span>
        </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingThenReply(text) {
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message chat-message-bot';
    typingDiv.id = 'chatTyping';
    typingDiv.innerHTML = `<div class="chat-msg-bubble" style="color:var(--gray-400)">●●●</div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
        const typing = document.getElementById('chatTyping');
        if (typing) typing.remove();
        addChatMessage(text, false);
    }, 800 + Math.random() * 600);
}

if (chatFab) {
    chatFab.addEventListener('click', () => {
        const isOpen = chatWindow.classList.toggle('open');
        chatFabIcon.textContent = isOpen ? '✕' : '💬';
        if (isOpen) {
            chatBadge.classList.add('hidden');
            chatInput.focus();
        }
    });
}

if (chatClose) {
    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        chatFabIcon.textContent = '💬';
    });
}

// Quick action buttons
document.querySelectorAll('.chat-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const answerKey = btn.dataset.answer;
        const userText = btn.textContent;
        const answers = chatAnswers[currentLang] || chatAnswers.tg;

        addChatMessage(userText, true);
        showTypingThenReply(answers[answerKey] || answers['default']);
    });
});

// Send custom message
function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, true);
    chatInput.value = '';

    const answers = chatAnswers[currentLang] || chatAnswers.tg;
    showTypingThenReply(answers['default']);
}

if (chatSend) chatSend.addEventListener('click', sendChatMessage);
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}
