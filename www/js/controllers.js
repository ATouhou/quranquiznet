/****
* Copyright (C) 2011-2016 Quran Quiz Net 
* Tarek Eldeeb <tarekeldeeb@gmail.com>
* License: see LICENSE.txt
****/

angular.module('starter.controllers', [])
.controller('ahlanCtrl', function($scope, Utils) {
	Utils.log('Ahlan to Quran Quiz Net!');
})
.controller('quizCtrl', function($scope, $stateParams, $ionicLoading, Q, $q, $ionicPopup, $ionicModal, DBA, Utils, Profile, Questionnaire) {
	var shuffle;
	$scope.round = 0;
	$scope.showingBackCard = false;
	$scope.busy = true;
	$scope.imageSrc = 'http://images.qurancomplex.gov.sa/publications/04_standard1/750/jpg_90/0011.jpg';
	var qquestion = document.getElementById('qquestion');
	$scope.busyShow = function(){ $ionicLoading.show({template: '<ion-spinner></ion-spinner>'}); }
	$scope.busyHide = function(){ $ionicLoading.hide(); }
	$ionicModal.fromTemplateUrl('image-modal.html', {
						scope: $scope,      animation: 'slide-in-up'
					}).then(function(modal) {
						$scope.modal = modal;
					});
	$scope.openModal = function() {	$scope.modal.show();};
	$scope.closeModal = function() {$scope.modal.hide();};
	$scope.$on('$destroy', function() {	$scope.modal.remove();});
			
		
		
	$scope.updateScore = function(){
		if ($scope.score == null){
			$scope.score = Profile.getScore();
		} else {
			animateScore(Profile.getScore());
		}
		$scope.score_up 	= Questionnaire.getUpScore();
		$scope.score_down 	= Questionnaire.getDownScore();
	}
		
	$scope.nextQ = function(start){
		$scope.busy = true;
	 	if(!$scope.showingBackCard) $scope.busyShow();
		Questionnaire.createNextQ(parseInt(start))
		.then(function(){
			$scope.round = 0;
			shuffle = Utils.randperm(5);
			$scope.question = Questionnaire.qo.txt.question;
			$scope.options = Utils.shuffle(Questionnaire.qo.txt.op[$scope.round], shuffle);
      $scope.instructions = Questionnaire.qo.qType.txt;
			$scope.busy = false;
			$scope.busyHide();
			setTimeout(function() {Profile.saveAll();},100); //Note: Remove to debug the lastly saved question
		});
	}
	$scope.getAnswer = function(){
		$scope.answer       = Questionnaire.qo.txt.answer + ' ...';
		$scope.answer_sura  = Utils.getSuraNameFromWordIdx(Questionnaire.qo.startIdx);
        $scope.answer_sura_info = Utils.getSuraTanzilFromWordIdx(Questionnaire.qo.startIdx)+
                                    ' اياتها ' + Utils.sura_ayas[Utils.getSuraIdx(Questionnaire.qo.startIdx)];
		Q.ayaNumberOf(Questionnaire.qo.startIdx).then(function(res){$scope.answer_aya  = res;});
	}
	$scope.skipQ = function(){
		Profile.addIncorrect(Questionnaire.qo);
		$scope.nextQ();
		$scope.updateScore();
	}
	$scope.makeSequence = function(n){return Utils.makeSequence(n);}
	$scope.selectOption = function(sel) {	
		if (shuffle[sel] != 0){ 								// Bad Choice
			$scope.getAnswer();
			$scope.flip();
			Profile.addIncorrect(Questionnaire.qo);
			$scope.nextQ();
			$scope.updateScore();
			return;
		}else if( ++$scope.round == Questionnaire.qo.rounds){ 	// Correct Finish
			Profile.addCorrect(Questionnaire.qo);
			$scope.busyShow();
			$scope.nextQ();
			$scope.updateScore();
			return;			
		} else {												// Proceed with rounds
			$scope.question = $scope.question + ' ' + $scope.options[sel];
			shuffle = Utils.randperm(5);
			$scope.options = Utils.shuffle(Questionnaire.qo.txt.op[$scope.round], shuffle);
			setTimeout(function() {qquestion.scrollLeft = 0},10);
			//setTimeout(function() {qquestion.animate({scrollLeft :0},800);},10);	
		}
	}
	
	$scope.flip = function(){
		$scope.showingBackCard = true;
		angular.element(document.getElementById('flip-container')).toggleClass('flip')
	}
	$scope.flipBack = function(){
		$scope.flip();
		$scope.showingBackCard = false;
		if($scope.busy)  $scope.busyShow();
	}
	function animateScore(count)
	{
	  var stepsCount = Math.abs(count - parseInt($scope.score)) ,
		  step = (count > parseInt($scope.score))?1:-1,
		  run_count = 0;
	  
	  var int = setInterval(function() {
		if(run_count++ < stepsCount){
		  $scope.score += step;
		} else {
		  clearInterval(int);
		}
	  }, 50);
	}
	$scope.reportQuestion = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'الابلاغ عن خطأ',
       template: 'هل تريد الابلاغ عن خطأ في السؤال؟'
     });
     confirmPopup.then(function(res) {
       if(res) {
         console.log('Reporting question:');
				 //TODO: Implement
       } else {
         console.log('Report cancelled');
       }
     });
   };
	$scope.nextQ($stateParams.customStart);
	$scope.updateScore();
})

/**
* All below services are for demo purposes!
* You may ignore for now.
*/
.controller('google', function ($rootScope, $scope, googleLogin, Utils, Profile) {
	$rootScope.social = Profile.social;
	Utils.log(JSON.stringify($rootScope.social));	
	$scope.login = function () {
		var promise = googleLogin.startLogin();
		promise.then(function (data) {
			$rootScope.social.type = 'google';
			$rootScope.social.data = data;
			Profile.saveSocial($rootScope.social);
			Utils.log(JSON.stringify(data));
		}, function (data) {
			Utils.log(JSON.stringify(data));
		});
	}
	$scope.logout = function () {
			/** Just delete the token and data locally */
			$rootScope.social.type = {};
			$rootScope.social.data = {};
			Profile.saveSocial($rootScope.social);
	}	
})

.controller('settingsCtrl', function($scope, Profile) {
  $scope.profile = Profile;
  $scope.saveSettings = function(){
	Profile.saveSettings();
  }
})

.controller('StudyCtrl', function($scope, Profile, Utils) {
  $scope.profile = Profile;
  $scope.saveParts = function(){
	//TODO: Validate selected quantity!
	Profile.saveParts();
}
  $scope.toggleParts = function(){
    var tog = ($scope.profile.parts[1].checked === false);
	for(var i=1;i<$scope.profile.parts.length;i++){
		$scope.profile.parts[i].checked = tog; 
	}
	$scope.saveParts();
  };
  
  $scope.getIcon = function(part){
	var ico = 'ion-help-circled stable';
	if(Utils.countedScore(part.numQuestions) > 0){
		var ratio = Utils.countedScore(part.numCorrect)/Utils.countedScore(part.numQuestions);
		if(ratio>=0.8)
			ico = 'ion-heart balanced';
		else if(ratio>=0.5)
			ico = 'ion-heart-broken energized';
		else 	
			ico = 'ion-flag assertive';
	}
	return ('icon '+ico);
  }
});
