var RAIN = (function(window) {

    'use strict';

    var lastTime = (new Date()).getTime();
    var window_width = window.innerWidth;
    var window_height = window.innerHeight;
    var renderer, camera, scene, controls, ocean, raining;
    var environment = "night";
    var groupShip;
    var boatShip;
    var boat;
    var mainDirectionalLight, rainGeometry, rain, cloudShader, sky_init, skyBox;
    var Loader = new THREE.LoadingManager();
    var imageLoader = new THREE.ImageLoader(Loader);
    var raining = false;

    function init() {

        initialize();
        resize(window_width, window_height);
        render();
        $("body").on("dblclick", (function() {
            if (raining == true) {
                raining = false;
                return;
            }
            raining = true;
        }));
    }

    function camera_init(boatShip) {
        camera = new THREE.PerspectiveCamera(55.0, window_width / window.innerHeight, 0.5, 1000000);
        camera.position.set(0, 350, 800);
        camera.lookAt(new THREE.Vector3());
        boatShip.add(camera);
        return view_control_init(camera);
    }

    function view_control_init(camera) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.userPan = false;
        controls.target.set(0, 100.0, 0);
        controls.noKeys = true;
        controls.userPanSpeed = 0;
        controls.minDistance = 0;
        controls.maxDistance = 20000.0;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI * 0.75;
    }

    function initialize() {

        renderer = new THREE.WebGLRenderer();
        $("body").append(renderer.domElement);

        scene = new THREE.Scene();
        groupShip = new THREE.Object3D();
        boatShip = new THREE.Object3D();
        scene.add(groupShip);
        groupShip.add(boatShip);

        // Initialize Clouds
        cloudShader = new CloudShader(renderer);
        cloudShader.cloudMesh.scale.multiplyScalar(4.0);
        scene.add(cloudShader.cloudMesh);

        camera_init(boatShip);
        light_init();
        load_ocean();
        sky_init();
        load_boat();
        load_rain();
        load_ocean();
        load_mountains();
    }

    function light_init() {
        // Add light
        mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainDirectionalLight.position.set(-0.2, 0.5, 1);
        scene.add(mainDirectionalLight);

    }

    function sky_init() {
        var cubeShader = THREE.ShaderLib['cube'];

        var skyBoxMaterial = new THREE.ShaderMaterial({
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            side: THREE.BackSide
        });

        skyBox = new THREE.Mesh(
            new THREE.BoxGeometry(450000, 450000, 450000),
            skyBoxMaterial
        );

        scene.add(skyBox);

        // https://stackoverflow.com/questions/3552944/how-to-get-the-anchor-from-the-url-using-jquery
        var url = window.location.href,
            idx = url.indexOf("#");
        var anchor = idx != -1 ? url.substring(idx + 1) : null;
        var environmentParameter = anchor;

        if (environmentParameter !== null) {
            environment = environmentParameter;
        }

        update_environment(environment);
    }

    function load_boat() {
        var loader = new THREE.OBJMTLLoader(Loader);
        boat = null;
        loader.load('models/moon.obj', 'models/moon.mtl', function(object) {
            object.position.y = 20.0;
            if (object.children) {
                for (var child in object.children) {
                    object.children[child].material.side = THREE.DoubleSide;
                }
            }
            groupShip.add(object);
            boat = object;
        });
    }

    function load_ocean() {
        // Initialize Ocean
        var gsize = 512;
        var res = 512;
        var gres = 256;
        var origx = -gsize / 2;
        var origz = -gsize / 2;
        ocean = new THREE.Ocean(renderer, camera, scene, {
            INITIAL_SIZE: 200.0,
            INITIAL_WIND: [10.0, 10.0],
            INITIAL_CHOPPINESS: 3.6,
            CLEAR_COLOR: [1.0, 1.0, 1.0, 0.0],
            SUN_DIRECTION: mainDirectionalLight.position.clone(),
            OCEAN_COLOR: new THREE.Vector3(0.35, 0.4, 0.45),
            SKY_COLOR: new THREE.Vector3(10.0, 13.0, 15.0),
            EXPOSURE: 0.15,
            GEOMETRY_RESOLUTION: gres,
            GEOMETRY_SIZE: gsize,
            RESOLUTION: res
        });

    }

    function load_rain() {
        // Add rain
        // var size = 128;
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
            rainGeometry.vertices.push(vertex);
        }
        rain = new THREE.PointCloud(rainGeometry, rainMaterial);
        camera.add(rain);
        rain.position.setZ(-size * 0.75);

    }

    function load_mountains() {

        var mountainTexture = new THREE.Texture();
        mountainTexture.generateMipmaps = false;
        mountainTexture.magFilter = THREE.LinearFilter;
        mountainTexture.minFilter = THREE.LinearFilter;
        imageLoader.load('img/mountains.png', function(image) {
            mountainTexture.image = image;
            mountainTexture.needsUpdate = true;
        });

        var mountainsMaterial = new THREE.MeshBasicMaterial({
            map: mountainTexture,
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false
        });

        var addMountain = function addMountain(size) {

            var moutains = new THREE.Mesh(
                new THREE.CylinderGeometry(size, size, 35000, 32, 1, true),
                mountainsMaterial
            );
            moutains.position.y = 10000;
            scene.add(moutains);
        };

        addMountain(120000);
        addMountain(150000);
    }

    function update_environment(key) {
        var textureName = '';
        var textureExt = ".jpg";
        var directionalLightPosition = new THREE.Vector3(-0.3, 0.3, 1);
        var directionalLightColor = new THREE.Color(1, 1, 1);

        textureName = 'grimmnight';
        environment = key;
        mainDirectionalLight.position.copy(directionalLightPosition);
        mainDirectionalLight.color.copy(directionalLightColor);
        ocean.materialOcean.uniforms.u_sunDirection.value.copy(mainDirectionalLight.position);

        var background = [
            'img/' + textureName + '_west' + textureExt,
            'img/' + textureName + '_east' + textureExt,
            'img/' + textureName + '_up' + textureExt,
            'img/' + textureName + '_down' + textureExt,
            'img/' + textureName + '_south' + textureExt,
            'img/' + textureName + '_north' + textureExt
        ];

        var images = [];

        var cubeMap = new THREE.CubeTexture(images);
        cubeMap.flipY = false;

        var loaded = 0;

        var loadTexture = function(i) {
            imageLoader.load(background[i], function(image) {
                cubeMap.images[i] = image;
                loaded++;
                if (loaded === 6) {
                    cubeMap.needsUpdate = true;
                }
            });

        }

        for (var i = 0, il = background.length; i < il; ++i) {
            loadTexture(i);
        }

        cubeMap.format = THREE.RGBFormat;
        cubeMap.generateMipmaps = false;
        cubeMap.magFilter = THREE.LinearFilter;
        cubeMap.minFilter = THREE.LinearFilter;
        skyBox.material.uniforms['tCube'].value = cubeMap;
    }

    function animate() {
        var currentTime = new Date().getTime();
        ocean.deltaTime = (currentTime - lastTime) / 1000 || 0.0;
        lastTime = currentTime;

        // Update camera position
        if (camera.position.y < 0.0) {
            camera.position.y = 2.0;
        }
        // Update rain
        if (raining) {
            var seed = 1;
            var fastRandom = function fastRandom() {
                // https://stackoverflow.com/questions/521295/javascript-random-seeds
                var x = Math.sin(seed++) * 10000;
                return x - Math.floor(x);
            }
            for (var i in rainGeometry.vertices) {
                var speed = 4.0;
                rainGeometry.vertices[i].y -= fastRandom() * speed + speed;
                if (rainGeometry.vertices[i].y < -50)
                    rainGeometry.vertices[i].y = 50;
            }
            rain.rotation.set(-camera.rotation.x, -camera.rotation.y, -camera.rotation.z, "ZYX");
            rainGeometry.verticesNeedUpdate = true;
        }

        // Render ocean reflection
        camera.remove(rain);
        ocean.render();
        if (raining) {
            camera.add(rain);
        }
    }

    function resize(inWidth, inHeight) {
        camera.aspect = inWidth / inHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(inWidth, inHeight);

    }

    function render() {
        requestAnimationFrame(render);
        animate();
        renderer.render(scene, camera);
        cloudShader.update();
        ocean.update();
        controls.update();
    }

		return {
        "init": init
    }

})(window);

$(function() {
    RAIN.init();
});
