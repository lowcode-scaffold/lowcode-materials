"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePresenter = void 0;
const service_1 = __importDefault(require("./service"));
const model_1 = require("./model");
const usePresenter = (props, emit) => {
    const model = (0, model_1.useModel)();
    const service = new service_1.default(model);
    const handleChange = () => {
        emit("change", { value: props.name });
    };
    return {
        model,
        service,
        handleChange,
    };
};
exports.usePresenter = usePresenter;
