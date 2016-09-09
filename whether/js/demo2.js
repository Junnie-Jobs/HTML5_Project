
var RAIN = (function(window) {

	'use strict';

  var lastTime = (new Date()).getTime();
  var window_width = window.innerWidth;
  var window_height = window.innerHeight;
  var renderer, camera, scene, controls, ocean, raining;
  var environment= "night";
  var groupShip;
  var boatShip;
  var boat;
  var Loader, imageLoader, mainDirectionalLight, rainGeometry, rain, cloudShader, LoadSkyBox, skyBox;

  var commands = {
		states : {
			up : false,
			right : false,
			down : false,
			left : false
		},
		movements : {
			speed : 0.0,
			angle : 0.0
		}
	}

  function render(){
     	requestAnimationFrame(render);
      Update();

  }

	function init(){

    Initialize();
    Resize(window_width, window_height);
    render();
	}

  function Initialize(){

      renderer = new THREE.WebGLRenderer();
      $("body").append(renderer.domElement);

      scene = new THREE.Scene();
      groupShip = new THREE.Object3D();
      boatShip = new THREE.Object3D();
      scene.add(groupShip);
      groupShip.add(boatShip);

      camera = new THREE.PerspectiveCamera(55.0, window_width / window.innerHeight, 0.5, 1000000);
      camera.position.set(0, 350, 800);
      camera.lookAt(new THREE.Vector3());
      boatShip.add(camera);

      // Initialize Orbit control
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.userPan = false;
      controls.target.set(0, 100.0, 0);
      controls.noKeys = true;
      controls.userPanSpeed = 0;
      controls.minDistance = 0;
      controls.maxDistance = 20000.0;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI * 0.75;

      InitializeLoader();
      InitializeScene();

  }

  function InitializeLoader(){
    Loader = new THREE.LoadingManager();
    imageLoader = new THREE.ImageLoader(Loader);
  }
  function LoadSkyBox(){
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

      UpdateEnvironment(environment);
  }

  function InitializeScene(){
    // Add light
    mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainDirectionalLight.position.set(-0.2, 0.5, 1);
    scene.add(mainDirectionalLight);

    // var boatShip_loader = new THREE.OBJLoader();
    // boatShip_loader.load('../model/boatShip.obj', function(object) {
    //
    //       // var texture = new THREE.Texture();
    //       boatShip = object;
    //       boatShip.position.x = -60;
    //       boatShip.position.y = 50;
    //       boatShip.position.z = 300;
    //
    //       boatShip.rotation.y = 180;
    //
    //       boatShip.scale.x = 150;
    //       boatShip.scale.y = 150;
    //       boatShip.scale.z = 150;
    //       boatShip.add(camera);
    //       scene.add(boatShip);
    //   });

    //Add Black Pearl
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


    // Initialize Clouds
    cloudShader = new CloudShader(renderer);
    cloudShader.cloudMesh.scale.multiplyScalar(4.0);
    scene.add(cloudShader.cloudMesh);

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

    LoadSkyBox();
    LoadMountains();
  }


  function LoadMountains(){
    var demo = this;

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

      // Add twice with different size in order to avoid some artifacts on the reflection
      addMountain(120000);
      addMountain(150000);

      // Add a black cylinder to hide the skybox under the water
      var cylinder = new THREE.Mesh(
          new THREE.CylinderGeometry(150000, 150000, 150000, 32, 1, true),
          new THREE.MeshBasicMaterial({
              color: "0xffffff",
              side: THREE.BackSide
          })
      );
      cylinder.position.y = -80000;
      scene.add(cylinder);
  }

  function UpdateEnvironment(key){
    var textureName = '';
    var textureExt = ".jpg";
    var directionalLightPosition = null;
    var directionalLightColor = null;
    var raining_bool = false;

    if (key == "night") {
        textureName = 'grimmnight';
        directionalLightPosition = new THREE.Vector3(-0.3, 0.3, 1);
        directionalLightColor = new THREE.Color(1, 1, 1);
        raining = true;
    }

    environment = key;
    raining = true;
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

    // var imageLoader = imageLoader;
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

  function Display(){
      renderer.render(scene, camera);

  }

  function Update(){
    var currentTime = new Date().getTime();
      ocean.deltaTime = (currentTime - lastTime) / 1000 || 0.0;
      lastTime = currentTime;


      // Update camera position
		if( camera.position.y < 0.0 ) {
			camera.position.y = 2.0;
		}

		// Update black ship displacements
		// UpdateCommands();
		// groupShip.rotation.y += commands.movements.angle;
		// boatShip.rotation.z = -commands.movements.angle * 10.0;
		// boatShip.rotation.x = commands.movements.speed * 0.1;
		// var shipDisplacement = (new THREE.Vector3(0, 0, -1)).applyEuler(groupShip.rotation).multiplyScalar( 10.0 * commands.movements.speed );
		// groupShip.position.add( shipDisplacement );
		// 
		// var currentTime = new Date().getTime();
		// ocean.deltaTime = ( currentTime - lastTime ) / 1000 || 0.0;
		// lastTime = currentTime;
		//
		// // Update black ship movements
		// if( boat !== null )
		// {
		// 	var animationRatio = 1.0 + commands.movements.speed * 1.0;
		// 	boat.rotation.y = Math.cos( currentTime * 0.0008 ) * 0.05 - 0.025;
		// 	boat.rotation.x = Math.sin( currentTime * 0.001154 + 0.78 ) * 0.1 + 0.05;
		// }

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
      if (raining)
          camera.add(rain);
      // Updade clouds
      cloudShader.update();

      // Update ocean data
      ocean.update();
      controls.update();
      Display();
  }

  function Resize(inWidth, inHeight){
    camera.aspect = inWidth / inHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(inWidth, inHeight);
      Display();

  }

	return {
		"init" : init
	}

})(window);

$(function(){
	RAIN.init();
});
