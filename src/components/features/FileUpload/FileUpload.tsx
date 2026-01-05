import { useCallback, useRef, useState, type DragEvent, type ChangeEvent, type ReactElement, type KeyboardEvent } from 'react';
import type { UploadedFile } from '../../../types/analysis';
import { generateId } from '../../../utils';
import { FILE_UPLOAD } from '../../../constants';
import { Button } from '../../common/Button';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  isLoading?: boolean;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  maxTotalSize?: number; // in bytes - total size of all files combined
  maxFiles?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getLanguageFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascriptreact',
    ts: 'typescript',
    tsx: 'typescriptreact',
    mjs: 'javascript',
    cjs: 'javascript',
    vue: 'vue',
    svelte: 'svelte',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    css: 'css',
    scss: 'scss',
    html: 'html',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    txt: 'plaintext',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    xml: 'xml',
    graphql: 'graphql',
    prisma: 'prisma',
  };
  return languageMap[ext] ?? 'plaintext';
}

export function FileUpload({
  onFilesUploaded,
  isLoading = false,
  acceptedTypes = FILE_UPLOAD.acceptedTypes as unknown as string[],
  maxFileSize = FILE_UPLOAD.maxFileSize,
  maxTotalSize = FILE_UPLOAD.maxTotalSize,
  maxFiles = FILE_UPLOAD.maxFiles,
}: FileUploadProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(ext)) {
      return `File type ${ext} is not supported`;
    }
    if (file.size > maxFileSize) {
      return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxFileSize)}`;
    }
    return null;
  }, [acceptedTypes, maxFileSize]);

  const processFiles = useCallback(async (files: FileList | File[]): Promise<void> => {
    setError(null);
    setWarning(null);
    const fileArray = Array.from(files);

    if (fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Calculate total size
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      setError(`Total file size (${formatFileSize(totalSize)}) exceeds maximum of ${formatFileSize(maxTotalSize)}`);
      return;
    }

    // Check for large files that may exceed AI token limits
    const largeFiles = fileArray.filter((file) => file.size > FILE_UPLOAD.largeFileWarningSize);
    if (largeFiles.length > 0) {
      const largeFileNames = largeFiles.map((f) => f.name).join(', ');
      setWarning(
        `Large file${largeFiles.length > 1 ? 's' : ''} detected (${largeFileNames}). ` +
        `Files over ${formatFileSize(FILE_UPLOAD.largeFileWarningSize)} may be truncated by the AI due to token limits. ` +
        `Consider splitting large files for better analysis.`
      );
    }

    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        validationErrors.push(errorMsg);
      } else {
        validFiles.push(file);
      }
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    try {
      const uploadedFiles: UploadedFile[] = await Promise.all(
        validFiles.map(async (file) => {
          const content = await file.text();
          return {
            id: generateId('file'),
            name: file.name,
            content,
            language: getLanguageFromExtension(file.name),
            size: file.size,
          };
        })
      );

      onFilesUploaded(uploadedFiles);
    } catch {
      setError('Failed to read files. Please try again.');
    }
  }, [maxFiles, maxTotalSize, validateFile, onFilesUploaded]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { files } = e.target;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const handleClick = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.loading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Upload files by clicking or dragging"
        aria-disabled={isLoading}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.iconContainer}>
          <svg
            className={styles.uploadIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 8L12 3L7 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 3V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.textContainer}>
          <p className={styles.mainText}>
            {isDragging ? 'Drop files here' : 'Drag & drop your code files'}
          </p>
          <p className={styles.subText}>
            or <span className={styles.browseLink}>browse</span> to upload
          </p>
          <p className={styles.supportedText}>
            Supports: JS, TS, Python, Go, Rust, C/C++, Java, and 25+ languages
          </p>
          <p className={styles.limitsText}>
            Up to {maxFiles} files • {formatFileSize(maxFileSize)} per file • {formatFileSize(maxTotalSize)} total
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          isLoading={isLoading}
          testId="upload-button"
        >
          Select Files
        </Button>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <svg
            className={styles.errorIcon}
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
          <span>{error}</span>
        </div>
      )}

      {warning && !error && (
        <div className={styles.warning} role="alert">
          <svg
            className={styles.warningIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.35 1.64 19.69 1.81 19.99C1.99 20.29 2.24 20.55 2.54 20.72C2.84 20.9 3.18 21 3.53 21H20.47C20.82 21 21.16 20.9 21.46 20.72C21.76 20.55 22.01 20.29 22.19 19.99C22.36 19.69 22.45 19.35 22.45 19C22.45 18.65 22.35 18.3 22.18 18L13.71 3.86C13.53 3.57 13.28 3.32 12.98 3.15C12.68 2.99 12.34 2.9 12 2.9C11.66 2.9 11.32 2.99 11.02 3.15C10.72 3.32 10.47 3.57 10.29 3.86Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}
