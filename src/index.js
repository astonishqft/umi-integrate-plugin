import { writeFileSync } from 'fs-extra';

import { join } from 'path';

const writeFile = (text, outputPath) => {
  writeFileSync(outputPath, text, { encoding: 'utf8' })
}

const generateManifestCode = (manifest) => {
  return `
      (function (window, factory) {
          if (typeof exports === 'object') {
          
              module.exports = factory();
          } else if (typeof define === 'function' && define.amd) { // eslint-disable-line
          
              define(factory); // eslint-disable-line
          } else {
          
              window.assetManifest = factory(); // eslint-disable-line
          }
      })(this, function () {
          return [${manifest.map(item => `'${item}'`).join(',')}]
      });
      `
}

export default function (api, options) {
  const { integrateName, fileList = [] } = options;
  const { paths } = api;
  const { absOutputPath } = paths;

  api.addEntryCode(`
    window['${integrateName}'] = {};
    window['${integrateName}'].render = function(selector) {
      if (__IS_BROWSER) {
        Promise.all(moduleBeforeRendererPromises)
          .then(() => {
            render().then(result => { result(selector)});
          })
          .catch(err => {
            window.console && window.console.error(err);
          });
      }
    }
`);

  api.modifyEntryRender(() => {
    return `
      window.g_isBrowser = true;
      let props = {};
      // Both support SSR and CSR
      if (window.g_useSSR) {
        // 如果开启服务端渲染则客户端组件初始化 props 使用服务端注入的数据
        props = window.g_initialData;
      } else {
        const pathname = location.pathname;
        const activeRoute = findRoute(require('@@/router').routes, pathname);
        // 在客户端渲染前，执行 getInitialProps 方法
        // 拿到初始数据
        if (
          activeRoute &&
          activeRoute.component &&
          activeRoute.component.getInitialProps
        ) {
          const initialProps = plugins.apply('modifyInitialProps', {
            initialValue: {},
          });
          props = activeRoute.component.getInitialProps
            ? await activeRoute.component.getInitialProps({
              route: activeRoute,
              isServer: false,
              location,
              ...initialProps,
            })
            : {};
        }
      }

      const rootContainer = plugins.apply('rootContainer', {
        initialValue: React.createElement(require('./router').default, props),
      });

      return function(selector){
        ReactDOM.render(
          rootContainer,
          document.getElementById(selector),
        );
      }
    `
  });

  api.onBuildSuccess(() => {
    let outputFileList = [...fileList];
    const manifestText = generateManifestCode(outputFileList);
    writeFile(manifestText, join(absOutputPath, 'asset-manifest.js'));
  });
}
