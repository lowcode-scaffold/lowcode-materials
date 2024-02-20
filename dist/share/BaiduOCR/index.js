"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docAnalysisOffice = exports.accurate = exports.accurateBasic = exports.general = exports.generalBasic = void 0;
const request_1 = require("./request");
/**
 * 通用文字识别（标准版）
 * https://cloud.baidu.com/doc/OCR/s/zk3h7xz52
 */
function generalBasic(data) {
    return (0, request_1.request)({
        url: `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic`,
        method: 'POST',
        data,
    });
}
exports.generalBasic = generalBasic;
/**
 * 通用文字识别（标准含位置版）
 * https://cloud.baidu.com/doc/OCR/s/vk3h7y58v
 */
function general(data) {
    return (0, request_1.request)({
        url: `https://aip.baidubce.com/rest/2.0/ocr/v1/general`,
        method: 'POST',
        data,
    });
}
exports.general = general;
/**
 * 通用文字识别（高精度版）
 * https://cloud.baidu.com/doc/OCR/s/1k3h7y3db
 */
function accurateBasic(data) {
    return (0, request_1.request)({
        url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic`,
        method: 'POST',
        data,
    });
}
exports.accurateBasic = accurateBasic;
/**
 * 通用文字识别（高精度含位置版）
 * https://cloud.baidu.com/doc/OCR/s/tk3h7y2aq
 */
function accurate(data) {
    return (0, request_1.request)({
        url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate`,
        method: 'POST',
        data,
    });
}
exports.accurate = accurate;
/**
 * 办公文档识别
 * https://cloud.baidu.com/doc/OCR/s/ykg9c09ji
 */
function docAnalysisOffice(data) {
    return (0, request_1.request)({
        url: `https://aip.baidubce.com/rest/2.0/ocr/v1/doc_analysis_office`,
        method: 'POST',
        data,
    });
}
exports.docAnalysisOffice = docAnalysisOffice;
// #endregion
