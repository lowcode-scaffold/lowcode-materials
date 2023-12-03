import * as path from 'path';
import { getFileContent } from './file';

export const getMaterial = (materialPath: string) => {
  let material: {
    model: object;
    schema: object;
    preview: {
      title?: string;
      description?: string;
      img?: string | string[];
      category?: string[];
      notShowInCommand?: boolean;
      notShowInSnippetsList?: boolean;
      notShowInintellisense?: boolean;
      schema?: string;
      scripts?: [{ method: string; remark: string }];
    };
    template: string;
    commandPrompt: string;
    viewPrompt: string;
  } = {} as any;
  try {
    const fullPath = path.join(materialPath);
    let model = {} as any;
    let schema = {} as any;
    let preview = {
      img: '',
      category: [],
      schema: 'form-render',
      chatGPT: { commandPrompt: '', viewPrompt: '' },
    };
    let template = '';
    let commandPrompt = '';
    let viewPrompt = '';
    try {
      model = JSON.parse(
        getFileContent(path.join(fullPath, 'config', 'model.json'), true),
      );
    } catch {}
    try {
      schema = JSON.parse(
        getFileContent(path.join(fullPath, 'config', 'schema.json'), true),
      );
    } catch {}
    try {
      preview = JSON.parse(
        getFileContent(path.join(fullPath, 'config', 'preview.json'), true),
      );
    } catch {}
    try {
      commandPrompt = getFileContent(
        path.join(fullPath, 'config', 'commandPrompt.ejs'),
        true,
      );
    } catch {}
    try {
      viewPrompt = getFileContent(
        path.join(fullPath, 'config', 'viewPrompt.ejs'),
        true,
      );
    } catch {}
    if (!preview.img) {
      preview.img =
        'https://gitee.com/img-host/img-host/raw/master/2020/11/05/1604587962875.jpg';
    }
    if (!preview.schema) {
      preview.schema = 'form-render';
    }

    try {
      template = getFileContent(
        path.join(fullPath, 'src', 'template.ejs'),
        true,
      );
    } catch {}
    if (schema.formSchema) {
      if (schema.formSchema.formData) {
        model = schema.formSchema.formData;
      }
      schema = schema.formSchema.schema;
    }
    if (Object.keys(schema).length > 0 && preview.schema === 'amis') {
      // 设置 page 默认 name
      schema.name = 'page';
      if (schema.body && Array.isArray(schema.body)) {
        schema.body.forEach((s: Record<string, unknown>) => {
          if (s.type === 'form') {
            s.name = 'form';
            if (s.data && Object.keys(model).length === 0) {
              model = s.data;
            } else if (!s.data && Object.keys(model).length > 0) {
              s.data = model;
            }
          }
        });
      }
    }
    material = {
      model,
      schema,
      preview,
      template,
      commandPrompt,
      viewPrompt,
    };
  } catch {}
  return material;
};
