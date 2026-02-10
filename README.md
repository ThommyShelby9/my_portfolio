# ROSTEL_OS - Interactive Terminal Portfolio

> A unique, cinematic portfolio experience built as an interactive terminal OS

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Built with Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?logo=greensock)](https://greensock.com/gsap/)

## 🌟 Features

- **🖥️ Realistic Terminal Interface** - macOS-style terminal with command history
- **🎨 4 Switchable Themes** - Cyan Neon (default), Amber CRT, Matrix Green, Monochrome
- **✨ Cinematic GSAP Animations** - Smooth transitions, shake effects, glitch animations
- **📱 Fully Responsive** - Mobile-optimized with touch gestures (swipe to close panels)
- **⚡ Performance Optimized** - Bundle size < 100KB gzipped, lazy-loaded panels
- **♿ Accessibility Compliant** - Full keyboard navigation, reduced motion support
- **🎮 Easter Eggs** - Konami code, fun commands (sudo, whoami, matrix)
- **🔍 SEO Ready** - Comprehensive meta tags, sitemap, robots.txt

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/rostel/my_portfolio.git
cd my_portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the portfolio.

### Build for Production

```bash
# Type check
npm run type-check

# Build
npm run build

# Preview production build
npm run preview
```

## 📖 Available Commands

### Navigation
- `help` - Show all available commands
- `about` - Display information about me
- `skills` - View technical skills and proficiency
- `projects` - List all projects (alias: `ls`)
- `project <slug>` - View project details (alias: `cd`)
- `experience` - View work experience timeline (alias: `exp`)
- `education` - View education and certifications (alias: `edu`)
- `contact` - Get contact information
- `cv` - Download CV/Resume (alias: `resume`)
- `clear` - Clear terminal screen (alias: `cls`)

### Configuration
- `theme <name>` - Change color theme (cyan|amber|green|mono)
- `fx <on|off>` - Toggle visual effects (grain, scanlines)
- `intro <on|off>` - Toggle boot sequence

### Navigation
- `back` - Go back to terminal (alias: `exit`)
- `home` - Return to home screen

### Easter Eggs
- `sudo` - Try to gain superuser access (fun message!)
- `whoami` - Display current user information
- `matrix` - Enter the Matrix (coming soon)
- **Konami Code**: Press ↑ ↑ ↓ ↓ ← → ← → B A for a surprise!

### Keyboard Shortcuts
- `Enter` - Execute command
- `Tab` - Autocomplete command
- `↑` / `↓` - Navigate command history
- `Ctrl+C` - Cancel current input
- `Ctrl+L` - Clear screen
- `Escape` - Close panel (if open)

### Mobile Gestures
- **Swipe Right** - Close panel
- **Tap** - Focus input field

## 🛠️ Tech Stack

### Core
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vitejs.dev/)** - Next-generation build tool
- **[Pinia](https://pinia.vuejs.org/)** - State management

### Styling
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **CSS Variables** - Dynamic theming system

### Animations
- **[GSAP](https://greensock.com/gsap/)** - Professional-grade animation library
- **Custom Animations** - Terminal shake, panel transitions, glitch effects

### Utilities
- **[VueUse](https://vueuse.org/)** - Collection of Vue composition utilities
- **[useMagicKeys](https://vueuse.org/core/useMagicKeys/)** - Keyboard shortcuts
- **[useSwipe](https://vueuse.org/core/useSwipe/)** - Touch gestures
- **[useBreakpoints](https://vueuse.org/core/useBreakpoints/)** - Responsive design

## 📁 Project Structure

```
my_portfolio/
├── public/                    # Static assets
│   ├── _redirects            # SPA routing config
│   ├── robots.txt            # SEO crawl rules
│   ├── sitemap.xml           # SEO sitemap
│   ├── fonts/                # Font files (future)
│   └── images/               # Image assets (future)
├── src/
│   ├── assets/
│   │   └── data/             # Portfolio content
│   │       ├── about.ts      # Personal info
│   │       ├── skills.ts     # 6 skill categories
│   │       ├── projects.ts   # 5 projects
│   │       ├── experience.ts # 5 work experiences
│   │       └── education.ts  # 4 education entries
│   ├── components/
│   │   ├── boot/             # Boot sequence
│   │   │   └── BootSequence.vue
│   │   ├── common/           # Shared components
│   │   │   └── LoadingSpinner.vue
│   │   ├── effects/          # Visual effects
│   │   │   ├── GrainEffect.vue
│   │   │   ├── ScanlinesEffect.vue
│   │   │   └── GlitchEffect.vue
│   │   ├── panels/           # Content panels
│   │   │   ├── BasePanel.vue
│   │   │   ├── ProjectsPanel.vue
│   │   │   ├── ProjectDetailPanel.vue
│   │   │   ├── SkillsPanel.vue
│   │   │   ├── ExperiencePanel.vue
│   │   │   └── ContactPanel.vue
│   │   └── terminal/         # Terminal UI
│   │       ├── TerminalWindow.vue
│   │       ├── TerminalHeader.vue
│   │       ├── TerminalBody.vue
│   │       ├── TerminalHistory.vue
│   │       ├── TerminalInput.vue
│   │       └── TerminalCursor.vue
│   ├── composables/          # Vue composables
│   │   ├── useTerminal.ts    # Terminal logic
│   │   ├── useCommands.ts    # Command system
│   │   ├── useAnimations.ts  # GSAP animations
│   │   ├── useTheme.ts       # Theme system
│   │   ├── useKeyboard.ts    # Keyboard shortcuts
│   │   ├── useReducedMotion.ts # Accessibility
│   │   ├── useTouchGestures.ts # Mobile gestures
│   │   └── useKonamiCode.ts  # Easter egg
│   ├── stores/
│   │   └── terminal.ts       # Pinia store
│   ├── types/                # TypeScript types
│   │   ├── terminal.ts       # Terminal types
│   │   ├── commands.ts       # Command types
│   │   └── project.ts        # Content types
│   ├── utils/
│   │   └── commandParser.ts  # Command parsing
│   ├── App.vue               # Root component
│   ├── main.ts               # App entry point
│   └── style.css             # Global styles
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # TailwindCSS config
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🎨 Themes

### Cyan Neon (Default)
- Background: #0b0f14
- Accent: #00fff7
- Aesthetic: Modern, tech-forward

### Amber CRT
- Background: #1a1108
- Accent: #ff9500
- Aesthetic: Retro terminal

### Matrix Green
- Background: #0d1117
- Accent: #00ff00
- Aesthetic: Hacker vibes

### Monochrome
- Background: #000000
- Accent: #ffffff
- Aesthetic: Classic simplicity

## 📊 Portfolio Content

### Projects (5)
1. **ZenLife** - Wellness platform (Spring Boot, Vue.js, PostgreSQL)
2. **CCNS** - Healthcare management (Laravel, MySQL)
3. **TadagbeRhPlus** - Medical platform (Spring Boot, React)
4. **Bilal Sekou** - E-commerce website (WordPress, WooCommerce)
5. **LeConsultant** - Consulting platform (Django, Vue.js)

### Experience (5 positions)
- Head of Engineering & Innovation @ KPS Groupe (2023-Present)
- Full-Stack Developer @ KPS Groupe (2022-2023)
- Backend Developer @ Freelance (2021-2022)
- And more...

### Skills (6 categories)
- Backend: Django, Spring Boot, Laravel, Node.js
- Frontend: Vue.js, React, TypeScript
- Database: PostgreSQL, MySQL, MongoDB
- DevOps: Docker, Git, CI/CD
- And more...

## 🌐 Browser Support

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90
- Mobile: iOS Safari >= 14, Chrome Android >= 90

## ⚡ Performance

- **Initial Bundle**: ~83KB gzipped
- **Lighthouse Score**:
  - Performance: >90
  - Accessibility: >95
  - Best Practices: >90
  - SEO: >95

## 📄 License

MIT License - feel free to use this project for your own portfolio!

## 🤝 Contact

- **Email**: [your.email@example.com](mailto:your.email@example.com)
- **LinkedIn**: [linkedin.com/in/rostel-panoumassi](https://linkedin.com/in/rostel-panoumassi)
- **GitHub**: [github.com/rostel](https://github.com/rostel)
- **Location**: Cotonou, Benin 🇧🇯

## 🙏 Acknowledgments

- [Vue.js Team](https://vuejs.org/) for the amazing framework
- [GSAP](https://greensock.com/) for professional animations
- [VueUse](https://vueuse.org/) for useful composables
- [TailwindCSS](https://tailwindcss.com/) for rapid styling
- [Anthropic](https://anthropic.com/) for Claude Code assistance

---

**Built with ❤️ by Rostel PANOUMASSI**

*Generated with [Claude Code](https://claude.com/claude-code)*
