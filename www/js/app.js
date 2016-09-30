(function(){
'use strict';

 angular.module('App-ai.Dashboard', []);
 angular.module('App-ai.Activity', []);
 
 angular.module('App-ai', [
  'ionic',
  'App-ai.Dashboard',
  'App-ai.Activity'
  ]);
})();

