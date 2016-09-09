var JunnieJobs_Render = (function(window) {

    var container, stats;
    var camera, scene, renderer;
    var boat;
    var island_A, island_B;
    var parameters = {
        width: 2000,
        height: 2000,
        widthSegments: 250,
        heightSegments: 250,
        depth: 2000,
        param: 4,
        filterparam: 1
    };
    var water, waterNormals;
    var controls;
    var light;
    var collidableMeshList = [];
    var clock = new THREE.Clock();
    var window_size = $(window).height();
    var day_image_path = '../textures/skyboxsun25degtest.png';
    var sunrise_image_path = '../textures/sunrise.jpg';
    var sunset_image_path = '../textures/sunset.jpg';
    var night_image_path = '../textures/night.jpg';
    var keyboard = new THREEx.KeyboardState();
    var whale;

    function init() {
        initialize();
        view_init();
        animate();
    }

    function initialize() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            $("#container").html("");
        }
    }

    function view_init() {
        container_setting();
        camera_init();
        view_control_init();
        light_init();
        sky_init();
        ocean_init();
        load_boat();
        rain_init();
    }

    var Loader = new THREE.LoadingManager();
    var imageLoader = new THREE.ImageLoader(Loader);
    var rainGeometry;
    var rain;

    function rain_init() {

        var size = 128;
        var rainTexture = new THREE.Texture();
        rainTexture.generateMipmaps = false;
        rainTexture.magFilter = THREE.LinearFilter;
        rainTexture.minFilter = THREE.LinearFilter;
        imageLoader.load('img/water-drop.png', function(image) {
            rainTexture.image = image;
            rainTexture.needsUpdate = true;
        });

        var rainShader = THREE.ShaderLib['rain'];

        var rainMaterial = new THREE.ShaderMaterial({
            fragmentShader: rainShader.fragmentShader,
            vertexShader: rainShader.vertexShader,
            uniforms: rainShader.uniforms,
            transparent: true,
            depthWrite: false
        });
        rainMaterial.uniforms.texture.value = rainTexture;

        rainGeometry = new THREE.Geometry();
        for (var i = 0; i < 100; i++) {
            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2.0 * size - size;
            vertex.y = Math.random() * 2.0 * size - size;
            vertex.z = Math.random() * size - size * 0.5;
        }
        rain = new THREE.PointCloud(rainGeometry, rainMaterial);
        camera.add(rain);
        rain.position.setZ(-size * 0.75);
    }

    function camera_init() {
        // Create a target camera instance.
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 3000000),
            // camera = new THREE.TargetCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000  ),
            scene.add(camera);
        camera.position.set(1500, 500, 1500); //boat (-60, 300 180)
        //1540, 500 1500
    }

    function light_init() {
        //빛 추가
        scene.add(new THREE.AmbientLight(0x444444));
        light = new THREE.DirectionalLight(0xffffbb, 1);
        // light.position.set( - 1, 1, - 1 );
        light.position.set(-1, 1, -1);
        scene.add(light);
    }

    //background init
    function sky_init() {

        var cubeMap = new THREE.CubeTexture([]);
        cubeMap.format = THREE.RGBFormat;

        var loader = new THREE.ImageLoader();
        loader.load('../textures/skyboxsun25degtest.png', function(image) {

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
            shininess: 500,
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

    function ocean_init() {
        //바다질감 추가
        waterNormals = new THREE.TextureLoader().load('../textures/waternormals.jpg');
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

        water = new THREE.Water(renderer, camera, scene, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x071440,
            distortionScale: 5.0,
        });

        //질감입히기
        mirrorMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(parameters.width * 500, parameters.height * 500),
            water.material
        );

        mirrorMesh.add(water);
        mirrorMesh.rotation.x = -Math.PI * 0.5;
        scene.add(mirrorMesh);
    }

    function container_setting() {
        var container = document.createElement('div');
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        THREEx.WindowResize(renderer, camera);
        THREEx.FullScreen.bindKey({
            charCode: 'm'.charCodeAt(0)
        });

        scene = new THREE.Scene();
    }

    function load_boat() {
        var boat_loader = new THREE.OBJLoader();
        boat_loader.load('../model/boat.obj', function(object) {

            // var texture = new THREE.Texture();
            boat = object;
            boat.position.x = -60;
            boat.position.y = 0;
            boat.position.z = 300;

            boat.rotation.y = 180;

            boat.scale.x = 50;
            boat.scale.y = 50;
            boat.scale.z = 50;
            scene.add(boat);
        })
    }

    function camera_follow_boat() {
        var relativeCameraOffset = new THREE.Vector3(0, 7, -30);
        var cameraOffset = relativeCameraOffset.applyMatrix4(boat.matrixWorld);
        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
    }

    function animate() {


        var velocity = 10; //volocity
        var delta = clock.getDelta(); // seconds.
        var rotateAngle = Math.PI / 4 * delta; // pi/2 radians (90 degrees) per
        requestAnimationFrame(animate);

        if (keyboard.pressed("up")) {
            boat.position.z += velocity * Math.cos(boat.rotation.y);
            boat.position.x += velocity * Math.sin(boat.rotation.y);
            camera_follow_boat();
        }

        if (keyboard.pressed("down")) {
            boat.position.z -= velocity * Math.cos(boat.rotation.y);
            boat.position.x -= velocity * Math.sin(boat.rotation.y);

        }

        if (keyboard.pressed("left")) {
            boat.rotation.y += rotateAngle;

        }

        if (keyboard.pressed("right")) {
            boat.rotation.y -= rotateAngle;
            camera_follow_boat();
            collision_check();
        }

        if (keyboard.pressed("F")) {
            boat.position.y += 5;

        }

        if (keyboard.pressed("D")) {
            boat.position.y -= 0.5;
        }

        var raining = true;

        if(raining){



          // console.log(rainGeometry.vertices.length);

          for(var i=0; i<rainGeometry.vertices.length; i++){
            var speed = 4.0;
            rainGeometry.vertices[i].y -= fastRandom(seed) * speed + speed;
            if (rainGeometry.vertices[i].y < -50)
                rainGeometry.vertices[i].y = 50;
          }

            // for (var i in rainGeometry.vertices) {
            //     var speed = 4.0;
            //     rainGeometry.vertices[i].y -= fastRandom(seed) * speed + speed;
            //     if (rainGeometry.vertices[i].y < -50)
            //         rainGeometry.vertices[i].y = 50;
            // }
            rain.rotation.set(-camera.rotation.x, -camera.rotation.y, -camera.rotation.z, "ZYX");
            rainGeometry.verticesNeedUpdate = true;

        }
        // Render ocean reflection
    camera.remove(rain);

    if (raining){
      camera.add(rain);
    }


        render();

    }
    var seed = 1;
    function fastRandom(seed) {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);

    }

    function render() {

        water.material.uniforms.time.value += 1.0 / 60.0;
        controls.update();
        camera.lookAt(boat.position);
        water.render();
        renderer.render(scene, camera);
    }

    return {
        "init": init
    }

})(window);

$(function() {
    JunnieJobs_Render.init();
});
