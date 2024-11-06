#使用1
```
npm install pdf-viewer
```
```html
<div class="preview"></div>
```
```javascript
import pdfViewer from 'pdf-viewer';

const pdf = new pdfViewer({
  url:'https://501351981.github.io/vue-office/examples/dist/static/test-files/test.pdf',
  workerSrc: '/pdf-viewer/lib/pdfjs-dist/pdf.worker.min.js',
  cMapUrl: '/pdf-viewer/lib/pdfjs-dist/cmaps/'
})
pdf.preview('.preview')
```

#使用2
```html
<script src="../lib/pdf-viewer.min.js"></script>
<div class="preview"></div>

<script>
  const pdf = new pdfViewer({
    url:'https://501351981.github.io/vue-office/examples/dist/static/test-files/test.pdf',
    workerSrc: '/pdf-viewer/lib/pdfjs-dist/pdf.worker.min.js',
    cMapUrl: '/pdf-viewer/lib/pdfjs-dist/cmaps/'
  })
  pdf.preview('.preview')
</script>
```