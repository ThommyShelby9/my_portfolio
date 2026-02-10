/**
 * Main JavaScript for Rostel PANOUMASSI Portfolio
 */

// DOM Elements
const loader = document.querySelector('.loader-container');
const loaderProgress = document.querySelector('.loader-progress-bar');
const mainNav = document.querySelector('.main-nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const allNavLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const downloadCV = document.getElementById('download-cv');
const backToTop = document.getElementById('back-to-top');
const scrollProgress = document.querySelector('.scroll-progress');
const customCursor = document.querySelector('.custom-cursor');
const skillProgressBars = document.querySelectorAll('.skill-progress-bar');
const currentYear = document.getElementById('current-year');
const sections = document.querySelectorAll('.section');
const contactForm = document.getElementById('contact-form');

// Debug helper to check if elements exist
function checkElements() {
    console.log('Checking critical elements:');
    console.log('loader:', loader ? 'found' : 'MISSING');
    console.log('themeToggle:', themeToggle ? 'found' : 'MISSING');
    console.log('language toggle:', document.getElementById('language-toggle') ? 'found' : 'MISSING');
    console.log('sections:', sections.length);
    for (let i = 0; i < sections.length; i++) {
        console.log(`Section #${i}:`, sections[i].id);
    }
}

// Initialize loader
function initLoader() {
    let progress = 0;
    const fakeLoading = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) {
            progress = 100;
            clearInterval(fakeLoading);
            
            // After a small delay, hide loader
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    // Start animations when page is loaded
                    document.body.classList.add('loaded');
                    initAnimations();
                }, 500);
            }, 500);
        }
        loaderProgress.style.width = `${progress}%`;
    }, 200);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    // Check elements
    checkElements();
    
    // Set current year in footer
    if (currentYear) {
        currentYear.textContent = `© ${new Date().getFullYear()} Rostel PANOUMASSI. All rights reserved.`;
    }
    
    // Check for saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Add scroll event listeners
    window.addEventListener('scroll', handleScroll);
    
    // Initialize loader
    if (loader && loaderProgress) {
        initLoader();
    } else {
        console.error('Loader elements not found!');
        document.body.classList.add('loaded');
    }
    
    // Initialize all event listeners
    initEventListeners();
    
    // Initialize intersection observers
    initObservers();
});

// Initialize event listeners
function initEventListeners() {
    console.log('Initializing event listeners');
    
    // Navigation toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            console.log('Nav toggle clicked');
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('show');
        });
    }
    
    // Nav links click handler (mobile)
    if (allNavLinks.length > 0 && navLinks) {
        allNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Prevent default only if JavaScript is working
                e.preventDefault();
                
                // Get the target section id
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Scroll to section
                    window.scrollTo({
                        top: targetSection.offsetTop - 80, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu
                    navLinks.classList.remove('show');
                    if (navToggle) navToggle.classList.remove('active');
                    
                    // Update active nav link
                    allNavLinks.forEach(navLink => navLink.classList.remove('active'));
                    link.classList.add('active');
                } else {
                    console.error(`Target section #${targetId} not found`);
                    window.location.href = link.getAttribute('href');
                }
            });
        });
    }
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('Theme toggle listener added');
    }
    
// Attacher l'écouteur d'événement au bouton
if (downloadCV) {
    console.log('CV download button found, adding event listener');
    downloadCV.addEventListener('click', handleDownloadCV);
} else {
    console.error('CV download button not found');
}
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Custom cursor
    if (customCursor) {
        document.addEventListener('mousemove', updateCursor);
        document.addEventListener('mouseenter', showCursor);
        document.addEventListener('mouseleave', hideCursor);
        
        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card, .skill-category, .timeline-content, .education-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                customCursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                customCursor.classList.remove('hover');
            });
        });
    }
    
    // Handle contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Handle scroll events
function handleScroll() {
    // Update scroll progress
    if (scrollProgress) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = `${scrollPercentage}%`;
    }
    
    // Show/hide back to top button
    if (backToTop) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        
        if (scrollTop > 300) {
            backToTop.classList.add('show');
            backToTop.classList.remove('hide');
        } else {
            backToTop.classList.remove('show');
            backToTop.classList.add('hide');
        }
    }
    
    // Add scrolled class to navigation
    if (mainNav) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        
        if (scrollTop > 50) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }
    
    // Update active nav link based on scroll position
    updateActiveNavLink();
}

// Update active nav link based on scroll position
function updateActiveNavLink() {
    if (allNavLinks.length > 0 && sections.length > 0) {
        const scrollPosition = window.scrollY + 300;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                allNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Toggle dark/light theme
function toggleTheme() {
    console.log('Toggle theme called');
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
        console.log('Dark theme applied');
    } else {
        localStorage.setItem('theme', 'light');
        console.log('Light theme applied');
    }
    
    // Update nano animation colors if function exists
    if (typeof updateThemeColors === 'function') {
        const isDark = document.body.classList.contains('dark-theme');
        updateThemeColors(isDark);
    }
}

// Handle download CV
// Fonction corrigée pour télécharger le CV
function handleDownloadCV() {
    console.log('Download CV clicked');
    
    // Lien vers le fichier PDF (assurez-vous que ce chemin est correct)
    const pdfPath = 'assets/Rostel_Missimawu.pdf';
    
    // Créer un élément d'ancrage invisible pour le téléchargement
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfPath;
    downloadLink.download = 'Rostel_PANOUMASSI_CV.pdf'; // Nom du fichier téléchargé
    downloadLink.target = '_blank';
    
    // Simuler un clic sur ce lien
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}



// Update custom cursor position
function updateCursor(e) {
    if (customCursor) {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    }
}

// Show custom cursor
function showCursor() {
    if (customCursor) {
        customCursor.classList.add('active');
    }
}

// Hide custom cursor
function hideCursor() {
    if (customCursor) {
        customCursor.classList.remove('active');
    }
}

// Initialize intersection observers
function initObservers() {
    console.log('Initializing observers');
    
    // Only proceed if IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported');
        // Fallback: show all skills immediately
        if (skillProgressBars.length > 0) {
            skillProgressBars.forEach(bar => {
                const percent = bar.getAttribute('data-percent');
                bar.style.width = `${percent}%`;
            });
        }
        return;
    }
    
    // Observer for skill bars
    if (skillProgressBars.length > 0) {
        const skillBarObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const percent = bar.getAttribute('data-percent');
                    bar.style.width = `${percent}%`;
                    skillBarObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });
        
        // Observe all skill bars
        skillProgressBars.forEach(bar => {
            skillBarObserver.observe(bar);
        });
    }
    
    // Observer for animation on scroll
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Elements to animate on scroll
    const animationElements = document.querySelectorAll('.timeline-item, .skill-category, .project-card, .education-card');
    
    if (animationElements.length > 0) {
        animationElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            animationObserver.observe(element);
        });
    }
}

// Initialize animations when page is loaded
function initAnimations() {
    console.log('Initializing animations');
    
    // Animation for elements with .animate class
    document.querySelectorAll('.animate').forEach(element => {
        element.classList.add('animated');
    });
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    // Simple validation
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    
    // Reset form
    contactForm.reset();
}