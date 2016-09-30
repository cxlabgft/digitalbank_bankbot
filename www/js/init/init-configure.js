(function (angular) {
    'use strict';

    angular
    .module('App-ai')
    .config(function (
        $ionicConfigProvider) {
          $ionicConfigProvider.tabs.position('bottom'); //Force tab navigation to bottom 
          if(!ionic.Platform.isIOS()){
	            $ionicConfigProvider.scrolling.jsScrolling(true);
	        }
    });
})(window.angular);
