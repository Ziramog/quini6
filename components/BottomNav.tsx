'use client';
import { Home, Target, Bell, Menu } from 'lucide-react';
import { Tab } from '@/lib/types';

interface NavItem {
  id: Tab | 'generator' | 'alerts' | 'more' | 'estadisticos';
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'historico', label: 'Inicio', icon: <Home size={20} strokeWidth={1.8} /> },
  { id: 'estadisticos', label: 'Σ', icon: <span className="text-base font-bold">Σ</span> },
  { id: 'generator', label: 'Mis Números', icon: <Target size={20} strokeWidth={1.8} /> },
  { id: 'alerts', label: 'Alertas', icon: <Bell size={20} strokeWidth={1.8} /> },
  { id: 'more', label: 'Más', icon: <Menu size={20} strokeWidth={1.8} /> },
];

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onMorePress?: () => void;
  onEstadisticosPress?: () => void;
}

export function BottomNav({ activeTab, onTabChange, onMorePress, onEstadisticosPress }: BottomNavProps) {
  function handlePress(id: NavItem['id']) {
    if (id === 'more') {
      onMorePress?.();
      return;
    }
    if (id === 'estadisticos') {
      onEstadisticosPress?.();
      return;
    }
    if (id === 'generator') {
      onTabChange('estadistico');
      return;
    }
    if (id === 'alerts') {
      onTabChange('premios');
      return;
    }
    onTabChange(id as Tab);
  }

  return (
    <>
      <style>{`
        @keyframes bottom-enter {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .bottom-nav {
          animation: bottom-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .nav-item:active {
          transform: scale(0.88);
          transition: transform 0.1s;
        }
        .nav-active {
          text-shadow: 0 0 12px rgba(96, 165, 250, 0.6);
        }
      `}</style>
      <nav
        className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px 16px 0 0',
        }}
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = item.id === activeTab ||
              (item.id === 'generator' && (activeTab === 'estadistico' || activeTab === 'estadistico2da')) ||
              (item.id === 'alerts' && activeTab === 'premios') ||
              (item.id === 'estadisticos' && (activeTab === 'estadistico' || activeTab === 'estadistico2da'));
            return (
              <button
                key={item.id}
                onClick={() => handlePress(item.id)}
                className="nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[52px]"
                style={{ color: isActive ? '#60a5fa' : 'rgba(148,163,184,0.7)' }}
              >
                <span className={isActive ? 'nav-active' : ''}>{item.icon}</span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}