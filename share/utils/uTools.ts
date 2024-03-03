import { clipboard } from 'electron';

export const getOpenaiApiKey = () =>
  new Promise<string>((resolve, reject) => {
    // utools.dbStorage.removeItem('lowcode.openaiApiKey'); // 需要更新 api key 的时候打开
    const cacheKey = utools.dbStorage.getItem('lowcode.openaiApiKey');
    if (cacheKey) {
      resolve(cacheKey);
      return;
    }
    const oldClip = clipboard.readText();
    utools.showNotification('请在输入框中粘贴 api key');
    utools.setSubInput(
      (input) => {
        const key = (input as unknown as { text: string }).text;
        utools.dbStorage.setItem('lowcode.openaiApiKey', key);
        clipboard.writeText(oldClip);
        resolve(key);
      },
      '请粘贴 api key',
      true,
    );
  });

export const screenCapture = () =>
  new Promise<string>((resolve, reject) => {
    utools.screenCapture((res) => {
      resolve(res);
    });
  });
