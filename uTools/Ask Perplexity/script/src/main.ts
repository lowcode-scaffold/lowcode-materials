import { clipboard } from 'electron';

export const bootstrap = async () => {
  utools.setUBrowserProxy({ proxyRules: 'http://127.0.0.1:7890' });
  utools.ubrowser
    .devTools('bottom')
    // .useragent('Chrome')
    // .useragent(
    //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    // ) // windows
    .useragent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) uTools/4.0.1 Chrome/108.0.5359.215 Electron/22.3.12 Safari/537.36',
    )
    .goto('https://www.perplexity.ai/')
    .wait('textarea')
    .when('textarea')
    .wait(1000)
    .focus('textarea')
    .wait(300)
    .paste('你好')
    // .wait(1000)
    // .press('Enter')
    .end()
    .run({});
  utools.outPlugin();
  utools.hideMainWindow();
};
