// Entry del preview local: renderiza el App REAL con el SDK mockeado (alias en esbuild).
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../frontend/App';

createRoot(document.getElementById('root')).render(<App />);
