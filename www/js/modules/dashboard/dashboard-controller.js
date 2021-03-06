(function () {
  'use strict';
  angular
    .module('App-ai.Dashboard')
    .controller('DashboardCtrl', DashboardCtrl);


  function DashboardCtrl($scope, $rootScope, $timeout, $ionicScrollDelegate, iBeaconsService, $cordovaBeacon, $cordovaGeolocation, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicPopup, IonicClosePopupService) {

    var self = this;

    //Var Definitoons
    self.response = {};
    self.messages = [];
    self.activeIndex = 0;
    self.msg = "";
    self.expand=false;
    self.optionsSlider = {
      loop: false,
      speed: 500,
      pagination: false
    };
    self.isRecording = false;
    self.messageIntercepted = false;
    self.voiceMsg = "";

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
      // note: the indexes are 0-based
      self.activeIndex = data.slider.activeIndex;
      $scope.$apply();
      $scope.previousIndex = data.slider.previousIndex;
    });

    self.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };


    //Method Definitions
    self.sendMessage = sendMessage;
    self.switchRecognition = switchRecognition;
    self.inputUp = inputUp;
    self.inputDown = inputDown;
    self.closeKeyboard = closeKeyboard;
    self.record = record;
    self.showRoute = showRoute;
    self.reproduceMessage = reproduceMessage;
    self.changeSlide = changeSlide;
    self.showInfo = showInfo;
    self.showRecordPopup = showRecordPopup;
    self.recordVoice = recordVoice;
    self.trash = trash;

    var recognition;
    var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
    var isAndroid = ionic.Platform.isWebView() && ionic.Platform.isAndroid();
    var isBrowser = false; //cordova-plugin-device





    /*GPSService.getCurrentLocation().then(function(data){
     self.position = data;
     },function(error){
     console.log("Error");
     });*/

    function startRecognition() {
      recognition = new webkitSpeechRecognition();
      /*recognition.onstart = function(event) {
       updateRec();
       };*/
      recognition.onresult = function (event) {
        var text = "";
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        self.voiceMsg = text;
        console.log(self.voiceMsg);
        self.messageIntercepted = true;
        self.isRecording = false;
        $scope.$apply();
        stopRecognition();
      };
      recognition.onend = function () {
        stopRecognition();
      };
      recognition.lang = "en-US";
      recognition.start();
    }

    function stopRecognition() {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
      //updateRec();
    }

    function switchRecognition() {
      if (recognition) {
        stopRecognition();
      } else {
        startRecognition();
      }
    }



    function record() {
      self.isRecording = true;
      if (!isBrowser) {
        var recognition = new SpeechRecognition();
        recognition.onresult = function (event) {
          if (event.results.length > 0) {
            self.voiceMsg = event.results[0][0].transcript;
            self.isRecording = false;
            self.messageIntercepted = true;
            $scope.$apply();
          }
        };
        recognition.start();
      } else { //Browser
        switchRecognition();
      }

    };

    if (navigator.userAgent.match(/iPad/i)) { //For emulator
      self.isTablet = true;
      if (window.innerHeight > window.innerWidth) {
        self.isPortrait = true;
      }
    } else {
      self.isTablet = window.isTablet; //uk.co.workingedge.phonegap.plugin.istablet PLUGIN for real device
      if (window.innerHeight > window.innerWidth) {
        self.isPortrait = true;
      }
    }

    function resetRecordValues(){
      $scope.$evalAsync(function () {
        self.msg = "";
        self.isRecording = false;
        self.voiceMsg = "";
        self.messageIntercepted = false;
      });
    }

    function sendMessage() {
      console.log(self.msg);
      if(self.voiceMsg !== ""){
        self.msg = self.voiceMsg;
        self.confirmPopup.close();
      }
      self.messages.push({from: 'me', text: self.msg});
      var messageToSend = self.msg;
      self.msg = "";
      var baseUrl = "https://api.api.ai/v1/";
      var accessToken = "758a10f0e8e848d488fadd9082ac6f78";
      $.ajax({
        type: "POST",
        url: baseUrl + "query?v=20150910",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Bearer " + accessToken
        },
        data: JSON.stringify({q: messageToSend, lang: "en"}),
        success: function (data) {
          setResponse(data);
        },
        error: function () {
          setResponse("Internal Server Error");
        }
      });

    }

    function setResponse(val) {

      resetRecordValues();
      console.log("SUCCESS:" + val);


      $scope.$evalAsync(function () {
        var response = val.result;
        if (response.action) {
          switch (response.action) {
            case 'nearOffices':
              getNearOffices(response);
              break;
            case 'showContacts':
              getContacts(response);
              break;
            case 'getExchange':
              getExchange(response);
              break;
            default:
              printResponse(response, 'noAction');
              break;
          }
        } else {
          printResponse(response, 'noAction');
        }

      });
    }

    function getNearOffices(response) {
      var offices = response.fulfillment.data.result;
      response.data = offices;
      printResponse(response, 'office');
    }

    function getContacts(response) {

    }

    function getExchange(response){ // Currency exchange rate euro to dollar
      var data = response.fulfillment.data;
      response.data={source:data.result.source,currencies:data.result.quotes};
      printResponse(response,data.type);
    }

    function printResponse(response, action) {
      if (action !== 'noAction') {
        self.messages.push({from: 'bot', text: response.fulfillment.speech, data: response.data, type: action});
      } else {
        self.messages.push({from: 'bot', text: response.fulfillment.speech});
      }
      $ionicScrollDelegate.scrollBottom(true);
    }

    function inputUp() {
      if (isIOS) $scope.data.keyboardHeight = 216;
      $timeout(function () {
        $ionicScrollDelegate.scrollBottom(true);
      }, 300);

    };

    function inputDown() {
      if (isIOS) $scope.data.keyboardHeight = 0;
      $ionicScrollDelegate.resize();
      $timeout(function () {
        $ionicScrollDelegate.scrollBottom(true);
      });
    };

    function closeKeyboard() {
      //cordova.plugins.Keyboard.close();
    };

    function showRoute(latitude, longitude) {
      if(isBrowser){
        window.open('https://www.google.es/maps/dir/41.491488,2.0732503/' + latitude + "," + longitude, '_system');
        return
      }

      $cordovaInAppBrowser.open('https://www.google.es/maps/dir/41.491488,2.0732503/' + latitude + "," + longitude, '_system', {}).then(function (event) {
        // success
      }).catch(function (event) {
        // error
      });
    }

    function reproduceMessage(msg) {
      //https://responsivevoice.org/api/
      if (responsiveVoice.voiceSupport())
        responsiveVoice.speak(msg);
      else {
        alert("Your device not support native text to speech")
      }
    }

    function changeSlide(index){
      self.activeIndex = index;
      $scope.slider.update(false);
      $scope.slider.slideTo(index, 0, false);
    }

    function showInfo(){
      $cordovaGeolocation.getCurrentPosition().then(function(){
        $cordovaBeacon.requestAlwaysAuthorization().then(function(){
          iBeaconsService.searchBeacons();
        });
      });
    }

    function showRecordPopup(){
      $scope.$broadcast('timer-start');
        self.confirmPopup  = $ionicPopup.confirm({
          title: '',
          templateUrl: 'templates/record.html',
          cssClass:'recordPopup animated slideInUp',
          scope: $scope,
          buttons:[]
        });

        IonicClosePopupService.register(self.confirmPopup);

        recordVoice();
        $timeout(function(){
          var SW = new SiriWave({
            width: 259,
            height: 70,
            speed: 0.12,
            amplitude: 1,
            color:'#01a1b5',
            container: document.getElementById('soundwave'),
            autostart: true
          });
        },100);


        self.confirmPopup.then(function(res) {
          if(res) {
            console.log('You are sure');
          } else {
            console.log('You are not sure');
            if(recognition){recognition.stop();}
            resetRecordValues();
          }
        });

    }

    function recordVoice(){
      self.isRecording = !self.isRecording;
      if(!self.isRecording){
        if(recognition){
          recognition.stop();
        }
      }
      else{
        record();
      }

    }

    function trash(){
      self.messageIntercepted = false;
    }
  }


})();
