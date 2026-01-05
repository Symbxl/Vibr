import { useState, useCallback, Suspense, type ReactElement } from 'react';
import type { UploadedFile, AnalysisResult } from './types/analysis';
import { analyzeFiles, hasApiKeyConfigured } from './services';
import { useUsageTracking } from './hooks';
import { Header } from './components/layout';
import { ErrorBoundary, Spinner } from './components/common';
import { FileUpload, AnalysisResults, Settings } from './components/features';
import './styles/global.css';
import styles from './App.module.css';

type AppState = 'upload' | 'analyzing' | 'results';

function App(): ReactElement {
  const [appState, setAppState] = useState<AppState>('upload');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const isAnalyzing = appState === 'analyzing';

  const { remainingCount, limit, isLimitReached, incrementUsage } = useUsageTracking();

  const handleFilesUploaded = useCallback(async (files: UploadedFile[]) => {
    if (!hasApiKeyConfigured()) {
      setIsSettingsOpen(true);
      setAnalysisError('Please configure your API key to analyze code.');
      return;
    }

    if (isLimitReached) {
      setAnalysisError('You have reached your free tier limit. Upgrade to Pro for unlimited analyses.');
      return;
    }

    setAppState('analyzing');
    setAnalysisError(null);

    try {
      const analysisResults = await analyzeFiles(files);
      incrementUsage();
      setResults(analysisResults);
      setAppState('results');
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : 'Analysis failed. Please try again.'
      );
      setAppState('upload');
    }
  }, [isLimitReached, incrementUsage]);

  const handleReset = useCallback(() => {
    setResults([]);
    setAppState('upload');
    setAnalysisError(null);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <Header onSettingsClick={handleOpenSettings} />

        <main className={styles.main}>
          <Suspense fallback={<LoadingFallback />}>
            {appState === 'upload' && (
              <>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                  <div className={styles.heroContent}>
                    <div className={styles.badge}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Powered by Claude & GPT-4
                    </div>
                    <h1 className={styles.heroTitle}>
                      Transform Your <span>Vibe Code</span> Into Production-Ready Quality
                    </h1>
                    <p className={styles.heroDescription}>
                      Upload your code and let AI analyze it for security vulnerabilities, bugs,
                      and best practices. Get instant, actionable feedback with refactored code.
                    </p>
                    <div className={styles.heroCta}>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleOpenSettings}
                      >
                        Get Started Free
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                      <a href="#how-it-works" className={styles.secondaryButton}>
                        See How It Works
                      </a>
                    </div>
                  </div>
                  <div className={styles.heroVisual}>
                    <div className={styles.browserMockup}>
                      <div className={styles.browserHeader}>
                        <div className={styles.browserDots}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div className={styles.browserUrl}>vibr.app/analyze</div>
                      </div>
                      <div className={styles.browserContent}>
                        <div className={styles.codePreview}>
                          <div className={styles.codeLine}>
                            <span className={styles.lineNumber}>1</span>
                            <span className={styles.keyword}>function</span> <span className={styles.funcName}>fetchUserData</span>(<span className={styles.param}>userId</span>) {'{'}
                          </div>
                          <div className={styles.codeLine}>
                            <span className={styles.lineNumber}>2</span>
                            {'  '}<span className={styles.keyword}>const</span> query = <span className={styles.string}>`SELECT * FROM users WHERE id = ${'{'}userId{'}'}`</span>;
                          </div>
                          <div className={`${styles.codeLine} ${styles.errorLine}`}>
                            <span className={styles.lineNumber}>3</span>
                            {'  '}<span className={styles.comment}>{'// SQL Injection vulnerability detected'}</span>
                          </div>
                          <div className={styles.codeLine}>
                            <span className={styles.lineNumber}>4</span>
                            {'  '}<span className={styles.keyword}>return</span> db.<span className={styles.funcName}>query</span>(query);
                          </div>
                          <div className={styles.codeLine}>
                            <span className={styles.lineNumber}>5</span>
                            {'}'}
                          </div>
                        </div>
                        <div className={styles.analysisOverlay}>
                          <div className={styles.issueCard}>
                            <div className={styles.issueIcon}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                              </svg>
                            </div>
                            <div className={styles.issueText}>
                              <strong>Critical: SQL Injection</strong>
                              <span>Line 2 - Use parameterized queries</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Trusted By */}
                <section className={styles.trustedSection}>
                  <p className={styles.trustedText}>Works with your favorite tools</p>
                  <div className={styles.trustedLogos}>
                    <span className={styles.companyLogo}>React</span>
                    <span className={styles.companyLogo}>TypeScript</span>
                    <span className={styles.companyLogo}>Node.js</span>
                    <span className={styles.companyLogo}>Python</span>
                    <span className={styles.companyLogo}>GraphQL</span>
                  </div>
                </section>

                {/* Upload Section */}
                <section className={styles.uploadSection} id="analyze">
                  <h2 className={styles.sectionTitle}>Start Analyzing Your Code</h2>
                  <p className={styles.sectionDescription}>
                    Drop your files below to get instant AI-powered code analysis
                  </p>

                  <div className={styles.usageIndicator}>
                    <div className={styles.usageInfo}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>Free Plan</span>
                    </div>
                    <div className={styles.usageCount}>
                      <span className={isLimitReached ? styles.limitReached : ''}>
                        {remainingCount}
                      </span>
                      <span className={styles.usageLimit}>/ {limit} analyses left this month</span>
                    </div>
                    {isLimitReached && (
                      <a href="#pricing" className={styles.upgradeLink}>
                        Upgrade to Pro
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {analysisError && (
                    <div className={styles.errorBanner} role="alert">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{analysisError}</span>
                    </div>
                  )}

                  <FileUpload
                    onFilesUploaded={handleFilesUploaded}
                    isLoading={isAnalyzing}
                  />
                </section>

                {/* Features Section */}
                <section className={styles.featuresSection} id="features">
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Enterprise-Grade Code Analysis</h2>
                    <p className={styles.sectionDescription}>
                      Everything you need to ship secure, high-quality code with confidence
                    </p>
                  </div>

                  <div className={styles.featuresGrid}>
                    <div className={styles.featureShowcase}>
                      <div className={styles.featureVisual}>
                        <div className={styles.securityScan}>
                          <div className={styles.scanHeader}>
                            <span className={styles.scanIcon}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/>
                              </svg>
                            </span>
                            Security Scan Complete
                          </div>
                          <div className={styles.scanResults}>
                            <div className={`${styles.scanItem} ${styles.critical}`}>
                              <span className={styles.scanCount}>3</span>
                              <span>Critical</span>
                            </div>
                            <div className={`${styles.scanItem} ${styles.warning}`}>
                              <span className={styles.scanCount}>7</span>
                              <span>Warnings</span>
                            </div>
                            <div className={`${styles.scanItem} ${styles.info}`}>
                              <span className={styles.scanCount}>12</span>
                              <span>Suggestions</span>
                            </div>
                          </div>
                          <div className={styles.scanProgress}>
                            <div className={styles.progressBar} style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.featureContent}>
                        <div className={styles.featureIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/>
                          </svg>
                        </div>
                        <h3>Security Vulnerability Detection</h3>
                        <p>
                          Automatically detect XSS, SQL injection, CSRF, and other OWASP Top 10
                          vulnerabilities before they reach production.
                        </p>
                        <ul className={styles.featureList}>
                          <li>OWASP Top 10 coverage</li>
                          <li>Dependency vulnerability scanning</li>
                          <li>Secret detection in code</li>
                        </ul>
                      </div>
                    </div>

                    <div className={`${styles.featureShowcase} ${styles.reversed}`}>
                      <div className={styles.featureVisual}>
                        <div className={styles.codeRefactor}>
                          <div className={styles.refactorBefore}>
                            <span className={styles.refactorLabel}>Before</span>
                            <pre>
{`function getData(id) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      result.push(data[i]);
    }
  }
  return result;
}`}
                            </pre>
                          </div>
                          <div className={styles.refactorArrow}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className={styles.refactorAfter}>
                            <span className={styles.refactorLabel}>After</span>
                            <pre>
{`const getData = (id: string) =>
  data.filter(item =>
    item.id === id
  );`}
                            </pre>
                          </div>
                        </div>
                      </div>
                      <div className={styles.featureContent}>
                        <div className={styles.featureIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18"/>
                          </svg>
                        </div>
                        <h3>Intelligent Code Refactoring</h3>
                        <p>
                          Get AI-powered suggestions to modernize your code with best practices,
                          TypeScript types, and cleaner patterns.
                        </p>
                        <ul className={styles.featureList}>
                          <li>Modern ES6+ patterns</li>
                          <li>TypeScript migration</li>
                          <li>Performance optimizations</li>
                        </ul>
                      </div>
                    </div>

                    <div className={styles.featureShowcase}>
                      <div className={styles.featureVisual}>
                        <div className={styles.bugDetection}>
                          <div className={styles.bugItem}>
                            <div className={`${styles.bugIcon} ${styles.error}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M15 9l-6 6M9 9l6 6"/>
                              </svg>
                            </div>
                            <div className={styles.bugInfo}>
                              <strong>Null Reference Error</strong>
                              <span>user.profile.name may be undefined</span>
                            </div>
                            <span className={styles.bugLine}>Line 23</span>
                          </div>
                          <div className={styles.bugItem}>
                            <div className={`${styles.bugIcon} ${styles.warning}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                              </svg>
                            </div>
                            <div className={styles.bugInfo}>
                              <strong>Memory Leak</strong>
                              <span>Event listener not cleaned up</span>
                            </div>
                            <span className={styles.bugLine}>Line 45</span>
                          </div>
                          <div className={styles.bugItem}>
                            <div className={`${styles.bugIcon} ${styles.info}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4M12 8h.01"/>
                              </svg>
                            </div>
                            <div className={styles.bugInfo}>
                              <strong>Race Condition</strong>
                              <span>Async state update issue</span>
                            </div>
                            <span className={styles.bugLine}>Line 67</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.featureContent}>
                        <div className={styles.featureIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 2L6 4M16 2L18 4M3 18H6M18 18H21M6 12H3M18 12H21M8 22L6 20M16 22L18 20"/>
                            <ellipse cx="12" cy="14" rx="5" ry="8"/>
                            <path d="M12 6V22"/>
                          </svg>
                        </div>
                        <h3>Deep Bug Detection</h3>
                        <p>
                          Find hidden bugs, race conditions, memory leaks, and edge cases
                          that traditional linters miss.
                        </p>
                        <ul className={styles.featureList}>
                          <li>Null reference detection</li>
                          <li>Async/await issues</li>
                          <li>Logic error analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How It Works */}
                <section className={styles.howItWorks} id="how-it-works">
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>How It Works</h2>
                    <p className={styles.sectionDescription}>
                      Three simple steps to better code
                    </p>
                  </div>

                  <div className={styles.stepsGrid}>
                    <div className={styles.step}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepVisual}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <h3>Upload Your Code</h3>
                      <p>Drag and drop your files or paste code directly. We support 50+ languages.</p>
                    </div>
                    <div className={styles.stepConnector}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepVisual}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                      </div>
                      <h3>AI Analyzes</h3>
                      <p>Our AI reviews your code for security issues, bugs, and improvement opportunities.</p>
                    </div>
                    <div className={styles.stepConnector}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepNumber}>3</div>
                      <div className={styles.stepVisual}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 11L12 14L22 4"/>
                          <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"/>
                        </svg>
                      </div>
                      <h3>Get Results</h3>
                      <p>Receive detailed reports with fixes, refactored code, and actionable recommendations.</p>
                    </div>
                  </div>
                </section>

                {/* Pricing Section */}
                <section className={styles.pricingSection} id="pricing">
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
                    <p className={styles.sectionDescription}>
                      Start free, upgrade when you need more
                    </p>
                  </div>

                  <div className={styles.pricingGrid}>
                    <div className={styles.pricingCard}>
                      <div className={styles.pricingHeader}>
                        <h3>Free</h3>
                        <div className={styles.pricingPrice}>
                          <span className={styles.currency}>$</span>
                          <span className={styles.amount}>0</span>
                          <span className={styles.period}>/month</span>
                        </div>
                        <p>Perfect for getting started</p>
                      </div>
                      <ul className={styles.pricingFeatures}>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          10 analyses per month
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Basic security scanning
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Single file uploads
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Community support
                        </li>
                      </ul>
                      <button type="button" className={styles.pricingButton} onClick={handleOpenSettings}>
                        Get Started
                      </button>
                    </div>

                    <div className={`${styles.pricingCard} ${styles.popular}`}>
                      <div className={styles.popularBadge}>Most Popular</div>
                      <div className={styles.pricingHeader}>
                        <h3>Pro</h3>
                        <div className={styles.pricingPrice}>
                          <span className={styles.currency}>$</span>
                          <span className={styles.amount}>29</span>
                          <span className={styles.period}>/month</span>
                        </div>
                        <p>For professional developers</p>
                      </div>
                      <ul className={styles.pricingFeatures}>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Unlimited analyses
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Advanced security scanning
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Multi-file & folder uploads
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Priority support
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Export reports
                        </li>
                      </ul>
                      <button type="button" className={`${styles.pricingButton} ${styles.primaryButton}`} onClick={handleOpenSettings}>
                        Start Free Trial
                      </button>
                    </div>

                    <div className={styles.pricingCard}>
                      <div className={styles.pricingHeader}>
                        <h3>Enterprise</h3>
                        <div className={styles.pricingPrice}>
                          <span className={styles.custom}>Custom</span>
                        </div>
                        <p>For teams and organizations</p>
                      </div>
                      <ul className={styles.pricingFeatures}>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Everything in Pro
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Team management
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          SSO & SAML
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Dedicated support
                        </li>
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17L4 12"/>
                          </svg>
                          Custom integrations
                        </li>
                      </ul>
                      <button type="button" className={styles.pricingButton}>
                        Contact Sales
                      </button>
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className={styles.ctaSection}>
                  <div className={styles.ctaContent}>
                    <h2>Ready to ship better code?</h2>
                    <p>Join thousands of developers who trust Vibr for code quality.</p>
                    <button
                      type="button"
                      className={styles.ctaButton}
                      onClick={handleOpenSettings}
                    >
                      Get Started Free
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </section>
              </>
            )}

            {appState === 'analyzing' && (
              <div className={styles.analyzingSection}>
                <Spinner size="lg" label="Analyzing your code..." />
                <p className={styles.analyzingText}>
                  AI is reviewing your code for issues and improvements...
                </p>
              </div>
            )}

            {appState === 'results' && (
              <AnalysisResults results={results} onReset={handleReset} />
            )}
          </Suspense>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <rect width="32" height="32" rx="8" fill="url(#footerLogoGradient)" />
                  <path d="M9 13L14 18L9 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 23H23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Vibr</span>
              </div>
              <p>AI-powered code analysis for modern developers.</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#how-it-works">How it Works</a>
              </div>
              <div className={styles.footerColumn}>
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#blog">Blog</a>
                <a href="#careers">Careers</a>
              </div>
              <div className={styles.footerColumn}>
                <h4>Legal</h4>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
                <a href="#security">Security</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>Powered by AI. Your code is analyzed securely and never stored.</p>
          </div>
        </footer>

        <Settings isOpen={isSettingsOpen} onClose={handleCloseSettings} />
      </div>
    </ErrorBoundary>
  );
}

function LoadingFallback(): ReactElement {
  return (
    <div className={styles.loadingFallback}>
      <Spinner size="lg" label="Loading..." />
    </div>
  );
}

export default App;
