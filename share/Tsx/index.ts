import React, { ReactElement, createElement } from 'react';
import * as ReactDOMServer from 'react-dom/server';

export const render = (el: ReactElement, props: any) => {
  const markup = ReactDOMServer.renderToStaticMarkup(el);
  return markup;
};
