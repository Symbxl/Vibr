// Code Analysis Types

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
  language: string;
  size: number;
}

export interface AnalysisResult {
  id: string;
  status: 'success' | 'warning' | 'error';
  originalFile: UploadedFile;
  refactoredCode?: string;
  suggestedPath?: string;
  issues: CodeIssue[];
  improvements: CodeImprovement[];
  summary: AnalysisSummary;
  timestamp: string;
}

export interface CodeIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  line?: number;
  column?: number;
  message: string;
  suggestion: string;
  code?: string;
  fixedCode?: string;
}

export type IssueType =
  | 'security'
  | 'bug'
  | 'performance'
  | 'style'
  | 'best-practice'
  | 'accessibility'
  | 'type-safety';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface CodeImprovement {
  id: string;
  category: ImprovementCategory;
  title: string;
  description: string;
  before?: string;
  after?: string;
}

export type ImprovementCategory =
  | 'structure'
  | 'naming'
  | 'typescript'
  | 'hooks'
  | 'performance'
  | 'accessibility'
  | 'testing';

export interface AnalysisSummary {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  improvementsCount: number;
  overallScore: number; // 0-100
  passedChecks: string[];
  failedChecks: string[];
  securityChecklist?: SecurityChecklist;
}

// Security Checklist Types
export interface SecurityCheckItem {
  passed: boolean;
  notes: string;
}

export interface FrontendSecurityChecks {
  httpsEnforced: SecurityCheckItem;
  inputValidation: SecurityCheckItem;
  noSensitiveDataInBrowser: SecurityCheckItem;
  csrfProtection: SecurityCheckItem;
  noExposedApiKeys: SecurityCheckItem;
}

export interface BackendSecurityChecks {
  authentication: SecurityCheckItem;
  authorization: SecurityCheckItem;
  apiProtection: SecurityCheckItem;
  sqlInjectionPrevention: SecurityCheckItem;
  securityHeaders: SecurityCheckItem;
  ddosProtection: SecurityCheckItem;
}

export interface PracticalSecurityChecks {
  dependenciesUpdated: SecurityCheckItem;
  properErrorHandling: SecurityCheckItem;
  secureCookies: SecurityCheckItem;
  fileUploadSecurity: SecurityCheckItem;
  rateLimiting: SecurityCheckItem;
}

export interface SecurityChecklist {
  frontendSecurity: FrontendSecurityChecks;
  backendSecurity: BackendSecurityChecks;
  practicalSecurity: PracticalSecurityChecks;
}

export interface FileStructureSuggestion {
  originalPath: string;
  suggestedPath: string;
  reason: string;
}

export interface AnalysisRequest {
  files: UploadedFile[];
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  checkSecurity?: boolean;
  checkPerformance?: boolean;
  checkAccessibility?: boolean;
  checkBestPractices?: boolean;
  suggestRefactoring?: boolean;
  convertToTypeScript?: boolean;
}

// AI Service types
export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export type AIProvider = 'anthropic' | 'openai';

export interface AIAnalysisPrompt {
  systemPrompt: string;
  userPrompt: string;
  code: string;
}
