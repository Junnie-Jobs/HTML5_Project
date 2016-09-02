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
    var island_A_cotent_html = "<iframe width='98%' height='' id='video' src='https://www.youtube.com/embed/3WIS6N_9gjA' frameborder='0' allowfullscreen></iframe>"
    var day_image_path = 'textures/skyboxsun25degtest.png';
    var sunrise_image_path = 'textures/sunrise.jpg';
    var sunset_image_path = 'textures/sunset.jpg';
    var night_image_path = 'textures/night.jpg';
    var keyboard = new THREEx.KeyboardState();
    var whale;

    function init() {
        $(".daytime").on("click", chang_to_day);
        $(".night").on("click", chang_to_night);
        $(".sunrise").on("click", chang_to_sunrise);
        $(".sunset").on("click", chang_to_sunset);
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
        ocean_init();
        time_check_and_set_background();
        load_boat();
        load_island1();
        load_island2();
        load_whale();
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
        loader.load('textures/skyboxsun25degtest.png', function(image) {

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
        waterNormals = new THREE.TextureLoader().load('textures/waternormals.jpg');
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

    function collision_check() {

        // island_A.position {x: 60, y: -50, z: -5000}
        // console.log(boat.position.x +","+boat.position.z);
        if (boat.position.x + 25 > island_A.position.x - 200 &&
            boat.position.x - 25 < island_A.position.x + 200) {
            if (boat.position.z + 500 > island_A.position.z - 1500 &&
                boat.position.z - 500 < island_A.position.z + 1500) {
                window.location.href = ("https://brunch.co.kr/@dj0999/1");
            }
        }
    }

    function load_boat() {
        var boat_loader = new THREE.OBJLoader();
        boat_loader.load('model/boat.obj', function(object) {

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

    function load_whale() {
        var load_whale = new THREE.OBJLoader();
        load_whale.load('model/whale.obj', function(object) {
            whale = object;
            whale.position.x = -3700;
            whale.position.y = 40;
            whale.position.z = -6000;
            whale.scale.x = 300;
            whale.scale.y = 300;
            whale.scale.z = 300;
            scene.add(whale);
        });
    }

    function load_island1() {
        var island_loader = new THREE.OBJLoader();
        island_loader.load('model/Small Tropical Island/Small Tropical Island.obj', function(object) {

            island_A = object;
            island_A.position.x = 60;
            island_A.position.y = -50;
            island_A.position.z = -5000;
            island_A.scale.x = 5;
            island_A.scale.y = 5;
            island_A.scale.z = 5;
            scene.add(object);
            collidableMeshList.push(island_A);

            // island_A.position {x: 60, y: -50, z: -5000}
        });
    }

    function load_island2() {
        var island_loader2 = new THREE.OBJLoader();
        island_loader2.load('model/Small Tropical Island/Small Tropical Island.obj', function(object) {

            island_B = object;
            island_B.position.x = -13000;
            island_B.position.y = -50;
            island_B.position.z = -2000;
            island_B.scale.x = 5;
            island_B.scale.y = 5;
            island_B.scale.z = 5;
            scene.add(island_B);
        });
    }

    function change_background(image_path) {

        var cubeMap = new THREE.CubeTexture([]);
        cubeMap.format = THREE.RGBFormat;

        var loader = new THREE.ImageLoader();
        loader.load(image_path, function(image) {

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
    }

    function chang_to_day() {
        change_background(day_image_path);
        $("#night_music").remove();
    }

    function chang_to_night() {
        var music = "<audio src='music/night.mp3' id='night_music' controls='false' autoplay='true' loop='true' preload='auto'></audio>"
        $("#info").after(music);
        change_background(night_image_path);
    }

    function chang_to_sunrise() {
        change_background(sunrise_image_path);
    }

    function chang_to_sunset() {

        change_background(sunset_image_path);
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

            // camera.position.z += velocity*Math.cos(boat.rotation.y)*10;
            // camera.position.x += velocity*Math.sin(boat.rotation.z)*10;
            collision_check();
        }

        if (keyboard.pressed("down")) {
            boat.position.z -= velocity * Math.cos(boat.rotation.y);
            boat.position.x -= velocity * Math.sin(boat.rotation.y);
            camera_follow_boat();
            collision_check();
        }

        if (keyboard.pressed("left")) {
            boat.rotation.y += rotateAngle;
            camera_follow_boat();
            collision_check();
        }

        if (keyboard.pressed("right")) {
            boat.rotation.y -= rotateAngle;
            camera_follow_boat();
            collision_check();
        }

        if (keyboard.pressed("F")) {
            boat.position.y += 5;
            if (boat.position.y > 2000) {
                window.location.href = ("space/space.html");
            }
        }

        if (keyboard.pressed("D")) {
            boat.position.y -= 0.5;
            if (boat.position.y < -200) {
                window.location.href = ("underWater/underWater.html");
                // window.location.href = ("http://labs.gooengine.com/pearl-boy/indexBelow.html");
            }
        }

        // whale.rotation.x += 0.01;
        render();

    }

    function time_check_and_set_background() {

        var current_time = new Date().getHours();

        if (current_time >= 5 && current_time < 7) { // 새벽
            change_background(sunrise_image_path);
        } else if (current_time >= 7 && current_time < 16) { // 낮
            change_background(day_image_path);
        } else if (current_time >= 16 && current_time < 20) { // 노을
            change_background(sunset_image_path);
        } else { //밤
            change_background(night_image_path);
        }
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


// var rainGeometry;
// var rain;
// var rainning = true;

// Update rain


// function rain_whether(){
//   var size = 128;
//   var rainTexture = new THREE.Texture();
//   rainTexture.generateMipmaps = false;
//   rainTexture.magFilter = THREE.LinearFilter;
//   rainTexture.minFilter = THREE.LinearFilter;
//   var loader  = new THREE.ImageLoader();
//   loader.load( 'image/water-drop.png', function ( image ) {
//     rainTexture.image = image;
//     rainTexture.needsUpdate = true;
// } );
//
// var rainShader = THREE.ShaderLib['rain'];
//
// var rainMaterial = new THREE.ShaderMaterial({
//   fragmentShader: rainShader.fragmentShader,
//   vertexShader: rainShader.vertexShader,
//   uniforms: rainShader.uniforms,
//   transparent: true,
//   depthWrite: false
// });
// rainMaterial.uniforms.texture.value = rainTexture;
//
// rainGeometry = new THREE.Geometry();
//
// for (var i = 0; i < 100; i++ )
// {
//   var vertex = new THREE.Vector3();
//   vertex.x = Math.random() * 2.0 * size - size;
//   vertex.y = Math.random() * 2.0 * size - size;
//   vertex.z = Math.random() * size - size * 0.5;
//   rainGeometry.vertices.push( vertex );
// }
// rain = new THREE.Points( rainGeometry, rainMaterial );
// camera.add( rain );
// // scene.add(rain);
// rain.position.setZ( - size * 0.75 ) ;
// }
//
// function check_rain(){
//
//   if( rainning ) {
//     var seed = 1;
//     var fastRandom = function fastRandom() {
//       // https://stackoverflow.com/questions/521295/javascript-random-seeds
//       var x = Math.sin( seed++ ) * 10000;
//       return x - Math.floor( x );
//     }
//
//     for( var i in rainGeometry.vertices )
//     {
//       var speed = 4.0;
//       rainGeometry.vertices[i].y -= fastRandom() * speed + speed;
//       if( rainGeometry.vertices[i].y < -50 )
//         rainGeometry.vertices[i].y = 50;
//     }
//
//     rain.rotation.set( -camera.rotation.x, -camera.rotation.y, -camera.rotation.z, "ZYX" );
//     rainGeometry.verticesNeedUpdate = true;
//   }
// }
