import { clipboard } from 'electron';

export const bootstrap = async () => {
  utools.setUBrowserProxy({ proxyRules: 'http://127.0.0.1:7890' });
  utools.ubrowser
    // .devTools('bottom')
    .useragent('Chrome')
    .goto('https://groq.com/')
    .wait('#model-selector')
    .wait('#chat')
    .when('#chat')
    .wait(1000)
    .focus('#chat')
    // .wait(300)
    // .paste('你好')
    // .wait(1000)
    // .press('Enter')
    .end()
    .run({});
  utools.outPlugin();
  utools.hideMainWindow();
};
