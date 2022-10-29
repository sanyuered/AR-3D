import * as photoBusiness from '../utils/photoBusiness.js?v4'
// canvas id
const canvasId = 'canvasWebGL';
// A panorama image url
const imageUrl = '../../assets/sample.jpg';

var app = new Vue({
  el: '#app',
  data: {
    // if device motion
    isDeviceMotion: false,
    notice: '',
    toggleDeviceMotion_text: 'Start Device Motion',
  },
  methods: {
    toggleDeviceMotion() {
      if (this.isDeviceMotion) {
        this.stopDeviceMotion();
      } else {
        this.startDeviceMotion();
      }
    },
    startDeviceMotion() {
      photoBusiness.startDeviceMotion();
      this.toggleDeviceMotion_text = "Stop Device Motion";
      this.isDeviceMotion = true;
    },
    stopDeviceMotion() {
      photoBusiness.stopDeviceMotion();
      this.toggleDeviceMotion_text = "Start Device Motion";
      this.isDeviceMotion = false;
    },
    load() {
      var _that = this;
      // init three scene
      photoBusiness.initThree(canvasId,
        imageUrl,
        window.innerWidth,
        window.innerHeight);

      // touch event
      var canvasWebGL = document.getElementById(canvasId);
      canvasWebGL.addEventListener("touchstart", function (event) {
        // if touch start, stop Device Motion.
        _that.stopDeviceMotion();
        photoBusiness.onTouchstart(event);
      })
      canvasWebGL.addEventListener("touchmove", function (event) {
        photoBusiness.onTouchmove(event);
      })

      // mouse event
      canvasWebGL.addEventListener("mousedown", function (event) {
        // if mouse down, stop Device Motion.
        _that.stopDeviceMotion();
        photoBusiness.onMousedown(event);
      })
      canvasWebGL.addEventListener("mousemove", function (event) {
        photoBusiness.onMousemove(event);
      })
      canvasWebGL.addEventListener("mouseup", function (event) {
        photoBusiness.onMouseup(event);
      })
    },
  },
  mounted: function () {
    this.load();
  },
});

document.getElementById("uploaderInput").addEventListener("change", function (e) {
  var files = e.target.files;
  if (files.length == 0) {
    return
  }
  var url = window.URL || window.webkitURL;
  var src;
  if (url) {
    src = url.createObjectURL(files[0]);
  }
  
  photoBusiness.updatePanorama(src,-90);
});

