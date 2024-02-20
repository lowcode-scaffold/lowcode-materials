"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescriptToMock = exports.mockFromSchema = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const TJS = __importStar(require("typescript-json-schema"));
const config_1 = require("./config");
const mockFromSchema = (schema) => {
    let listIndex = 1;
    const config = (0, config_1.getConfig)();
    const mockConfig = config.mock;
    const getMockValue = (key, defaultValue, type = 'number') => {
        const value = defaultValue;
        const mockKeyWordEqualConfig = mockConfig?.mockKeyWordEqual || [];
        for (let i = 0; i < mockKeyWordEqualConfig.length; i++) {
            if (key.toUpperCase() === mockKeyWordEqualConfig[i].key.toUpperCase()) {
                if (typeof mockKeyWordEqualConfig[i].value === 'string') {
                    const array = mockKeyWordEqualConfig[i].value.split('&&');
                    if (array.length > 1) {
                        if (type === array[1]) {
                            return array[0];
                        }
                        return value;
                    }
                }
                return mockKeyWordEqualConfig[i].value;
            }
        }
        const mockKeyWordLikeConfig = mockConfig?.mockKeyWordLike || [];
        for (let i = 0; i < mockKeyWordLikeConfig.length; i++) {
            if (key.toUpperCase().indexOf(mockKeyWordLikeConfig[i].key.toUpperCase()) >
                -1) {
                if (typeof mockKeyWordLikeConfig[i].value === 'string') {
                    const array = mockKeyWordLikeConfig[i].value.split('&&');
                    if (array.length > 1) {
                        if (type === array[1]) {
                            return array[0];
                        }
                        return value;
                    }
                }
                return mockKeyWordLikeConfig[i].value;
            }
        }
        return value;
    };
    const formatProperty = (property, key = '') => {
        let jsonStr = '';
        let listStr = [];
        if (property.type === 'object') {
            jsonStr += `${key ? `${key}: {` : ''}`;
            Object.keys(property.properties).map((childPropertyKey) => {
                const childProperty = property.properties[childPropertyKey];
                const { jsonStr: childJsonStr, listStr: childListStr } = formatProperty(childProperty, childPropertyKey);
                jsonStr += childJsonStr;
                listStr = listStr.concat(childListStr);
            });
            jsonStr += `${key ? '},' : ''}`;
        }
        else if (property.type === 'array') {
            if (Object.keys(property.items).length > 0) {
                const index = listIndex;
                listIndex++;
                let itemStr = `
			 const list${index}=[];
			 for(let i = 0; i < 10 ; i++){
			  list${index}.push(
		  `;
                if (property.items.type === 'object') {
                    itemStr += '{';
                    Object.keys(property.items.properties).map((itemPropertyKey) => {
                        const itemProperty = property.items.properties[itemPropertyKey];
                        const { jsonStr: itemJsonStr, listStr: itemListStr } = formatProperty(itemProperty, itemPropertyKey);
                        itemStr += itemJsonStr;
                        listStr = listStr.concat(itemListStr);
                    });
                    itemStr += `})}`;
                }
                else {
                    if (property.items.type === 'string') {
                        itemStr += getMockValue(key, mockConfig?.mockString || '', 'string');
                    }
                    else {
                        itemStr += getMockValue(key, mockConfig?.mockNumber || 'Random.natural(1000,1000)');
                    }
                    itemStr += `)}`;
                }
                listStr.push(itemStr);
                jsonStr += `${key}: list${index},`;
            }
            else {
                jsonStr += `${key}: [],`;
            }
        }
        else if (property.type === 'number') {
            jsonStr += `${key}: ${getMockValue(key, mockConfig?.mockNumber || 'Random.natural(1000,1000)')},`;
        }
        else if (property.type === 'boolean') {
            jsonStr += `${key}: ${getMockValue(key, mockConfig?.mockBoolean || 'false', 'boolean')},`;
        }
        else if (property.type === 'string') {
            jsonStr += `${key}: ${getMockValue(key, mockConfig?.mockString || 'Random.cword(5, 7)', 'string')},`;
        }
        return {
            jsonStr,
            listStr,
        };
    };
    const { jsonStr, listStr } = formatProperty(schema);
    return {
        mockCode: listStr.join('\n'),
        mockData: `{${jsonStr}}`,
    };
};
exports.mockFromSchema = mockFromSchema;
const typescriptToMock = (oriType) => {
    let type = oriType;
    const tempDir = path.join(os.homedir(), '.lowcode/temp');
    const filePath = path.join(tempDir, 'ts.ts');
    if (!fs.existsSync(filePath)) {
        fs.createFileSync(filePath);
    }
    // 处理最外层是数组类型的场景
    if (!type.trim().endsWith('}')) {
        type = `{ result: ${type} }`;
    }
    fs.writeFileSync(filePath, `export interface TempType ${type}`, {
        encoding: 'utf-8',
    });
    const program = TJS.getProgramFromFiles([filePath]);
    const schema = TJS.generateSchema(program, 'TempType');
    if (schema === null) {
        throw new Error('根据TS类型生成JSON Schema失败');
    }
    const { mockCode, mockData } = (0, exports.mockFromSchema)(schema);
    return {
        mockCode,
        mockData: !oriType.trim().endsWith('}') ? 'list1' : mockData,
    };
};
exports.typescriptToMock = typescriptToMock;
