将项目 clone 到本地，安装依赖，执行 yarn build

安装 [lowcode](https://marketplace.visualstudio.com/items?itemName=wjkang.lowcode) 插件

设置同步目录为 clone 项目的目录

![](https://i.imgur.com/9mVkBga.png)

![](https://i.imgur.com/J44thU5.png)

vscode 执行如下命令

![](https://i.imgur.com/QWblbfV.png)

出现如下选项，配置成功

![](https://i.imgur.com/UU0wzyy.png)

快速创建区块

![](https://i.imgur.com/eeSp4Et.gif)


以同步目录设置的代码模版和区块在所有项目里都可见，代码逻辑可以自由修改，不过分依赖 lowcode 插件内部，比如上面快速创建区块的代码： https://github.com/lowcode-scaffold/lowcode-materials/blob/master/materials/snippets/%E5%BF%AB%E9%80%9F%E5%88%9B%E5%BB%BA%E5%8C%BA%E5%9D%97/script/src/main.ts

### 使用其它 LLM

只要实现了 `llm/index.js` 中的 `createChatCompletion` 的方法，lowcode 插件内部的 ChatGPT 请求将会转为使用这个方法。不存在这个文件或者没有  `createChatCompletion` 方法会继续使用内部 ChatGPT 请求。https://github.com/lowcode-scaffold/lowcode-materials/blob/master/llm/index.js

如果使用的 LLM 兼容 openai 的数据格式，直接通过可视化界面进行配置

![image](https://github.com/user-attachments/assets/c115b70c-68f8-4479-96f4-495d4d0a1275)

![image](https://github.com/user-attachments/assets/cfa2b61b-e462-40a5-aadd-710adec15b8a)

![image](https://github.com/user-attachments/assets/5eb13ef1-150b-450c-9b53-018cbbdf59a1)


### uTools 自动化脚本

安装依赖后执行 yarn prod，uTools 中安装自动化脚本插件，新建脚本，把 dist/utools 目录下的各个 index.js 内容复制过去就行。

一个生成特定代码的例子：

![](https://github.com/user-attachments/assets/ebd19d40-1f92-49d3-ab13-aa7272ff04f9)

![](https://github.com/user-attachments/assets/b0a4e635-08cf-4e09-8469-6d73c76c17d3)

