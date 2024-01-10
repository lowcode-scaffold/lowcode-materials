import alert from '../controllers/alert';
import * as task from '../controllers/task';
import * as script from '../controllers/script';

export const routes: Record<string, any> = {
  alert: alert.alert,
  getTask: task.getTask,
  runScript: script.runScript,
};
