export function formatDateReadable(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function delay(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
