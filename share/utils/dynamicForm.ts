import path from 'path';
import fs from 'fs';

/** utoolsScriptFile 和 vscodeMaterialPath 必须传入一个 */
export const getDynamicFormConfig = (data: {
  utoolsScriptFile?: string;
  vscodeMaterialPath?: string;
  model?: object;
}) => {
  let configPath = '';
  if (data.utoolsScriptFile) {
    configPath = data.utoolsScriptFile
      .replace('/script/src/mainBundle', '/config')
      .replace('/script/src/main', '/config');
  }
  if (data.vscodeMaterialPath) {
    configPath = path.join(data.vscodeMaterialPath, 'config');
  }

  const formConfig: {
    schema: object;
    scripts: { method: string; remark: string }[];
  } = { schema: {}, scripts: [] };
  try {
    const fullPath = path.join(configPath);
    let model = {};
    let schema = {} as any;
    let config = { scripts: [] };
    try {
      model = JSON.parse(
        fs.readFileSync(path.join(fullPath, 'model.json')).toString(),
      );
    } catch {}
    try {
      schema = JSON.parse(
        fs.readFileSync(path.join(fullPath, 'schema.json')).toString(),
      );
    } catch {}
    try {
      let configFilePath = path.join(fullPath, 'config.json');
      if (!fs.existsSync(configFilePath)) {
        configFilePath = path.join(fullPath, 'preview.json');
      }
      config = JSON.parse(fs.readFileSync(configFilePath).toString());
    } catch {}
    if (schema.formSchema && schema.formSchema.schema) {
      schema = schema.formSchema.schema;
    }
    if (Object.keys(schema).length > 0) {
      // 设置 page 默认 name
      schema.name = 'page';
      if (schema.body && Array.isArray(schema.body)) {
        schema.body.forEach((s: Record<string, unknown>) => {
          if (s.type === 'form') {
            s.name = 'form';
            s.data = data.model || model;
          }
        });
      }
    }
    formConfig.schema = schema;
    formConfig.scripts = config.scripts;
  } catch {}
  return formConfig;
};
