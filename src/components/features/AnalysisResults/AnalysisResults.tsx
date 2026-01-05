import { useState, useCallback, memo, type ReactElement } from 'react';
import type { AnalysisResult, CodeIssue, CodeImprovement, SecurityChecklist } from '../../../types/analysis';
import { Button } from '../../common/Button';
import styles from './AnalysisResults.module.css';

interface AnalysisResultsProps {
  results: AnalysisResult[];
  onReset: () => void;
}

export const AnalysisResults = memo(function AnalysisResults({
  results,
  onReset,
}: AnalysisResultsProps): ReactElement {
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    results[0] ?? null
  );
  const [activeTab, setActiveTab] = useState<'issues' | 'improvements' | 'security' | 'code'>('issues');

  const handleResultSelect = useCallback((result: AnalysisResult) => {
    setSelectedResult(result);
    setActiveTab('issues');
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (selectedResult?.refactoredCode) {
      await navigator.clipboard.writeText(selectedResult.refactoredCode);
    }
  }, [selectedResult]);

  const handleDownloadCode = useCallback(() => {
    if (selectedResult?.refactoredCode) {
      const blob = new Blob([selectedResult.refactoredCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedResult.suggestedPath ?? selectedResult.originalFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [selectedResult]);

  const overallStatus = results.every((r) => r.status === 'success')
    ? 'success'
    : results.some((r) => r.status === 'error')
    ? 'error'
    : 'warning';

  return (
    <div className={styles.container}>
      {/* Overall Status Banner */}
      <div className={`${styles.statusBanner} ${styles[overallStatus]}`}>
        <div className={styles.statusIcon}>
          {overallStatus === 'success' ? (
            <CheckIcon />
          ) : overallStatus === 'error' ? (
            <XIcon />
          ) : (
            <WarningIcon />
          )}
        </div>
        <div className={styles.statusContent}>
          <h2 className={styles.statusTitle}>
            {overallStatus === 'success'
              ? 'All Checks Passed!'
              : overallStatus === 'error'
              ? 'Issues Found'
              : 'Improvements Suggested'}
          </h2>
          <p className={styles.statusSubtitle}>
            Analyzed {results.length} file{results.length !== 1 ? 's' : ''}
            {selectedResult && ` • Score: ${selectedResult.summary.overallScore}/100`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          Analyze More Files
        </Button>
      </div>

      <div className={styles.mainContent}>
        {/* File List Sidebar */}
        {results.length > 1 && (
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Files</h3>
            <ul className={styles.fileList}>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className={`${styles.fileItem} ${
                      selectedResult?.id === result.id ? styles.active : ''
                    }`}
                    onClick={() => handleResultSelect(result)}
                  >
                    <span className={`${styles.fileStatus} ${styles[result.status]}`}>
                      {result.status === 'success' ? (
                        <CheckIcon size={14} />
                      ) : result.status === 'error' ? (
                        <XIcon size={14} />
                      ) : (
                        <WarningIcon size={14} />
                      )}
                    </span>
                    <span className={styles.fileName}>{result.originalFile.name}</span>
                    <span className={styles.issueCount}>
                      {result.summary.totalIssues}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Results Panel */}
        {selectedResult && (
          <div className={styles.resultsPanel}>
            {/* Summary Cards */}
            <div className={styles.summaryCards}>
              <SummaryCard
                title="Score"
                value={selectedResult.summary.overallScore}
                suffix="/100"
                status={
                  selectedResult.summary.overallScore >= 80
                    ? 'success'
                    : selectedResult.summary.overallScore >= 50
                    ? 'warning'
                    : 'error'
                }
              />
              <SummaryCard
                title="Issues"
                value={selectedResult.summary.totalIssues}
                status={selectedResult.summary.totalIssues === 0 ? 'success' : 'warning'}
              />
              <SummaryCard
                title="Critical"
                value={selectedResult.summary.criticalCount}
                status={selectedResult.summary.criticalCount === 0 ? 'success' : 'error'}
              />
              <SummaryCard
                title="Improvements"
                value={selectedResult.summary.improvementsCount}
                status="info"
              />
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'issues' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('issues')}
              >
                Issues ({selectedResult.issues.length})
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'improvements' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('improvements')}
              >
                Improvements ({selectedResult.improvements.length})
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('security')}
              >
                Security Checklist
              </button>
              {selectedResult.refactoredCode && (
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'code' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  Refactored Code
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'issues' && (
                <IssuesList issues={selectedResult.issues} />
              )}
              {activeTab === 'improvements' && (
                <ImprovementsList improvements={selectedResult.improvements} />
              )}
              {activeTab === 'security' && (
                <SecurityChecklistView checklist={selectedResult.summary.securityChecklist} />
              )}
              {activeTab === 'code' && selectedResult.refactoredCode && (
                <div className={styles.codeSection}>
                  <div className={styles.codeActions}>
                    <Button variant="secondary" size="sm" onClick={handleCopyCode}>
                      Copy Code
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleDownloadCode}>
                      Download File
                    </Button>
                  </div>
                  {selectedResult.suggestedPath && (
                    <p className={styles.suggestedPath}>
                      Suggested path: <code>{selectedResult.suggestedPath}</code>
                    </p>
                  )}
                  <pre className={styles.codeBlock}>
                    <code>{selectedResult.refactoredCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Sub-components
interface SummaryCardProps {
  title: string;
  value: number;
  suffix?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

function SummaryCard({ title, value, suffix, status }: SummaryCardProps): ReactElement {
  return (
    <div className={`${styles.summaryCard} ${styles[`card${capitalize(status)}`]}`}>
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardValue}>
        {value}
        {suffix && <span className={styles.cardSuffix}>{suffix}</span>}
      </span>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface IssuesListProps {
  issues: CodeIssue[];
}

function IssuesList({ issues }: IssuesListProps): ReactElement {
  if (issues.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CheckIcon size={48} />
        <p>No issues found! Your code looks great.</p>
      </div>
    );
  }

  return (
    <ul className={styles.issuesList}>
      {issues.map((issue) => (
        <li key={issue.id} className={`${styles.issueItem} ${styles[issue.severity]}`}>
          <div className={styles.issueHeader}>
            <span className={`${styles.severityBadge} ${styles[issue.severity]}`}>
              {issue.severity}
            </span>
            <span className={`${styles.typeBadge}`}>{issue.type}</span>
            {issue.line && <span className={styles.lineNumber}>Line {issue.line}</span>}
          </div>
          <p className={styles.issueMessage}>{issue.message}</p>
          <p className={styles.issueSuggestion}>
            <strong>Suggestion:</strong> {issue.suggestion}
          </p>
          {issue.code && issue.fixedCode && (
            <div className={styles.codeComparison}>
              <div className={styles.codeBefore}>
                <span className={styles.codeLabel}>Before</span>
                <pre><code>{issue.code}</code></pre>
              </div>
              <div className={styles.codeAfter}>
                <span className={styles.codeLabel}>After</span>
                <pre><code>{issue.fixedCode}</code></pre>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

interface ImprovementsListProps {
  improvements: CodeImprovement[];
}

function ImprovementsList({ improvements }: ImprovementsListProps): ReactElement {
  if (improvements.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CheckIcon size={48} />
        <p>No additional improvements suggested.</p>
      </div>
    );
  }

  return (
    <ul className={styles.improvementsList}>
      {improvements.map((improvement) => (
        <li key={improvement.id} className={styles.improvementItem}>
          <div className={styles.improvementHeader}>
            <span className={styles.categoryBadge}>{improvement.category}</span>
            <h4 className={styles.improvementTitle}>{improvement.title}</h4>
          </div>
          <p className={styles.improvementDescription}>{improvement.description}</p>
          {improvement.before && improvement.after && (
            <div className={styles.codeComparison}>
              <div className={styles.codeBefore}>
                <span className={styles.codeLabel}>Before</span>
                <pre><code>{improvement.before}</code></pre>
              </div>
              <div className={styles.codeAfter}>
                <span className={styles.codeLabel}>After</span>
                <pre><code>{improvement.after}</code></pre>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// Security Checklist View
interface SecurityChecklistViewProps {
  checklist?: SecurityChecklist;
}

const SECURITY_CHECK_LABELS: Record<string, Record<string, string>> = {
  frontendSecurity: {
    httpsEnforced: 'HTTPS Enforcement',
    inputValidation: 'Input Validation',
    noSensitiveDataInBrowser: 'No Sensitive Data in Browser',
    csrfProtection: 'CSRF Protection',
    noExposedApiKeys: 'No Exposed API Keys',
  },
  backendSecurity: {
    authentication: 'Authentication',
    authorization: 'Authorization',
    apiProtection: 'API Protection',
    sqlInjectionPrevention: 'SQL Injection Prevention',
    securityHeaders: 'Security Headers',
    ddosProtection: 'DDoS Protection',
  },
  practicalSecurity: {
    dependenciesUpdated: 'Dependencies Updated',
    properErrorHandling: 'Proper Error Handling',
    secureCookies: 'Secure Cookies',
    fileUploadSecurity: 'File Upload Security',
    rateLimiting: 'Rate Limiting',
  },
};

const CATEGORY_TITLES: Record<string, string> = {
  frontendSecurity: 'Frontend Security',
  backendSecurity: 'Backend Security',
  practicalSecurity: 'Practical Security Habits',
};

function SecurityChecklistView({ checklist }: SecurityChecklistViewProps): ReactElement {
  if (!checklist) {
    return (
      <div className={styles.emptyState}>
        <ShieldIcon size={48} />
        <p>Security checklist not available for this analysis.</p>
        <p className={styles.emptyStateSubtext}>
          The AI analysis may not have returned security checklist data.
        </p>
      </div>
    );
  }

  const categories = ['frontendSecurity', 'backendSecurity', 'practicalSecurity'] as const;

  return (
    <div className={styles.securityChecklist}>
      {categories.map((category) => {
        const checks = checklist[category];
        const checkEntries = Object.entries(checks) as [string, { passed: boolean; notes: string }][];
        const passedCount = checkEntries.filter(([, check]) => check.passed).length;
        const totalCount = checkEntries.length;

        return (
          <div key={category} className={styles.securityCategory}>
            <div className={styles.securityCategoryHeader}>
              <h3 className={styles.securityCategoryTitle}>
                {CATEGORY_TITLES[category]}
              </h3>
              <span
                className={`${styles.securityCategoryScore} ${
                  passedCount === totalCount ? styles.allPassed : styles.someFailed
                }`}
              >
                {passedCount}/{totalCount} Passed
              </span>
            </div>
            <ul className={styles.securityChecksList}>
              {checkEntries.map(([checkKey, check]) => (
                <li
                  key={checkKey}
                  className={`${styles.securityCheckItem} ${
                    check.passed ? styles.passed : styles.failed
                  }`}
                >
                  <span className={styles.securityCheckIcon}>
                    {check.passed ? <CheckIcon size={16} /> : <XIcon size={16} />}
                  </span>
                  <div className={styles.securityCheckContent}>
                    <span className={styles.securityCheckLabel}>
                      {SECURITY_CHECK_LABELS[category]?.[checkKey] ?? checkKey}
                    </span>
                    <span className={styles.securityCheckNotes}>{check.notes}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ShieldIcon({ size = 24 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icons
function CheckIcon({ size = 24 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 4L12 14.01L9 11.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ size = 24 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9L9 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon({ size = 24 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.29 3.86001L1.82002 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53002 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.4471 18.6453 22.3547 18.3024 22.18 18L13.71 3.86001C13.5318 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3438 2.89726 12 2.89726C11.6563 2.89726 11.3184 2.98585 11.0188 3.15449C10.7193 3.32313 10.4683 3.56611 10.29 3.86001Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
