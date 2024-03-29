import * as deviceOrientationControl from '../../third_party/DeviceOrientationControl.js';
var camera, scene, renderer;
var touchX, touchY, device = {};
var lon, lat, gradient;
var mainModel;
var isDeviceMotion = false;
var last_lon, last_lat, last_device = {};
var canvasWidth, canvasHeight;
var isMouseDown = false;
const mouseMoveSpeed = 0.3;
var touchStart = { a: null, b: null }
var touchMove = { a: null, b: null }
var timeoutId

function initThree(canvasId,
    imageUrl,
    _canvasWidth,
    _canvasHeight) {
    canvasWidth = _canvasWidth;
    canvasHeight = _canvasHeight;

    var canvas_webgl = document.getElementById(canvasId);
    initScene(canvas_webgl);
    loadPanorama(imageUrl);
}

function initScene(canvas_webgl) {
    lon = -90;
    lat = 0;

    // init Perspective Camera
    camera = new THREE.PerspectiveCamera(75,
        canvasWidth / canvasHeight,
        1,
        1000);
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));
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
    
    animate();

}

function loadPanorama(imageUrl) {
    // sphere geometry
    var geometry = new THREE.SphereGeometry(500, 64, 32);
    // back side
    geometry.scale(-1, 1, 1);
    var texture1 = new THREE.TextureLoader().load(imageUrl);
    var material1 = new THREE.MeshBasicMaterial({ map: texture1 });
    var model = new THREE.Mesh(geometry, material1);
    // the rotation of the model 
    model.rotation.set(0, THREE.Math.degToRad(-90), 0);
    // add the object to the scene
    mainModel = model;
    scene.add(model);

}

function updatePanorama(imageUrl, deg) {
    var texture1 = new THREE.TextureLoader().load(imageUrl);
    mainModel.material.map = texture1;
    // the rotation Y of the model 
    mainModel.rotation.set(0, THREE.Math.degToRad(deg), 0);

    camera.fov = 75;
    camera.updateProjectionMatrix();
}

function animate() {
    window.requestAnimationFrame(animate);

    // manual mode
    if (lon !== last_lon ||
        lat !== last_lat) {
        // save
        last_lon = lon;
        last_lat = lat;

        deviceOrientationControl.camaraRotationControl(camera, lon, lat, THREE);

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

    renderer.render(scene, camera);
}

function onTouchstart(event) {
    if (event.touches.length === 2) {
        touchStart.a = event.touches[0]
        touchStart.b = event.touches[1]

    } else {
        var touch = event.touches[0];
        if (!touch) {
            return;
        }
        touchX = touch.pageX;
        touchY = touch.pageY;
    }
}

function calcDistance() {
    var x2 = touchMove.b.pageX - touchMove.a.pageX
    var y2 = touchMove.b.pageY - touchMove.a.pageY

    var x1 = touchStart.b.pageX - touchStart.a.pageX
    var y1 = touchStart.b.pageY - touchStart.a.pageY

    var scale = (x2 * x2 + y2 * y2) / (x1 * x1 + y1 * y1)
    var deltaY = 0

    if (scale > 1) {
        deltaY = -125
    }
    else if (scale < 1) {
        deltaY = 125
    }

    if (deltaY) {
        const fov = camera.fov + deltaY * 0.05;
        camera.fov = THREE.MathUtils.clamp(fov, 40, 100);
        camera.updateProjectionMatrix();
    }
}

function onTouchmove(event) {
    if (event.touches.length === 2) {
        touchMove.a = event.touches[0]
        touchMove.b = event.touches[1]

        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(function () {
            calcDistance()
        }, 150)

    } else {
        var touch = event.touches[0];
        if (!touch) {
            return;
        }

        // var moveX = touch.pageX - touchX;
        var moveX = touchX - touch.pageX;
        var moveY = touch.pageY - touchY;
        lon += moveX;
        lat += moveY;

        touchX = touch.pageX;
        touchY = touch.pageY;
        gradient = Math.abs(moveX / moveY);
    }
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

    // var moveX = touch.pageX - touchX;
    var moveX = touchX - touch.pageX;
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

document.addEventListener('wheel', function (event) {
    if (!camera) {
        return
    }

    const fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.MathUtils.clamp(fov, 40, 100);
    camera.updateProjectionMatrix();
})


export {
    initThree,
    onTouchstart,
    onTouchmove,
    startDeviceMotion,
    stopDeviceMotion,
    updatePanorama,
    onMousedown,
    onMousemove,
    onMouseup,
}