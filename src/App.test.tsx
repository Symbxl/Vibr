import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the services
jest.mock('./services', () => ({
  analyzeFiles: jest.fn(),
  hasApiKeyConfigured: jest.fn(),
}));

import { analyzeFiles, hasApiKeyConfigured } from './services';

const mockAnalyzeFiles = analyzeFiles as jest.MockedFunction<typeof analyzeFiles>;
const mockHasApiKeyConfigured = hasApiKeyConfigured as jest.MockedFunction<typeof hasApiKeyConfigured>;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasApiKeyConfigured.mockReturnValue(false);
  });

  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText(/Transform Your Vibe Code/i)).toBeInTheDocument();
  });

  it('renders the file upload component', () => {
    render(<App />);
    expect(screen.getByText(/Drag & drop your code files/i)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<App />);
    expect(screen.getByText('Security Scanning')).toBeInTheDocument();
    expect(screen.getByText('Bug Detection')).toBeInTheDocument();
    expect(screen.getByText('Best Practices')).toBeInTheDocument();
    expect(screen.getByText('File Structure')).toBeInTheDocument();
  });

  it('opens settings when settings button is clicked', async () => {
    render(<App />);

    const settingsButton = screen.getByLabelText(/Open settings/i);
    await userEvent.click(settingsButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('AI Provider')).toBeInTheDocument();
  });

  it('closes settings when close button is clicked', async () => {
    render(<App />);

    const settingsButton = screen.getByLabelText(/Open settings/i);
    await userEvent.click(settingsButton);

    const closeButton = screen.getByLabelText(/Close settings/i);
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error when trying to analyze without API key', async () => {
    render(<App />);

    // Create a mock file
    const file = new File(['const x = 1;'], 'test.js', { type: 'text/javascript' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock FileReader
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Please configure your API key/i)).toBeInTheDocument();
    });
  });

  it('shows analysis results when API key is configured', async () => {
    mockHasApiKeyConfigured.mockReturnValue(true);
    mockAnalyzeFiles.mockResolvedValue([
      {
        id: 'test-result',
        status: 'success',
        originalFile: {
          id: 'test-file',
          name: 'test.js',
          content: 'const x = 1;',
          language: 'javascript',
          size: 12,
        },
        issues: [],
        improvements: [],
        summary: {
          totalIssues: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          infoCount: 0,
          improvementsCount: 0,
          overallScore: 100,
          passedChecks: ['All checks passed'],
          failedChecks: [],
        },
        timestamp: new Date().toISOString(),
      },
    ]);

    render(<App />);

    // Create a mock file
    const file = new File(['const x = 1;'], 'test.js', { type: 'text/javascript' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/All Checks Passed/i)).toBeInTheDocument();
    });
  });

  it('renders footer with security message', () => {
    render(<App />);
    expect(screen.getByText(/Your code is analyzed securely/i)).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('has no accessibility violations in the main structure', async () => {
    render(<App />);

    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check for header
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Check for navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('file upload has proper aria attributes', () => {
    render(<App />);

    const uploadZone = screen.getByRole('button', { name: /Upload files/i });
    expect(uploadZone).toHaveAttribute('aria-label');
  });
});
