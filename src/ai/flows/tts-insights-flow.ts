
'use server';
/**
 * @fileOverview Flow para converter insights de texto em áudio usando Gemini TTS.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const TtsInsightsInputSchema = z.object({
  text: z.string().describe('O texto da análise financeira a ser convertido em voz.'),
});
export type TtsInsightsInput = z.infer<typeof TtsInsightsInputSchema>;

const TtsInsightsOutputSchema = z.object({
  audioDataUri: z.string().describe('Áudio em formato data URI (WAV).'),
});
export type TtsInsightsOutput = z.infer<typeof TtsInsightsOutputSchema>;

export async function generateTtsInsights(input: TtsInsightsInput): Promise<TtsInsightsOutput> {
  return ttsInsightsFlow(input);
}

const ttsInsightsFlow = ai.defineFlow(
  {
    name: 'ttsInsightsFlow',
    inputSchema: TtsInsightsInputSchema,
    outputSchema: TtsInsightsOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: `Lê o seguinte relatório financeiro do KwanzaKeeper com uma voz profissional e encorajadora em português de Angola: ${input.text}`,
    });

    if (!media || !media.url) {
      throw new Error('Falha ao gerar áudio');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    
    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}
