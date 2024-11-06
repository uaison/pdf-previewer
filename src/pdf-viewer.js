/**
 * 使用pdf.js进行pdf预览
 * @param url 预览的pdf文件地址，支持url和base64
 * @param scalable 是否使用插件自带缩放，默认不使用，由页面提供缩放功能
 * @param workerSrc pdfjs执行worker静态路径
 * @param cMapUrl 字体库url，某些PDF存在字体缺失问题，额外配置此字段可修复
 * @returns {PdfViewer}
 * @returns {Pdf}
 * @constructor
 * @usage 引入插件：<script src="../js/commons/pdf-viewer.min.js"></script>
 *        预览：new pdfViewer({url: 'url', scalable: false, workerSrc, cMapUrl}).preview('.headSrc')
 *        启用插件自带缩放：new Pdf(data).preview('.headSrc').enableScale()
 */
import loading from './loading'
import PDFJS  from "pdfjs-dist";

/**
 *
 * @param url
 * @param scalable
 * @param workerSrc
 * @param cMapUrl
 * @returns {PdfViewer}
 * @constructor
 */
function PdfViewer({url, scalable, workerSrc, cMapUrl}) {
  const base64Pattern = /^data:application\/pdf;base64,/
  const urlPattern = /^(\w+:)?\/\//
  let isBase64 = base64Pattern.test(url)
  let isUrl = urlPattern.test(url)

  this.url = !(isUrl || isBase64) ? 'data:application/pdf;base64,' + url : url
  this.instance = null
  this.scalable = scalable || false
  this.cMapUrl = cMapUrl || false;
  PDFJS.GlobalWorkerOptions.workerSrc = workerSrc

  return this
}

// 获取pdf对象实例
Pdf.prototype.getInstance = async function(url) {
  if (this.instance) return this.instance
  this.instance = await PDFJS.getDocument(this.cMapUrl ? { url, cMapUrl: this.cMapUrl, cMapPacked: true } : url)
  return this.instance
}

/**
 * 预览pdf
 * @param target 预览pdf内容在页面中父级元素的选择器，支持类名、id等
 * @returns {Promise<Pdf>}
 */
Pdf.prototype.preview = async function preview(target) {
  loading.show();
  let pdf = await this.getInstance(this.url)
  let num = pdf.numPages;
  for (let i = 1; i <= num; i++) {
    let canvas = document.createElement("canvas")
    canvas.className = 'pdf-page-canvas'
    canvas.style.cssText = 'width: 100%;margin-bottom: 10px;'
    document.querySelector(target).appendChild(canvas)
    let page = await pdf.getPage(i)
    this.render(page, canvas)
  }
  loading.hide();
  if (this.scalable) this.enableScale()

  return this
}

/**
 * 按页面渲染pdf内容
 * @param page 要渲染的页面page对象
 * @param canvas 渲染容器canvas
 * @returns {Pdf}
 */
Pdf.prototype.render = function render(page, canvas) {
  let viewport = page.getViewport(1);
  let screenWith = document.documentElement.scrollWidth || document.body.scrollWidth
  let scale = Math.ceil(screenWith * window.devicePixelRatio / viewport.width)
  let scaledViewport = page.getViewport(scale)
  let context = canvas.getContext('2d')
  canvas.height = scaledViewport.height
  canvas.width = scaledViewport.width

  let renderContext = {
    canvasContext: context,
    viewport: scaledViewport
  }

  page.render(renderContext)

  return this
}

/**
 * 启用插件自带缩放
 */
Pdf.prototype.enableScale = function scaleEventHandler() {
  let container = document.body;
  let store = {
    scale: 1
  };
  // 缩放事件的处理
  container.addEventListener('touchstart', function(event) {
    let touches = event.touches
    if (touches.length === 1) return
    let events = touches[0]
    let events2 = touches[1]

    event.preventDefault()

    // 第一个触摸点的坐标
    store.pageX = events.pageX
    store.pageY = events.pageY

    store.moveable = true

    if (events2) {
      store.pageX2 = events2.pageX
      store.pageY2 = events2.pageY
    }

    store.originScale = store.scale || 1
  })
  document.addEventListener('touchmove', function(event) {
    if (!store.moveable) {
      return;
    }

    event.preventDefault()

    let touches = event.touches
    let events = touches[0]
    let events2 = touches[1]
    // 双指移动
    if (events2) {
      // 第2个指头坐标在touchmove时候获取
      if (!store.pageX2) {
        store.pageX2 = events2.pageX
      }
      if (!store.pageY2) {
        store.pageY2 = events2.pageY
      }

      // 获取坐标之间的举例
      let getDistance = function(start, stop) {
        return Math.hypot(stop.x - start.x, stop.y - start.y);
      };
      // 双指缩放比例计算
      let zoom = getDistance({
          x: events.pageX,
          y: events.pageY
        }, {
          x: events2.pageX,
          y: events2.pageY
        }) /
        getDistance({
          x: store.pageX,
          y: store.pageY
        }, {
          x: store.pageX2,
          y: store.pageY2
        });
      // 应用在元素上的缩放比例
      let newScale = store.originScale * zoom
      // 最大缩放比例限制
      if (newScale > 3) newScale = 3
      if (newScale < 1) newScale = 1
      // 记住使用的缩放值
      store.scale = newScale

      let scaleOrigin = {
        x: (events.pageX + events2.pageX) / 2,
        y: (events.pageY + events2.pageY) / 2,
      }
      // 图像应用缩放效果
      container.style.transformOrigin = `${scaleOrigin.x}px ${scaleOrigin.y}px`
      container.style.transform = 'scale(' + newScale + ')'
    }
  })

  document.addEventListener('touchend', function() {
    store.moveable = false

    delete store.pageX2
    delete store.pageY2
  });
  document.addEventListener('touchcancel', function() {
    store.moveable = false

    delete store.pageX2
    delete store.pageY2
  });
}

export default PdfViewer
