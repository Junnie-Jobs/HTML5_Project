var DEMO =
{
	renderer : null,
	camera : null,
	scene : null,
	controls : null,
	ocean : null,
	environment : "night",
	raining : false,

	Initialize : function () {

		this.renderer = new THREE.WebGLRenderer();
		document.body.appendChild( this.renderer.domElement );

		this.scene = new THREE.Scene();

		this.groupShip = new THREE.Object3D();
		this.blackPearlShip = new THREE.Object3D();
		this.scene.add( this.groupShip );
		this.groupShip.add( this.blackPearlShip );

		this.camera = new THREE.PerspectiveCamera( 55.0, WINDOW._Width / WINDOW._Height, 0.5, 1000000 );
		this.camera.position.set( 0, 350, 800 );
		this.camera.lookAt( new THREE.Vector3() );
		this.blackPearlShip.add( this.camera );

		// Initialize Orbit control
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		this.controls.userPan = false;
		this.controls.target.set( 0, 100.0, 0 );
		this.controls.noKeys = true;
		this.controls.userPanSpeed = 0;
		this.controls.minDistance = 0;
		this.controls.maxDistance = 20000.0;
		this.controls.minPolarAngle = 0;
		this.controls.maxPolarAngle = Math.PI * 0.75;

		this.InitializeLoader();
		this.InitializeScene();

	},


  InitializeLoader : function InitializeLoader() {

    this.Loader = new THREE.LoadingManager();

    var log = function( message, type, timeout ) {
      console.log( message );
      messg( message, type, timeout );
    }

    var delay = 1500;
    this.Loader.onProgress = function( item, loaded, total ) {
      log( 'Loaded ' + loaded + '/' + total + ':' + item, 'info', delay );
    };
    this.Loader.onLoad = function () {
      log( 'Loaded.', 'success', delay );
    };
    this.Loader.onError = function () {
      log( 'Loading error.', 'error', delay );
    };

    this.ms_ImageLoader = new THREE.ImageLoader( this.Loader );
  },

	InitializeScene : function InitializeScene() {

		// Add light
		this.mainDirectionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
		this.mainDirectionalLight.position.set( -0.2, 0.5, 1 );
		this.scene.add( this.mainDirectionalLight );

		// Add Black Pearl
		var loader = new THREE.OBJMTLLoader( this.Loader );
		this.blackPearl = null;
		loader.load( 'models/BlackPearl/BlackPearl.obj', 'models/BlackPearl/BlackPearl.mtl', function ( object ) {
			object.position.y = 20.0;
			if( object.children ) {
				for( child in object.children ) {
					object.children[child].material.side = THREE.DoubleSide;
				}
			}

			DEMO.blackPearlShip.add( object );
			DEMO.blackPearl = object;
		} );

		// Add rain
		{
			var size = 128;
      var rainTexture = new THREE.Texture();
      rainTexture.generateMipmaps = false;
      rainTexture.magFilter = THREE.LinearFilter;
      rainTexture.minFilter = THREE.LinearFilter;
      this.ms_ImageLoader.load( 'img/water-drop.png', function ( image ) {
          rainTexture.image = image;
          rainTexture.needsUpdate = true;
      } );

      var rainShader = THREE.ShaderLib['rain'];

			var rainMaterial = new THREE.ShaderMaterial({
        fragmentShader: rainShader.fragmentShader,
        vertexShader: rainShader.vertexShader,
        uniforms: rainShader.uniforms,
				transparent: true,
				depthWrite: false
			});
      rainMaterial.uniforms.texture.value = rainTexture;

			this.rainGeometry = new THREE.Geometry();
			for ( i = 0; i < 100; i++ )
			{
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 2.0 * size - size;
				vertex.y = Math.random() * 2.0 * size - size;
				vertex.z = Math.random() * size - size * 0.5;
				this.rainGeometry.vertices.push( vertex );
			}
			this.rain = new THREE.PointCloud( this.rainGeometry, rainMaterial );
			this.camera.add( this.rain );
			this.rain.position.setZ( - size * 0.75 ) ;
		}

		// Initialize Clouds
		this.cloudShader = new CloudShader( this.renderer );
		this.cloudShader.cloudMesh.scale.multiplyScalar( 4.0 );
		this.scene.add( this.cloudShader.cloudMesh );

		// Initialize Ocean
		var gsize = 512;
		var res = 512;
		var gres = 256;
		var origx = -gsize / 2;
		var origz = -gsize / 2;
		this.ocean = new THREE.Ocean( this.renderer, this.camera, this.scene,
		{
			INITIAL_SIZE : 200.0,
			INITIAL_WIND : [ 10.0, 10.0 ],
			INITIAL_CHOPPINESS : 3.6,
			CLEAR_COLOR : [ 1.0, 1.0, 1.0, 0.0 ],
			SUN_DIRECTION : this.mainDirectionalLight.position.clone(),
			OCEAN_COLOR: new THREE.Vector3( 0.35, 0.4, 0.45 ),
			SKY_COLOR: new THREE.Vector3( 10.0, 13.0, 15.0 ),
			EXPOSURE : 0.15,
			GEOMETRY_RESOLUTION: gres,
			GEOMETRY_SIZE : gsize,
			RESOLUTION : res
		} );

		this.LoadSkyBox();
		this.LoadMountains();
	},


	LoadMountains : function LoadSkyBox() {

		var demo = this;

    var mountainTexture = new THREE.Texture();
    mountainTexture.generateMipmaps = false;
    mountainTexture.magFilter = THREE.LinearFilter;
    mountainTexture.minFilter = THREE.LinearFilter;
    this.ms_ImageLoader.load( 'img/mountains.png', function ( image ) {
        mountainTexture.image = image;
        mountainTexture.needsUpdate = true;
    } );


		var mountainsMaterial = new THREE.MeshBasicMaterial( {
			map: mountainTexture,
			transparent: true,
			side: THREE.BackSide,
			depthWrite: false
		} );

		var addMountain = function addMountain( size ) {

			var moutains = new THREE.Mesh(
				new THREE.CylinderGeometry( size, size, 35000, 32, 1, true ),
				mountainsMaterial
			);
			moutains.position.y = 10000;
			demo.scene.add( moutains );

		} ;

		// Add twice with different size in order to avoid some artifacts on the reflection
		addMountain( 120000 );
		addMountain( 150000 );

		// Add a black cylinder to hide the skybox under the water
		var cylinder = new THREE.Mesh(
			new THREE.CylinderGeometry( 150000, 150000, 150000, 32, 1, true ),
			new THREE.MeshBasicMaterial( { color: "0xffffff", side: THREE.BackSide } )
		);
		cylinder.position.y = -80000;
		demo.scene.add( cylinder );

	},

	LoadSkyBox : function LoadSkyBox() {

		var cubeShader = THREE.ShaderLib['cube'];

		var skyBoxMaterial = new THREE.ShaderMaterial( {
			fragmentShader: cubeShader.fragmentShader,
			vertexShader: cubeShader.vertexShader,
			uniforms: cubeShader.uniforms,
			side: THREE.BackSide
		} );

		this.skyBox = new THREE.Mesh(
			new THREE.BoxGeometry( 450000, 450000, 450000 ),
			skyBoxMaterial
		);

		this.scene.add( this.skyBox );

    // https://stackoverflow.com/questions/3552944/how-to-get-the-anchor-from-the-url-using-jquery
    var url = window.location.href, idx = url.indexOf("#");
    var anchor = idx != -1 ? url.substring(idx+1) : null;
    var environmentParameter = anchor;

    if( environmentParameter !== null ) {
      this.environment = environmentParameter;
    }

		this.UpdateEnvironment( this.environment );

	},

	UpdateEnvironment : function UpdateEnvironment( key ) {

		var textureName = '';
		var textureExt = ".jpg";
		var directionalLightPosition = null;
		var directionalLightColor = null;
		var raining = false;

		if(key == "night"){
			textureName = 'grimmnight';
			directionalLightPosition = new THREE.Vector3( -0.3, 0.3, 1 );
			directionalLightColor = new THREE.Color( 1, 1, 1 );
			raining = true;
		}

		this.environment = key;
		this.raining = raining;
		this.mainDirectionalLight.position.copy( directionalLightPosition );
		this.mainDirectionalLight.color.copy( directionalLightColor );
		this.ocean.materialOcean.uniforms.u_sunDirection.value.copy( this.mainDirectionalLight.position );

    var background = [
			'img/' + textureName + '_west' + textureExt,
			'img/' + textureName + '_east' + textureExt,
			'img/' + textureName + '_up' + textureExt,
			'img/' + textureName + '_down' + textureExt,
			'img/' + textureName + '_south' + textureExt,
			'img/' + textureName + '_north' + textureExt
		];

    var images = [];

    var cubeMap = new THREE.CubeTexture( images );
    cubeMap.flipY = false;

    var imageLoader = this.ms_ImageLoader;
    var loaded = 0;
    var loadTexture = function ( i ) {
      imageLoader.load( background[ i ], function ( image ) {
        cubeMap.images[ i ] = image;
        loaded ++;
        if ( loaded === 6 ) {
          cubeMap.needsUpdate = true;
        }
      } );

    }

    for ( var i = 0, il = background.length; i < il; ++ i ) {
      loadTexture( i );
    }

		cubeMap.format = THREE.RGBFormat;
    cubeMap.generateMipmaps = false;
    cubeMap.magFilter = THREE.LinearFilter;
    cubeMap.minFilter = THREE.LinearFilter;

		this.skyBox.material.uniforms['tCube'].value = cubeMap;
	},

	Display : function () {

		this.renderer.render( this.scene, this.camera );

	},

	Update : function () {

		var currentTime = new Date().getTime();
		this.ocean.deltaTime = ( currentTime - lastTime ) / 1000 || 0.0;
		lastTime = currentTime;


		// Update rain
		if( this.raining ) {
			var seed = 1;
			var fastRandom = function fastRandom() {
				// https://stackoverflow.com/questions/521295/javascript-random-seeds
				var x = Math.sin( seed++ ) * 10000;
				return x - Math.floor( x );
			}
			for( i in this.rainGeometry.vertices )
			{
				var speed = 4.0;
				this.rainGeometry.vertices[i].y -= fastRandom() * speed + speed;
				if( this.rainGeometry.vertices[i].y < -50 )
					this.rainGeometry.vertices[i].y = 50;
			}
			this.rain.rotation.set( -this.camera.rotation.x, -this.camera.rotation.y, -this.camera.rotation.z, "ZYX" );
			this.rainGeometry.verticesNeedUpdate = true;
		}

		// Render ocean reflection
		this.camera.remove( this.rain );
		this.ocean.render();
		if( this.raining )
			this.camera.add( this.rain );

		// Updade clouds
		this.cloudShader.update();

		// Update ocean data
		this.ocean.update();

		this.controls.update();
		this.Display();

	},


	Resize : function ( inWidth, inHeight ) {

		this.camera.aspect = inWidth / inHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( inWidth, inHeight );
		this.Display();

	}
};
