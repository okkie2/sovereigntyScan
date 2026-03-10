import React, { useMemo, useState } from 'react';
import emailjs from '@emailjs/browser';
import { AnswerMap, calculateScore, questions } from './assessmentConfig';
import { trackEvent } from './analytics';
import { saveLead, type LeadSubmission } from './leadStorage';

type View = 'intro' | 'assessment' | 'loading' | 'results';

const LOADING_DURATION_MS = 2000;

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const App: React.FC = () => {
  const [view, setView] = useState<View>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [hasStarted, setHasStarted] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [wantsWhitepaper, setWantsWhitepaper] = useState(false);
  const [wantsContact, setWantsContact] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const totalQuestions = questions.length;

  const currentQuestion = useMemo(() => questions[currentIndex], [currentIndex]);

  const scoreResult = useMemo(() => calculateScore(answers), [answers]);

  const handleStart = () => {
    setView('assessment');
    if (!hasStarted) {
      trackEvent({ type: 'assessment_started' });
      setHasStarted(true);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    const selected = currentQuestion.options.find(o => o.id === answerId);
    if (!selected) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selected
    }));

    trackEvent({
      type: 'question_answered',
      questionId: currentQuestion.id,
      answerId: selected.id
    });
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setView('loading');
      const { totalScore, category } = scoreResult;
      trackEvent({
        type: 'assessment_completed',
        totalScore,
        category
      });
      window.setTimeout(() => {
        setView('results');
      }, LOADING_DURATION_MS);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setView('intro');
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setCurrentIndex(0);
    setView('intro');
    setFormError(null);
    setFormSuccess(null);
    setFirstName('');
    setEmail('');
    setWantsWhitepaper(false);
    setWantsContact(false);
  };

  const handleSubmitLead = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedName = firstName.trim();
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName || !trimmedEmail) {
      setFormError('Please provide your name and work email.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setFormError('Please enter a valid work email address.');
      return;
    }

    const domainPart = trimmedEmail.split('@')[1] ?? '';
    const tld = domainPart.split('.').pop() ?? '';
    const commonTlds = new Set([
      'com',
      'net',
      'org',
      'io',
      'ai',
      'co',
      'nl',
      'de',
      'fr',
      'uk',
      'eu',
      'gov',
      'edu',
      'info',
      'biz'
    ]);

    if (tld.length < 2 || (!commonTlds.has(tld.toLowerCase()) && tld.length > 4)) {
      setFormError('Please enter a work email address with a valid domain extension.');
      return;
    }

    const organisationFromEmail = trimmedEmail.split('@')[1] ?? '';

    const submission: LeadSubmission = {
      firstName: trimmedName,
      email: trimmedEmail,
      organisation: organisationFromEmail,
      wantsWhitepaper,
      wantsContact,
      submittedAt: new Date().toISOString()
    };

    saveLead(submission);
    trackEvent({
      type: 'lead_submitted',
      hasWhitepaper: wantsWhitepaper,
      hasContactRequest: wantsContact
    });

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      // For production, replace this with your preferred email integration.
      void emailjs
        .send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            firstName: submission.firstName,
            email: submission.email,
            organisation: submission.organisation,
            wantsWhitepaper: submission.wantsWhitepaper ? 'Yes' : 'No',
            wantsContact: submission.wantsContact ? 'Yes' : 'No',
            score: scoreResult.totalScore,
            category: scoreResult.category
          },
          {
            publicKey: EMAILJS_PUBLIC_KEY
          }
        )
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('[email] failed_to_send', error);
        });
    }

    setFormSuccess('Thank you for your interest. Please expect our response shortly.');
  };

  const renderIntro = () => (
    <div>
      <h1 className="app-title">Technology Dependency &amp; Sovereignty Check</h1>
      <p className="intro-lead">
        In under 3 minutes, assess how dependent your organisation is on a small number of technology
        providers.
      </p>
      <p className="intro-body">
        Many organisations have strong security governance through frameworks such as ISO 27001.
        This assessment looks at a related but often overlooked dimension: structural dependency and
        control over critical technology providers.
      </p>
      <p className="intro-caption">Designed for CTOs, CIOs and technology leaders.</p>
      <button type="button" className="primary-button" onClick={handleStart}>
        Start assessment
      </button>
    </div>
  );

  const renderAssessment = () => {
    const currentAnswer = answers[currentQuestion.id];
    const progressFraction = (currentIndex + 1) / totalQuestions;

    return (
      <div>
        <header className="assessment-header">
          <div className="assessment-header-top">
            <div className="assessment-title">Technology Dependency &amp; Sovereignty Check</div>
            <div className="assessment-step">
              Question {currentIndex + 1} of {totalQuestions}
            </div>
          </div>
          <div className="progress-shell" aria-hidden="true">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.round(progressFraction * 100)}%` }}
              />
            </div>
          </div>
        </header>
        <main>
          <h2 className="question-text">{currentQuestion.title}</h2>
          <div className="answers-grid">
            {currentQuestion.options.map(option => {
              const selected = currentAnswer?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`answer-button ${selected ? 'answer-button-selected' : ''}`}
                  onClick={() => handleAnswerSelect(option.id)}
                >
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </main>
        <div className="navigation-row">
          <button
            type="button"
            className="secondary-button"
            onClick={goBack}
          >
            Back
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={goNext}
            disabled={!currentAnswer}
          >
            {currentIndex === totalQuestions - 1 ? 'View results' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="loading-screen">
      <div className="spinner" aria-hidden="true" />
      <div>
        <div className="loading-text">Analysing technology dependencies…</div>
        <div className="loading-subtext">
          Mapping concentration, operational dependence, exit difficulty and legal visibility.
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    const { totalScore, maxScore, category } = scoreResult;

    const categoryLabel =
      category === 'low' ? 'Low exposure' : category === 'moderate' ? 'Moderate exposure' : 'High exposure';

    const categoryClassSuffix = category === 'low' ? 'low' : category === 'moderate' ? 'moderate' : 'high';

    let headline: string;
    let description: string;

    if (category === 'low') {
      headline = 'Diversified technology environment';
      description =
        'Your answers suggest that identity, infrastructure and work platforms are not heavily concentrated with a single provider.';
    } else if (category === 'moderate') {
      headline = 'Structural dependency on a small number of providers';
      description =
        'Your organisation appears to rely on a limited number of technology providers. This is common in modern cloud environments but can increase exit cost and operational exposure.';
    } else {
      headline = 'Strong provider dependency';
      description =
        'Your answers suggest that identity, infrastructure and daily work may depend heavily on the same provider or small group of providers. This creates structural dependency and may increase exposure to vendor lock-in, jurisdictional control and geopolitical risk.';
    }

    return (
      <div>
        <h1 className="app-title">Technology Dependency &amp; Sovereignty Check</h1>
        <p className="app-subtitle">Summary of your assessment.</p>

        <div className="results-layout">
          <section className="results-main">
            <div className={`badge-pill badge-pill-${categoryClassSuffix}`}>{categoryLabel}</div>
            <div className={`results-score results-score-${categoryClassSuffix}`}>
              Score:{' '}
              <span className="results-score-accent">
                {totalScore}
              </span>{' '}
              / {maxScore}
            </div>
            <div className="results-category">Exposure category: {categoryLabel}</div>
            <h2 className="results-headline">{headline}</h2>
            <p className="results-description">{description}</p>
            <p className="iso-context">
              Many organisations with mature security governance, including ISO 27001 environments,
              still rely heavily on a small number of technology providers.
              <br />
              <br />
              ISO 27001 focuses on security controls. This assessment highlights a different dimension:
              technology dependency and sovereignty exposure.
            </p>
          </section>

          <aside className="results-side">
            <form className="lead-form" onSubmit={handleSubmitLead}>
              <div className="lead-form-title">Continue the conversation</div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="firstName" className="sr-only">First name</label>
                  <input
                    id="firstName"
                    className="form-input"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email" className="sr-only">Work email</label>
                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Work email"
                  />
                </div>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={wantsWhitepaper}
                    onChange={e => setWantsWhitepaper(e.target.checked)}
                  />
                  <span>Send me the whitepaper “Security Without Sovereignty: Why ISO 27001 Isn’t Enough”.</span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={wantsContact}
                    onChange={e => setWantsContact(e.target.checked)}
                  />
                  <span>Contact me for a deeper Technology Dependency &amp; Sovereignty assessment.</span>
                </label>
              </div>

              <div className="form-footer">
                <button type="submit" className="primary-button">
                  Proceed
                </button>
                <div>
                  {formError && <div className="form-error">{formError}</div>}
                  {formSuccess && <div className="form-success">{formSuccess}</div>}
                  {!formError && !formSuccess && (
                    <div className="form-hint">
                      Submissions are stored locally for this prototype. Connect your CRM or marketing automation
                      later.
                    </div>
                  )}
                </div>
              </div>
            </form>
          </aside>
        </div>

        <button type="button" className="tertiary-button" onClick={resetAssessment}>
          Start a new assessment
        </button>
      </div>
    );
  };

  return (
    <div className="app-root">
      <div className="card">
        {view === 'intro' && renderIntro()}
        {view === 'assessment' && renderAssessment()}
        {view === 'loading' && renderLoading()}
        {view === 'results' && renderResults()}
      </div>
    </div>
  );
};

