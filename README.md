## umi-integrate-plugin 插件的使用

  `umi` 工程集成进主工程需要 `umi-integrate-plugin` 插件的配合。

- 在需要集成进主工程的 `umi` 工程中安装 `umi-integrate-plugin` 
  
  ```shell
  $ yarn add umi-integrate-plugin
  ```

- 修改 umi 工程的 .umirc 配置文件

 1. 开启缓存路由功能
    ```js
    export default {
      history: 'memory',
    }
    ```
  开启缓存路由的目的是为了防止子工程集成进主工程之后，子工程路由的切换会影响主工程的路由。

  1. 配置插件
      ```js
      export default {
        plugins: [
          ['umi-integrate-plugin', {
            integrateName: 'gcc',
            fileList: [
              '/umi.js',
              '/umi.css',
            ]
          }]
        ],
      }
      ```

     插件需要传入两个参数，`integrateName` 和 `fileList`:
     -  `integrateName`:
     
         用来指定挂载到 `window` 对象上的对象，这个对象上面会提供一个 `render` 方法，传入指定的 `id选择器`，就可以调用该方法在指定的id容器内渲染出umi的内容。`uportal` 打开新标签的时候正是通过 `window[integrateNmae].render(selector)` 的方式来渲染 `umi` 工程的。

         **注意：**这里指定的 `integrateName` 需要和uportal配置的菜单url后面跟着的参数名保持一致。

     - `fileList`:

        需要加载的 `umi` 编译后的 `js` 和 `css` 资源文件路径。`umi` 执行完 `$ npm run build` 之后会生成编译后的 `js` 和 `css` 资源，集成的时候这些资源是必须要加载到 `uportal` 中的，因为这里还涉及到一些第三方的 `js` 和 `css` 资源，所以这里提供了一个列表，传入你需要加载资源文件地址，可以根据 `dist` 目录下的 `index.html` 文件中引入的资源来确定该列表中的参数。需要注意的是，`js` 资源的加载是有顺序的，所以根据需要来设置列表的顺序，`umi.js` 文件需要最后加载。
        
        配置好 `fileList` 之后，每次编译之后会在 `dist` 目录中生成一个 `asset-manifest.js` 文件，其中会包含fileList指定的资源地址，提供给主工程加载时使用。

  ## 集成多个umi工程

  如果想要同时集成多个 `umi` 工程进主工程，需要注意以下几点：

  - 编译的时候注意每个 `umi` 子工程的插件配置中的 `integrateName` 一定不要重复了，否则集成之后会出问题。

  - 编译的时候注意每个 `umi` 子工程的 `package.json` 文件的 `name` 字段最好不要重复

  - 多个子工程集成进主工程会共享同一个 `dav` 的 `store`， 因此一定要确保 `umi` 子工程中 `module` 的 `namespace` 不一致，否则会出现多个 `umi` 子工程数据互相影响的问题，可以使用 `your project name + namespace` 进行区分。

## 如何进行测试

以上配置配置完毕后，大家可以进入 `dist` 目录下通过 `http-server` 启动一个静态服务，然后打开浏览器，在地址栏输入静态服务地址，在控制台中输入 `window.[integrateName插件中定义].render('root')`，就可以看到你的umi工程被渲染到 `id` 为 `root` 的节点中了。
