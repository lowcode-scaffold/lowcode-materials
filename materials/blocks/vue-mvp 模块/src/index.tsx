import { defineComponent } from "vue";
import { usePresenter } from "./presenter";

const Page = defineComponent({
  setup() {
    const presenter = usePresenter();
    const { model } = presenter;

    return { model, presenter };
  },
  render() {
    return <div>vue mvp</div>;
  },
});
export default Page;
