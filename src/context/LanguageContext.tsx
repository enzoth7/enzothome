"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore, ReactNode } from "react";
import { translations } from "@/src/data/translations";
import type { SiteLanguage } from "@/src/lib/site-language";

type Language = SiteLanguage;

interface LanguageContextProps {
    language: Language;
    toggleLanguage: () => void;
    t: typeof translations.es;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);
const LANGUAGE_STORAGE_KEY = "language";
const LANGUAGE_CHANGE_EVENT = "language-change";

function getCookieLanguage(): Language | null {
    const match = document.cookie.match(/(?:^|;\s*)language=(es|en)(?:;|$)/);
    return match?.[1] as Language | undefined ?? null;
}

function getStoredLanguage(initialLanguage: Language): Language {
    if (typeof window === "undefined") {
        return initialLanguage;
    }

    const cookieLanguage = getCookieLanguage();
    if (cookieLanguage) return cookieLanguage;
    try {
        const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === "es" || saved === "en") return saved;
    } catch {
        // Private browsing may disable storage; the server choice still works.
    }
    return initialLanguage;
}

function subscribe(onStoreChange: () => void) {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === LANGUAGE_STORAGE_KEY) {
            onStoreChange();
        }
    };

    const handleLanguageChange = () => {
        onStoreChange();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);

    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    };
}

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage: Language }) {
    const language = useSyncExternalStore<Language>(
        subscribe,
        () => getStoredLanguage(initialLanguage),
        () => initialLanguage
    );

    const toggleLanguage = () => {
        const nextLang = language === "es" ? "en" : "es";
        document.cookie = `language=${nextLang}; Path=/; Max-Age=31536000; SameSite=Lax`;
        try {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
        } catch {
            // The cookie is enough to persist the manual selection.
        }
        window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        if (getCookieLanguage()) return;
        try {
            const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (saved === "es" || saved === "en") {
                document.cookie = `language=${saved}; Path=/; Max-Age=31536000; SameSite=Lax`;
            }
        } catch {
            // No migration is needed if storage is unavailable.
        }
    }, []);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
