将项目 clone 到本地，安装依赖，执行 yarn build

## 使用 VSCODE

安装 [lowcode](https://marketplace.visualstudio.com/items?itemName=wjkang.lowcode) 插件

设置同步目录为 clone 项目的目录

![](https://github.com/user-attachments/assets/979aefca-445b-4805-98e8-5224f9a06067)

![](https://github.com/user-attachments/assets/01f4684d-3cc5-496d-adce-91a345c8a4c8)

vscode 执行如下命令

![](https://github.com/user-attachments/assets/3563be5f-322d-429a-b3d7-44be3d380fbe)

出现如下选项，配置成功

![](https://github.com/user-attachments/assets/266b876a-bae9-409a-bbb9-f01dbd8c0637)

快速创建区块

![](https://github.com/user-attachments/assets/cacc892a-0834-4899-a766-f6e090abe302)



以同步目录设置的代码模版和区块在所有项目里都可见，代码逻辑可以自由修改，不过分依赖 lowcode 插件内部，比如上面快速创建区块的代码： https://github.com/lowcode-scaffold/lowcode-materials/blob/master/materials/snippets/%E5%BF%AB%E9%80%9F%E5%88%9B%E5%BB%BA%E5%8C%BA%E5%9D%97/script/src/main.ts

### 支持其它 LLM

只要实现了 `llm/index.js` 中的 `createChatCompletion` 的方法，lowcode 插件内部的 ChatGPT 请求将会转为使用这个方法。不存在这个文件或者没有  `createChatCompletion` 方法会继续使用内部 ChatGPT 请求。https://github.com/lowcode-scaffold/lowcode-materials/blob/master/llm/index.js

如果使用的 LLM 兼容 openai 的数据格式，直接通过可视化界面进行配置

![image](https://github.com/user-attachments/assets/c115b70c-68f8-4479-96f4-495d4d0a1275)

![image](https://github.com/user-attachments/assets/cfa2b61b-e462-40a5-aadd-710adec15b8a)

![image](https://github.com/user-attachments/assets/5eb13ef1-150b-450c-9b53-018cbbdf59a1)


## 使用 uTools

### uTools 自动化脚本

安装依赖后执行 yarn build，uTools 中安装自动化脚本插件，新建脚本，把 dist/utools 目录下的各个 index.js 内容复制过去就行。

![image](https://github.com/user-attachments/assets/ee3cd944-850b-478b-b1e7-03fa8a79d3a2)

![image](https://github.com/user-attachments/assets/3b307be1-70ab-4524-9a2d-9b19419965a4)


部分脚本需要配合插件使用，插件下载：[lowcode-1.0.0.upxs](https://github.com/lowcode-scaffold/lowcode-materials/releases)


一个生成特定代码的例子：

![](https://github.com/user-attachments/assets/ebd19d40-1f92-49d3-ab13-aa7272ff04f9)

![](https://github.com/user-attachments/assets/b0a4e635-08cf-4e09-8469-6d73c76c17d3)

