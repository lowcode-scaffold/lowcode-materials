"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const genCodeByYapi_1 = require("./genCode/genCodeByYapi");
async function bootstrap() {
    await (0, genCodeByYapi_1.genCodeByYapi)();
}
exports.bootstrap = bootstrap;
