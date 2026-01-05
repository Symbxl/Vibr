import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider, AppProvider } from './context';
import { reportWebVitals } from './utils/reportWebVitals';

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Failed to find the root element. Make sure there is a <div id="root"></div> in your HTML.'
  );
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AppProvider>
  </StrictMode>
);

// Performance monitoring
// Pass a callback to log results (e.g., reportWebVitals(console.log))
// or send to an analytics endpoint.
// Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
