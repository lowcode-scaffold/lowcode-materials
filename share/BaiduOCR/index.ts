import { request } from './request';

// #region 通用文字识别（标准版）
export interface IGeneralBasicResult {
  words_result: {
    words: string;
  }[];
  words_result_num: number;
  log_id: number;
}

export interface IGeneralBasicData {
  image: string;
  detect_direction?: boolean;
  paragraph?: boolean;
  probability?: boolean;
}
/**
 * 通用文字识别（标准版）
 * https://cloud.baidu.com/doc/OCR/s/zk3h7xz52
 */
export function generalBasic(data: IGeneralBasicData) {
  return request<IGeneralBasicResult>({
    url: `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic`,
    method: 'POST',
    data,
  });
}
// #endregion

// #region 通用文字识别（标准含位置版）
export interface IGeneralResult {
  words_result: {
    words: string;
    location: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }[];
  words_result_num: number;
  log_id: number;
}

export interface IGeneralData {
  image: string;
  detect_direction?: boolean;
  paragraph?: boolean;
  probability?: boolean;
}

/**
 * 通用文字识别（标准含位置版）
 * https://cloud.baidu.com/doc/OCR/s/vk3h7y58v
 */
export function general(data: IGeneralData) {
  return request<IGeneralResult>({
    url: `https://aip.baidubce.com/rest/2.0/ocr/v1/general`,
    method: 'POST',
    data,
  });
}

// #endregion

// #region 通用文字识别（高精度版）
export interface IAccurateBasicResult {
  words_result: {
    words: string;
  }[];
  words_result_num: number;
  log_id: number;
}

export interface IAccurateBasicData {
  image: string;
}

/**
 * 通用文字识别（高精度版）
 * https://cloud.baidu.com/doc/OCR/s/1k3h7y3db
 */
export function accurateBasic(data: IAccurateBasicData) {
  return request<IAccurateBasicResult>({
    url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic`,
    method: 'POST',
    data,
  });
}

// #endregion
// #region 通用文字识别（高精度含位置版）
export interface IAccurateResult {
  words_result: {
    words: string;
    location: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }[];
  words_result_num: number;
  log_id: number;
}

export interface IAccurateData {
  image: string;
}
/**
 * 通用文字识别（高精度含位置版）
 * https://cloud.baidu.com/doc/OCR/s/tk3h7y2aq
 */
export function accurate(data: IAccurateData) {
  return request<IAccurateResult>({
    url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate`,
    method: 'POST',
    data,
  });
}
// #endregion

// #region 办公文档识别
export interface IDocAnalysisOfficeResult {
  results: {
    words: {
      word: string;
      words_location: {
        left: number;
        height: number;
        width: number;
        top: number;
      };
    };
    words_type: string;
  }[];
  results_num: number;
  log_id: number;
}

export interface IDocAnalysisOfficeData {
  image: string;
}
/**
 * 办公文档识别
 * https://cloud.baidu.com/doc/OCR/s/ykg9c09ji
 */
export function docAnalysisOffice(data: IDocAnalysisOfficeData) {
  return request<IDocAnalysisOfficeResult>({
    url: `https://aip.baidubce.com/rest/2.0/ocr/v1/doc_analysis_office`,
    method: 'POST',
    data,
  });
}
// #endregion
