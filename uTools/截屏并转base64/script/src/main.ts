import { clipboard } from 'electron';
import { screenCapture } from '../../../../share/utils/uTools';

export const bootstrap = async () => {
  const base64 = await screenCapture();
  clipboard.writeText(base64);
  utools.outPlugin();
  utools.hideMainWindow();
};
