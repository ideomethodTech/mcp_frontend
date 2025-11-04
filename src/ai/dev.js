import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-plan.js';
import '@/ai/flows/chat-with-book.js';
import '@/ai/flows/generate-answer-key.js';
import '@/ai/flows/generate-ppt.js';
import '@/ai/flows/generate-worksheet.js';