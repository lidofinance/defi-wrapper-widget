import React from 'react';
import { createRoot } from 'react-dom/client';
import { IframeApp } from '@/iframe-demo-wrapper/iframe-app';
import '../styles/App.css';

const container = document.getElementById('root');
const root = createRoot(container!); // Use createRoot for React 18+

root.render(
  <React.StrictMode>
    <IframeApp />
  </React.StrictMode>,
);
