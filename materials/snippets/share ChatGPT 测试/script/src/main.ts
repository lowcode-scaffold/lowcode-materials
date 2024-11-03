import * as path from 'path';
import * as fs from 'fs-extra';
import { window, Range } from 'vscode';
import { generalBasic } from '@share/BaiduOCR/index';
import { translate } from '@share/TypeChatSlim/index';
import { createChatCompletion } from '@share/LLM/openai';
import { context } from './context';
import { IColumns } from '../../config/schema';

const systemPrompt = `# Role: Tailwind CSS Developer

## Task

- Input: Screenshot(s) of a reference web page or Low-fidelity
- Output: Single HTML page using Tailwind CSS, HTML

## Guidelines

- Utilize Tailwind CSS to develop the website based on the provided screenshot or Low-fidelity
- Achieve an exact visual match to the provided screenshot or Low-fidelity
- Pay close attention to:
  - Background color
  - Text color
  - Font size
  - Font family
  - Padding
  - Margin
  - Border
- Use the precise text from the screenshot
- Avoid placeholder comments; write the full code
- Repeat elements as shown in the screenshot (e.g., if there are 15 items, include 15 items in the code)
- Use placeholder images from \`https://placehold.co\` with descriptive \`alt\` text for future image generation

## Libraries

- Include Tailwind CSS via: \`<script src="https://cdn.tailwindcss.com"></script>\`

## Deliverable

- Respond with the complete HTML code within \`<html>\` tags
- Respond with the HTML file content only
`;

export async function bootstrap() {
  const { lowcodeContext } = context;
  const res = await createChatCompletion({
    model: 'gpt-4-vision-preview',
    maxTokens: 4096,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: 'https://i.imgur.com/fHpqvC9.png' },
          },
          {
            type: 'text',
            text: 'Turn this into a single html file using tailwind.',
          },
        ],
      },
    ],
    handleChunk(data) {
      lowcodeContext?.log.append(data.text || '');
    },
  });
}
