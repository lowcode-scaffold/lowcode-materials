import { clipboard } from 'electron';

export const bootstrap = () => {
  const text = clipboard.readText();
  utools.showNotification(text || 'Hello Word');
};
