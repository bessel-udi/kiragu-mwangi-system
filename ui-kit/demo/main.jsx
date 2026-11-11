// ui-kit/demo/main.jsx
// Entry file of the demo page: loads the theme, wraps the page in the toast provider and renders it.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/index.scss';
import { ToastProvider } from '../src/index.js';
import DemoPage from './DemoPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <DemoPage />
    </ToastProvider>
  </StrictMode>,
);
