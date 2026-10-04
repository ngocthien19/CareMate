// src/hooks/useReveal.js
import { useEffect } from 'react';

/**
 * Tự động thêm class 'is-visible' cho mọi element có class 'reveal'
 * khi chúng xuất hiện trong viewport
 */
export function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}