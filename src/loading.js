export default {
  instance: null,
  stack: 0,
  getInstance() {
    if (this.instance) return this.instance;
    let wrapper = document.querySelector('.pdf-loading')
    if (wrapper) return wrapper;
    wrapper = document.createElement('div')
    wrapper.className = 'pdf-loading'
    wrapper.style.cssText = 'width:100%;height:100%;position:fixed;top:0;left:0;z-index:9999;'
    let loader = document.createElement('div')
    loader.style.cssText = "position:absolute;left: 50%;top: 50%;transform:translate(-50%,-50%);background: rgba(0,0,0,.7);color: #fff;padding: 6px 10px;border-radius:4px;box-shadow:0 0 3px #eee;transition: .25s linear"
    loader.innerText = '数据加载中...'
    wrapper.appendChild(loader)
    document.body.appendChild(wrapper);
    return wrapper;
  },
  show() {
    this.stack ++;
    this.getInstance().style.display = 'block';
  },
  hide() {
    this.stack --;
    if (this.stack <= 0) this.getInstance().style.display = 'none'
  }
}