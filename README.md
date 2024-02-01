将项目 clone 到本地，安装依赖

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

使用其它 LLM

只要实现了 `llm/index.js` 中的 `createChatCompletion` 的方法，lowcode 插件内部的 ChatGPT 请求将会转为使用这个方法。不存在这个文件或者没有  `createChatCompletion` 方法会继续使用内部 ChatGPT 请求。https://github.com/lowcode-scaffold/lowcode-materials/blob/master/llm/index.js

