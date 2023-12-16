import Service from "./service";
import { useModel } from "./model";

interface IProps {
  name: string;
}

export const usePresenter = (props: IProps) => {
  const model = useModel();
  const service = new Service(model);


  return {
    model,
    service,
  };
};
