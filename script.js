/**
 * Hai Nguyen Thai — Developer Portfolio Application Script
 * Precision Engineering & Silicon Infrastructure Interactive Engine
 * Zero dependencies, pure modern ES6+, fully accessible.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initHeroVisualizer();
    initStatCounters();
    initProjectsModal();
    initCertModal();
    initCommandPalette();
    initCopyEmail();
    initBackToTop();
    initDynamicYear();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const storageKey = 'hai-theme-preference';

    const savedTheme = localStorage.getItem(storageKey);
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

    applyTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem(storageKey, nextTheme);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#070A11' : '#F8FAFC');
        }
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute(
                'aria-label',
                theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
            );
        }
    }
}

/* --------------------------------------------------------------------------
   2. Navigation, Scrollspy & Mobile Drawer
   -------------------------------------------------------------------------- */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Mobile drawer toggle
    if (hamburger && mobileDrawer) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('is-open');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (
                mobileDrawer.classList.contains('is-open') &&
                !mobileDrawer.contains(e.target) &&
                !hamburger.contains(e.target)
            ) {
                closeDrawer();
            }
        });
    }

    function closeDrawer() {
        if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
            mobileDrawer.classList.remove('is-open');
            if (hamburger) {
                hamburger.setAttribute('aria-expanded', 'false');
                mobileDrawer.setAttribute('aria-hidden', 'true');
            }
        }
    }

    // Smooth scroll and auto-close mobile drawer
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });

    // Scrollspy with IntersectionObserver
    if ('IntersectionObserver' in window && sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && window.scrollY >= 100) {
                    const id = entry.target.getAttribute('id');
                    highlightNavLink(id);
                }
            });
        }, observerOptions);

        sections.forEach((section) => sectionObserver.observe(section));
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            highlightNavLink('home');
        }
    }, { passive: true });

    function highlightNavLink(sectionId) {
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }
        });
    }
}



/* --------------------------------------------------------------------------
   3. Interactive Hero System Visualizer
   -------------------------------------------------------------------------- */
function initHeroVisualizer() {
    const tabs = document.querySelectorAll('.panel-tab');
    const tabPanels = document.querySelectorAll('.tab-content');
    const pipelineNodes = document.querySelectorAll('.pipeline-node');

    // Tab switching
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('aria-controls');

            tabs.forEach((t) => {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach((p) => p.classList.remove('is-active'));

            tab.classList.add('is-active');
            tab.setAttribute('aria-selected', 'true');

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('is-active');
            }
        });
    });

    // Pipeline node click feedback
    pipelineNodes.forEach((node) => {
        node.addEventListener('click', () => {
            const nodeName = node.querySelector('.node-name')?.textContent || 'Pipeline Node';
            showToast(`Stage active: ${nodeName}`);
        });
    });
}

/* --------------------------------------------------------------------------
   4. Scroll-Driven Stat Counter Animation
   -------------------------------------------------------------------------- */
function initStatCounters() {
    const proofSection = document.querySelector('.proof-section');
    const counters = document.querySelectorAll('.counter-val[data-target]');
    if (!proofSection || counters.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
        counters.forEach(counter => {
            counter.textContent = counter.getAttribute('data-target');
        });
        return;
    }

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                observer.unobserve(proofSection);
                runCountUp();
            }
        });
    }, { threshold: 0.25 });

    observer.observe(proofSection);

    function runCountUp() {
        const duration = 1400; // ms
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = String(target).includes('.');
                const currentVal = isDecimal 
                    ? (target * easeProgress).toFixed(1) 
                    : Math.round(target * easeProgress);

                counter.textContent = currentVal;
            });

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counters.forEach(counter => {
                    counter.textContent = counter.getAttribute('data-target');
                });
            }
        }

        requestAnimationFrame(update);
    }
}

/* --------------------------------------------------------------------------
   5. Universal Modal Controller
   -------------------------------------------------------------------------- */
class ModalController {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) return;

        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeButtons = this.modal.querySelectorAll('.modal-close-btn, .modal-cancel-btn');
        this.lastFocusedElement = null;

        this.initEvents();
    }

    initEvents() {
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        this.closeButtons.forEach((btn) => {
            btn.addEventListener('click', () => this.close());
        });

        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    open(triggerElement = null) {
        if (!this.modal) return;
        this.lastFocusedElement = triggerElement || document.activeElement;

        this.modal.classList.add('is-active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const firstInput = this.modal.querySelector('input');
        const firstClose = this.modal.querySelector('.modal-close-btn');

        if (firstInput) {
            setTimeout(() => firstInput.focus(), 60);
        } else if (firstClose) {
            setTimeout(() => firstClose.focus(), 60);
        }
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('is-active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
            this.lastFocusedElement.focus();
        }
    }
}



/* --------------------------------------------------------------------------
   7. Project Specifications Modal Data & Controller
   -------------------------------------------------------------------------- */
const projectsData = {
    'corebase-specharness': {
        icon: 'CBS',
        title: 'CoreBase SpecHarness',
        summary: 'An embedded, skills-first spec-driven kit that turns conversational AI into inspectable delivery — bounded context per skill, durable feature artifacts, and mechanically protected closeout.',
        features: [
            '11 peer-level skills covering research, requirements, architecture, task sequencing, TDD implementation, verification, memory curation, ADRs, and harness diagnostics.',
            'Deterministic stdlib Python CLI embedded in repository — zero daemon, zero hosted engine — enabling any coding agent to run lifecycle commands consistently.',
            'Compiles bounded context per skill with a 4,500-token active budget and session auto-delta that cuts repeated context injection by 49–80%.',
            'Records git-trackable feature artifacts (spec, plan, tasks, review) keeping ephemeral session state strictly separate from durable repo memory.',
            'Protects delivery closeout with advisory-by-default verification gates (test, lint, typecheck) so "done" is backed by mechanical evidence.'
        ],
        tags: ['AI Agents', 'Spec-Driven Dev', 'Bounded Context', 'Python CLI', 'Session Auto-Delta', 'Verification Gates', 'Repo Memory'],
        productUrl: 'https://thaihai-swe.github.io/corebase-specharness/',
        githubUrl: 'https://github.com/thaihai-swe/corebase-specharness'
    },
    'dictionary-extension': {
        icon: 'DIC',
        title: 'Dictionary Chrome Extension',
        summary: 'A Manifest V3 Chrome extension that keeps in-page dictionary lookup, neural translation, speech practice, and sentence-aware contextual AI next to the text you are reading.',
        features: [
            'In-page overlay and toolbar popup so readers can look up words, idioms, and phrases without switching tabs or losing context.',
            'Two-phase lookup pipeline: an immediate primary dictionary and translation path, followed by non-blocking enrichment from Wiktionary, Merriam-Webster, Wordnik, and WordsAPI.',
            'Smart lemmatization and phrasal canonicalization ensuring inflected words and idioms resolve cleanly to usable dictionary forms.',
            'Sentence-aware contextual AI: determines word sense in context, grammar nuances, comparative meanings, and provides rewrites when static glossary definitions are insufficient.',
            'Strictly dependency-free: plain JavaScript, CSS, and HTML with a service-worker orchestrator and user-controlled API keys.'
        ],
        tags: ['Chrome Extension', 'Manifest V3', 'Service Worker', 'Dictionary APIs', 'Neural Translation', 'Contextual AI', 'Zero Dependencies'],
        productUrl: 'https://thaihai-swe.github.io/dictionary-extension/',
        githubUrl: 'https://github.com/thaihai-swe/dictionary-extension'
    },
    'ai-summarizer-extension': {
        icon: 'EXT',
        title: 'AI Summarizer Chrome Extension',
        summary: 'A privacy-first Chrome extension that summarizes YouTube videos, long-form articles, and online courses using a pluggable provider registry — supporting cloud and local models.',
        features: [
            'Unified provider registry abstracting Gemini, OpenAI, Ollama, and LM Studio behind a single interface — swapping providers requires zero changes to summarization logic.',
            'Background Service Worker orchestrator routes Chrome messages between Content Script and Side Panel UI, streaming chunks directly as they are generated.',
            'Supports YouTube transcripts via API, webpages via DOM cleaning, selected text, and online courses with automatic content-type detection.',
            'Structured prompt system with 5 tone variations (Simple to Expert), 3 length presets (50–500 words), and 4 modes (Summarize, Analyze, Explain, Debate).',
            'Privacy-first design: local providers (Ollama, LM Studio) transmit zero data externally, with auto-generated follow-up questions and per-tab conversation memory.'
        ],
        tags: ['Chrome Extension', 'Service Worker', 'Local-First AI', 'Gemini / OpenAI', 'Ollama / LM Studio', 'Streaming', 'Prompt Architecture'],
        productUrl: 'https://thaihai-swe.github.io/summarizer-extension/',
        githubUrl: 'https://github.com/thaihai-swe/summarizer-extension'
    }
};

function initProjectsModal() {
    const modalCtrl = new ModalController('projectDetailsModal');
    const detailButtons = document.querySelectorAll('.btn-details');

    const iconEl = document.getElementById('projectDetailsIcon');
    const titleEl = document.getElementById('projectDetailsTitle');
    const summaryEl = document.getElementById('projectDetailsSummary');
    const featuresEl = document.getElementById('projectDetailsFeatures');
    const tagsEl = document.getElementById('projectDetailsTags');
    const productLink = document.getElementById('projectDetailsProductLink');
    const githubLink = document.getElementById('projectDetailsGithubLink');

    detailButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const projectKey = btn.getAttribute('data-project');
            const data = projectsData[projectKey];
            if (!data) return;

            if (iconEl) iconEl.textContent = data.icon;
            if (titleEl) titleEl.textContent = data.title;
            if (summaryEl) summaryEl.textContent = data.summary;

            if (featuresEl) {
                featuresEl.innerHTML = '';
                data.features.forEach((feat) => {
                    const li = document.createElement('li');
                    li.textContent = feat;
                    featuresEl.appendChild(li);
                });
            }

            if (tagsEl) {
                tagsEl.innerHTML = '';
                data.tags.forEach((tag) => {
                    const span = document.createElement('span');
                    span.className = 'tech-tag';
                    span.textContent = tag;
                    tagsEl.appendChild(span);
                });
            }

            if (productLink) {
                if (data.productUrl) {
                    productLink.href = data.productUrl;
                    productLink.hidden = false;
                    productLink.style.display = '';
                } else {
                    productLink.removeAttribute('href');
                    productLink.hidden = true;
                    productLink.style.display = 'none';
                }
            }

            if (githubLink) {
                if (data.githubUrl) {
                    githubLink.href = data.githubUrl;
                    githubLink.hidden = false;
                    githubLink.style.display = '';
                } else {
                    githubLink.removeAttribute('href');
                    githubLink.hidden = true;
                    githubLink.style.display = 'none';
                }
            }

            modalCtrl.open(btn);
        });
    });
}

/* --------------------------------------------------------------------------
   8. Certificate Preview Modal
   -------------------------------------------------------------------------- */
function initCertModal() {
    const certModalCtrl = new ModalController('certModal');
    const certButtons = document.querySelectorAll('.btn-view-cert, .award-btn');

    const titleEl = document.getElementById('certModalTitle');
    const issuerEl = document.getElementById('certModalIssuer');
    const imgEl = document.getElementById('certModalImg');
    const verifyBtn = document.getElementById('certModalVerifyBtn');

    certButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const isAward = btn.classList.contains('award-btn');
            const imageSrc = btn.getAttribute('data-cert-image') || btn.getAttribute('data-cert');
            const certTitle = btn.getAttribute('data-cert-title') || (isAward ? 'Award of Recognition' : 'Certificate of Achievement');
            const certIssuer = btn.getAttribute('data-cert-issuer') || 'Accredited Authority';
            const verifyUrl = !isAward ? btn.getAttribute('data-cert-verify') : null;

            if (titleEl) titleEl.textContent = certTitle;
            if (issuerEl) issuerEl.textContent = certIssuer;

            if (imgEl && imageSrc) {
                const resolvedPath = imageSrc.startsWith('certs/') ? imageSrc : `certs/${imageSrc}`;
                imgEl.src = resolvedPath;
                imgEl.alt = certTitle;
            }

            if (verifyBtn) {
                if (verifyUrl && !isAward) {
                    verifyBtn.href = verifyUrl;
                    verifyBtn.hidden = false;
                    verifyBtn.style.display = '';
                } else {
                    verifyBtn.removeAttribute('href');
                    verifyBtn.hidden = true;
                    verifyBtn.style.display = 'none';
                }
            }

            certModalCtrl.open(btn);
        });
    });
}

/* --------------------------------------------------------------------------
   9. Command Palette (Cmd+K / Ctrl+K)
   -------------------------------------------------------------------------- */
function initCommandPalette() {
    const cmdPaletteBtn = document.getElementById('cmdPaletteBtn');
    const cmdModalCtrl = new ModalController('cmdPaletteModal');
    const cmdInput = document.getElementById('cmdPaletteInput');
    const cmdItems = document.querySelectorAll('.cmd-item');

    // Trigger on button click
    if (cmdPaletteBtn) {
        cmdPaletteBtn.addEventListener('click', () => {
            cmdModalCtrl.open(cmdPaletteBtn);
            resetCommandPalette();
        });
    }

    // Keyboard shortcut (Cmd+K or Ctrl+K)
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const modal = document.getElementById('cmdPaletteModal');
            if (modal && modal.classList.contains('is-active')) {
                cmdModalCtrl.close();
            } else {
                cmdModalCtrl.open();
                resetCommandPalette();
            }
        }
    });

    // Real-time filtering in input
    if (cmdInput) {
        cmdInput.addEventListener('input', () => {
            const query = cmdInput.value.toLowerCase().trim();
            let hasVisible = false;

            cmdItems.forEach((item) => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'flex';
                    hasVisible = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Update selected item
            updateSelection();
        });

        // Arrow keys navigation
        cmdInput.addEventListener('keydown', (e) => {
            const visibleItems = Array.from(cmdItems).filter(item => item.style.display !== 'none');
            const currentIndex = visibleItems.findIndex(item => item.classList.contains('is-selected'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % visibleItems.length;
                selectItem(visibleItems, nextIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
                selectItem(visibleItems, prevIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentIndex >= 0 && visibleItems[currentIndex]) {
                    triggerAction(visibleItems[currentIndex]);
                }
            }
        });
    }

    // Click handler for items
    cmdItems.forEach((item) => {
        item.addEventListener('click', () => {
            triggerAction(item);
        });
    });

    function selectItem(items, index) {
        items.forEach(it => it.classList.remove('is-selected'));
        if (items[index]) {
            items[index].classList.add('is-selected');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    function updateSelection() {
        const visibleItems = Array.from(cmdItems).filter(item => item.style.display !== 'none');
        visibleItems.forEach((it, idx) => {
            if (idx === 0) it.classList.add('is-selected');
            else it.classList.remove('is-selected');
        });
    }

    function resetCommandPalette() {
        if (cmdInput) {
            cmdInput.value = '';
            cmdItems.forEach(item => {
                item.style.display = 'flex';
            });
            updateSelection();
        }
    }

    function triggerAction(item) {
        const action = item.getAttribute('data-action');
        cmdModalCtrl.close();

        if (action === 'nav') {
            const target = item.getAttribute('data-target');
            const targetEl = document.querySelector(target);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (action === 'resume') {
            window.open('resume.pdf', '_blank');
        } else if (action === 'copy-email') {
            navigator.clipboard.writeText('nguyenthaihai00@gmail.com')
                .then(() => showToast('Copied nguyenthaihai00@gmail.com to clipboard!'))
                .catch(() => showToast('Address: nguyenthaihai00@gmail.com'));
        } else if (action === 'theme') {
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn) themeBtn.click();
        } else if (action === 'github') {
            window.open('https://github.com/thaihai-swe', '_blank');
        } else if (action === 'linkedin') {
            window.open('https://linkedin.com/in/haint97', '_blank');
        }
    }
}



/* --------------------------------------------------------------------------
   10. Copy Email Helper & Toast System
   -------------------------------------------------------------------------- */
function initCopyEmail() {
    const copyButtons = document.querySelectorAll('.btn-copy-email');

    copyButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const email = btn.getAttribute('data-email') || 'nguyenthaihai00@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                showToast(`Copied ${email} to clipboard!`);
                const origHTML = btn.innerHTML;
                btn.classList.add('is-copied');
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Copied!</span>
                `;
                setTimeout(() => {
                    btn.classList.remove('is-copied');
                    btn.innerHTML = origHTML;
                }, 1800);
            } catch (err) {
                showToast(`Could not copy email automatically. Address: ${email}`);
            }
        });
    });
}

function showToast(message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success); flex-shrink: 0;">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 200ms ease';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

/* --------------------------------------------------------------------------
   11. Floating Back-to-Top Button
   -------------------------------------------------------------------------- */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* --------------------------------------------------------------------------
   12. Dynamic Year
   -------------------------------------------------------------------------- */
function initDynamicYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}
