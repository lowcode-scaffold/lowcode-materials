import path from 'path';
import { homedir } from 'os';
import * as fs from 'fs-extra';

const dataFile = path.join(homedir(), '.lowcode', 'data.json');

export type ShareData = {
  activeWindow?: string;
};

export const getShareData = () => {
  if (fs.existsSync(dataFile)) {
    return fs.readJSONSync(dataFile) as ShareData;
  }
  return {} as ShareData;
};

export const saveShareData = (data: ShareData) => {
  fs.writeJSONSync(dataFile, { ...getShareData(), ...data }, { spaces: 2 });
};
