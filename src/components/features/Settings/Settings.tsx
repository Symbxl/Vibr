import { useState, useCallback, useEffect, type FormEvent, type ChangeEvent, type ReactElement, type MouseEvent, type KeyboardEvent } from 'react';
import type { AIProvider } from '../../../types/analysis';
import { STORAGE_KEYS } from '../../../constants';
import { getStorageItem, setStorageItem } from '../../../utils';
import { Button } from '../../common/Button';
import styles from './Settings.module.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKeyState {
  anthropic: string;
  openai: string;
}

export function Settings({ isOpen, onClose }: SettingsProps): ReactElement | null {
  const [apiKeys, setApiKeys] = useState<ApiKeyState>({
    anthropic: '',
    openai: '',
  });
  const [activeProvider, setActiveProvider] = useState<AIProvider>('anthropic');
  const [showKeys, setShowKeys] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStorageItem<Partial<ApiKeyState>>(STORAGE_KEYS.apiKeys, {});
      setApiKeys({
        anthropic: stored.anthropic ?? '',
        openai: stored.openai ?? '',
      });
      // Determine active provider based on which key is stored
      if (stored.anthropic) {
        setActiveProvider('anthropic');
      } else if (stored.openai) {
        setActiveProvider('openai');
      }
    }
  }, [isOpen]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  }, []);

  const handleProviderChange = useCallback((provider: AIProvider) => {
    setActiveProvider(provider);
    setIsSaved(false);
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setStorageItem(STORAGE_KEYS.apiKeys, apiKeys);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [apiKeys]);

  const handleClearKeys = useCallback(() => {
    setApiKeys({ anthropic: '', openai: '' });
    setStorageItem(STORAGE_KEYS.apiKeys, {});
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, []);

  const toggleShowKeys = useCallback(() => {
    setShowKeys((prev) => !prev);
  }, []);

  const handleBackdropClick = useCallback((e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="settings-title" className={styles.title}>
            Settings
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>AI Provider</h3>
            <p className={styles.sectionDescription}>
              Choose your preferred AI provider for code analysis. Your API key is stored locally in your browser.
            </p>

            <div className={styles.providerToggle}>
              <button
                type="button"
                className={`${styles.providerOption} ${
                  activeProvider === 'anthropic' ? styles.active : ''
                }`}
                onClick={() => handleProviderChange('anthropic')}
              >
                <span className={styles.providerName}>Anthropic</span>
                <span className={styles.providerModel}>Claude</span>
              </button>
              <button
                type="button"
                className={`${styles.providerOption} ${
                  activeProvider === 'openai' ? styles.active : ''
                }`}
                onClick={() => handleProviderChange('openai')}
              >
                <span className={styles.providerName}>OpenAI</span>
                <span className={styles.providerModel}>GPT-4</span>
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>API Keys</h3>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={toggleShowKeys}
              >
                {showKeys ? 'Hide' : 'Show'} Keys
              </button>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="anthropic" className={styles.label}>
                Anthropic API Key
                {activeProvider === 'anthropic' && (
                  <span className={styles.activeBadge}>Active</span>
                )}
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                id="anthropic"
                name="anthropic"
                value={apiKeys.anthropic}
                onChange={handleInputChange}
                placeholder="sk-ant-..."
                className={styles.input}
                autoComplete="off"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="openai" className={styles.label}>
                OpenAI API Key
                {activeProvider === 'openai' && (
                  <span className={styles.activeBadge}>Active</span>
                )}
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                id="openai"
                name="openai"
                value={apiKeys.openai}
                onChange={handleInputChange}
                placeholder="sk-..."
                className={styles.input}
                autoComplete="off"
              />
            </div>

            <div className={styles.warning}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                API keys are stored in your browser's localStorage. Never share your API keys with others.
              </span>
            </div>
          </section>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearKeys}
            >
              Clear All Keys
            </Button>
            <div className={styles.rightActions}>
              {isSaved && (
                <span className={styles.savedMessage}>Saved!</span>
              )}
              <Button type="submit" variant="primary">
                Save Settings
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
