import { window, env } from 'vscode';
import { compile } from 'json-schema-to-typescript';
import strip from 'strip-comments';
import jsonminify from 'jsonminify';
import * as GenerateSchema from 'generate-schema';
import { compile as compileEjs, Model } from '../utils/ejs';
import { fetchApiDetailInfo } from '../utils/request';
import { getFuncNameAndTypeName, pasteToEditor } from '../utils/editor';
import { mockFromSchema } from '../utils/json';
import { getConfig } from '../utils/config';
import { getMaterial } from '../utils/material';
import { context } from '../context';

export const genCodeByYapi = async () => {
  const domain = getConfig().yapi?.domain || '';
  if (!domain.trim()) {
    window.showErrorMessage('请配置yapi域名');
    return;
  }
  const projectList = getConfig().yapi?.projects || [];
  if (projectList.length === 0) {
    window.showErrorMessage('请配置项目');
  }
  const rawClipboardText = await env.clipboard.readText();
  if (!rawClipboardText) {
    window.showErrorMessage('请复制 yapi 接口 id');
    return;
  }

  const selectInfo = getFuncNameAndTypeName();
  const result = await window.showQuickPick(
    projectList.map((s) => s.name),
    { placeHolder: '请选择项目' },
  );
  if (!result) {
    return;
  }

  const project = projectList.find((s) => s.name === result);
  const { lowcodeContext } = context;
  const template = getMaterial(lowcodeContext!.materialPath);
  try {
    const model = await genTemplateModelByYapi(
      project?.domain || domain,
      rawClipboardText,
      project!.token,
      selectInfo.typeName,
      selectInfo.funcName,
    );
    if (model) {
      model.rawSelectedText = selectInfo.rawSelectedText;
      model.rawClipboardText = rawClipboardText;
      const code = compileEjs(template!.template, model);
      pasteToEditor(code);
    }
  } catch (e: any) {
    window.showErrorMessage(e.toString());
  }
};

const genTemplateModelByYapi = async (
  domain: string,
  yapiId: string,
  token: string,
  typeNameOriginal: string,
  funcNameOriginal: string,
) => {
  let funcName = funcNameOriginal;
  let typeName = typeNameOriginal;
  const res = await fetchApiDetailInfo(domain, yapiId, token);
  if (!res.data.data) {
    throw res.data.errmsg;
  }
  funcName = await context.lowcodeContext!.createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `你是一个代码专家，按照用户传给你的 api 接口地址，和接口请求方法，根据接口地址里的信息推测出一个生动形象的方法名称，驼峰格式，返回方法名称`,
      },
      {
        role: 'user',
        content: `api 地址：${res.data.data.query_path}，${res.data.data.method} 方法，作用是${res.data.data.title}`,
      },
    ],
  });
  typeName = `I${funcName.charAt(0).toUpperCase() + funcName.slice(1)}Result`;
  const requestBodyTypeName =
    funcName.slice(0, 1).toUpperCase() + funcName.slice(1);
  if (res.data.data.res_body_type === 'json') {
    const schema = JSON.parse(jsonminify(res.data.data.res_body));
    fixSchema(schema, ['$ref', '$$ref']);
    delete schema.title;
    let ts = await compile(schema, typeName, {
      bannerComment: '',
    });
    ts = ts.replace(/(\[k: string\]: unknown;)|\?/g, '');
    const { mockCode, mockData } = mockFromSchema(schema);
    let requestBodyType = '';
    if (res.data.data.req_body_other) {
      const reqBodyScheme = JSON.parse(res.data.data.req_body_other);
      fixSchema(reqBodyScheme, ['$ref', '$$ref']);
      delete reqBodyScheme.title;
      requestBodyType = await compile(
        reqBodyScheme,
        `I${requestBodyTypeName}Data`,
        {
          bannerComment: '',
        },
      );
    }
    const model: Model = {
      type: ts,
      requestBodyType: requestBodyType.replace(/\[k: string\]: unknown;/g, ''),
      funcName,
      typeName,
      api: res.data.data,
      yapiDomain: domain,
      inputValues: [],
      mockCode,
      mockData,
      jsonData: {},
      rawSelectedText: '',
      rawClipboardText: '',
    };
    return model;
  }
  // yapi 返回数据直接贴的 json
  const resBodyJson = JSON.parse(jsonminify(res.data.data.res_body));
  const schema = GenerateSchema.json(typeName || 'Schema', resBodyJson);
  fixSchema(schema, ['$ref', '$$ref']);
  let ts = await compile(schema, typeName, {
    bannerComment: '',
  });
  ts = strip(ts.replace(/(\[k: string\]: unknown;)|\?/g, ''));
  const { mockCode, mockData } = mockFromSchema(schema);
  let requestBodyType = '';
  if (res.data.data.req_body_other) {
    const reqBodyScheme = JSON.parse(jsonminify(res.data.data.req_body_other));
    fixSchema(reqBodyScheme, ['$ref', '$$ref']);
    delete reqBodyScheme.title;
    requestBodyType = await compile(
      reqBodyScheme,
      `I${requestBodyTypeName}Data`,
      {
        bannerComment: '',
      },
    );
  }
  const model: Model = {
    type: ts,
    requestBodyType: requestBodyType.replace(/\[k: string\]: unknown;/g, ''),
    funcName,
    typeName,
    api: res.data.data,
    yapiDomain: domain,
    inputValues: [],
    mockCode,
    mockData,
    jsonData: resBodyJson,
    rawClipboardText: '',
    rawSelectedText: '',
  };
  return model;
};

function fixSchema(obj: object, fieldNames: string[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((item: object) => {
        if (typeof item === 'object' && item !== null) {
          fixSchema(item, fieldNames);
        } else {
          // eslint-disable-next-line no-restricted-syntax
          for (const fieldName of fieldNames) {
            if (item && item[fieldName]) {
              delete item[fieldName];
            }
          }
        }
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (obj[key].type === 'object' && !obj[key].properties) {
        delete obj[key];
      }
      fixSchema(obj[key], fieldNames);
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const fieldName of fieldNames) {
        if (key === fieldName) {
          delete obj[key];
        }
      }
    }
  }
}
