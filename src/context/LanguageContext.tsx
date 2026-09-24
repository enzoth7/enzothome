"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore, ReactNode } from "react";
import { translations } from "@/src/data/translations";

type Language = "es" | "en";

interface LanguageContextProps {
    language: Language;
    toggleLanguage: () => void;
    t: typeof translations.es;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);
const LANGUAGE_STORAGE_KEY = "language";
const LANGUAGE_CHANGE_EVENT = "language-change";

function getStoredLanguage(): Language {
    if (typeof window === "undefined") {
        return "es";
    }

    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "es" || saved === "en" ? saved : "es";
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

export function LanguageProvider({ children }: { children: ReactNode }) {
    const language = useSyncExternalStore<Language>(
        subscribe,
        getStoredLanguage,
        () => "es"
    );

    const toggleLanguage = () => {
        const nextLang = language === "es" ? "en" : "es";
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
        window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

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
