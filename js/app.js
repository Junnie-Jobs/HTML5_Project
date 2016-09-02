
var JunnieJobs_Navi = (function(window) {

	'use strict';

	function init(){
		 $('.modal-trigger').leanModal();
	}

	return {
		"init" : init
	}

})(window);

$(function(){
	JunnieJobs_Navi.init();
});
