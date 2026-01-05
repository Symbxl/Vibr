import type {
  UploadedFile,
  AnalysisResult,
  AnalysisOptions,
  CodeIssue,
  CodeImprovement,
  AnalysisSummary,
  AIProvider,
  SecurityChecklist,
} from '../types/analysis';
import { generateId } from '../utils';
import { STORAGE_KEYS } from '../constants';

const ANALYSIS_SYSTEM_PROMPT = `You are an expert code reviewer and security auditor. Analyze the provided code and return a JSON response with the following structure:

{
  "status": "success" | "warning" | "error",
  "suggestedPath": "suggested/file/path.tsx",
  "refactoredCode": "// The improved, refactored code here",
  "issues": [
    {
      "type": "security" | "bug" | "performance" | "style" | "best-practice" | "accessibility" | "type-safety",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "line": 10,
      "message": "Description of the issue",
      "suggestion": "How to fix it",
      "code": "problematic code snippet",
      "fixedCode": "fixed code snippet"
    }
  ],
  "improvements": [
    {
      "category": "structure" | "naming" | "typescript" | "hooks" | "performance" | "accessibility" | "testing",
      "title": "Improvement title",
      "description": "Detailed description",
      "before": "old code",
      "after": "improved code"
    }
  ],
  "passedChecks": ["Check 1", "Check 2"],
  "failedChecks": ["Failed check 1"],
  "securityChecklist": {
    "frontendSecurity": {
      "httpsEnforced": { "passed": true, "notes": "Uses HTTPS for all external requests" },
      "inputValidation": { "passed": true, "notes": "All user inputs are validated" },
      "noSensitiveDataInBrowser": { "passed": true, "notes": "No passwords/tokens stored in localStorage" },
      "csrfProtection": { "passed": true, "notes": "CSRF tokens implemented" },
      "noExposedApiKeys": { "passed": false, "notes": "API key found hardcoded on line 15" }
    },
    "backendSecurity": {
      "authentication": { "passed": true, "notes": "Proper auth implementation" },
      "authorization": { "passed": true, "notes": "Role-based access control" },
      "apiProtection": { "passed": true, "notes": "Rate limiting and input validation" },
      "sqlInjectionPrevention": { "passed": true, "notes": "Uses parameterized queries" },
      "securityHeaders": { "passed": true, "notes": "CSP, HSTS, X-Frame-Options set" },
      "ddosProtection": { "passed": true, "notes": "Rate limiting implemented" }
    },
    "practicalSecurity": {
      "dependenciesUpdated": { "passed": true, "notes": "No known vulnerable dependencies" },
      "properErrorHandling": { "passed": true, "notes": "Errors don't expose sensitive info" },
      "secureCookies": { "passed": true, "notes": "HttpOnly, Secure, SameSite flags set" },
      "fileUploadSecurity": { "passed": true, "notes": "File type/size validation in place" },
      "rateLimiting": { "passed": true, "notes": "API rate limiting configured" }
    }
  }
}

COMPREHENSIVE SECURITY CHECKLIST - Code must pass ALL applicable checks to get a green checkmark:

## Frontend Security
1. HTTPS Enforcement: All external API calls must use HTTPS, no HTTP URLs
2. Input Validation: All user inputs must be sanitized and validated before use
3. No Sensitive Data in Browser: Never store passwords, tokens, or secrets in localStorage/sessionStorage (API keys for client-side apps are exception with proper warning)
4. CSRF Protection: Forms should have CSRF tokens, use SameSite cookies
5. No Exposed API Keys: No hardcoded API keys, secrets, or credentials in source code

## Backend Security (if applicable)
1. Authentication: Proper user authentication (JWT, sessions, OAuth)
2. Authorization: Role-based access control, permission checks on all routes
3. API Protection: Input validation, rate limiting on all endpoints
4. SQL Injection Prevention: Use parameterized queries, ORMs, or prepared statements
5. Security Headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
6. DDoS Protection: Rate limiting, request throttling, load balancing considerations

## Practical Security Habits
1. Dependencies Updated: Check for known vulnerable packages (npm audit style)
2. Proper Error Handling: Errors should not expose stack traces, internal paths, or sensitive info to users
3. Secure Cookies: HttpOnly, Secure, SameSite flags for all authentication cookies
4. File Upload Security: Validate file types, sizes, scan for malicious content patterns
5. Rate Limiting: Prevent brute force and abuse with rate limiting

IMPORTANT RULES:
- Status "success" (green checkmark) ONLY if there are NO critical/high severity issues AND all applicable security checks pass
- Status "warning" (yellow) if there are medium severity issues or some security checks fail
- Status "error" (red X) if there are critical/high severity issues
- Mark security checks as "passed: true" only if the code explicitly implements them OR if they're not applicable (e.g., SQL injection for a frontend-only component)
- Add "notes" explaining why each check passed or failed
- The refactoredCode should fix ALL security issues and follow ALL best practices

Additional Guidelines:
1. Check for XSS vulnerabilities (dangerouslySetInnerHTML, unsanitized user input in DOM)
2. Identify memory leaks (uncleared intervals, event listeners, subscriptions)
3. Suggest TypeScript conversions if using JavaScript
4. Recommend React best practices (hooks, memoization, proper state management)
5. Check accessibility (ARIA, semantic HTML, keyboard navigation)
6. Suggest proper file structure and naming conventions
7. Identify performance optimizations (useMemo, useCallback, React.memo)

Be thorough and strict. Security is paramount.`;

interface AIResponse {
  status: 'success' | 'warning' | 'error';
  suggestedPath?: string;
  refactoredCode?: string;
  issues: Array<{
    type: CodeIssue['type'];
    severity: CodeIssue['severity'];
    line?: number;
    column?: number;
    message: string;
    suggestion: string;
    code?: string;
    fixedCode?: string;
  }>;
  improvements: Array<{
    category: CodeImprovement['category'];
    title: string;
    description: string;
    before?: string;
    after?: string;
  }>;
  passedChecks: string[];
  failedChecks: string[];
  securityChecklist?: SecurityChecklist;
}

function getStoredApiKey(): string | null {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.apiKeys);
    if (settings) {
      const parsed = JSON.parse(settings) as Record<string, string>;
      return parsed.anthropic ?? parsed.openai ?? null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function getStoredProvider(): AIProvider {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.apiKeys);
    if (settings) {
      const parsed = JSON.parse(settings) as Record<string, string>;
      if (parsed.anthropic) return 'anthropic';
      if (parsed.openai) return 'openai';
    }
  } catch {
    // Ignore parse errors
  }
  return 'anthropic';
}

async function callAnthropicAPI(code: string, filename: string, apiKey: string): Promise<AIResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this code file (${filename}):\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide your analysis as a JSON object following the specified structure.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `API request failed: ${response.status} ${(errorData as { error?: { message?: string } }).error?.message ?? response.statusText}`
    );
  }

  const data = await response.json() as {
    content: Array<{ type: string; text?: string }>;
  };

  const textContent = data.content.find((c) => c.type === 'text');
  if (!textContent?.text) {
    throw new Error('No text response from API');
  }

  // Extract JSON from the response (it might be wrapped in markdown code blocks)
  let jsonText = textContent.text;
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1]?.trim() ?? jsonText;
  }

  try {
    return JSON.parse(jsonText) as AIResponse;
  } catch {
    throw new Error('Failed to parse API response as JSON');
  }
}

async function callOpenAIAPI(code: string, filename: string, apiKey: string): Promise<AIResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this code file (${filename}):\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide your analysis as a JSON object following the specified structure.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `API request failed: ${response.status} ${(errorData as { error?: { message?: string } }).error?.message ?? response.statusText}`
    );
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message.content;
  if (!content) {
    throw new Error('No response from API');
  }

  return JSON.parse(content) as AIResponse;
}

function calculateSummary(
  issues: CodeIssue[],
  improvements: CodeImprovement[],
  passedChecks: string[],
  failedChecks: string[],
  securityChecklist?: SecurityChecklist
): AnalysisSummary {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const lowCount = issues.filter((i) => i.severity === 'low').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  // Calculate score: start at 100, deduct based on severity
  let score = 100;
  score -= criticalCount * 25;
  score -= highCount * 15;
  score -= mediumCount * 5;
  score -= lowCount * 2;

  // Deduct points for failed security checks
  if (securityChecklist) {
    const allChecks = [
      ...Object.values(securityChecklist.frontendSecurity),
      ...Object.values(securityChecklist.backendSecurity),
      ...Object.values(securityChecklist.practicalSecurity),
    ];
    const failedSecurityChecks = allChecks.filter((check) => !check.passed).length;
    score -= failedSecurityChecks * 5;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    totalIssues: issues.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    improvementsCount: improvements.length,
    overallScore: score,
    passedChecks,
    failedChecks,
    securityChecklist,
  };
}

export async function analyzeFile(
  file: UploadedFile,
  _options?: AnalysisOptions
): Promise<AnalysisResult> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('No API key configured. Please add your API key in Settings.');
  }

  const provider = getStoredProvider();

  try {
    const aiResponse = provider === 'anthropic'
      ? await callAnthropicAPI(file.content, file.name, apiKey)
      : await callOpenAIAPI(file.content, file.name, apiKey);

    const issues: CodeIssue[] = aiResponse.issues.map((issue) => ({
      id: generateId('issue'),
      ...issue,
    }));

    const improvements: CodeImprovement[] = aiResponse.improvements.map((imp) => ({
      id: generateId('imp'),
      ...imp,
    }));

    const summary = calculateSummary(
      issues,
      improvements,
      aiResponse.passedChecks ?? [],
      aiResponse.failedChecks ?? [],
      aiResponse.securityChecklist
    );

    return {
      id: generateId('result'),
      status: aiResponse.status,
      originalFile: file,
      refactoredCode: aiResponse.refactoredCode,
      suggestedPath: aiResponse.suggestedPath,
      issues,
      improvements,
      summary,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Return an error result instead of throwing
    return {
      id: generateId('result'),
      status: 'error',
      originalFile: file,
      issues: [{
        id: generateId('issue'),
        type: 'bug',
        severity: 'critical',
        message: error instanceof Error ? error.message : 'Analysis failed',
        suggestion: 'Check your API key and try again',
      }],
      improvements: [],
      summary: {
        totalIssues: 1,
        criticalCount: 1,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        improvementsCount: 0,
        overallScore: 0,
        passedChecks: [],
        failedChecks: ['API Connection'],
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export async function analyzeFiles(
  files: UploadedFile[],
  options?: AnalysisOptions
): Promise<AnalysisResult[]> {
  const results = await Promise.all(
    files.map((file) => analyzeFile(file, options))
  );
  return results;
}

export function hasApiKeyConfigured(): boolean {
  return getStoredApiKey() !== null;
}
