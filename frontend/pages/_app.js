import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import AudioPlayer from '@/components/AudioPlayer';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/lib/useKeyboardShortcuts';

function KeyboardShortcutsProvider({ children }) {
    const [showHelp, setShowHelp] = useState(false);

    useKeyboardShortcuts();

    // Show help with ? key
    useEffect(() => {
        const handleHelp = (e) => {
            if (e.key === '?' && !e.target.tagName.match(/INPUT|TEXTAREA/)) {
                setShowHelp(prev => !prev);
            }
            if (e.key === 'Escape') {
                setShowHelp(false);
            }
        };
        window.addEventListener('keydown', handleHelp);
        return () => window.removeEventListener('keydown', handleHelp);
    }, []);

    return (
        <>
            {children}
            <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </>
    );
}

export default function App({ Component, pageProps }) {
    const fetchCategories = useStore((state) => state.fetchCategories);

    useEffect(() => {
        fetchCategories();

        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('SW registered:', reg.scope))
                .catch((err) => console.log('SW registration failed:', err));
        }
    }, []);

    return (
        <KeyboardShortcutsProvider>
            <Component {...pageProps} />
            <AudioPlayer />
        </KeyboardShortcutsProvider>
    );
}
