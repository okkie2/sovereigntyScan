export type LeadSubmission = {
  firstName: string;
  email: string;
  organisation: string;
  wantsWhitepaper: boolean;
  wantsContact: boolean;
  submittedAt: string;
};

const STORAGE_KEY = 'technology-dependency-sovereignty-leads';

export function saveLead(submission: LeadSubmission): void {
  if (typeof window === 'undefined') return;

  try {
    const existingRaw = window.localStorage.getItem(STORAGE_KEY);
    const existing: LeadSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [...existing, submission];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // eslint-disable-next-line no-console
    console.log('[lead_storage] lead_saved', submission);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[lead_storage] failed_to_save', error);
  }
}

