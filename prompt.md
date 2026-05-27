```txt
You are a senior mobile UX engineer and React/Next.js UI architect.

I want to evolve my Quini6 statistics web app into a premium mobile-first experience similar to:
- Sofascore
- FotMob
- Robinhood
- Stake
- modern sports analytics apps

Current stack:
- Next.js
- TailwindCSS
- dark theme
- responsive web app
- dashboard/statistics oriented

GOAL:
Transform the app from a “desktop dashboard adapted to mobile” into a REAL native-feeling mobile app experience.

FIRST TASK:
Implement a modern fixed bottom navigation bar optimized for mobile UX.

IMPORTANT:
- Do NOT use a generic sidebar-only navigation anymore.
- Sidebar should become secondary.
- Bottom bar becomes the PRIMARY navigation on mobile.
- Must feel premium, minimal, smooth and native-like.

DESIGN REQUIREMENTS:

STYLE:
- Dark premium UI
- Minimal
- Soft glow accents
- Modern spacing
- Smooth transitions
- Native app feel
- No emoji icons
- Use Lucide React icons

BOTTOM BAR ITEMS:
1. Inicio
   icon: Home

2. Estadísticas
   icon: BarChart3

3. Mis Números
   icon: Target

4. Alertas
   icon: Bell

5. Más
   icon: Menu

UX REQUIREMENTS:
- Fixed bottom navigation
- Rounded top corners
- Frosted glass / subtle glassmorphism
- Active tab highlighted with soft blue glow
- Smooth hover/tap animations
- Mobile-first spacing
- Safe-area support for iPhone
- Height optimized for thumb usage
- Responsive behavior

BEHAVIOR:
- Bottom nav visible only on mobile/tablet
- Sidebar remains visible on desktop
- Active route detection
- Smooth transitions between sections
- Touch-friendly interactions

TECHNICAL REQUIREMENTS:
- React component architecture
- TailwindCSS only
- Framer Motion animations
- Reusable navigation config array
- Clean scalable structure
- Modern app-shell layout

ALSO:
Refactor the current layout structure to support:
- app-shell architecture
- mobile-first navigation
- future Capacitor conversion
- future push notifications
- native app scalability

EXTRA:
Add subtle entrance animations and polished microinteractions.

OUTPUT:
- Full component code
- Layout refactor
- Tailwind classes
- Responsive architecture
- Suggested folder structure
- Best practices for mobile app feel
- Any improvements needed for future Android/iOS app deployment

IMPORTANT:
The final result should feel like a premium native statistics app, NOT a typical admin dashboard.
```
