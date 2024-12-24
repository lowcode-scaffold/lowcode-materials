import { createChatCompletion } from '@share/LLM/openaiV2';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const text = clipboard.readText();
  let platform = utools.isWindows() ? 'windows' : 'mac';
  if (utools.isLinux()) {
    platform = 'linux';
  }
  if (!text) {
    utools.showNotification('请先复制内容');
    return;
  }
  let res = await createChatCompletion({
    messages: [
      // {
      //   role: 'system',
      //   content: `你精通各种 OS 平台命令行，你的目标是根据用户的要求，帮助用户获取命令行命令，直接给出可执行的命令，用户复制后可直接执行。下面用户输入的内容：`,
      // },
      {
        role: 'user',
        content: `${platform} 平台下， ${text}，返回可执行的命令即可，不要带多余的信息`,
      },
    ],
  });
  res = res.replace(/`/g, '');
  utools.outPlugin();
  utools.hideMainWindowPasteText(res);
};
