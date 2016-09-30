  (function () {
    'use strict';
    angular
    .module('App-ai.Dashboard')
    .controller('DashboardCtrl',DashboardCtrl)
    .directive('input',input);

    function DashboardCtrl($scope, $rootScope, $timeout, $ionicScrollDelegate) {

		var self = this;

		//Var Definitoons
      self.msg;
      self.response = {};
      self.isPizzaBot = false;
      self.messages = [];


		//Method Definitions
      self.sendMessage = sendMessage;
      self.switchRecognition = switchRecognition;
      self.inputUp = inputUp;
      self.inputDown = inputDown;
      self.closeKeyboard = closeKeyboard;
		  self.record = record;
      self.showRoute = showRoute;

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
			recognition.onresult = function(event) {
				var text = "";
			    for (var i = event.resultIndex; i < event.results.length; ++i) {
			    	text += event.results[i][0].transcript;
			    }
			    self.msg = text;
			    $scope.$apply();
			    sendMessage();
				stopRecognition();
			};
			recognition.onend = function() {
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
			if(!isBrowser){
				var recognition = new SpeechRecognition();
				recognition.onresult = function(event) {
					if (event.results.length > 0) {
						self.msg = event.results[0][0].transcript;
						$scope.$apply();
						sendMessage();
					}
				};
				recognition.start();
			}else{ //Browser
				switchRecognition();
			}

		};

		if(navigator.userAgent.match(/iPad/i)){ //For emulator
	        self.isTablet = true;
	        if(window.innerHeight > window.innerWidth){
	        	self.isPortrait = true;
	        }
	    } else {
	        self.isTablet = window.isTablet; //uk.co.workingedge.phonegap.plugin.istablet PLUGIN for real device
	        if(window.innerHeight > window.innerWidth){
	        	self.isPortrait = true;
	        }
	    }


	    function sendMessage(){

	    	console.log(self.msg);
	    	self.isRecording = false;
	    	self.messages.push({from:'me',text:self.msg});
	    	var messageToSend = self.msg;
	    	self.msg="";
	    	var baseUrl = "https://api.api.ai/v1/";
	    	var accessToken = self.isPizzaBot ? "bdb08eb40e174ec69b681f273037e3d6" : "758a10f0e8e848d488fadd9082ac6f78";
	        $.ajax({
				type: "POST",
				url: baseUrl + "query?v=20150910",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				headers: {
					"Authorization": "Bearer " + accessToken
				},
				data: JSON.stringify({ q: messageToSend, lang: "en" }),
				success: function(data) {
					setResponse(JSON.stringify(data, undefined, 2));
				},
				error: function() {
					setResponse("Internal Server Error");
				}
			});

	    }
	    function setResponse(val) {
			console.log("SUCCESS:" + val);


			$scope.$evalAsync(function(){
				var response = JSON.parse(val).result;
				if(response.action){
					switch (response.action){
						case 'nearOffices': getNearOffices(response);
						break;
						case 'showContacts': getContacts(response);
						break;
					}
				}else{
					printResponse(response,'noAction');
				}

            });
		}

		function getNearOffices(response){
			var offices = JSON.parse(response.fulfillment.data).result;
			response.data =  offices;
			printResponse(response,'office');
		}

		function getContacts(response){

		}

		function printResponse(response, action){
			if(action !== 'noAction'){
				self.messages.push({from:'bot',text:response.fulfillment.speech, data:response.data, type:action });
			}else{
        self.messages.push({from:'bot',text:response.fulfillment.speech});
      }
      $ionicScrollDelegate.scrollBottom(true);
		}

		function inputUp() {
		    if (isIOS) $scope.data.keyboardHeight = 216;
		    $timeout(function() {
		      $ionicScrollDelegate.scrollBottom(true);
		    }, 300);

		  };

		function inputDown() {
		    if (isIOS) $scope.data.keyboardHeight = 0;
		    $ionicScrollDelegate.resize();
		    $timeout(function() {
		    	$ionicScrollDelegate.scrollBottom(true);
			});
		  };

		 function closeKeyboard() {
		    cordova.plugins.Keyboard.close();
		  };

      function showRoute(dest) {

        var destCoord = dest.latitude + ',' + dest.longitude;
        /*$cordovaInAppBrowser.open('https://www.google.es/maps/dir/' + self.position.center + '/' + destCoord, '_system', {}).then(function(event) {
          // success
        }).catch(function(event) {
          // error
        });*/
      }
	}

	function input($timeout) {
	  return {
	    restrict: 'E',
	    scope: {
	      'returnClose': '=',
	      'onReturn': '&',
	      'onFocus': '&',
	      'onBlur': '&'
	    },
	    link: function(scope, element, attr) {
	      element.bind('focus', function(e) {
	        if (scope.onFocus) {
	          $timeout(function() {
	            scope.onFocus();
	          });
	        }
	      });
	      element.bind('blur', function(e) {
	        if (scope.onBlur) {
	          $timeout(function() {
	            scope.onBlur();
	          });
	        }
	      });
	      element.bind('keydown', function(e) {
	        if (e.which == 13) {
	          if (scope.returnClose) element[0].blur();
	          if (scope.onReturn) {
	            $timeout(function() {
	              scope.onReturn();
	            });
	          }
	        }
	      });
	    }
	  }
	}
})();