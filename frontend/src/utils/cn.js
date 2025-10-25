/**
 * Utility function for conditionally joining classNames
 * Similar to clsx but lightweight
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}