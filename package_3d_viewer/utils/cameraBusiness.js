import * as deviceOrientationControl from '../../third_party/DeviceOrientationControl.js';
var camera, scene, renderer;
var canvas;
var touchX, touchY, device = {};
var lon, lat, gradient;
var mainModel;
var isDeviceMotion = false;
var last_lon, last_lat, last_device = {};
var canvasWidth, canvasHeight;
var isMouseDown = false;
const mouseMoveSpeed = 0.6;

function initThree(canvasId,
    modelUrl,
    _canvasWidth,
    _canvasHeight) {
    canvasWidth = _canvasWidth;
    canvasHeight = _canvasHeight;

    var canvas_webgl = document.getElementById(canvasId);
    initScene(canvas_webgl);
    loadModel(modelUrl);

}

function initScene(canvas_webgl) {
    lon = -90;
    lat = 0;

    // init Perspective Camera
    camera = new THREE.PerspectiveCamera(75,
        canvasWidth / canvasWidth,
        1,
        1000);
    // according to camera position
    camera.position.set(0, 3, 6);

    scene = new THREE.Scene();
    // ambient light
    scene.add(new THREE.AmbientLight(0xffffff));
    // direction light
    var directionallight = new THREE.DirectionalLight(0xffffff, 1);
    directionallight.position.set(5, 10, 7.5);
    scene.add(directionallight);

    // init render
    renderer = new THREE.WebGLRenderer({
        canvas: canvas_webgl,
        antialias: true,
        alpha: true,
    });
    const devicePixelRatio = window.devicePixelRatio;
    console.log('device pixel ratio', devicePixelRatio);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);

    // gamma色彩空间校正，以适应人眼对亮度的感觉。
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2

    animate();

}

function loadModel(modelUrl) {
    var loader = new THREE.GLTFLoader();

    loader.load(modelUrl,
        function (gltf) {
            console.log('loadModel', 'success');
            var model = gltf.scene;
            // save model
            mainModel = model;
            scene.add(model);
        },
        null,
        function (error) {
            console.log('loadModel', error);
        });
}

function updateModel(modelUrl) {
    var loader = new THREE.GLTFLoader();

    loader.load(modelUrl,
        function (gltf) {
            console.log('loadModel', 'success');
            var model = gltf.scene;
            // remove old model
            scene.remove(mainModel);
            // save new model
            mainModel = model;
            // add new model
            scene.add(model);

        },
        null,
        function (error) {
            console.log('loadModel', error);

        });
}

function animate() {
    window.requestAnimationFrame(animate);

    // manual mode
    if (lon !== last_lon ||
        lat !== last_lat) {

        last_lon = lon;
        last_lat = lat;

        deviceOrientationControl.modelRotationControl(mainModel, lon, lat, gradient, THREE);

    }

    // auto mode
    if (last_device.alpha !== device.alpha ||
        last_device.beta !== device.beta ||
        last_device.gamma !== device.gamma) {
        // save
        last_device.alpha = device.alpha;
        last_device.beta = device.beta;
        last_device.gamma = device.gamma;

        if (isDeviceMotion) {
            deviceOrientationControl.deviceControl(camera, device, THREE);
        }
    }


    // render for Perspective Camera
    renderer.render(scene, camera);
}


function onTouchstart(event) {
    var touch = event.touches[0];
    if (!touch) {
        return;
    }
    touchX = touch.pageX;
    touchY = touch.pageY;
}

function onTouchmove(event) {
    var touch = event.touches[0];
    if (!touch) {
        return;
    }

    var moveX = touch.pageX - touchX;
    var moveY = touch.pageY - touchY;
    lon += moveX;
    lat += moveY;

    touchX = touch.pageX;
    touchY = touch.pageY;
    gradient = Math.abs(moveX / moveY);
}

function onMousedown(event) {
    if (event.button != 0) {
        return;
    }

    isMouseDown = true;

    var touch = event;
    if (!touch) {
        return;
    }
    touchX = touch.pageX;
    touchY = touch.pageY;
}

function onMousemove(event) {
    if (!isMouseDown) {
        return
    }

    var touch = event;
    if (!touch) {
        return;
    }

    var moveX = touch.pageX - touchX;
    var moveY = touch.pageY - touchY;
    lon += moveX * mouseMoveSpeed;
    lat += moveY * mouseMoveSpeed;
    touchX = touch.pageX;
    touchY = touch.pageY;
    gradient = Math.abs(moveX / moveY);
}

function onMouseup(event) {
    if (event.button != 0) {
        return;
    }

    isMouseDown = false;
}


function deviceorientation_callback(event) {
    device = event;
}

function startDeviceMotion() {
    if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
        // for iOS
        window.DeviceOrientationEvent.requestPermission()
            .then(function (state) {
                if (state == "granted") {
                    isDeviceMotion = true;
                    window.addEventListener("deviceorientation", deviceorientation_callback, true);
                } else {
                    console.log("startDeviceMotion", "request permission is not granted.")
                }
            });
    } else {
        isDeviceMotion = true;
        window.addEventListener("deviceorientation", deviceorientation_callback, true);
    }
}

function stopDeviceMotion() {
    isDeviceMotion = false;
    window.removeEventListener("deviceorientation", deviceorientation_callback);
}

window.addEventListener("resize", function () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
})


export {
    initThree,
    onTouchstart,
    onTouchmove,
    startDeviceMotion,
    stopDeviceMotion,
    updateModel,
    onMousedown,
    onMousemove,
    onMouseup,
}