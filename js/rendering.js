var JunnieJobs_Render = (function(window) {

  var container, stats;
  var camera, scene, renderer;
  var sphere;
  var boat;
  var boat2;
  var boatCamera;
  var island_A;
  var island_B;
  var parameters = {
    width: 2000,
    height: 2000,
    widthSegments: 250,
    heightSegments: 250,
    depth: 2000,
    param: 4,
    filterparam: 1
  };
  var waterNormals;
  var controls;
  var water;
  var light;
  var collidableMeshList = [];
var clock = new THREE.Clock();

  var day_image_path = 'textures/skyboxsun25degtest.png';
  var night_image_path = 'textures/night.jpg';

	function init(){
    $(".daytime").on("click", chang_to_day);
    $(".night").on("click", chang_to_night);
    initialize();
    view_init();
    animate();
  }
  function initialize(){
    if ( ! Detector.webgl ) {
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
    sky_init();
    boatLoader();
    islandLoader1();
    // islandLoader2();
  }


  function camera_init(){
    // Create a target camera instance.
     camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000  ),
    // camera = new THREE.TargetCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000  ),
    scene.add(camera);
    camera.position.set( 1500, 500, 1500 ); //boat (-60, 300 180)
     //1540, 500 1500
  }

  function light_init(){
    //빛 추가
    scene.add( new THREE.AmbientLight( 0x444444 ) );
    light = new THREE.DirectionalLight( 0xffffbb, 1 );
    // light.position.set( - 1, 1, - 1 );
    light.position.set( 1, 1, 1 );
    scene.add( light );
  }

  function sky_init(){
    // load skybox
    var cubeMap = new THREE.CubeTexture( [] );
    cubeMap.format = THREE.RGBFormat;

    var loader = new THREE.ImageLoader();
    loader.load( 'textures/skyboxsun25degtest.png', function ( image ) {

      var getSide = function ( x, y ) {

        var size = 1024;

        var canvas = document.createElement( 'canvas' );
        canvas.width = size;
        canvas.height = size;
        var context = canvas.getContext( '2d' );
        context.drawImage( image, - x * size, - y * size);

        return canvas;

      };

      cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
      cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
      cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
      cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
      cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
      cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
      cubeMap.needsUpdate = true;

    } );

    var cubeShader = THREE.ShaderLib[ 'cube' ];
    cubeShader.uniforms[ 'tCube' ].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial( {
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    } );

    var skyBox = new THREE.Mesh(
      new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
      skyBoxMaterial
    );

    scene.add( skyBox );

    var geometry = new THREE.IcosahedronGeometry( 400, 4 );
    var material = new THREE.MeshPhongMaterial( {
      vertexColors: THREE.FaceColors,
      shininess: 200,
      envMap: cubeMap
    } );
  }

  function view_control_init(){
    //마우스 클릭으로 세계관을 보기 위한 시점 컨트롤
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.minDistance = 1000.0;
    controls.maxDistance = 5000.0;
    // controls.maxPolarAngle = Math.PI * 0.495;
    controls.maxPolarAngle = Math.PI;
    controls.target.set( 0, 500, 0 );
  }

  function ocean_init(){
    //바다질감 추가
    waterNormals = new THREE.TextureLoader().load( 'textures/waternormals.jpg' );
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

      water = new THREE.Water( renderer, camera, scene, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 	1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x071440,
      distortionScale: 5.0,
    } );

    //질감입히기
    mirrorMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( parameters.width * 500, parameters.height * 500 ),
      water.material
    );

    mirrorMesh.add( water );
    mirrorMesh.rotation.x = - Math.PI * 0.5;
    scene.add( mirrorMesh );
  }

  function container_setting(){
    var container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    scene = new THREE.Scene();
  }

  function collision_check(){
    console.log(boat.position.x);
    // island_A.position {x: 60, y: -50, z: -5000}
    if(boat.position.x+25 > island_A.position.x-100 &&
       boat.position.x-25 < island_A.position.x+100){
      if(boat.position.z+1500 > island_A.position.z-1500 &&
         boat.position.z-1500 < island_A.position.z+1500){
        $(".show").trigger("click");
      }
    }
  }

  function boatLoader(){
    var boat_loader = new THREE.OBJLoader();
    boat_loader.load('model/boat.obj', function ( object ) {

      // var texture = new THREE.Texture();
           boat = object;
           boat.position.x = - 60;
           boat.position.y = 0;
           boat.position.z = 300;

           boat.rotation.y = 180;

           boat.scale.x = 50;
           boat.scale.y = 50;
           boat.scale.z = 50;

           scene.add( boat );
          //  var geometry = object.geometry;


            })
}

  function islandLoader1(){
    var island_loader = new THREE.OBJLoader();
    island_loader.load('model/Small Tropical Island/Small Tropical Island.obj', function ( object ) {

           island_A = object;
           island_A.position.x =  60;
           island_A.position.y = -50;
           island_A.position.z = -5000;
           island_A.scale.x = 5;
           island_A.scale.y = 5;
           island_A.scale.z = 5;
           scene.add( object );
           collidableMeshList.push(island_A);

          // island_A.position {x: 60, y: -50, z: -5000}
    });
  }

  function islandLoader2(){
    var island_loader2 = new THREE.OBJLoader();
    island_loader2.load('model/Small Tropical Island/Small Tropical Island.obj', function ( object ) {

           island_B = object;
           island_B.position.x = -13000;
           island_B.position.y = -50;
           island_B.position.z = -2000;
           island_B.scale.x = 5;
           island_B.scale.y = 5;
           island_B.scale.z = 5;
           scene.add( island_B );
    });
  }

  function change_background(image_path){

    var cubeMap = new THREE.CubeTexture( [] );
    cubeMap.format = THREE.RGBFormat;

    var loader = new THREE.ImageLoader();
    loader.load( image_path, function ( image ) {

      var getSide = function ( x, y ) {

        var size = 1024;

        var canvas = document.createElement( 'canvas' );
        canvas.width = size;
        canvas.height = size;

        var context = canvas.getContext( '2d' );
        context.drawImage( image, - x * size, - y * size);

        return canvas;

      };

      cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
      cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
      cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
      cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
      cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
      cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
      cubeMap.needsUpdate = true;

    } );

    var cubeShader = THREE.ShaderLib[ 'cube' ];
    cubeShader.uniforms[ 'tCube' ].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial( {
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    } );

    var skyBox = new THREE.Mesh(
      new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
      skyBoxMaterial
    );

    scene.add( skyBox );
  }

  function chang_to_day(){
    change_background(day_image_path);
    $("#night_music").remove();
  }

  function chang_to_night(){
    var music = "<audio src='music/night.mp3' id='night_music' controls='false' autoplay='true' loop='true' preload='auto'></audio>"
    $("#info").after(music);
    console.log("change!");
    change_background(night_image_path);
  }

  function animate() {
    var velocity = 10;
    var delta = clock.getDelta(); // seconds.
    var rotateAngle = Math.PI / 4 * delta;   // pi/2 radians (90 degrees) per
    requestAnimationFrame( animate );

    if (window.moveFront) {
      boat.position.z += velocity*Math.cos(boat.rotation.y);
      boat.position.x += velocity*Math.sin(boat.rotation.y);
      var relativeCameraOffset = new THREE.Vector3(0, 10, -60);
      var cameraOffset = relativeCameraOffset.applyMatrix4(boat.matrixWorld);
      camera.position.x = cameraOffset.x;
      camera.position.y = cameraOffset.y;
      camera.position.z = cameraOffset.z;

      // camera.position.z += velocity*Math.cos(boat.rotation.y)*10;
      // camera.position.x += velocity*Math.sin(boat.rotation.z)*10;
        collision_check();
    }

    if(window.moveBack){
        boat.position.z -= velocity*Math.cos(boat.rotation.y);
        boat.position.x -= velocity*Math.sin(boat.rotation.y);
         collision_check();
    }

    if(window.moveLeft){
        // boat.rotation.y += 0.007;
        boat.rotation.y += rotateAngle;
         collision_check();
    }

    if(window.moveRight){
        // boat.rotation.y -= 0.007;
        boat.rotation.y -= rotateAngle;
         collision_check();
    }

    if(window.moveUp){

        boat.position.y += 5;
        if(boat.position.y > 2000){
          window.location.href = ("space/space.html");
        }
    }
    if(window.moveDown){
        boat.position.y -= 5;
    }
    render();
  }

  function render() {

    var time = performance.now() * 0.001;
    water.material.uniforms.time.value += 1.0 / 60.0;
    controls.update();
    water.render();
    camera.lookAt(boat.position);
    renderer.render( scene, camera );
  }

  return {
		"init" : init
	}

})(window);

$(function(){
	JunnieJobs_Render.init();
});
