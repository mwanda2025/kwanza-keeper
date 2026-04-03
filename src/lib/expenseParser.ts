
/**
 * @fileOverview Local Parser (DEPRECATED).
 * Natural language processing is now handled exclusively by the Genkit Cloud flow.
 */

export function parseExpenseOffline(text: string) {
  return {
    description: text,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'other',
  };
}
