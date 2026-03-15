'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered spending insights.
 *
 * - getAiSpendingInsights - A function that analyzes monthly spending data and provides personalized insights.
 * - AiSpendingInsightsInput - The input type for the getAiSpendingInsights function.
 * - AiSpendingInsightsOutput - The return type for the getAiSpendingInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExpenseSchema = z.object({
  id: z.union([z.number(), z.string()]).describe('Unique identifier for the expense.'),
  date: z.string().describe('Date of the expense in YYYY-MM-DD format.'),
  category: z.string().describe('ID of the expense category.'),
  description: z.string().describe('Short description of the expense.'),
  amount: z.number().describe('Amount of the expense.'),
  payment: z.string().describe('Payment method used (e.g., Cash, Transfer).'),
  person: z.string().optional().describe('Optional: Person associated with the expense.'),
  notes: z.string().optional().describe('Optional: Additional notes for the expense.'),
});

const CategorySchema = z.object({
  id: z.string().describe('Unique identifier for the category.'),
  label: z.string().describe('Human-readable label for the category.'),
  emoji: z.string().describe('Emoji representing the category.'),
  color: z.string().describe('Color code associated with the category.'),
});

const AiSpendingInsightsInputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('An array of all individual monthly expenses.'),
  monthTotal: z.number().describe('The total amount of money spent this month.'),
  dailyAvg: z.number().describe('The average daily spending for the current month.'),
  byCategory: z.array(z.tuple([z.string(), z.number()])).describe('An array of tuples: [categoryID, amount].'),
  byPerson: z.array(z.tuple([z.string(), z.number()])).optional().describe('An array of tuples: [personName, amount].'),
  busiestDay: z.object({
    date: z.string(),
    amount: z.number()
  }).optional().describe('The day with the highest total spending.'),
  busiestWeek: z.object({
    weekNumber: z.number(),
    amount: z.number()
  }).optional().describe('The week with the highest total spending.'),
  categories: z.array(CategorySchema).describe('A list of all predefined expense categories.'),
});
export type AiSpendingInsightsInput = z.infer<typeof AiSpendingInsightsInputSchema>;

const AiSpendingInsightsOutputSchema = z.object({
  summary: z.string().describe('A high-level positive opening summary.'),
  trends: z.array(z.string()).describe('Specific spending trends identified.'),
  savings: z.array(z.string()).describe('Actionable savings suggestions.'),
  peakAnalysis: z.string().describe('Analysis of the busiest spending periods (day/week).'),
});
export type AiSpendingInsightsOutput = z.infer<typeof AiSpendingInsightsOutputSchema>;

export async function getAiSpendingInsights(input: AiSpendingInsightsInput): Promise<AiSpendingInsightsOutput> {
  return aiSpendingInsightsFlow(input);
}

const aiSpendingInsightsPrompt = ai.definePrompt({
  name: 'aiSpendingInsightsPrompt',
  input: { schema: AiSpendingInsightsInputSchema },
  output: { schema: AiSpendingInsightsOutputSchema },
  prompt: `You are KwanzaKeeper, an expert financial AI for Angolans. Analyze the spending data for the month and provide deep insights.

Total spent: {{{monthTotal}}} Kz
Daily average: {{{dailyAvg}}} Kz

{{#if busiestDay}}
Peak Day: {{{busiestDay.date}}} ({{{busiestDay.amount}}} Kz)
{{/if}}

{{#if busiestWeek}}
Peak Week: Week {{{busiestWeek.weekNumber}}} ({{{busiestWeek.amount}}} Kz)
{{/if}}

Category Breakdown:
{{#each byCategory}}
- {{lookup ../categories_map this.[0] 'label'}}: {{this.[1]}} Kz
{{/each}}

{{#if byPerson}}
Spending by Person:
{{#each byPerson}}
- {{this.[0]}}: {{this.[1]}} Kz
{{/each}}
{{/if}}

Expenses Context:
{{#each expenses}}
- {{{date}}}: {{{description}}} ({{{amount}}} Kz) in {{{lookup ../categories_map this.category 'label'}}}
{{/each}}

Your goal:
1. Provide a friendly 'summary' paragraph about the month. Mention if they stayed within a reasonable limit or if there was a specific event that caused a spike.
2. List 3 specific 'trends' (e.g., "Gastas muito aos fins de semana", "Os teus gastos com transporte subiram na segunda semana").
3. List 3 'savings' tips tailored to this data (e.g., "Tenta reduzir as refeições fora", "Usa transportes partilhados").
4. Provide a 'peakAnalysis' explaining why the peak day/week might have occurred based on the descriptions and how to avoid it in the future.

All responses MUST be in Portuguese (pt-AO). Be encouraging and use Angolan financial context where appropriate.`,
});

const aiSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'aiSpendingInsightsFlow',
    inputSchema: AiSpendingInsightsInputSchema,
    outputSchema: AiSpendingInsightsOutputSchema,
  },
  async (input) => {
    const categories_map: { [key: string]: { label: string; emoji: string; color: string } } = {};
    input.categories.forEach((cat) => {
      categories_map[cat.id] = { label: cat.label, emoji: cat.emoji, color: cat.color };
    });

    const { output } = await aiSpendingInsightsPrompt({
      ...input,
      categories_map,
    });
    return output!;
  }
);
