# Testing Guide

Manual testing checklist for ROSTEL_OS Terminal Portfolio

## 🖥️ Desktop Browser Testing

### Chrome (>=90)
- [ ] Terminal loads and boots correctly
- [ ] All commands execute without errors
- [ ] Panels open and close smoothly
- [ ] GSAP animations are smooth (60fps)
- [ ] Keyboard shortcuts work (Tab, ↑↓, Ctrl+C, Ctrl+L, Escape)
- [ ] Theme switching works (cyan, amber, green, mono)
- [ ] Visual effects can be toggled (fx on/off)
- [ ] Konami code triggers secret message
- [ ] No console errors

### Firefox (>=88)
- [ ] Terminal loads and boots correctly
- [ ] All commands execute without errors
- [ ] Panels render correctly
- [ ] Animations are smooth
- [ ] All keyboard shortcuts work
- [ ] Theme switching works
- [ ] Visual effects work
- [ ] No console errors

### Safari (>=14)
- [ ] Terminal loads and boots correctly
- [ ] All commands work
- [ ] Panels display properly
- [ ] CSS grid/flexbox layouts correct
- [ ] Animations smooth
- [ ] Keyboard shortcuts work
- [ ] No console errors

### Edge (>=90)
- [ ] Terminal loads correctly
- [ ] All functionality works
- [ ] No console errors

## 📱 Mobile Device Testing

### iOS Safari (>=14)
- [ ] Terminal is fullscreen
- [ ] Virtual keyboard appears on tap
- [ ] Input field doesn't trigger zoom
- [ ] Swipe right closes panel
- [ ] Panel is fullscreen
- [ ] Typography is readable (14px base)
- [ ] No horizontal scroll
- [ ] Boot sequence works
- [ ] All commands accessible

### Chrome Android (>=90)
- [ ] Terminal is fullscreen
- [ ] Virtual keyboard accessible
- [ ] No zoom on input focus
- [ ] Swipe gestures work
- [ ] Panel responsive
- [ ] Typography readable
- [ ] No layout issues
- [ ] All functionality works

### iPad / Tablet
- [ ] Responsive layout adapts
- [ ] Touch gestures work
- [ ] Typography scales properly
- [ ] Panels sized correctly

## ⌨️ Command Testing

### Basic Navigation
- [ ] `help` - Shows all commands
- [ ] `about` - Opens about content
- [ ] `skills` - Opens skills panel (6 categories visible)
- [ ] `projects` - Opens projects panel (5 projects visible)
- [ ] `project zenlife` - Opens ZenLife detail
- [ ] `experience` - Opens experience timeline (5 positions)
- [ ] `education` - Opens education panel (4 entries)
- [ ] `contact` - Opens contact panel
- [ ] `cv` - Triggers download (or message)
- [ ] `clear` - Clears terminal
- [ ] `back` - Closes panel
- [ ] `home` - Resets terminal

### Aliases
- [ ] `ls` = `projects`
- [ ] `cd zenlife` = `project zenlife`
- [ ] `exp` = `experience`
- [ ] `edu` = `education`
- [ ] `cls` = `clear`
- [ ] `exit` = `back`
- [ ] `info` = `about`

### Configuration
- [ ] `theme cyan` - Switches to cyan theme
- [ ] `theme amber` - Switches to amber theme
- [ ] `theme green` - Switches to matrix green theme
- [ ] `theme mono` - Switches to monochrome theme
- [ ] `theme` (no arg) - Shows available themes
- [ ] `theme invalid` - Shows error
- [ ] `fx off` - Disables visual effects (grain, scanlines disappear)
- [ ] `fx on` - Enables visual effects
- [ ] `fx` (no arg) - Shows current state
- [ ] `intro off` - Disables boot sequence
- [ ] `intro on` - Enables boot sequence
- [ ] Settings persist after reload

### Easter Eggs
- [ ] `sudo` - Shows humorous permission denied
- [ ] `whoami` - Shows visitor info
- [ ] `matrix` - Shows placeholder message
- [ ] Konami code (↑ ↑ ↓ ↓ ← → ← → B A) - Shows secret message

### Invalid Commands
- [ ] `invalid-command` - Shows "Command not found" error
- [ ] Empty input - Does nothing
- [ ] Command with wrong args - Shows usage or error

## 🎨 Visual Testing

### Animations
- [ ] Boot sequence plays smoothly (~3.5s)
- [ ] Boot can be skipped
- [ ] Panel opens with shake + flash + slide
- [ ] Panel closes with slide out
- [ ] Command execute shows brief flash
- [ ] Error commands show glitch effect
- [ ] Cursor blinks continuously
- [ ] All animations are 60fps

### Visual Effects
- [ ] Grain effect is subtle and animated
- [ ] Scanlines move slowly downward
- [ ] Effects can be toggled
- [ ] Effects disabled on mobile if needed
- [ ] No performance degradation with effects

### Themes
- [ ] All 4 themes apply instantly
- [ ] Colors update everywhere (terminal, panels, text)
- [ ] Border colors update
- [ ] Scrollbar colors update
- [ ] Selection colors update
- [ ] Theme persists after reload

### Responsive Design
- [ ] Terminal fullscreen on mobile
- [ ] Terminal windowed on desktop
- [ ] Panels fullscreen on mobile
- [ ] Panels side panel on desktop
- [ ] Typography readable on all sizes
- [ ] No layout shift or jank

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Enter executes command
- [ ] Tab autocompletes (if suggestions available)
- [ ] ↑ shows previous command
- [ ] ↓ shows next command
- [ ] Ctrl+C cancels input
- [ ] Ctrl+L clears screen
- [ ] Escape closes panel
- [ ] Input always focusable

### Reduced Motion
- [ ] System "prefers-reduced-motion" detected
- [ ] Animations disabled when enabled
- [ ] App still functional without animations
- [ ] No console errors

### Screen Reader (Optional)
- [ ] Labels are descriptive
- [ ] ARIA attributes present where needed
- [ ] Focus indicators visible

## ⚡ Performance Testing

### Load Time
- [ ] Initial load < 3 seconds (fast connection)
- [ ] Boot sequence completes in ~3.5s
- [ ] Terminal interactive after boot
- [ ] No blocking JavaScript

### Bundle Size
- [ ] Initial bundle < 100KB gzipped
- [ ] Panels lazy-loaded
- [ ] No unnecessary dependencies

### Runtime Performance
- [ ] DevTools Performance monitor shows 60fps
- [ ] No memory leaks (long session test)
- [ ] Smooth scrolling in panels
- [ ] Command execution is instant

### Network
- [ ] Works with slow 3G connection
- [ ] Assets cached properly (check Network tab)
- [ ] No failed resource loads

## 🔍 SEO Testing

### Meta Tags
- [ ] Title tag present and descriptive
- [ ] Meta description present
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] Twitter Card tags present
- [ ] Canonical link present
- [ ] Viewport meta correct
- [ ] Theme color meta present

### Files
- [ ] /robots.txt accessible
- [ ] /sitemap.xml accessible
- [ ] Favicon loads

### Lighthouse Audit
- [ ] Performance score > 90
- [ ] Accessibility score > 95
- [ ] Best Practices score > 90
- [ ] SEO score > 95

## 🐛 Error Handling

### Edge Cases
- [ ] Very long command input handled
- [ ] Rapid command execution doesn't break
- [ ] Opening/closing panels quickly doesn't break
- [ ] Refreshing during boot works
- [ ] Back button (browser) works correctly

### Console
- [ ] No errors in console
- [ ] No warnings (except expected ones)
- [ ] Network requests succeed
- [ ] No 404 errors

## ✅ Regression Testing

After any changes, re-test:
- [ ] All commands still work
- [ ] Themes still switch
- [ ] Animations still smooth
- [ ] Mobile still responsive
- [ ] No new console errors
- [ ] Build still succeeds
- [ ] Bundle size hasn't increased significantly

## 📊 Testing Checklist Summary

**Desktop:** ☐ Chrome ☐ Firefox ☐ Safari ☐ Edge
**Mobile:** ☐ iOS Safari ☐ Chrome Android ☐ Tablet
**Commands:** ☐ All 15+ commands tested
**Visual:** ☐ Animations ☐ Effects ☐ Themes ☐ Responsive
**Accessibility:** ☐ Keyboard ☐ Reduced Motion
**Performance:** ☐ Load Time ☐ Bundle ☐ Runtime
**SEO:** ☐ Meta Tags ☐ Lighthouse

## 🎯 Critical Path Test (Smoke Test)

Quick test for rapid verification:

1. Load app → Boot sequence plays
2. Type `help` → Command list appears
3. Type `projects` → Panel opens with 5 projects
4. Click project → Detail view opens
5. Press `Escape` → Panel closes
6. Type `theme green` → Theme changes
7. Type `fx off` → Effects disappear
8. Refresh → Settings persisted
9. Test on mobile → Fullscreen, swipe works

If all pass: ✅ Basic functionality working!

---

**Testing Notes:** Document any issues found with browser/device details.
