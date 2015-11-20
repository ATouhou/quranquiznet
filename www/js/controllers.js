angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Q, Utils) {
	var ii = 100;
	$scope.question = ' بسم الله الرحمن';
	$scope.options = ['الرحمن', 'الرحيم', 'الملك', 'القدوس', 'السلام'];
	$scope.selectOption = function(sel) {
		$scope.question = $scope.question + ' ' + $scope.options[sel];
		Q.txt(ii,5).then(function(op){
			$scope.options = op;
			//console.log(JSON.stringify($scope.options));
		});
		ii = ii+5;
		//console.log(Utils.modQWords(90999));
		//Q.ayaCountOfSuraAt(90).then(function(op){
		//	console.log(op);
		//});
	};
})

/**
* All below services are for demo purposes!
* You may ignore for now.
*/

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
