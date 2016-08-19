
var JunnieJobs_Navi = (function(window) {

	'use strict';

	function init(){
     $(document).on("keydown",handleKeyDown);
     $(document).on("keyup",handleKeyUp);
	}

  function handleKeyDown(event) {

				if (event.keyCode === 38) {
					window.moveFront = true;
				}

				if(event.keyCode === 40){
						window.moveBack = true;
				}

				if(event.keyCode === 37){
					window.moveLeft = true;
				}

				if(event.keyCode === 39){
					window.moveRight = true;
				}

				if(event.keyCode === 70){
					window.moveUp = true;
				}

				if(event.keyCode === 68){
					window.moveDown = true;
				}
        }

  function handleKeyUp(event) {
  				if (event.keyCode === 38) {
  					window.moveFront = false;
  				}

  				if(event.keyCode === 40){
  						window.moveBack = false;
  				}

  				if(event.keyCode === 37){
  					window.moveLeft = false;
  				}

  				if(event.keyCode === 39){
  					window.moveRight = false;
  				}

  				if(event.keyCode === 70){
  					window.moveUp = false;
  				}

  				if(event.keyCode === 68){
  					window.moveDown = false;
  				}
}

	return {
		"init" : init
	}

})(window);

$(function(){
	JunnieJobs_Navi.init();
});
