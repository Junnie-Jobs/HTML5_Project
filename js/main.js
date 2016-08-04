(function (
	CanvasWrapper,
	WebGLSupport
) {
	'use strict';

	var gooRunner = null;

	function setup(scene, loader) {
	}

	function init() {
		if (!checkForWebGLSupport()) { 
			return; 
		}

		// GooEngine 초기화
		initGoo();
		var world = gooRunner.world;
		var renderer = gooRunner.renderer;

		loadScene().then(function (loaderAndScene) {
			var loader = loaderAndScene.loader;
			var scene = loaderAndScene.scene;

			world.process();

			if (goo.Renderer.mainCamera) {
				renderer.checkResize(goo.Renderer.mainCamera);
			}

			return setup(scene, loader);
		}).then(function () {
			(new goo.EntityCombiner(world)).combine();
			world.process();
			return prepareMaterials();
		}).then(function () {
			show('canvas-screen');
			hide('loading-screen');
			CanvasWrapper.show();
			CanvasWrapper.resize();
			gooRunner.startGameLoop();
			renderer.domElement.focus();
		}).then(null, function (error) {
			console.error(error);
		});
	}


	//scene에서 사용되는 materials를 미리 로드한다. 
	function prepareMaterials() {
		var renderer = gooRunner.renderer;
		var renderSystem = gooRunner.world.getSystem('RenderSystem');
		var entities = renderSystem._activeEntities;
		var lights = renderSystem.lights;

		return renderer.precompileShaders(entities, lights).then(function () {
			return renderer.preloadMaterials(entities);
		})
	}


	//Goo 엔진과 모든 시스템을 초기화 한다. 
	function initGoo() {
		
		var params = {
			"alpha": false, 
			"useDevicePixelRatio": true, 
			"manuallyStartGameLoop": true, 
			"antialias": true, 
			"logo": false};
		params.logo = false 
		gooRunner = new goo.GooRunner(params);

		var stateMachineSystem = new goo.StateMachineSystem(gooRunner);
		gooRunner.world
			.add(new goo.AnimationSystem())
			.add(stateMachineSystem)
			.add(new goo.HtmlSystem(gooRunner.renderer))
			.add(new goo.Dom3dSystem(gooRunner.renderer))
			.add(new goo.TimelineSystem())
			.add(new goo.PhysicsSystem())
			.add(new goo.ColliderSystem())
			.add(new goo.ParticleSystemSystem());

		stateMachineSystem.play();
	}


	function loadScene() {
	
		var loader = new goo.DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		return loader.load('root.bundle').then(function(bundle) {
			var scene = getFirstSceneFromBundle(bundle);
			var alphaEnabled = false;

			if (alphaEnabled) {
				Object.keys(bundle)
					.filter(function(k) { return /\.skybox$/.test(k); })
					.forEach(function(k) {
						var v = bundle[k];
						v.box.enabled = false;
					});
			}

			if (!scene || !scene.id) {
				console.error('Error: No scene in bundle'); // Should never happen.
				return null;
			}

			var canvasConfig = scene ? scene.canvas : {};
			CanvasWrapper.setup(gooRunner.renderer.domElement, canvasConfig);
			CanvasWrapper.add();
			CanvasWrapper.hide();

			return loader.load(scene.id, {
				preloadBinaries: true,
				progressCallback: onLoadProgress
			})
			.then(function (scene) {
				return { scene: scene, loader: loader };
			});
		});
	}

	function getFirstSceneFromBundle(bundle) {
		function isSceneId(id) { return /\.scene$/.test(id); }

		for (var id in bundle) {
			if (isSceneId(id)) {
				return bundle[id];
			}
		}

		return null;
	}


	function onLoadProgress(handled, total) {
		var loadedPercent = (100 * handled / total).toFixed();
		document.getElementById('progress').style.width = loadedPercent + '%';
		window.postMessage({
			handled: handled, 
			total: total, 
			loadedPercent: loadedPercent}, '*')
	}

	function checkForWebGLSupport() {
		var errorObject = WebGLSupport.check();

		if (errorObject.error === WebGLSupport.ERRORS.NO_ERROR) {
			show('loading-screen');
			return true;
		} else {
			show('fallback');
			hide('loading-screen');
			return false;
		}
	}

	function show(id) {
		var classList = document.getElementById(id).classList;
		classList.add('visible');
		classList.remove('hidden');
	}

	function hide(id) {
		var classList = document.getElementById(id).classList;
		classList.remove('visible');
		window.setTimeout(function () {
			classList.add('hidden');
		}, 500);
	}

	//--------------------------------------------------------------------------

	init();
})(CanvasWrapper, WebGLSupport);