import { createRoot } from 'react-dom/client';
import invariant from 'tiny-invariant';
import { App } from './app';
import { initResizeEventEmitter } from './iframe-demo-wrapper/resize-event-emitter';

const ROOT_ELEMENT_ID = 'root';

const container = document.getElementById(ROOT_ELEMENT_ID);
invariant(container, `Root element with id '${ROOT_ELEMENT_ID}' not found`);
const root = createRoot(container); // Use createRoot for React 18+

// emits event to top parent window with height of the app
initResizeEventEmitter(ROOT_ELEMENT_ID);

root.render(<App />);
