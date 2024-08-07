import alert from '../controllers/alert';
import * as task from '../controllers/task';
import * as script from '../controllers/script';
import * as llm from '../controllers/llm';
import * as dynamicForm from '../controllers/dynamicForm';

export const routes: Record<string, any> = {
  alert: alert.alert,
  getTask: task.getTask,
  runScript: script.runScript,
  askLLM: llm.askLLM,
  getDynamicForm: dynamicForm.getDynamicForm,
};
