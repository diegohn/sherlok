var sherlokApp = angular.module('sherlokApp', ['ngCookies']);
sherlokApp.controller('ImageUploadController',['$scope', function($scope){
	$scope.takeImage = function() {
		navigator.camera.getPicture(onSuccess, onFail, { 
			quality: 40,
    		destinationType: Camera.DestinationType.FILE_URI,
    		sourceType : Camera.PictureSourceType.CAMERA,
    		saveToPhotoAlbum: true,
    		allowEdit : false,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 250,
			targetHeight: 250 
		});
	}
}]);
sherlokApp.controller('DisplayPostsController', ['$scope', '$http' ,function($scope, $http) {
    $http.get('http://sherlok.theideapeople.net/?json=core.get_posts').success(function(data) {
    	$scope.posts = data;
    });
}]);
sherlokApp.controller('ClearCookies',['$scope' , '$cookies', '$cookieStore', function($scope, $cookies, $cookieStore){
	$scope.clearCookies = function() {
    	$cookieStore.remove('myFavorite');
  	};
}]);
sherlokApp.controller('ShowCookies',['$scope' , '$cookies', '$cookieStore', function($scope, $cookies, $cookieStore){
	$scope.cookiestored = $cookies.myFavorite;
	$scope.displayCookies = function() {
    	$scope.cookiestored = $cookies.myFavorite;
  	};
}]);
sherlokApp.controller('FormCtrl', [ '$scope' , '$http', '$cookies', function($scope, $http, $cookies){
       $scope.send = function(form) {
       		//Get nonce for create_post
			$http.get('http://sherlok.theideapeople.net?json=core.get_nonce&controller=posts&method=create_post').
				success(function(data, status, headers, config) {
					$scope.answer = data;
					$scope.status = status;
					var myNonce = data.nonce;
					var favoriteCookie = $cookies.myFavorite;
					//Validate Cookie
					$http.post('http://sherlok.theideapeople.net/?json=user.validate_auth_cookie&cookie='+favoriteCookie).
						success(function(data, status, headers, config){
							$scope.isvalid = data;
							var proceed = data.valid;
							if(proceed) {
								//Insert Post
								$http.post('http://sherlok.theideapeople.net?json=posts.create_post&cookie='+favoriteCookie+'&author=Diego&nonce='+ myNonce +'&title='+ $scope.form.title +'&content='+ $scope.form.content +'&status=publish').
									success(function(data, status, headers, config) {
										$scope.creation = data;
									}).
									error(function(data, status, headers, config) {
						  				$scope.creationerror = data.status;
						  			});
							} else {
								$scope.creationerror = 'You dont have a valid session bro!';
							}
						}).
						error(function(data, status, headers, config){
							$scope.isvalid = data;
						});
			  	}).
			  	error(function(data, status, headers, config) {

			  		$scope.answer = data.status;
			  	}
			);
		}
}]);
sherlokApp.controller('CredentialsController', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){
	$scope.send = function(form) {
		//Generate nonce for cookie
		$http.post('http://sherlok.theideapeople.net/?json=core.get_nonce&controller=user&method=generate_auth_cookie').
			success(function(data,status,headers,config) {
				$scope.nonce_one = data;
				//Generate the cookie
				$http.post('http://sherlok.theideapeople.net/?json=user.generate_auth_cookie&nonce='+data.nonce+'&username='+$scope.form.username+'&password='+$scope.form.password).
					success(function(data,status,headers,config){
						$cookies.myFavorite = data.cookie;
						$scope.cookie = data;
					}).
					error(function(data,status,headers,config){
						$scope.cookie = data;
					});
			}).
			error(function(data,status,headers,config){
				$scope.nonce_one = data;
			});
	}
}]);
sherlokApp.directive('khs', function($timeout) {
    return {
      	restrict: 'E',
      	transclude: true,
      	scope: {},
      	controller: function($scope, $element) {
        	var timeoutId;
        	$scope.seconds = 0;
        	$scope.minutes = 0;
        	$scope.hours   = 0;
        	$scope.running = false;
        	$scope.special = true;
        	var timestamp  = new Array();
	        $scope.stop = function() {
	          	$timeout.cancel(timeoutId);
	          	proccessTimer();
	          	$scope.running = false;
	          	$scope.final = false;
	          	$scope.special = true;
	        };
	        $scope.start = function() {
	          	timer();
	          	proccessTimer();
	          	$scope.running = true;
	          	$scope.special = false;

	        };
	        $scope.done = function() {
	        	$timeout.cancel(timeoutId);
	        	$scope.running = true;
	        	$scope.special = true;
	        	$scope.final   = true;
	        	proccessTimer();
	        	$scope.finaltime = calculateTotalTime();
	        };
	        $scope.clear = function() {
	          	$scope.seconds = 0;
	          	$scope.minutes = 0;
	          	$scope.hours   = 0;
	        };
	        function timer() {
	          timeoutId = $timeout(function() {
	            updateTime(); // update Model
	            timer();
	          }, 1000);
	        }
	        function updateTime() {
	          	$scope.seconds++;
	          	if ($scope.seconds === 60) {
	            	$scope.seconds = 0;
	            	$scope.minutes++;
	          	}
	          	if($scope.minutes === 60) {
	          		$scope.minutes = 0;
	          		$scope.hours++;
	          	}
	        }
	        function proccessTimer() {
	        	temp = getLocalStorage("timer");
	        	if(temp) { 
	        		temp[temp.length] = new Date();
	        		setLocalStorage(temp);
	        	} else {
	        		timestamp[timestamp.length] = new Date();
	        		setLocalStorage(timestamp);
	        	}
	        	$scope.times = getLocalStorage("timer");
	        }
	        Storage.prototype.setArray = function (key,obj) {
			    return this.setItem(key, JSON.stringify(obj));
			}
			Storage.prototype.getArray = function (key) {
			    return JSON.parse(this.getItem(key));
			}
			
	        function setLocalStorage(info) {
	        	window.localStorage.setArray("timer",info);
	        }
	        function getLocalStorage(key) {
	        	var value = window.localStorage.getArray(key);
	        	return value;
	        }
	   		function calculateTotalTime() {
	   			times = getLocalStorage("timer");
	   			var amount = times.length;
	   			var super_total = 0;
	   			differences = new Array();
	   			for(x = 0; x < amount; x += 2) {
					start = new Date(times[x]);
					end = new Date(times[x+1]);
					dif = start.getTime() - end.getTime();
					var sec_from_start_to_end = dif / 1000;
					differences[differences.length] = Math.abs(sec_from_start_to_end);
				}
				for(y = 0; y < differences.length; y++) {
					super_total = super_total + differences[y];
				}
				return toHHMMSS(super_total);
	   		}
    	},
    	template:
	        '<div class="blueborder">' +
	          	'<div>{{hours|numberpad:2}}:{{minutes|numberpad:2}}:{{seconds|numberpad:2}}</div><br/>' +
	          	'<input type="button" ng-model="startButton" ng-click="start()" ng-disabled="running" value="Start" />' +
	          	'<input type="button" ng-model="stopButton" ng-click="stop()" ng-disabled="special" value="Pause" />' +
	          	'<input type="button" ng-model="doneButton" ng-click="done()" ng-disabled="!running" value="Stop" />' +
	          	'<input type="button" ng-model="clearButton" ng-click="clear()" ng-disabled="running" value="CLEAR" />' +
	          	'<div ng-show="final" >Final Time : {{hours|numberpad:2}}:{{minutes|numberpad:2}}:{{seconds|numberpad:2}}</div>'+
	          	'<div ng-repeat="time in times"><p>{{time}}</p></div>'+
	          	'<div>Final time : <p>{{finaltime}}</p></div>'+
	        '</div>',
    	replace: true
    };
}).
filter('numberpad', function() {
	return function(input, places) {
	  	var out = "";
	  	if (places) {
		    var placesLength = parseInt(places, 10);
		    var inputLength = input.toString().length;
		  
		    for (var i = 0; i < (placesLength - inputLength); i++) {
		      out = '0' + out;
		    }
		    out = out + input;
	  	}
	  	return out;
	};
}); 
function onSuccess(imageData) {
	//Prepare File
    var imageFile = imageData;
    extractedFilename = imageFile.substr(imageFile.lastIndexOf('/')+1);
    correctedFilename = extractedFilename.split('?', 1)[0];
    //Create File Transfer Object
    var ft = new FileTransfer();                     
	var options = new FileUploadOptions();

	options.fileKey	 = "vImage1";                      
	options.fileName = extractedFilename;
	options.mimeType = "image/jpeg";  
	var params = new Object();
	params.value1 = "test";
	params.value2 = "param";                       
	options.params = params;
	options.headers = {
		Connection: "close" 
	};
	options.chunkedMode = true;
	ft.upload(imageData, "http://sherlok.theideapeople.net/wp-content/themes/twentyfifteen/sherlok.php", winning, failing, options, true);
}
function onFail(message) {
    alert('Failed because: ' + message);
}
//Helper function on success for uploadPhoto.
function winning(r3) {
	console.log(r3);
    alert("Code = " + r3.responseCode);
    alert("Response = " + r3.response);
    alert("Sent = " + r3.bytesSent);
}
//Helper function on fail for uploadPhoto.
function failing(error2) {
	console.log(error2);
    alert("An error2 has occurred: Code = " + error2.code);
    alert("upload error2 source " + error2.source);
    alert("upload error2 target " + error2.target);
}
function toHHMMSS(time){
    var sec_num = parseInt(time, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}