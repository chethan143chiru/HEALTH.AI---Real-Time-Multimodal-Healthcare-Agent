/**
 * HEALTH.AI Shared Gemini Client
 * Single source of truth for the Gemini SDK client and model identifiers.
 *
 * Model split (per PS05 architecture):
 *  - GEMINI_FLASH_MODEL = gemini-3.8-flash  -> general multimodal / non-live workflows
 *  - GEMINI_LIVE_MODEL  = gemini-3.8-live   -> realtime Live API voice agent
 *
 * The API key stays server-side only. It is never exposed to the frontend bundle.
 */

import { GoogleGenAI } from '@google/genai';

export const GEMINI_FLASH_MODEL = 'gemini-3.8-flash';
export const GEMINI_LIVE_MODEL = 'gemini-3.8-live';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});
