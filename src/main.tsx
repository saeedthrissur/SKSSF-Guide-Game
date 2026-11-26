import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { displayPrefs } from './utils/displayPrefs';

// Apply saved Dark Mode, Font Size (1-5), and Language before first paint
displayPrefs.applyToDom();

createRoot(document.getElementById('root')!).render(<App />);
