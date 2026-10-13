/**
 * Hai Nguyen Thai — Portfolio Application Script
 * Clean Vanilla ES6+, accessible modal manager, theme toggle, and telemetry tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initHeroTabs();
    initStatCounters();
    initProjectsModal();
    initCertModal();
    initVideoDemoModal();
    initCopyEmail();
    initDynamicYear();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const storageKey = 'hai-theme-preference';

    // Retrieve saved theme or default to 'dark'
    const savedTheme = localStorage.getItem(storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // Default dark

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
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#080C14' : '#F8FAFC');
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
   2. Navigation & Mobile Drawer
   -------------------------------------------------------------------------- */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Hamburger toggle
    if (hamburger && mobileDrawer) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('is-open');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        });

        // Close drawer on click outside
        document.addEventListener('click', (e) => {
            if (
                mobileDrawer.classList.contains('is-open') &&
                !mobileDrawer.contains(e.target) &&
                !hamburger.contains(e.target)
            ) {
                mobileDrawer.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileDrawer.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Smooth scroll and auto-close mobile drawer
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
                mobileDrawer.classList.remove('is-open');
                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    mobileDrawer.setAttribute('aria-hidden', 'true');
                }
            }
        });
    });

    // Active Section Tracking via IntersectionObserver
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

    // Top-of-page check to ensure Home is active when at the top
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
                link.classList.add('active');
            } else {
                link.classList.remove('is-active');
                link.classList.remove('active');
            }
        });
    }
}

/* --------------------------------------------------------------------------
   3. Hero Architecture Tabs
   -------------------------------------------------------------------------- */
function initHeroTabs() {
    const tabs = document.querySelectorAll('.panel-tab');
    const tabPanels = document.querySelectorAll('.tab-content');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('aria-controls');

            // Deactivate all
            tabs.forEach((t) => {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach((p) => p.classList.remove('is-active'));

            // Activate current
            tab.classList.add('is-active');
            tab.setAttribute('aria-selected', 'true');

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('is-active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. Universal Modal Controller (Focus Trap + A11y)
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

        // Focus first close button
        const firstClose = this.modal.querySelector('.modal-close-btn');
        if (firstClose) {
            setTimeout(() => firstClose.focus(), 50);
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
   5. Project Specifications Modal
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
        githubUrl: 'https://github.com/thaihai-swe/corebase-specharness',
        demoVideo: null
    },
    'dictionary-extension': {
        icon: 'DIC',
        title: 'Dictionary Chrome Extension',
        summary: 'A Manifest V3 Chrome extension that keeps in-page dictionary lookup, translation, pronunciation, and sentence-aware contextual AI next to the text you are reading.',
        features: [
            'In-page overlay and toolbar popup so readers can look up words, idioms, and phrases without switching tabs or losing context.',
            'Two-phase lookup pipeline: an immediate primary dictionary and translation path, followed by non-blocking enrichment from Wiktionary, Merriam-Webster, Wordnik, and WordsAPI.',
            'Smart lemmatization and phrasal canonicalization ensuring inflected words and idioms resolve cleanly to usable dictionary forms.',
            'Sentence-aware contextual AI: determines word sense in context, grammar nuances, comparative meanings, and provides rewrites when static glossary definitions are insufficient.',
            'Strictly dependency-free: plain JavaScript, CSS, and HTML with a service-worker orchestrator and user-controlled API keys.'
        ],
        tags: ['Chrome Extension', 'Manifest V3', 'Service Worker', 'Dictionary APIs', 'Neural Translation', 'Contextual AI', 'Zero Dependencies'],
        productUrl: 'https://thaihai-swe.github.io/dictionary-extension/',
        githubUrl: 'https://github.com/thaihai-swe/dictionary-extension',
        demoVideo: null
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
        githubUrl: 'https://github.com/thaihai-swe/summarizer-extension',
        demoVideo: null
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
    const demoBtn = document.getElementById('projectDetailsDemoBtn');

    detailButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const projectKey = btn.getAttribute('data-project');
            const data = projectsData[projectKey];
            if (!data) return;

            if (iconEl) iconEl.textContent = data.icon;
            if (titleEl) titleEl.textContent = data.title;
            if (summaryEl) summaryEl.textContent = data.summary;

            // Features list
            if (featuresEl) {
                featuresEl.innerHTML = '';
                data.features.forEach((feat) => {
                    const li = document.createElement('li');
                    li.textContent = feat;
                    featuresEl.appendChild(li);
                });
            }

            // Tags
            if (tagsEl) {
                tagsEl.innerHTML = '';
                data.tags.forEach((tag) => {
                    const span = document.createElement('span');
                    span.className = 'tech-tag';
                    span.textContent = tag;
                    tagsEl.appendChild(span);
                });
            }

            // Links
            if (productLink) {
                if (data.productUrl) {
                    productLink.href = data.productUrl;
                    productLink.hidden = false;
                } else {
                    productLink.hidden = true;
                }
            }

            if (githubLink) {
                if (data.githubUrl) {
                    githubLink.href = data.githubUrl;
                    githubLink.hidden = false;
                } else {
                    githubLink.hidden = true;
                }
            }

            if (demoBtn) {
                if (data.demoVideo) {
                    demoBtn.hidden = false;
                    demoBtn.onclick = () => {
                        modalCtrl.close();
                        const videoCtrl = new ModalController('videoDemoModal');
                        const videoPlayer = document.getElementById('demoVideoPlayer');
                        if (videoPlayer) {
                            videoPlayer.src = data.demoVideo;
                            videoPlayer.play().catch(() => {});
                        }
                        videoCtrl.open();
                    };
                } else {
                    demoBtn.hidden = true;
                }
            }

            modalCtrl.open(btn);
        });
    });
}

/* --------------------------------------------------------------------------
   6. Certificate Preview Modal
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
            const imageSrc = btn.getAttribute('data-cert-image') || btn.getAttribute('data-cert');
            const certTitle = btn.getAttribute('data-cert-title') || 'Certificate of Achievement';
            const certIssuer = btn.getAttribute('data-cert-issuer') || 'Accredited Authority';
            const verifyUrl = btn.getAttribute('data-cert-verify');

            if (titleEl) titleEl.textContent = certTitle;
            if (issuerEl) issuerEl.textContent = certIssuer;

            if (imgEl && imageSrc) {
                // Ensure proper path
                const resolvedPath = imageSrc.startsWith('certs/') ? imageSrc : `certs/${imageSrc}`;
                imgEl.src = resolvedPath;
                imgEl.alt = certTitle;
            }

            if (verifyBtn) {
                if (verifyUrl) {
                    verifyBtn.href = verifyUrl;
                    verifyBtn.hidden = false;
                } else {
                    verifyBtn.hidden = true;
                }
            }

            certModalCtrl.open(btn);
        });
    });
}

/* --------------------------------------------------------------------------
   7. Video Demo Modal
   -------------------------------------------------------------------------- */
function initVideoDemoModal() {
    const videoCtrl = new ModalController('videoDemoModal');
    const demoButtons = document.querySelectorAll('.btn-demo');
    const videoPlayer = document.getElementById('demoVideoPlayer');

    demoButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const videoSrc = btn.getAttribute('data-video');
            const posterSrc = btn.getAttribute('data-poster');

            if (videoPlayer && videoSrc) {
                videoPlayer.src = videoSrc;
                if (posterSrc) videoPlayer.poster = posterSrc;
                videoPlayer.play().catch(() => {});
            }

            videoCtrl.open(btn);
        });
    });

    // Pause video when modal closes
    const videoModal = document.getElementById('videoDemoModal');
    if (videoModal && videoPlayer) {
        const observer = new MutationObserver(() => {
            if (!videoModal.classList.contains('is-active')) {
                videoPlayer.pause();
                videoPlayer.currentTime = 0;
            }
        });
        observer.observe(videoModal, { attributes: true, attributeFilter: ['class'] });
    }
}

/* --------------------------------------------------------------------------
   8. Copy Email Helper & Toast System
   -------------------------------------------------------------------------- */
function initCopyEmail() {
    const copyButtons = document.querySelectorAll('.btn-copy-email');

    copyButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const email = btn.getAttribute('data-email') || 'nguyenthaihai00@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                showToast(`Copied ${email} to clipboard!`);
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
    toast.className = 'toast toast-success';
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success); flex-shrink: 0;">
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
   9. Dynamic Year
   -------------------------------------------------------------------------- */
function initDynamicYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

/* --------------------------------------------------------------------------
   10. Scroll-Driven Stat Counter Animation
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



