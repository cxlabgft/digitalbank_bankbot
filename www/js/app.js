(function(){
'use strict';

  angular.module('App-ai.Common', []);
  angular.module('App-ai.Dashboard', []);
  angular.module('App-ai.Activity', []);

 angular.module('App-ai', [
  'ionic',
   'ngCordova',
   'App-ai.Common',
  'App-ai.Dashboard',
  'App-ai.Activity'
  ]);
})();

