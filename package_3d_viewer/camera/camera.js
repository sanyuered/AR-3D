import * as cameraBusiness from '../utils/cameraBusiness.js'
const canvasId = 'canvasWebGL';
// a gltf model url
const modelUrl = '../../assets/robot.glb';
const canvasWidth = 375;
const canvasHeight = 375;

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
      cameraBusiness.startDeviceMotion();
      this.toggleDeviceMotion_text = "Stop Device Motion";
      this.isDeviceMotion = true;
    },
    stopDeviceMotion() {
      cameraBusiness.stopDeviceMotion();
      this.toggleDeviceMotion_text = "Start Device Motion";
      this.isDeviceMotion = false;
    },
    async takePhoto() {
      if (!navigator.mediaDevices) {
        var msg = 'not support of navigator.mediaDevices';
        this.notice = msg;
        console.log('takePhoto', msg);
        return
      }

      if (this.isButtonDisabled) {
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: canvasWidth,
          height: canvasHeight,
          facingMode:'environment',
        }
      });
      var inputData = document.getElementById("inputData");
      inputData.srcObject = stream;
    },
    load() {
      var _that = this;
      // init three scene
      cameraBusiness.initThree(canvasId,
        modelUrl,
        canvasWidth,
        canvasHeight);

      // touch event
      var canvasWebGL = document.getElementById(canvasId);
      canvasWebGL.addEventListener("touchstart", function (event) {
        // if touch start, stop Device Motion.
        _that.stopDeviceMotion();
        cameraBusiness.onTouchstart(event);
      })
      canvasWebGL.addEventListener("touchmove", function (event) {
        cameraBusiness.onTouchmove(event);
      })
      canvasWebGL.addEventListener("mousedown", function (event) {
        // if mouse down, stop Device Motion.
        _that.stopDeviceMotion();
        cameraBusiness.onMousedown(event);
      })
      canvasWebGL.addEventListener("mousemove", function (event) {
        cameraBusiness.onMousemove(event);
      })
      canvasWebGL.addEventListener("mouseup", function (event) {
        cameraBusiness.onMouseup(event);
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

  cameraBusiness.updateModel(src);
});