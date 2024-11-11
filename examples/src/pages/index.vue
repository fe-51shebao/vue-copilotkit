<template>
<div class="card">
  <input type="radio" name="select" id="slide_1" checked>
  <input type="radio" name="select" id="slide_2">
  <input type="radio" name="select" id="slide_3">
  <input type="checkbox" id="slideImg">

  <div class="slider">
    <label for="slide_1" class="slide slide_1"></label>
    <label for="slide_2" class="slide slide_2"></label>
    <label for="slide_3" class="slide slide_3"></label>
  </div>

  <div class="inner_part">
    <label for="slideImg" class="img">
      <img class="img_1" src="https://github.com/fe-51shebao/.github/raw/main/demo3-ok.gif">
    </label>
    <div class="content content_1">
      <div class="title">待办演示</div>
      <div class="text">
        谈笑之间，待办灰飞烟灭
      </div>
      <button><a href="./todolist"> 去体验 </a></button>
    </div>
  </div>

  <div class="inner_part">
    <label for="slideImg" class="img">
      <img class="img_2" src="https://github.com/fe-51shebao/.github/raw/main/demo-form.gif">
    </label>
    <div class="content content_2">
      <div class="title">表单自动填写演示</div>
      <div class="text">
        表单太长，人太忙，拷贝粘贴之间，AI帮你搞定！
      </div>
      <button><a href="./form"> 去体验 </a></button>
    </div>
  </div>

  <div class="inner_part">
    <label for="slideImg" class="img">
      <img class="img_3" src="https://github.com/fe-51shebao/.github/raw/main/demo1-ok.gif">
    </label>
    <div class="content content_3">
      <div class="title">email自动回复</div>
      <div class="text">
        比较内敛，担心辞不达意，又或时间紧迫，任务繁多，你只需输入几个词，指出方向，AI帮你回复。
      </div>
      <button><a href="./textarea"> 去体验 </a></button>
    </div>
  </div>
  <div class="inner_part">
    <label for="slideImg" class="img">
      <img class="img_3" src="https://github.com/fe-51shebao/.github/raw/main/demo4.gif">
    </label>
    <div class="content content_3">
      <div class="title">操作表格</div>
      <div class="text">
        常见的表格操作，看看接入ai会有什么不同？
      </div>
      <button><a href="./table"> 去体验 </a></button>
    </div>
  </div>

</div>
</template>

<script setup lang="ts">
import {
  useCopilotReadable,
  useCopilotAction,
  useCopilotChat,
} from "@copilotkit/vue-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";


</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100vh;
  font-family: 'Open Sans', sans-serif;
  background-color: #666666;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  display: block;
  position: relative;
  height: 350px;
  width: 850px;
  max-width: 850px;
  margin: auto;
  background-color: #ffffff;
  border-radius: 25px;
  box-shadow: 10px 0 50px rgba(0, 0, 0, 0.5);
}

.card .inner_part {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 0 30px;
  height: 350px;
  position: absolute;
}

#slideImg:checked ~ .inner_part {
  padding: 0;
  transition: .1s ease-in;
}

.inner_part .img {
  height: 260px;
  width: 346px;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.2);
}

#slideImg:checked ~ .inner_part .img {
 height: 350px;
 width: 850px;
 z-index: 99;
 transition: .3s .2s ease-in;
}

.img img {
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
  transition: .6s;
}

#slide_1:checked ~ .inner_part .img_1,
#slide_2:checked ~ .inner_part .img_2,
#slide_3:checked ~ .inner_part .img_3 {
  opacity: 1;
  transition-delay: .2s;
}

.content {
  padding: 0 20px 0 35px;
  width: 440px;
  margin-left: 50px;
  opacity: 0;
  transition: .6s; 
}

#slideImg:checked ~ .inner_part .content {
  display: none;
}

#slide_1:checked ~ .inner_part .content_1,
#slide_2:checked ~ .inner_part .content_2,
#slide_3:checked ~ .inner_part .content_3 {
  opacity: 1;
  margin-left: 0;
  z-index: 100;
  transition-delay: .3s;
}

.content .title {
  font-size: 30px;
  font-weight: 700;
  color: #0d0925;
  margin: 0 0 20px 0;
}

.content .text {
  font-size: 19px;
  color: #4e4a67;
  margin: 0 auto 30px auto;
  line-height: 1.5em;
  text-align: justify;
}

.content button {
  padding: 15px 20px;
  border: none;
  font-size: 16px;
  color: #fff0e6;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 50px;
  cursor: pointer;
  outline: none;
  background: #000000;
  float: right;
}

.content button:hover {
  background: #cecece;
  color: #000000;
}

.slider {
  position: absolute;
  bottom: 25px;
  left: 60%;
  transform: translateX(-50%);
  z-index: 1;
}

#slideImg:checked ~ .slider {
  display: none;
}

.slider .slide {
  position: relative;
  height: 10px;
  width: 50px;
  background: #d9d9d9;
  border-radius: 5px;
  display: inline-flex;
  margin: 0 3px;
  cursor: pointer;
}


.slider .slide:before {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  height: 100%;
  width: -100%;
  background: #000000;;
  border-radius: 10px;
  transform: scaleX(0);
  transition: transform .6s;
  transform-origin: left;
}

#slide_1:checked ~ .slider .slide_1:before,
#slide_2:checked ~ .slider .slide_2:before,
#slide_3:checked ~ .slider .slide_3:before {
  transform: scaleX(1);
  width: 100%;
}

input {
  display: none;
}
</style>
