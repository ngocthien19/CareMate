// src/components/LanguageSwitcher.jsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'vi';

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLangObj = languages.find((l) => l.code === currentLang);

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isWhite = variant === 'white';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút mở dropdown — FIX WIDTH để không nhảy layout */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border-2 transition text-sm font-semibold w-[88px] ${
          isWhite
            ? 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'
        }`}
        aria-label="Change language"
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">{currentLangObj.flag}</span>
          <span className="inline-block w-6 text-left">
            {currentLangObj.code.toUpperCase()}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className={`absolute right-0 mt-2 w-44 rounded-xl border-2 shadow-xl z-50 overflow-hidden animate-fadeIn ${
            isWhite
              ? 'bg-white border-white/30'
              : 'bg-white border-gray-200'
          }`}
        >
          {languages.map((lang) => {
            const active = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                onClick={() => switchLang(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {active && (
                  <span className="text-teal-600 font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}