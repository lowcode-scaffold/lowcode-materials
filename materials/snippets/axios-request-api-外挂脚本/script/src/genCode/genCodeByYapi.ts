import { window } from 'vscode';
import { compile } from 'json-schema-to-typescript';
// import * as strip from 'strip-comments';
import jsonminify from 'jsonminify';
// import * as GenerateSchema from 'generate-schema';
// import { compile as compileEjs, Model } from '../utils/ejs';
import { fetchApiDetailInfo } from '../utils/request';
import { getFuncNameAndTypeName, pasteToEditor } from '../utils/editor';
import { mockFromSchema } from '../utils/json';
import { getConfig } from '../utils/config';
import { getMaterial } from '../utils/material';
import { context } from '../context';
import { Model } from '../utils/ejs';

export const genCodeByYapi = async (
  yapiId: string,
  rawClipboardText: string,
) => {
  const domain = getConfig().yapi?.domain || '';
  if (!domain.trim()) {
    window.showErrorMessage('请配置yapi域名');
    return;
  }
  const projectList = getConfig().yapi?.projects || [];
  if (projectList.length === 0) {
    window.showErrorMessage('请配置项目');
  }

  const selectInfo = getFuncNameAndTypeName();
  const result = await window.showQuickPick(
    projectList.map((s) => s.name),
    { placeHolder: '请选择项目' },
  );
  if (!result) {
  }

  const project = projectList.find((s) => s.name === result);
  const { lowcodeContext } = context;
  const template = getMaterial(lowcodeContext!.materialPath);
  try {
    const model = await genTemplateModelByYapi(
      project?.domain || domain,
      yapiId,
      project!.token,
      selectInfo.typeName,
      selectInfo.funcName,
    );
    console.log(model);
    // model.inputValues = selectInfo.inputValues;
    // model.rawSelectedText = selectInfo.rawSelectedText;
    // model.rawClipboardText = rawClipboardText;
    // const code = compileEjs(template!.template, model);
    // pasteToEditor(code);
  } catch (e: any) {
    window.showErrorMessage(e.toString());
  }
};

export const genTemplateModelByYapi = async (
  domain: string,
  yapiId: string,
  token: string,
  typeName: string,
  funcName: string,
) => {
  const res = await fetchApiDetailInfo(domain, yapiId, token);
  const requestBodyTypeName =
    funcName.slice(0, 1).toUpperCase() + funcName.slice(1);
  if (res.data.data.res_body_type === 'json') {
    const schema = JSON.parse(jsonminify(res.data.data.res_body));
    fixSchema(schema);
    delete schema.title;
    let ts = await compile(schema, typeName, {
      bannerComment: '',
    });
    ts = ts.replace(/(\[k: string\]: unknown;)|\?/g, '');
    const { mockCode, mockData } = mockFromSchema(schema);
    let requestBodyType = '';
    if (res.data.data.req_body_other) {
      const reqBodyScheme = JSON.parse(
        jsonminify(res.data.data.req_body_other),
      );
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
      inputValues: [],
      mockCode,
      mockData,
      jsonData: {},
      rawSelectedText: '',
      rawClipboardText: '',
    };
    return model;
  }
  // // const ts = await jsonToTs(selectInfo.typeName, res.data.data.res_body);
  // const resBodyJson = JSON.parse(stripJsonComments(res.data.data.res_body));
  // const schema = GenerateSchema.json(typeName || 'Schema', resBodyJson);
  // let ts = await compile(schema, typeName, {
  //   bannerComment: '',
  // });
  // ts = strip(ts.replace(/(\[k: string\]: unknown;)|\?/g, ''));
  // const { mockCode, mockData } = mockFromSchema(schema);
  // let requestBodyType = '';
  // if (res.data.data.req_body_other) {
  //   const reqBodyScheme = JSON.parse(
  //     stripJsonComments(res.data.data.req_body_other),
  //   );
  //   delete reqBodyScheme.title;
  //   requestBodyType = await compile(
  //     reqBodyScheme,
  //     `I${requestBodyTypeName}Data`,
  //     {
  //       bannerComment: '',
  //     },
  //   );
  // }
  // const model: Model = {
  //   type: ts,
  //   requestBodyType: requestBodyType.replace(/\[k: string\]: unknown;/g, ''),
  //   funcName,
  //   typeName,
  //   api: res.data.data,
  //   inputValues: [],
  //   mockCode,
  //   mockData,
  //   jsonData: resBodyJson,
  //   rawClipboardText: '',
  //   rawSelectedText: '',
  // };
  // return model;
};

const fixSchema = (obj: object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    // @ts-ignore
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // @ts-ignore
      if (obj[key].type === 'object' && !obj[key].properties) {
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete obj[key];
      }
      // @ts-ignore
      fixSchema(obj[key]); // 递归处理
    }
  }
};
