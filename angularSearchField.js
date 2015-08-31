(function (angular) {

	var scripts = document.getElementsByTagName("script");
	var currentScriptPath = scripts[scripts.length-1].src;

	var postHeaders = {
        'Content-Type' : 'application/json; charset=UTF-8'
    };

    function isNull(_check){
    	return !_check || _check === "";
    }

	angular.module('angular.searchField', ['ui.bootstrap', 'ngGrid'])
	.factory("$searchFieldDefaults", function(){
		var options = {
			messageInfo: function(_msg){
				alert(_msg);
			},
			processReturn: function(_ret){
				return _ret;
			},
			rootRequest: ""
		};
		var defaultsSerchs = {};

		return {
			setOptions: function(_arg){
					options = angular.extend(options, _arg);
			},
			getOptions: function(){
				return options;
			},
			getSearch: function(name){
				return defaultsSerchs[name];
			},
			addSearch: function(name, config){
				defaultsSerchs[name] = config;
			}
		}

	})
	.factory("ModalSearchFieldFactory", function($http, $searchFieldDefaults){

		var properties = {};
		var list = [];

		function excuteFind(_filter, callbackSucess){
			 $http.post($searchFieldDefaults.getOptions().rootRequest + properties.service, _filter, { headers : postHeaders }).success(function(_ret){
			 	
			 	if(callbackSucess){
			 		callbackSucess($searchFieldDefaults.getOptions().processReturn(_ret));
			 	}
			 }).error(function(error){
			 	alert(error);
			 });
		}

		return {
			setProperties: function(_prop){
				properties = _prop;
			},
			getProperties: function(){
				return properties;
			},
			excuteFind: excuteFind,
			setList: function(_list){
				list = _list;
			},
			getList: function(){
				return list;
			}
		}
	})
	.controller("ModalSearchFieldCtrl", function($scope, ModalSearchFieldFactory, $timeout, $modalInstance){

		$scope.properties = ModalSearchFieldFactory.getProperties();

		$scope.id = null;
		$scope.description = null;

	   $scope.grid = {
        	data: 'gridData',
        	multiSelect: false,
        	afterSelectionChange: function(rowItem){
        		var entity = {};
        		entity[$scope.properties.fieldId] = rowItem.entity[$scope.properties.labelId];
				entity[$scope.properties.fieldDescription] = rowItem.entity[$scope.properties.labelDescription];
        		$scope.properties.setValue(entity);
        		$modalInstance.close();
        	}
        };

        $scope.gridData = [];

        $scope.clean = function(){
        	$scope.id = null;
			$scope.description = null;
        }

        $scope.havingData = function(){
        	return $scope.gridData.length > 0;
        }

		$scope.find = function(){
			var _filter = {};

			_filter[$scope.properties.fieldId] = $scope.id;
			_filter[$scope.properties.fieldDescription] = $scope.description;

			ModalSearchFieldFactory.excuteFind(_filter, function(list){
				$scope.gridData = convertResultList(list);
			});
		}

		function convertResultList(list){
			return list.map(function(_this){
					var ret = {};
					ret[$scope.properties.labelId] = _this[$scope.properties.fieldId];
					ret[$scope.properties.labelDescription] = _this[$scope.properties.fieldDescription];
					return ret;
				});
		};

		$timeout(function(){
			var list = ModalSearchFieldFactory.getList();
			if(list && list.length > 0){
				$scope.gridData = convertResultList(list);
			}
		});

	})
	.directive('ngSearchField', function (){
		return {
			scope: {
				label: '@',
				service: '@',
				labelId: '@',
				labelDescription: '@',
				title: '@',
				fieldId: '@',
				fieldDescription: '@',
				config: '@',

				value: '='
			},
			controller: function($scope, ModalSearchFieldFactory, $modal, $searchFieldDefaults, $timeout){

				$scope.id = null;
				$scope.description = null;

				$scope.search = function(){
					openModal();
				}

				$scope.clean = function(){
					$scope.value = null;
					$scope.id = null;
					$scope.description = null;
				}

				$scope.inputBlur = function(){

					//verify if having chaging in fields
					if($scope.value != null && 
					   $scope.id == $scope.value[$scope.fieldId] && 
					   $scope.description == $scope.value[$scope.fieldDescription]){
						return;
					}

					var _filter = {};

					_filter[$scope.fieldId] = $scope.id;
					_filter[$scope.fieldDescription] = $scope.description;

					ModalSearchFieldFactory.setProperties(buildProperties());
					ModalSearchFieldFactory.excuteFind(_filter, function(list){

						if(!list  || list.length == 0){
							$searchFieldDefaults.getOptions().messageInfo("Nenhum registro encontrado");
							setValue(null);
						}else if(list.length == 1){
							setValue(list[0]);
						}else{
							openModal();
							ModalSearchFieldFactory.setList(list);
						}
					});

				};

				function openModal(){
					ModalSearchFieldFactory.setProperties(buildProperties());
					ModalSearchFieldFactory.setList(null);

					$modal.open({
					    templateUrl: 'angular_serch_field_modal.html',
					    controller: 'ModalSearchFieldCtrl',
					    size: 'lg'
					  }); 
				}

				function setValue(value){
					$scope.value = value;
					if(value){
						$scope.id = value[$scope.fieldId];
						$scope.description = value[$scope.fieldDescription];	
					}else{
						$scope.id = null;
						$scope.description = null;	
					}
					
				}

				function buildProperties(){
					var properties = { //get Configuration of 
							service: $scope.service,
							title: $scope.title,
							labelId: $scope.labelId,
							labelDescription: $scope.labelDescription,
							fieldId: $scope.fieldId,
							fieldDescription: $scope.fieldDescription,

							setValue: setValue
					};

					return properties;
				}

				function setDefaultConfig(){
					if(!isNull($scope.config)){// get configuration from default
						var dataConfig = $searchFieldDefaults.getSearch($scope.config);
						if(!dataConfig){
							alert('No having serchfield ' + $scope.config + ' configured!');
							return;
						}

						for (var key in dataConfig) {// replacing values configured in html
						  if (dataConfig.hasOwnProperty(key) ){
						  	$scope[key] = dataConfig[key];
						  }
						}
					}
				};

				$timeout(function(){
					setDefaultConfig();
				});
			},
			templateUrl: currentScriptPath.replace('angularSearchField.js', 'angularSearchField.html')
		}
	});

})(angular);