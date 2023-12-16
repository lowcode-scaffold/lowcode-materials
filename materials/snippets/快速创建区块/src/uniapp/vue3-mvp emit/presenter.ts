import Service from "./service";
import { useModel } from "./model";

interface IEmit {
  (e: "change", data?: { value: string }): void;
}

export const usePresenter = (emit: IEmit) => {
  const model = useModel();
  const service = new Service(model);

  const handleChange = (value: string) => {
    emit("change", { value });
  };

  return {
    model,
    service,
    handleChange,
  };
};
