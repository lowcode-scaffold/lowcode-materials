import { clipboard } from 'electron';
import { askChatGPT as askOpenai } from '@share/utils/uTools';

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

  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
      content: `${platform} 平台下， ${text}，返回可执行的命令即可，不要带多余的信息`,
    }),
  });
};

type LLMMessage = (
  | {
      role: 'system';
      content: string;
    }
  | {
      role: 'user';
      content:
        | string
        | (
            | {
                type: 'image_url';
                image_url: { url: string };
              }
            | { type: 'text'; text: string }
          )[];
    }
)[];
// 给页面调用的
export const askChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
  scriptFile: string;
}) => {
  const content = await askOpenai({
    messages: data.messages,
    handleChunk: data.handleChunk,
  });
  return content;
};
