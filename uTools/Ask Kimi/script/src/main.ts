import { clipboard } from 'electron';

export const bootstrap = async () => {
  utools.ubrowser
    .goto('https://kimi.moonshot.cn/')
    .wait('div[role="textbox"]')
    .focus('div[role="textbox"]')
    // .paste('你好')
    // .wait(300)
    // .press('Enter')
    .run({})
    .catch((err) => {
      utools.showNotification(err.message);
    });
  utools.outPlugin();
  utools.hideMainWindow();
};
