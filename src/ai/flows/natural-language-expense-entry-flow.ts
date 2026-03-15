'use server';
/**
 * @fileOverview This file defines a Genkit flow for parsing natural language expense entries.
 *
 * - naturalLanguageExpenseEntry - A function that handles natural language expense input and extracts structured data.
 * - NaturalLanguageExpenseEntryInput - The input type for the naturalLanguageExpenseEntry function.
 * - NaturalLanguageExpenseEntryOutput - The return type for the naturalLanguageExpenseEntry function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CATEGORIES = [
  "food",
  "transport",
  "home",
  "internet",
  "shopping",
  "fuel",
  "water",
  "education",
  "health",
  "leisure",
  "other",
];

const PAYMENT_METHODS = ["Cash", "Transfer", "Multicaixa", "Card"];

const NaturalLanguageExpenseEntryInputSchema = z.object({
  text: z.string().describe('Natural language description of an expense.'),
});
export type NaturalLanguageExpenseEntryInput = z.infer<typeof NaturalLanguageExpenseEntryInputSchema>;

const NaturalLanguageExpenseEntryOutputSchema = z.object({
  description: z.string().describe('A concise description of the expense.'),
  amount: z.number().describe('The amount of the expense in Kz.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The date of the expense in YYYY-MM-DD format. If not specified, default to today. If "yesterday" is mentioned, use yesterday\'s date.'),
  category: z.enum(CATEGORIES as [string, ...string[]]).describe(`The category of the expense. Must be one of: ${CATEGORIES.join(', ')}. Default to "other" if none fits.`), // Type assertion for z.enum
  paymentMethod: z.enum(PAYMENT_METHODS as [string, ...string[]]).describe(`The payment method used. Must be one of: ${PAYMENT_METHODS.join(', ')}. Default to "Cash" if not specified.`), // Type assertion for z.enum
  person: z.string().optional().describe('The person associated with the expense, if any.'),
  notes: z.string().optional().describe('Any additional notes for the expense.'),
});
export type NaturalLanguageExpenseEntryOutput = z.infer<typeof NaturalLanguageExpenseEntryOutputSchema>;

export async function naturalLanguageExpenseEntry(input: NaturalLanguageExpenseEntryInput): Promise<NaturalLanguageExpenseEntryOutput> {
  return naturalLanguageExpenseEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageExpenseEntryPrompt',
  input: { schema: NaturalLanguageExpenseEntryInputSchema },
  output: { schema: NaturalLanguageExpenseEntryOutputSchema },
  prompt: `You are an AI assistant tasked with parsing natural language expense descriptions into a structured JSON format.

Here are the rules you MUST follow:
1.  Extract the 'description', 'amount' (in Kz), 'date', 'category', 'paymentMethod', 'person', and 'notes' from the user's input.
2.  The 'date' should be in YYYY-MM-DD format. If the input mentions "today", use the current date. If "yesterday" is mentioned, use yesterday's date. If no date is specified, default to today's date.
3.  The 'category' must be one of the following: ${CATEGORIES.join(', ')}. If a category is not clearly specified or does not match, default to "other".
4.  The 'paymentMethod' must be one of the following: ${PAYMENT_METHODS.join(', ')}. If a payment method is not specified, default to "Cash".
5.  The 'amount' must be a numerical value.
6.  'person' and 'notes' are optional fields.

Input: {{{text}}}

Structured Expense: `,
});

const naturalLanguageExpenseEntryFlow = ai.defineFlow(
  {
    name: 'naturalLanguageExpenseEntryFlow',
    inputSchema: NaturalLanguageExpenseEntryInputSchema,
    outputSchema: NaturalLanguageExpenseEntryOutputSchema,
  },
  async (input) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { output } = await prompt({
      text: input.text + ` (Current Date: ${today}, Yesterday's Date: ${yesterday})`,
    });
    return output!;
  }
);
