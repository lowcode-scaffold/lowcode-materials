"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.error = exports.success = void 0;
function success(data) {
    return { success: true, data };
}
exports.success = success;
function error(message) {
    return { success: false, message };
}
exports.error = error;
function getData(result) {
    if (result.success) {
        return result.data;
    }
    throw new Error(result.message);
}
exports.getData = getData;
