import alert from '../controllers/alert';
import * as task from '../controllers/task';

export const routes: Record<string, any> = {
  alert: alert.alert,
  getTask: task.getTask,
};
