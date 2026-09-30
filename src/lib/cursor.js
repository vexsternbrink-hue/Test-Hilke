import { useEffect } from 'react';

/**
 * Setzt den Mauszeiger auf „pointer“, solange `hovered` wahr ist, und setzt ihn
 * beim Verlassen oder Unmount zuverlässig zurück (sonst bleibt er hängen).
 */
export function useHoverCursor(hovered) {
  useEffect(() => {
    if (!hovered) return undefined;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);
}

