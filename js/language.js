/**
 * Language Switcher for Rostel PANOUMASSI Portfolio
 */

// DOM Elements
const languageToggle = document.getElementById('language-toggle');
const currentLangElement = document.getElementById('current-lang');

// Language data
const translations = {
    en: {
        // Navigation
        'nav-home': 'Home',
        'nav-about': 'About',
        'nav-experience': 'Experience',
        'nav-skills': 'Skills',
        'nav-projects': 'Projects',
        'nav-education': 'Education',
        'nav-contact': 'Contact',
        
        // Home Section
        'hero-title': 'Rostel PANOUMASSI',
        'hero-subtitle': 'Full-Stack Developer',
        'hero-description': 'Backend Specialist | Frontend Expertise | Cybersecurity',
        'btn-hire': 'Hire Me',
        'btn-about': 'About Me',
        
        // About Section
        'about-title': 'About Me',
        'about-greeting': 'Hello, I\'m Rostel',
        'about-p1': 'Stepping into the tech arena with a certification in web and mobile development from Ecole 229 and specialized knowledge in cybersecurity, Django, Spring-Boot, Laravel, VueJs, I have embraced the Full-stack Developer role at Cabinet GPRHME. Here, I focus on advancing our HR management platform, TadagbeRhPlus, ensuring robust security and seamless functionality.',
        'about-p2': 'My recent freelance experience with N01ZET allowed me to refine my expertise in QA test automation, employing tools like Selenium and Java. At Cabinet GPRHME, we prioritize innovation and the relentless pursuit of improvement, aligning perfectly with my proactive problem-solving approach and dedication to delivering cutting-edge software solutions.',
        'about-name': 'Name:',
        'about-email': 'Email:',
        'about-location': 'Location:',
        'about-role': 'Role:',
        'btn-contact': 'Contact Me',
        
        // Experience Section
        'exp-title': 'Work Experience',
        'exp-gprhme-role': 'Full-stack Developer',
        'exp-gprhme-date': 'September 2024 - Present',
        'exp-gprhme-resp1': 'Development and improvement of the TadagbeRhPlus HR management platform.',
        'exp-gprhme-resp2': 'Redesign of the TadagbeRhPlus platform.',
        'exp-gprhme-resp3': 'Design of other related platforms (INTER-NAT, HIPEJUS).',
        
        'exp-consultant-role': 'Full Stack Developer',
        'exp-consultant-date': 'August 2023 - December 2024',
        'exp-consultant-resp1': 'Design and continuous improvement of the LeConsultant tender announcement platform.',
        
        'exp-noizet-role': 'QA Tests Automation',
        'exp-noizet-date': 'March 2024 - August 2024',
        'exp-noizet-resp1': 'Implementation of automated tests with Selenium, Java, JUnit at N01ZET (Freelance).',
        
        'exp-dsmc-role': 'Full-stack Developer',
        'exp-dsmc-date': 'March 2024 - July 2024',
        'exp-dsmc-resp1': 'Design of a payment aggregator (Full Laravel).',
        'exp-dsmc-resp2': 'Improvement of the DSMC MILLENIUM CYBERSECURITY platform (Full Laravel).',
        
        'exp-jscom-role': 'Professional Internship',
        'exp-jscom-date': 'November 2023 - March 2024',
        'exp-jscom-resp1': 'Development of an inventory management platform in Spring-Boot (Java) and VueJs.',
        
        // Skills Section
        'skills-title': 'Technical Skills',
        'skills-backend': 'Backend',
        'skills-frontend': 'Frontend',
        'skills-database': 'Databases',
        'skills-devops': 'DevOps',
        'skills-testing': 'Testing',
        'skills-security': 'Security',
        'skills-proficiency': 'Proficiency Levels',
        
        // Projects Section
        'projects-title': 'Featured Projects',
        'project-zenlife-title': 'ZenLife',
        'project-zenlife-desc': 'Find your balance and serenity. ZenLife accompanies you in your quest for daily well-being. Plan your life, manage your finances, track your health, and cultivate positivity with ease.',
        
        'project-ccns-title': 'Commission Catholique Nationale pour la Santé',
        'project-ccns-desc': 'Complete platform for the National Catholic Health Commission, offering management, monitoring, and coordination services for nationwide health initiatives.',
        
        'project-tadagbe-title': 'TadagbeRhPlus',
        'project-tadagbe-desc': 'HR management platform with comprehensive employee tracking, payroll, and performance evaluation features.',
        
        'project-consultant-title': 'LeConsultant Platform',
        'project-consultant-desc': 'Tender announcement platform providing businesses with timely updates on new opportunities.',
        
        // Education Section
        'education-title': 'Education & Certifications',
        'edu-ecole229-title': 'Ecole 229',
        'edu-ecole229-degree': 'Certification, Web and Mobile Development',
        'edu-ecole229-date': 'March 2023 - March 2024',
        
        'edu-mindluster-title': 'Mindluster',
        'edu-mindluster-degree': 'Certificate, Computer and Information Systems Security',
        'edu-mindluster-date': 'January 2025 - February 2025',
        
        'edu-asin-title': 'ASIN',
        'edu-asin-degree': 'Attestation, Computer and Information Systems Security',
        'edu-asin-date': 'December 2023',
        
        'edu-injeps-title': 'INJEPS',
        'edu-injeps-degree': 'Professional License, STASE option Andragogie',
        'edu-injeps-date': 'October 2019 - August 2022',
        
        // Contact Section
        'contact-title': 'Get In Touch',
        'contact-info': 'Contact Information',
        'contact-email': 'Email',
        'contact-location': 'Location',
        'contact-form': 'Send Message',
        'contact-name': 'Name',
        'contact-subject': 'Subject',
        'contact-message': 'Message',
        'btn-send': 'Send Message',
        
        // Footer
        'copyright': '© 2025 Rostel PANOUMASSI. All rights reserved.'
    },
    fr: {
        // Navigation
        'nav-home': 'Accueil',
        'nav-about': 'À Propos',
        'nav-experience': 'Expérience',
        'nav-skills': 'Compétences',
        'nav-projects': 'Projets',
        'nav-education': 'Formation',
        'nav-contact': 'Contact',
        
        // Home Section
        'hero-title': 'Rostel PANOUMASSI',
        'hero-subtitle': 'Développeur Full-Stack',
        'hero-description': 'Spécialiste Backend | Expert Frontend | Cybersécurité',
        'btn-hire': 'Embauchez-moi',
        'btn-about': 'À Propos de Moi',
        
        // About Section
        'about-title': 'À Propos de Moi',
        'about-greeting': 'Bonjour, je suis Rostel',
        'about-p1': 'Avec une certification en développement web et mobile de l\'Ecole 229 et des connaissances spécialisées en cybersécurité, Django, Spring-Boot, Laravel, VueJs, j\'ai embrassé le rôle de développeur Full-stack au sein du Cabinet GPRHME. Ici, je me concentre sur l\'avancement de notre plateforme de gestion des ressources humaines TadagbeRhPlus, assurant une sécurité robuste et une fonctionnalité fluide.',
        'about-p2': 'Ma récente expérience en tant que freelance chez N01ZET m\'a permis d\'affiner mon expertise dans l\'automatisation des tests d\'assurance qualité, en utilisant des outils tels que Selenium et Java. Au Cabinet GPRHME, nous donnons la priorité à l\'innovation et à la poursuite incessante de l\'amélioration, ce qui correspond parfaitement à mon approche proactive de la résolution de problèmes et à mon dévouement à la fourniture de solutions logicielles de pointe.',
        'about-name': 'Nom:',
        'about-email': 'Email:',
        'about-location': 'Localisation:',
        'about-role': 'Rôle:',
        'btn-contact': 'Contactez-moi',
        
        // Experience Section
        'exp-title': 'Expérience Professionnelle',
        'exp-gprhme-role': 'Développeur Full-stack',
        'exp-gprhme-date': 'Septembre 2024 - Présent',
        'exp-gprhme-resp1': 'Réalisation et amélioration d\'une plateforme de gestion des ressources humaines TadagbeRhPlus.',
        'exp-gprhme-resp2': 'Refonte de la plateforme TadagbeRhPlus.',
        'exp-gprhme-resp3': 'Conception d\'autres plateformes connexes (INTER-NAT, HIPEJUS).',
        
        'exp-consultant-role': 'Développeur Full Stack',
        'exp-consultant-date': 'Août 2023 - Décembre 2024',
        'exp-consultant-resp1': 'Conception et amélioration continue de la plateforme d\'annonce d\'appels d\'offres LeConsultant.',
        
        'exp-noizet-role': 'Automatisation des Tests QA',
        'exp-noizet-date': 'Mars 2024 - Août 2024',
        'exp-noizet-resp1': 'Réalisation de tests automatisés avec Selenium, Java, JUnit à N01ZET (Freelance).',
        
        'exp-dsmc-role': 'Développeur Full-stack',
        'exp-dsmc-date': 'Mars 2024 - Juillet 2024',
        'exp-dsmc-resp1': 'Conception d\'un agrégateur de paiement (Full Laravel).',
        'exp-dsmc-resp2': 'Amélioration de la plateforme DSMC MILLENIUM CYBERSECURITY (Full Laravel).',
        
        'exp-jscom-role': 'Stage Professionnel',
        'exp-jscom-date': 'Novembre 2023 - Mars 2024',
        'exp-jscom-resp1': 'Réalisation d\'une plateforme de gestion de stock en Spring-Boot (Java) et VueJs.',
        
        // Skills Section
        'skills-title': 'Compétences Techniques',
        'skills-backend': 'Backend',
        'skills-frontend': 'Frontend',
        'skills-database': 'Bases de Données',
        'skills-devops': 'DevOps',
        'skills-testing': 'Tests',
        'skills-security': 'Sécurité',
        'skills-proficiency': 'Niveaux de Compétence',
        
        // Projects Section
        'projects-title': 'Projets Présentés',
        'project-zenlife-title': 'ZenLife',
        'project-zenlife-desc': 'Retrouvez votre équilibre et sérénité. ZenLife vous accompagne dans votre quête de bien-être quotidien. Planifiez votre vie, gérez vos finances, suivez votre santé et cultivez la positivité en toute simplicité.',
        
        'project-ccns-title': 'Commission Catholique Nationale pour la Santé',
        'project-ccns-desc': 'Plateforme complète pour la Commission Catholique Nationale pour la Santé, offrant des services de gestion, suivi et coordination des initiatives de santé à l\'échelle nationale.',
        
        'project-tadagbe-title': 'TadagbeRhPlus',
        'project-tadagbe-desc': 'Plateforme de gestion RH avec suivi complet des employés, paie et fonctionnalités d\'évaluation de performance.',

        'project-bilal-title': 'Portfolio Bilal Sekou',
        'project-bilal-desc': 'Portfolio en ligne montrant les talents et les projets de Bilal Sekou.',
        
        'project-consultant-title': 'Plateforme LeConsultant',
        'project-consultant-desc': 'Plateforme d\'annonce d\'appels d\'offres fournissant aux entreprises des mises à jour opportunes sur les nouvelles opportunités.',
        
        // Education Section
        'education-title': 'Formation & Certifications',
        'edu-ecole229-title': 'Ecole 229',
        'edu-ecole229-degree': 'Certification, Développement Web et Mobile',
        'edu-ecole229-date': 'Mars 2023 - Mars 2024',
        
        'edu-mindluster-title': 'Mindluster',
        'edu-mindluster-degree': 'Certificat, Sécurité des Systèmes Informatiques et d\'Information',
        'edu-mindluster-date': 'Janvier 2025 - Février 2025',
        
        'edu-asin-title': 'ASIN',
        'edu-asin-degree': 'Attestation, Sécurité des Systèmes Informatiques et d\'Information',
        'edu-asin-date': 'Décembre 2023',
        
        'edu-injeps-title': 'INJEPS',
        'edu-injeps-degree': 'Licence Professionnelle, STASE option Andragogie',
        'edu-injeps-date': 'Octobre 2019 - Août 2022',
        
        // Contact Section
        'contact-title': 'Entrer en Contact',
        'contact-info': 'Informations de Contact',
        'contact-email': 'Email',
        'contact-location': 'Localisation',
        'contact-form': 'Envoyer un Message',
        'contact-name': 'Nom',
        'contact-subject': 'Sujet',
        'contact-message': 'Message',
        'btn-send': 'Envoyer le Message',
        
        // Footer
        'copyright': '© 2025 Rostel PANOUMASSI. Tous droits réservés.'
    }
};

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get saved language or default to English
    const savedLang = localStorage.getItem('language') || 'en';
    
    // Set initial language
    setLanguage(savedLang);
    
    // Add event listener for language toggle
    languageToggle.addEventListener('click', toggleLanguage);
});

// Toggle between languages
function toggleLanguage() {
    const currentLang = currentLangElement.textContent.toLowerCase();
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    
    setLanguage(newLang);
}

// Set language throughout the site
function setLanguage(lang) {
    // Update displayed language
    currentLangElement.textContent = lang.toUpperCase();
    
    // Update all translation elements
    for (const [key, value] of Object.entries(translations[lang])) {
        // First try to find by data-lang attribute
        const elements = document.querySelectorAll(`[data-lang="${key}"]`);
        
        if (elements.length > 0) {
            elements.forEach(el => {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = value;
                } else {
                    el.textContent = value;
                }
            });
        } else {
            // Try to find by matching class
            const classBased = document.querySelectorAll(`.${key}`);
            classBased.forEach(el => {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = value;
                } else {
                    el.textContent = value;
                }
            });
        }
    }
    
    // Update navigation links data-text attribute
    document.querySelectorAll('.nav-link').forEach(link => {
        const section = link.getAttribute('href').substring(1); // Remove # from href
        const key = `nav-${section}`; // Using backticks for template literal
        if (translations[lang][key]) {
            link.setAttribute('data-text', translations[lang][key]);
            link.textContent = translations[lang][key];
        }
    });
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Save preference
    localStorage.setItem('language', lang);
}