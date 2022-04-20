
// import 是 ES mode 的引入语法
// import './main.css';
// import './test.js';


// require() 是 CommonJS 的引入模块语法
// 使用 ~ | @ 使用别名 
require('~/main.css')
require('@/test')
require('@/main.scss')
// require('./main.less')
// import logo from './58903178.png'
const logo = require('~/58903178.png')


const img = new Image()
img.src = logo

document.getElementById('imgBox').appendChild(img)


class Author {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  info = () => {
    return {
      name: this.name,
      age: this.age
    }
  }
}


const yellowsea = new Author('yellowsea', 123)
console.log(yellowsea.info())


module.exports = Author