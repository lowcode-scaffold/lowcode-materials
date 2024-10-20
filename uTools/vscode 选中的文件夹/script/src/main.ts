import { clipboard } from 'electron';
import { getShareData } from '@share/utils/shareData';

export const bootstrap = async (scriptFile?: string) => {
  const data = getShareData();
  return data.selectedFolder || '';
};
