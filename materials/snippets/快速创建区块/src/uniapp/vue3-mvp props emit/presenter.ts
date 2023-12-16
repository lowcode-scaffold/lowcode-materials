import Service from "./service";
import { useModel } from "./model";

interface IProps {
  name: string;
}

interface IEmit {
  (e: "change", data?: { value: string }): void;
}

export const usePresenter = (props: IProps, emit: IEmit) => {
  const model = useModel();
  const service = new Service(model);

  const handleChange = () => {
    emit("change", { value: props.name });
  };

  return {
    model,
    service,
    handleChange,
  };
};
