import { useState, useCallback, Suspense, type ReactElement } from 'react';
import type { UploadedFile, AnalysisResult } from './types/analysis';
import { analyzeFiles, hasApiKeyConfigured } from './services';
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

  const handleFilesUploaded = useCallback(async (files: UploadedFile[]) => {
    if (!hasApiKeyConfigured()) {
      setIsSettingsOpen(true);
      setAnalysisError('Please configure your API key to analyze code.');
      return;
    }

    setAppState('analyzing');
    setAnalysisError(null);

    try {
      const analysisResults = await analyzeFiles(files);
      setResults(analysisResults);
      setAppState('results');
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : 'Analysis failed. Please try again.'
      );
      setAppState('upload');
    }
  }, []);

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
              <div className={styles.uploadSection}>
                <div className={styles.hero}>
                  <div className={styles.badge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Powered by Claude & GPT-4
                  </div>
                  <h2 className={styles.heroTitle}>
                    Transform Your Code Into <span>Production-Ready</span> Quality
                  </h2>
                  <p className={styles.heroDescription}>
                    Upload your code and let AI analyze it for security vulnerabilities, bugs,
                    and best practices. Get instant, actionable feedback with refactored code.
                  </p>
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

                <div className={styles.features}>
                  <FeatureCard
                    icon={<SecurityIcon />}
                    title="Security Scanning"
                    description="Detect XSS, injection, and other OWASP vulnerabilities"
                  />
                  <FeatureCard
                    icon={<BugIcon />}
                    title="Bug Detection"
                    description="Find logical errors, memory leaks, and anti-patterns"
                  />
                  <FeatureCard
                    icon={<CodeIcon />}
                    title="Best Practices"
                    description="Get TypeScript, React hooks, and accessibility improvements"
                  />
                  <FeatureCard
                    icon={<StructureIcon />}
                    title="File Structure"
                    description="Suggested enterprise-grade folder organization"
                  />
                </div>
              </div>
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
          <p>
            Powered by AI. Your code is analyzed securely and never stored.
          </p>
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

interface FeatureCardProps {
  icon: ReactElement;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps): ReactElement {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

// Icons
function SecurityIcon(): ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BugIcon(): ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L6 4M16 2L18 4M3 18H6M18 18H21M6 12H3M18 12H21M8 22L6 20M16 22L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="12" cy="14" rx="5" ry="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CodeIcon(): ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StructureIcon(): ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default App;
