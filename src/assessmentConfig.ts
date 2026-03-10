export type AnswerOption = {
  id: string;
  label: string;
  score: number;
};

export type Question = {
  id: string;
  title: string;
  description?: string;
  options: AnswerOption[];
};

export const questions: Question[] = [
  {
    id: 'q1',
    title:
      'If your identity provider (for example Entra / Azure AD or Google Identity) became unavailable, what would happen?',
    options: [
      { id: 'little-impact', label: 'Little impact', score: 0 },
      { id: 'some-internal-stop', label: 'Some internal systems would stop', score: 1 },
      { id: 'most-cannot-work', label: 'Most employees could not work', score: 2 },
      { id: 'org-stop', label: 'The organisation would largely stop', score: 3 },
      { id: 'not-sure-q1', label: 'Not sure', score: 2 }
    ]
  },
  {
    id: 'q2',
    title:
      'How dependent is daily work on one productivity platform (for example Microsoft 365 or Google Workspace)?',
    options: [
      { id: 'not-very-dependent', label: 'Not very dependent', score: 0 },
      { id: 'some-dependence', label: 'Some dependence', score: 1 },
      { id: 'most-work-depends', label: 'Most work depends on it', score: 2 },
      { id: 'almost-all-depends', label: 'Almost all work depends on it', score: 3 },
      { id: 'not-sure-q2', label: 'Not sure', score: 2 }
    ]
  },
  {
    id: 'q3',
    title: 'Where do most of your systems run today?',
    options: [
      { id: 'mostly-on-prem', label: 'Mostly on-premise', score: 1 },
      { id: 'several-clouds', label: 'Spread across several cloud providers', score: 0 },
      { id: 'mostly-one-cloud', label: 'Mostly with one cloud provider', score: 2 },
      { id: 'almost-one-cloud', label: 'Almost entirely with one cloud provider', score: 3 },
      { id: 'not-sure-q3', label: 'Not sure', score: 2 }
    ]
  },
  {
    id: 'q4',
    title:
      'If you had to reduce dependence on your main cloud provider, how realistic would that be within 12 months?',
    options: [
      { id: 'realistic', label: 'Realistic', score: 0 },
      { id: 'difficult-possible', label: 'Difficult but possible', score: 1 },
      { id: 'very-difficult', label: 'Very difficult', score: 2 },
      { id: 'not-realistic', label: 'Not realistic', score: 3 },
      { id: 'not-sure-q4', label: 'Not sure', score: 2 }
    ]
  },
  {
    id: 'q5',
    title:
      'If your main technology providers were temporarily unavailable, how much of the organisation could still operate?',
    options: [
      { id: 'most-continue', label: 'Most operations continue', score: 0 },
      { id: 'some-disruption', label: 'Some disruption', score: 1 },
      { id: 'major-disruption', label: 'Major disruption', score: 2 },
      { id: 'operations-stop', label: 'Operations largely stop', score: 3 },
      { id: 'not-sure-q5', label: 'Not sure', score: 2 }
    ]
  },
  {
    id: 'q6',
    title:
      'How well do you understand which countries’ laws ultimately govern the technology providers your organisation depends on?',
    options: [
      { id: 'fully-mapped', label: 'Fully mapped and reviewed', score: 0 },
      { id: 'partially-mapped', label: 'Partially mapped', score: 1 },
      { id: 'roughly-assumed', label: 'Roughly assumed', score: 2 },
      { id: 'not-known', label: 'Not really known', score: 3 },
      { id: 'not-sure-q6', label: 'Not sure', score: 2 }
    ]
  }
];

export type AnswerMap = Record<string, AnswerOption | undefined>;

export type ScoreCategory = 'low' | 'moderate' | 'high';

export type ScoreResult = {
  totalScore: number;
  maxScore: number;
  category: ScoreCategory;
};

export const MAX_SCORE = 18;

export function calculateScore(answers: AnswerMap): ScoreResult {
  const totalScore = questions.reduce((sum, q) => {
    const answer = answers[q.id];
    return sum + (answer?.score ?? 0);
  }, 0);

  let category: ScoreCategory;
  if (totalScore <= 6) {
    category = 'low';
  } else if (totalScore <= 12) {
    category = 'moderate';
  } else {
    category = 'high';
  }

  return {
    totalScore,
    maxScore: MAX_SCORE,
    category
  };
}

