export type TaskInfo = {
  // 需求 id，用户发送内容的开头数字部分
  taskId: string;
  // 需求标题，用户发送内容去掉开头数字部分，请翻译成英文，不要直接翻译，要自然、流畅和地道，这部分内容会作为 git 分支名，请用中划线代替翻译后的空格
  taskTitle: string;
};
