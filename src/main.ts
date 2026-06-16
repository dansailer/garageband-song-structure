import './styles/main.css';
import { mountApp } from './ui/app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) {
  throw new Error('Root element #app not found');
}

mountApp(root);