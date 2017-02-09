### 安装执行环境

1. **安装 [node](https://nodejs.org/en/)** 
3. **安装npm包 （npm install）** (如果用cnpm, 请使用 cnpm@2 版本)
4. **前端框架:** 

  - [React](http://reactjs.cn/react/tips/communicate-between-components.html) 数据驱动渲染view
  - [ReactRouter](https://github.com/reactjs/react-router/tree/master/docs) 定义路由，动态加载路由所需文件
  - View/Command/Store 简化数据流实现
  - [webpack](http://webpack.github.io/) 项目构建工具
  - [Schema & Immutable Schema](https://gitlab.saay.com/eim_webfront/webfront/blob/master/Schema.md) 数据格式定义


### 编译前端代码并启动测试服务器

    >> npm run build-dev


### 前端架构

    |--- eim/client
       |--- app/ 业务代码
           |--- components/    <s>业务组件类</s> 公用组件类（不含业务代码, 不可引用core/,views/下代码）
               |--- exposeLocale.js  导出本地化设置
           |--- utils/ 工具类（不含业务代码, 不可引用core/,views/下代码）
           |--- core/  业务特定逻辑代码
               |--- commands/  业务操作 (唯一的修改store的方式)。对应的进行中状态由 exposePendingCmds 获取
               |--- stores/  业务数据层
               |--- schemas/  业务数据层json数据格式定义
               |--- components/ 业务特定的公用组件类
                   |--- exposePendingCmds.js  导出commands进行中状态
               |--- constants/ 业务常量定义
               |--- httpdatahandler/  http请求类
               |--- enums/ 业务特定枚举值定义
               |--- ReactPropTypes.js  自定义的PropTypes校验 (.ofSchema, .ofEnum, .rootLocale, .pendingCmds)
           |--- views/ 业务视图层 (彼此独立的完整业务功能/界面)
       |--- less/  通用样式文件 (按组件化开发, 组件/视图特定的样式文件置于其相同目录)
           |--- common/ 全局样式定义
           |--- _variables.less 全局变量定义 (不产生css样式)
           |--- _mixins.less 全局mixin方法定义 (不产生css样式)
       |--- static/      静态资源 图片，icon
       |--- vendor/      三方库文件
           |--- modules/  导出模块的三方库
           |--- standalone/  全局引用的三方库
           |--- locale/  本地化 (待移动)
       |--- webpack-build.js  Webpack 编辑配置文件


### framework desgin
- 数据流: view -> command -> store -> view
- 本地化和TimeZone LocaleConfig.根据浏览器对象获取系统当前地区语言，包括时区。动态加载相关的配置文件。TimeZone基于moment封装便利的接口实现。
- 本地缓存设计 PoolMixin 扩展对LocalStorage接口单一的缺陷， 实现namespace。
- 不同组件基于事件的传递机制 EventBus 。实现事件pub/sub
- GlobalEventbus 负责非相关组件间消息通信。组件包括UI和非UI组件。如非必要不建议使用, 降低代码可读性。
- locale固定字段:
    - COMPONENTS: 用于定义app/components/公用组件的本地化。非业务特定的公用组件只能访问这一个字段的本地化

### 代码规范
- 数据合法性保证: 任何store中的json数据格式均通过schema定义/校验/转换，任何相关组件必须定义propTypes验证schema数据 (ReactPropTypes.ofSchema(...))
- View层数据获取设计为 XXXComposer -> XXXView, Composer负责侦听stores更新并获取stores数据。保证仅有一个地方处理store的数据获取, 不得随意从store中读数据
- Command是唯一修改store的方式, View不得修改store
- 引用三方库时, 按需引用。
    - lodash: `import assign from 'lodash/assign';`
    - react-bootstrap: `import Popover from 'react-bootstrap/lib/Popover';`
- 组件继承 PureRenderComponent 提升性能 (注意PureRender特性: 仅当props或state浅层引用值发生变化时, 才会触发更新。所以需要immutablejs)
- 所有使用的props属性均通过组件propTypes定义校验
- css
    - 采用rem单位动态布局 (实际中使用@rex变量, 同px单位1:1), 边框/1px值可不采用
    - 组件代码与css样式放在一起, 样式直接由组件自身管理依赖

### css
- [less语法](http://lesscss.org/)
- [dpi](http://www.css88.com/book/css/values/resolution/dpi.htm) 解释


### socket通信


### React 和 AngularJS,Backbone 主要区别
- AngularJS/Backbone 没有摆脱直接操作DOM元素
- AngularJS/Backbone 组件没有生命周期特性，资源回收是问题。例如：某个区域使用了 IScroller，而用户的任何操作都可能造成该区域dom消失，没有办法回收 scroller 占用的资源，造成绑定的事件无法移除。
- Flux 单向数据流，不用维护组件和组件之间的关系，全部是由数据驱动，最典型的案例就是：twitter中，发送一条twitter之后，twitter总数不会变化，原因就是twitter中太多的组件之间关系难以维系

### React 编写规范
- 尽可能合并 setState 调用, 多次调用会导致不必要的重绘



### 文档参考

- [less语法](http://lesscss.org/)
- [ES6语法](http://es6.ruanyifeng.com/)
— [react-router](https://github.com/reactjs/react-router/tree/master/docs)
- [react-bootstrap](https://react-bootstrap.github.io/components.html)
- [lodash](https://lodash.com/docs)
