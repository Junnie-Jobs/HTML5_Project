var JunnieJobs_Render_Space = (function(window) {

  var container, stats;
  var camera, scene, renderer;
  var sphere;
  var boat;
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

  var day_image_path = '../textures/skyboxsun25degtest.png';
  var night_image_path = '../textures/night.jpg';

	function init(){

    initialize();
    view_setting();
    animate();

  }

  function initialize(){
    if ( ! Detector.webgl ) {
      Detector.addGetWebGLMessage();
       $("#container").html("");
    }
  }

  function view_setting() {

    var container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000 );
    camera.position.set( 2000, 750, 2000 );

    //카메라 시점 컨트롤
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.minDistance = 1000.0;
    controls.maxDistance = 5000.0;
    // controls.maxPolarAngle = Math.PI * 0.495;
    controls.maxPolarAngle = Math.PI;
    controls.target.set( 0, 500, 0 );

    //빛 추가
    scene.add( new THREE.AmbientLight( 0x444444 ) );

    var light = new THREE.DirectionalLight( 0xffffbb, 1 );
    light.position.set( - 1, 1, - 1 );
    scene.add( light );


    // load skybox
    var cubeMap = new THREE.CubeTexture( [] );
    cubeMap.format = THREE.RGBFormat;

    var loader = new THREE.ImageLoader();
    loader.load( '../textures/night.jpg', function ( image ) {

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

    var boat_loader = new THREE.OBJLoader();
    boat_loader.load('../model/boat.obj', function ( object ) {

           boat = object;
           boat.position.x = - 60;
           boat.position.z = 300;
           boat.rotation.y = 180;
            boat.scale.x = 50;
            boat.scale.y = 50;
            boat.scale.z = 50;
        scene.add( object );
    });
  }

  function animate() {
    var velocity = 10;
    requestAnimationFrame( animate );
    if (window.moveFront) {
      boat.position.z += velocity*Math.cos(boat.rotation.y);
      boat.position.x += velocity*Math.sin(boat.rotation.y);
    }

    if(window.moveBack){
        boat.position.z -= velocity*Math.cos(boat.rotation.y);
        boat.position.x -= velocity*Math.sin(boat.rotation.y);
    }

    if(window.moveLeft){
        boat.rotation.y += 0.007;
    }

    if(window.moveRight){
        boat.rotation.y -= 0.007;
    }

    if(window.moveUp){
        boat.position.y += 5;
    }

    if(window.moveDown){
        boat.position.y -= 5;
    }
    render();
  }

  function render() {

    var time = performance.now() * 0.001;
    controls.update();
    renderer.render( scene, camera );
  }

  return {
		"init" : init
	}

})(window);

$(function(){
	JunnieJobs_Render_Space.init();
});

// sphere.position.y = Math.sin( time ) * 500 + 250;
// sphere.rotation.x = time * 0.5;
// sphere.rotation.z = time * 0.51;
