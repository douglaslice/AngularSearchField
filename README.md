Dependencies
============

Bootstrap => http://getbootstrap.com/ <br>
ng-grid     => https://github.com/angular-ui/ng-grid


Configure
========

1 Import the 'angularSearchField.js' script in your page. 

2 Include the module 'angular.searchField' in your angular app.

3 Include the ng-search-field directive in a text field like the examples abouve:

Example
=======

Configure just with attributes:

```xml
<div ng-search-field service="/service/list" label="My Label" 
    value="seachValue" label-id="Code" label-description="Description" 
    title="Tittle" field-id="id" field-description="name"/>
```   


Or
==

Create default search-field and instantiate by name:

  angular.module('myApp', [
    'ui.bootstrap',
    'angular.crud',
    'angular.searchField'
    ]).run(function($rootScope, $searchFieldDefaults) {
        
      $searchFieldDefaults.addSearch("myFinder", {
         service: '/service/list',
         label: "My Labe",
         title: 'Tittle',
         labelId: 'Code',
         labelDescription: Description',
         fieldId: 'id',
         fieldDescription: 'name'
      });

    });

```xml 
<div ng-search-field config="myApp" value="seachValue"/> 
```