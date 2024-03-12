import { clipboard } from 'electron';

export const bootstrap = async () => {
  utools.setUBrowserProxy({ proxyRules: 'http://127.0.0.1:7890' });
  utools.ubrowser
    // .devTools('bottom')
    .useragent('Chrome')
    .goto('https://gemini.google.com/')
    .wait('rich-textarea')
    .when('rich-textarea')
    .wait(1000)
    .focus('rich-textarea')
    // .wait(300)
    // .paste('你好')
    // .wait(1000)
    // .press('Enter')
    .end()
    .run({});
  utools.outPlugin();
  utools.hideMainWindow();
};
