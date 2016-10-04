(function () {
  'use strict';

  angular
    .module('App-ai.Common')
    .factory('iBeaconsService', iBeaconsService);

  //List of Beacons Comming from Server
  var serverBeacons;


  /**
   * @ngdoc service
   * @name DBank.Initialize.iBeaconsService:iBeaconsService
   * @description
   * Trigger the search of beacons (beaconSearch)
   * @requires  RestEndPointFactory
   * @requires  $interval
   * @requires  iBeacons
   */
  function iBeaconsService(iBeaconsConfig, $cordovaBeacon, $rootScope, DeviceService, ionicUtils) {

    var isFromiBeacon = false;
    var brIdentifier = 'estimote';
    var brMajor = null;
    var brMinor = null;
    var brNotifyEntryStateOnDisplay = true;

    var self = this;
    self.uuid = '85FC11DD-4CCA-4B27-AFB3-876854BB5C3B';

    function searchBeacons() {
      console.log("SEARCH BEACONS");

      if (!iBeaconsConfig.emulator) {
        console.debug('Monitoring iBeacons');
        $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion(
          brIdentifier, self.uuid, brMajor, brMinor, brNotifyEntryStateOnDisplay
        ));
      } else {
        console.debug('iBeacons are being emulated!');
      }

    }

    function setFromiBeacon(ibeacon) {
      isFromiBeacon = ibeacon;
    }

    function getFromiBeacon() {
      return isFromiBeacon;
    }

    function stopSearching(){
      if (!iBeaconsConfig.emulator) {
        console.debug('Stop Monitoring iBeacons');
        $cordovaBeacon.stopRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion(
          brIdentifier, self.uuid, brMajor, brMinor, brNotifyEntryStateOnDisplay
        ));
      } else {
        console.debug('iBeacons are being emulated!');
      }
    }


    /**
     * @ngdoc method
     * @name checkBluetooth
     * @methodOf DBank.Initialize.iBeaconsService:iBeaconsService
     * @description
     * Check if BlueTooth is enabled
     */
    function checkBluetooth(){

      //bluetoothSerial is a variable from "cordova-plugin-bluetooth-serial"
      bluetoothSerial.isEnabled(function(isEnabled) {
          console.log("Bluetooth enabled enabled");
        },
        function(isNotEnabled) {
          if(DeviceService.isAndroid()) {
            $cordovaBeacon.enableBluetooth().then(function (success) {
              console.log("Success enabling bluetooth connection");
            }, function (error) {
              showBluetoothPopUp();
            });
          }
        });


      function showBluetoothPopUp() {
        var text = {};
        text.title = 'Warning';
        text.template = "<h4>Please turn on your Bluetooth connection</h4>";
        text.buttons = [{
          text: 'OK'
        }];
        ionicUtils.showPopUpGeneric(text, 'popupStyle');
      }
    }

    function compareBeaconDistance(a,b) {
      if (a.accuracy< b.accuracy)
        return -1;
      else if (a.accuracy> b.accuracy)
        return 1;
      else
        return 0;
    }


    /**
     * @ngdoc method
     * @name parseBeacons
     * @methodOf DBank.Initialize.iBeaconsServiceCallback:iBeaconsServiceCallback
     * @description
     * Parses the list of beacons detected in order to check if the closer one is a registered office
     * @params beacon {Array} List of beacons detected
     */
    function parseBeacons(beaconsFounded) {

      var branchBeacons=[];

      beaconsFounded = _.filter(beaconsFounded, function (beacon) {
        return beacon.accuracy >= 0;
      });

      // Sort beacons founded by distance
      beaconsFounded.sort(compareBeaconDistance);

      //Get only branch beacons and push them into branchBeacons array
      beaconsFounded.forEach(function(beacon){
        var index = _.findIndex(serverBeacons, function (serverBeacon) {
          return serverBeacon.major == beacon.major && serverBeacon.branch;
        });
        if(index !== -1){ //Branch beacon founded
          branchBeacons.push(serverBeacons[index]);
        }
      });

      if(branchBeacons.length > 0){
        console.log("¡¡¡¡¡BEACON FOUND!!!!!");
        factory.status = branchBeacons[0].office; //Get the closer one (first position)
        $rootScope.$evalAsync();
        console.log(subscribers);
        /*subscribers.forEach(function (callback) {
         callback(branchBeacons[0].office);
         });*/
        console.log(branchBeacons[0].office);
        var text = {};
        text.title = 'Congratulations';
        text.template = "<h4>You have discounts in this shop!!!</h4>";
        text.buttons = [{
          text: 'OK'
        }];
        if(showPopup){
          ionicUtils.showPopUpGeneric(text, 'popupStyle');
          iBeaconsService.stopSearching();
        }
        showPopup = false;
      }
    }

    $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function (event, pluginResult) {
      console.log("CHECKING FOR BEACONS");
      console.log(pluginResult);
      if(pluginResult.beacons.length === 0){
        console.log("BEACON NOT_VISIBLE");
      }else{
        console.log("BEACONS FOUND");
        console.log(pluginResult.beacons);
        parseBeacons(pluginResult.beacons);
      }

    });

    return {
      searchBeacons: searchBeacons,
      setFromiBeacon: setFromiBeacon,
      getFromiBeacon: getFromiBeacon,
      stopSearching: stopSearching,
      checkBluetooth: checkBluetooth
    };
  }
})();
