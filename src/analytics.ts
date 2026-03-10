type AssessmentEvent =
  | { type: 'assessment_started' }
  | { type: 'question_answered'; questionId: string; answerId: string }
  | { type: 'assessment_completed'; totalScore: number; category: string }
  | { type: 'lead_submitted'; hasWhitepaper: boolean; hasContactRequest: boolean };

// Replace console logging with your analytics integration (e.g. dataLayer, Segment) in production.
export function trackEvent(event: AssessmentEvent): void {
  // eslint-disable-next-line no-console
  console.log('[analytics]', event.type, event);
}

