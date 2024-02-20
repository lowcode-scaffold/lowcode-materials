"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchApiDetailInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: true,
});
https.globalAgent.options.rejectUnauthorized = false;
const fetchApiDetailInfo = (domain, id, token) => {
    const url = domain.endsWith('/')
        ? `${domain}api/interface/get?id=${id}&token=${token}`
        : `${domain}/api/interface/get?id=${id}&token=${token}`;
    return axios_1.default.get(url, { httpsAgent: agent });
};
exports.fetchApiDetailInfo = fetchApiDetailInfo;
