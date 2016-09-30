(function () {
  'use strict';

  angular
    .module('App-ai.Dashboard')
    .directive("statementMapImg", statementMapImg);


  /**
   * @ngdoc directive
   * @name DBank.Statements.statementMapImg:statementMapImg
   *
   * @description
   * Create static Google map with geolocalized P2P movements and put this image in the header of dashboard screen
   *
   */
  function statementMapImg() {
    return {
      link: function ($scope, element, attr) {
        console.log("STATEMENTS MAP");

        var zoom = 17;
        var icon = "http://i.imgur.com/3T0M6gJ.png";

        //var src = get_static_style(mapStyle);

        //var markersText = '|41.444024,2.230580';
        console.log(attr);
        var markersText = "|" + attr.coordinates;
        var center = attr.coordinates;

        var mapSrc = "https://maps.googleapis.com/maps/api/staticmap?center=" + center + "&zoom=" + zoom + "&format=png&sensor=false&size=700x400&maptype=roadmap&markers=icon:" + icon + markersText;
        mapSrc = mapSrc.replace(/[\s]/g, ''); //delete spaces


        element.css({
          'background-image': 'url(' + mapSrc + ')',
          'background-size': 'cover',
          'background-position': '50% 0px',
          'background-repeat': 'no-repeat'
        });

        console.log(element);
      }
    };
  }

})();
