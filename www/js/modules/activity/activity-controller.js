(function () {
    'use strict';
    angular
    .module('App-ai.Activity')
    .controller('ActivityCtrl',ActivityCtrl);

    function ActivityCtrl($scope) {

		var self = this;
		self.activityText = 'Test';
	}


})();
