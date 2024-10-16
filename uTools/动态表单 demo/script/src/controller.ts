import path from 'path';
import * as fs from 'fs-extra';
import * as execa from 'execa';
import * as ejs from 'ejs';
import axios from 'axios';
import { clipboard } from 'electron';
import { validate } from '../../../../share/TypeChatSlim/utools';
import { generalBasic } from '../../../../share/BaiduOCR/index';
import { getShareData } from '../../../../share/utils/shareData';
import { renderEjsTemplates } from '../../../../share/utils/ejs';
import { typescriptToMock } from '../../../../share/utils/platformIndependent/json';

export type MethodHandle = (data: {
  method: string;
  params: string;
  model: object;
  scriptFile: string;
}) => Promise<{
  /** 立即更新 model */
  updateModelImmediately?: boolean;
  /** 仅更新参数 */
  onlyUpdateParams?: boolean;
  params?: string;
  /** 打开 Chat */
  showChat?: boolean;
  /** Chat Content */
  chatContent?: string;
  model: object;
}>;

export const initFiltersFromImage: MethodHandle = async (data) => {
  const availableFormats = clipboard.availableFormats('clipboard');
  if (!availableFormats.some((s) => s.includes('image'))) {
    throw new Error('剪贴板里没有截图');
  }
  const base64 = clipboard.readImage('clipboard').toDataURL();
  const ocrRes = await generalBasic({ image: base64 });
  return {
    updateModelImmediately: false,
    model: data.model,
    onlyUpdateParams: true,
    params: ocrRes.words_result.map((s) => s.words).join('\r\n'),
  };
};

export const initFiltersFromText: MethodHandle = async (data) => {
  const filters = data.params
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');
  const formatedFilters = filters.map((item) => {
    const s = item.replace(/：|：/g, ':').split(':');
    return {
      component: (s[1] || '').indexOf('选择') > -1 ? 'select' : 'input',
      key: s[0].trim(),
      label: s[0].trim(),
      placeholder: s[1] || '',
    };
  });
  return {
    updateModelImmediately: false,
    onlyUpdateParams: false,
    params: '',
    model: { ...data.model, filters: formatedFilters },
  };
};

export const initColumnsFromText: MethodHandle = async (data) => {
  const columns = data.params
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');
  const formatedColumns = columns.map((s) => ({
    slot: false,
    title: s,
    dataIndex: s,
    key: s,
  }));
  return {
    updateModelImmediately: false,
    onlyUpdateParams: false,
    params: '',
    model: { ...data.model, columns: formatedColumns },
  };
};

export const openChatGPT: MethodHandle = async (data) => {
  const configPath = path.join(
    data.scriptFile
      .replace('/script/src/mainBundle', '/config')
      .replace('/script/src/main', '/config'),
  );
  const schema = fs.readFileSync(path.join(configPath, 'schema.ts'), 'utf8');
  const clipboardText = JSON.stringify(data.model);
  const typeName = 'IOption';
  const requestPrompt =
    `You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:\n` +
    `\`\`\`\n${schema}\`\`\`\n` +
    `The following is a user request:\n` +
    `"""\n${clipboardText}\n"""\n` +
    `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;
  return {
    updateModelImmediately: true,
    onlyUpdateParams: false,
    params: '',
    showChat: true,
    chatContent: requestPrompt,
    model: data.model,
  };
};

export const generateCode: MethodHandle = async (data) => {
  const { selectedFolder, activeWindow } = getShareData();
  const tempWorkPath = path.join(activeWindow || '', '.lowcode');
  const blockPath = path.join(
    data.scriptFile
      .replace('/script/src/mainBundle', '')
      .replace('/script/src/main', ''),
  );
  fs.copySync(blockPath, tempWorkPath);
  try {
    await renderEjsTemplates(
      {
        ...data.model,
        createBlockPath: path.join(selectedFolder || '').replace(/\\/g, '/'),
      },
      path.join(tempWorkPath, 'src'),
    );

    // #region 更新 mock 服务
    const mockType = fs
      .readFileSync(path.join(tempWorkPath, 'src', 'temp.mock.type').toString())
      .toString();
    fs.removeSync(path.join(tempWorkPath, 'src', 'temp.mock.type'));
    const { mockCode, mockData } = typescriptToMock(mockType);
    const mockTemplate = fs
      .readFileSync(
        path.join(tempWorkPath, 'src', 'temp.mock.script').toString(),
      )
      .toString();
    fs.removeSync(path.join(tempWorkPath, 'src', 'temp.mock.script'));
    const mockScript = ejs.render(mockTemplate, {
      ...data.model,
      mockCode,
      mockData,
      createBlockPath: selectedFolder?.replace(':', ''),
    });
    const mockProjectPathRes = await axios
      .get('http://localhost:3000/mockProjectPath', { timeout: 1000 })
      .catch(() => {
        // window.showInformationMessage(
        //   '获取 mock 项目路径失败，跳过更新 mock 服务',
        // );
      });
    if (mockProjectPathRes?.data.result) {
      const projectName = activeWindow?.replace(/\\/g, '/').split('/').pop();
      const mockRouteFile = path.join(
        mockProjectPathRes.data.result,
        `${projectName}.js`,
      );
      let mockFileContent = `
	 import KoaRouter from 'koa-router';
	 import proxy from '../middleware/Proxy';
	 import { delay } from '../lib/util';

	 const Mock = require('mockjs');

	 const { Random } = Mock;

	 const router = new KoaRouter();
	 router{{mockScript}}
	 module.exports = router;
	 `;

      if (fs.existsSync(mockRouteFile)) {
        mockFileContent = fs.readFileSync(mockRouteFile).toString().toString();
        const index = mockFileContent.lastIndexOf(')') + 1;
        mockFileContent = `${mockFileContent.substring(
          0,
          index,
        )}{{mockScript}}\n${mockFileContent.substring(index)}`;
      }
      mockFileContent = mockFileContent.replace(/{{mockScript}}/g, mockScript);
      fs.writeFileSync(mockRouteFile, mockFileContent);
      try {
        execa.sync('node', [
          path.join(
            mockProjectPathRes.data.result
              .replace(/\\/g, '/')
              .replace('/src/routes', ''),
            '/node_modules/eslint/bin/eslint.js',
          ),
          mockRouteFile,
          '--resolve-plugins-relative-to',
          mockProjectPathRes.data.result
            .replace(/\\/g, '/')
            .replace('/src/routes', ''),
          '--fix',
        ]);
      } catch (err) {
        console.log(err);
      }
      // #endregion
    }
  } catch (ex) {
    fs.removeSync(tempWorkPath);
    throw ex;
  }

  fs.copySync(path.join(tempWorkPath, 'src'), path.join(selectedFolder || ''));
  fs.removeSync(tempWorkPath);

  return {
    updateModelImmediately: false,
    model: data.model,
    onlyUpdateParams: true,
    params: `代码生成目录：${selectedFolder}`,
  };
};

export const validateJSON = (data: {
  jsonText: string;
  scriptFile: string;
}) => {
  const configPath = path.join(
    data.scriptFile
      .replace('/script/src/mainBundle', '/config')
      .replace('/script/src/main', '/config'),
  );
  const schema = fs.readFileSync(path.join(configPath, 'schema.ts'), 'utf8');
  const typeName = 'PageConfig';
  return validate(data.jsonText, schema, typeName);
};
