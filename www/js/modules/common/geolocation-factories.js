(function (angular) {
  'use strict';

  angular
    .module('App-ai.Dashboard')
    .factory('GPSFactory', GPSFactory)
    .service('GPSService', GPSService)
    .factory('GetNearestBranchesFactory', GetNearestBranchesFactory);

  /**
   * @ngdoc service
   * @name DBank.Initialize.GPSFactory:GPSFactory
   * @description
   * Factory for GPS methods
   * @requires  $q
   * @requires  $window
   */
  function GPSFactory($q, $cordovaGeolocation) {

    /**
     * @ngdoc method
     * @name getLocation
     * @methodOf DBank.Initialize.GPSFactory:GPSFactory
     * @description
     * Gets the current device location coordinates.
     *
     * @returns {Object} A promise with an object having the response (current location info)
     */
    var getLocation = function () {
      var deferred = $q.defer();


      var posOptions = {timeout: 30000};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          console.log("NEW LOCATION");
          console.log(position);
          deferred.resolve(position);


        }, function (error) {
          console.log("ERROR GETTING CURRENT POSITION");
          console.log(error.message);
          deferred.reject(error);

        });

      return deferred.promise;
    };

    return {
      getLocation: getLocation
    };
  }

  /**
   * @ngdoc service
   * @name DBank.Initialize.GPSService:GPSService
   * @description
   * Service for GPS methods
   * @requires  $q
   * @requires  GPSFactory
   * @requires  $ionicLoading
   * @requires  $ionicPopup
   */
  function GPSService($q, GPSFactory, $ionicLoading, $ionicPopup) {
    /* METHODS DEFINITION */
    this.getCurrentLocation = getCurrentLocation;
    this.getMapOptions = getMapOptions;

    var mapOptions = {
      center: '48.151558,2.077962'
    };


    /**
     * @ngdoc method
     * @name getCurrentLocation
     * @methodOf DBank.Initialize.GPSFactory:GPSFactory
     * @description
     * Gets the current device location coordinates.
     *
     * @returns {Object} A promise with an object having the response (current location info)
     */
    function getCurrentLocation() {
      var d = $q.defer();

      GPSFactory.getLocation().then(
        function (position) {
          mapOptions = {
            center: position.coords.latitude + ', ' + position.coords.longitude
          };
          d.resolve(position);
        },
        function (error) {

          console.log("GPS ERROR: ");
          console.log(error);
          showAlert("Unable to obtain your position. Please make sure GPS is enabled and the application has permissions to use it");
          d.reject({});
        }
      );

      return d.promise;

    }

    /**
     * @ngdoc method
     * @name showAlert
     * @methodOf DBank.Initialize.GPSService:GPSService
     * @description
     * Show an alert dialog
     *
     * @param {String} contentText Text to show in the alert(popup)
     */
    function showAlert(contentText) {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
        title: 'Warning!',
        cssClass: 'popupStyle',
        template: contentText
      });
      alertPopup.then(function () {
        console.log('Ok');
      });
    }


    function getMapOptions() {
      return mapOptions;
    }
  }


  /**
   * @ngdoc service
   * @name DBank.Initialize.GetNearestBranchesFactory:GetNearestBranchesFactory
   * @description
   * Factory to get the NearestBranches and update the view
   * @requires  $rootScope
   * @requires  BranchesFactory
   * @requires  GPSService
   */
  function GetNearestBranchesFactory($rootScope, BranchesFactory, GPSFactory) {

    var subscribers = [];

    /**
     * @ngdoc method
     * @name getNearestBranches
     * @methodOf DBank.Initialize.GetNearestBranchesFactory:GetNearestBranchesFactory
     * @descriptiondescription
     * Get the nearestBranches and call callback
     *
     * @param {Object} coordinates Current device location coordinates
     */
    var getNearestBranches = function (coordinates) {
      BranchesFactory.getNearestBranches(coordinates).then(
        function (data) {
          //GPSFactory.stopLocation();
          console.log('GET NEAREST BRANCHES');
          console.log(data);
          $rootScope.$evalAsync();
          subscribers.forEach(function (callback) {
            callback(data.result);
          });

        },
        function (error) {
          //GPSFactory.stopLocation();
          console.log('GET NEAREST BRANCHES ERROR');
          console.log(error);
        }
      );
    };

    var factory = {
      status: null,
      onChange: function (callback) {
        subscribers.push(callback);
      },
      getNearestBranches: getNearestBranches
    };

    return factory;
  }


})(window.angular);
