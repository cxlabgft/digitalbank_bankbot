'use strict';
angular.module('App-ai')
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive


    .state('tutorial', {
      url: '/tutorial',
      templateUrl: 'templates/tutorial.html',
      controller: 'TutorialController',
      controllerAs: 'tutorialCtrl'
    })

    .state('onboarding', {
      url: '/onboarding',
      abstract: true,
      template: '<ion-nav-view></ion-nav-view>'
    })

    .state('onboarding.signup-f', {
      url: '/onboarding',
      template: ''
    })

    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashboardCtrl as dash'
      }
    }
  })

  .state('tab.activity', {
    url: '/activity',
    views: {
      'tab-activity': {
        templateUrl: 'templates/tab-activity.html',
        controller: 'ActivityCtrl as activity'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tutorial');

});
