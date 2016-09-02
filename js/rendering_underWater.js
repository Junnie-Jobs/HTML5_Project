var JunnieJobs_Render_underWater = (function(window) {

    var container, stats;
    var camera, scene, renderer;
    var sphere;
    var boat;
    var controls;
    var keyboard = new THREEx.KeyboardState();
    var clock = new THREE.Clock();

    function init() {

        initialize();
        view_init();
        animate();

    }

    function view_init() {

        container_setting();
        camera_init();
        view_control_init();
        light_init();
        sky_init();
        load_boat();
    }

    function initialize() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            $("#container").html("");
        }
    }

    function camera_init() {
        // Create a target camera instance.
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 3000000);
        camera.position.set(2000, 750, 2000);
    }

    function light_init() {
        scene.add(new THREE.AmbientLight(0x444444));
        var light = new THREE.DirectionalLight(0xffffbb, 1);
        light.position.set(1, 1, -1);
        scene.add(light);
    }

    function sky_init() {

        // load skybox
        var cubeMap = new THREE.CubeTexture([]);
        cubeMap.format = THREE.RGBFormat;

        var loader = new THREE.ImageLoader();
        loader.load('../textures/underwater5.jpg', function(image) {

            var getSide = function(x, y) {

                var size = 1024;

                var canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;

                var context = canvas.getContext('2d');
                context.drawImage(image, -x * size, -y * size);

                return canvas;

            };

            cubeMap.images[0] = getSide(2, 1); // px
            cubeMap.images[1] = getSide(0, 1); // nx
            cubeMap.images[2] = getSide(1, 0); // py
            cubeMap.images[3] = getSide(1, 2); // ny
            cubeMap.images[4] = getSide(1, 1); // pz
            cubeMap.images[5] = getSide(3, 1); // nz
            cubeMap.needsUpdate = true;

        });

        var cubeShader = THREE.ShaderLib['cube'];
        cubeShader.uniforms['tCube'].value = cubeMap;

        var skyBoxMaterial = new THREE.ShaderMaterial({
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        var skyBox = new THREE.Mesh(
            new THREE.BoxGeometry(1000000, 1000000, 1000000),
            skyBoxMaterial
        );

        scene.add(skyBox);

        var geometry = new THREE.IcosahedronGeometry(400, 4);
        var material = new THREE.MeshPhongMaterial({
            vertexColors: THREE.FaceColors,
            shininess: 200,
            envMap: cubeMap
        });
    }

    function view_control_init() {
        //마우스 클릭으로 세계관을 보기 위한 시점 컨트롤
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.minDistance = 1000.0;
        controls.maxDistance = 5000.0;
        // controls.maxPolarAngle = Math.PI * 0.495;
        controls.maxPolarAngle = Math.PI;
        controls.target.set(0, 500, 0);
    }

    function load_boat() {
        var boat_loader = new THREE.OBJLoader();
        boat_loader.load('../model/boat.obj', function(object) {

            boat = object;
            boat.position.x = -60;
            boat.position.z = 300;
            boat.rotation.y = 180;
            boat.scale.x = 50;
            boat.scale.y = 50;
            boat.scale.z = 50;
            scene.add(object);
            //boat position -60 0 300
        })
    }

    function animate() {
        var velocity = 10;
        var delta = clock.getDelta();
        var rotateAngle = Math.PI / 4 * delta;
        requestAnimationFrame(animate);
        if (keyboard.pressed("up")) {
            boat.position.z += velocity * Math.cos(boat.rotation.y);
            boat.position.x += velocity * Math.sin(boat.rotation.y);
            // camera_follow_boat();
            collision_check();
        }

        if (keyboard.pressed("down")) {
            boat.position.z -= velocity * Math.cos(boat.rotation.y);
            boat.position.x -= velocity * Math.sin(boat.rotation.y);
            // camera_follow_boat();
            collision_check();
        }

        if (keyboard.pressed("left")) {
            boat.rotation.y += rotateAngle;
            collision_check();
        }

        if (keyboard.pressed("right")) {
            boat.rotation.y -= rotateAngle;
            collision_check();
        }

        if (keyboard.pressed("F")) {
            boat.position.y += 5;

        }

        if (keyboard.pressed("D")) {
            boat.position.y -= 5;
            // if (boat.position.y < -700) {
            //   window.location.href = ("../JunnieJobsBlog.html");
            // }
        }

        render();
    }

    function collision_check() {}

    function container_setting() {
        var container = document.createElement('div');
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();

    }

    function render() {

        var time = performance.now() * 0.001;
        controls.update();
        camera.lookAt(boat.position);
        renderer.render(scene, camera);
    }

    function camera_follow_boat() {
        var relativeCameraOffset = new THREE.Vector3(0, 7, -30);
        var cameraOffset = relativeCameraOffset.applyMatrix4(boat.matrixWorld);
        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
    }

    return {
        "init": init
    }

})(window);


$(function() {
  JunnieJobs_Render_underWater.init();
});
