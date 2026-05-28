// Entry point de la Interface Extension.
// API: import desde '@airtable/blocks/interface/ui', initializeBlock recibe { interface: () => ReactNode }.
import {initializeBlock, loadCSSFromURLAsync} from '@airtable/blocks/interface/ui';
import './style.css';
import App from './App';

// Tipografía de marca (Mulish). loadCSSFromURLAsync es la vía sancionada por el SDK
// para cargar CSS externo dentro del iframe (evita problemas de CSP). Fallback: system sans.
loadCSSFromURLAsync('https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500;600;700&display=swap').catch(
  () => {},
);

initializeBlock({interface: () => <App />});
