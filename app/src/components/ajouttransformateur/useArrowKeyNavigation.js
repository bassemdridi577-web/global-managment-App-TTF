import { useEffect, useRef } from 'react';

export const useArrowKeyNavigation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) || !activeElement) {
        return;
      }

      const isInput = (activeElement.tagName === 'INPUT' && activeElement.type === 'text') || activeElement.tagName === 'TEXTAREA';

      if (isInput) {
        if (e.key === 'ArrowLeft') {
          if (activeElement.selectionStart > 0) {
            return;
          }
        } else if (e.key === 'ArrowRight') {
          if (activeElement.selectionStart < activeElement.value.length) {
            return;
          }
        }
      }

      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll('input, select, textarea, button')
      ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled && !el.readOnly;
      });

      const currentIndex = focusableElements.indexOf(activeElement);

      if (currentIndex === -1) {
        return;
      }

      let nextIndex = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % focusableElements.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      }

      if (nextIndex !== -1) {
        const nextElement = focusableElements[nextIndex];
        if (nextElement) {
          nextElement.focus();
          if (typeof nextElement.select === 'function') {
            nextElement.select();
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  return containerRef;
};