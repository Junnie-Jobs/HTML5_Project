var JunnieJobs_Render_Space = (function(window) {

  var container, stats;
  var camera, scene, renderer;
  var sphere;
  var boat;
  var clock = new THREE.Clock();
  var controls;
  var keyboard = new THREEx.KeyboardState();
  var moon;

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
    load_Earth();
    load_Jupiter();
    load_Pluto();
    load_Neptune();
    load_Saturn();

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
    loader.load('../textures/night.jpg', function(image) {

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

  function container_setting() {
    var container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

  }

  function camera_follow_boat() {
    var relativeCameraOffset = new THREE.Vector3(0, 7, -30);
    var cameraOffset = relativeCameraOffset.applyMatrix4(boat.matrixWorld);
    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
  }

  function collision_check() {}

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

  function render() {

    var time = performance.now() * 0.001;
    controls.update();
    camera.lookAt(boat.position);
    renderer.render(scene, camera);

  }

  function load_Jupiter() {

    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var texture = THREE.ImageUtils.loadTexture('images/jupitermap.jpg');
    var material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.02,
    })
    var jupiter = new THREE.Mesh(geometry, material);

    jupiter.position.x = -5260;
    jupiter.position.y = -50;
    jupiter.position.z = -13293;
    jupiter.scale.x = 2000;
    jupiter.scale.y = 2000;
    jupiter.scale.z = 2000;
    scene.add(jupiter);
  }

  function load_Earth() {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('images/earthmap1k.jpg'),
      bumpMap: THREE.ImageUtils.loadTexture('images/earthbump1k.jpg'),
      bumpScale: 0.05,
      specularMap: THREE.ImageUtils.loadTexture('images/earthspec1k.jpg'),
      specular: new THREE.Color('grey'),
    });
    var earth = new THREE.Mesh(geometry, material);
    //boat position -60 0 300
    earth.position.x = 60;
    earth.position.y = -1300;
    earth.position.z = 300;
    earth.scale.x = 2000;
    earth.scale.y = 2000;
    earth.scale.z = 2000;
    scene.add(earth);
  }

  function load_Pluto() {

    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('images/plutomap1k.jpg'),
      bumpMap: THREE.ImageUtils.loadTexture('images/plutobump1k.jpg'),
      bumpScale: 0.005,
    });

    var pluto = new THREE.Mesh(geometry, material);
    pluto.position.x = -5060;
    pluto.position.y = -50;
    pluto.position.z = 1503;
    pluto.scale.x = 2000;
    pluto.scale.y = 2000;
    pluto.scale.z = 2000;
    scene.add(pluto);
  }

  function load_Neptune() {

    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture('images/neptunemap.jpg')
    var material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.05,
    })

    var neptune = new THREE.Mesh(geometry, material);
    neptune.position.x = -14060;
    neptune.position.y = -50;
    neptune.position.z = -3503;
    neptune.scale.x = 2000;
    neptune.scale.y = 2000;
    neptune.scale.z = 2000;
    scene.add(neptune);
  }

  function load_Saturn() {

    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var texture = THREE.ImageUtils.loadTexture('images/saturnmap.jpg');
    var material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.05,
    });

    var saturn = new THREE.Mesh(geometry, material);
    saturn.position.x = -3060;
    saturn.position.y = -50;
    saturn.position.z = 8503;
    saturn.scale.x = 2000;
    saturn.scale.y = 2000;
    saturn.scale.z = 2000;
    scene.add(saturn);
  }

  return {
    "init": init
  }

})(window);

$(function() {
  JunnieJobs_Render_Space.init();
});

// sphere.position.y = Math.sin( time ) * 500 + 250;
// sphere.rotation.x = time * 0.5;
// sphere.rotation.z = time * 0.51;
