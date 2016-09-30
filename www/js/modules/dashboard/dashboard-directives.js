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
                function get_static_style(styles) {
                    var result = [];
                    styles.forEach(function (v /*, i, a*/) {

                        var style = '';
                        if (v.stylers) { // only if there is a styler object
                            if (v.stylers.length > 0) { // Needs to have a style rule to be valid.
                                style += (v.hasOwnProperty('featureType') ? 'feature:' + v.featureType : 'feature:all') + '|';
                                style += (v.hasOwnProperty('elementType') ? 'element:' + v.elementType : 'element:all') + '|';
                                v.stylers.forEach(function (val /*, i, a*/) {
                                    var propertyname = Object.keys(val)[0];
                                    var propertyval = val[propertyname].toString().replace('#', '0x');
                                    style += propertyname + ':' + propertyval + '|';
                                });
                            }
                        }
                        result.push('style=' + encodeURIComponent(style));
                    });

                    return result.join('&');
                }

                var zoom = 16;
                var icon = "http://i.imgur.com/3T0M6gJ.png";

                var mapStyle = [{
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e9e9e9"
                    }, {
                        "lightness": 17
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }, {
                        "lightness": 20
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#ffffff"
                    }, {
                        "lightness": 17
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                        "color": "#ffffff"
                    }, {
                        "lightness": 29
                    }, {
                        "weight": 0.2
                    }]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#ffffff"
                    }, {
                        "lightness": 18
                    }]
                }, {
                    "featureType": "road.local",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#ffffff"
                    }, {
                        "lightness": 16
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }, {
                        "lightness": 21
                    }]
                }, {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#dedede"
                    }, {
                        "lightness": 21
                    }]
                }, {
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "visibility": "on"
                    }, {
                        "color": "#ffffff"
                    }, {
                        "lightness": 16
                    }]
                }, {
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#888888"
                    }, {
                        "lightness": 20
                    }]
                }, {
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "transit",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#f2f2f2"
                    }, {
                        "lightness": 19
                    }]
                }, {
                    "featureType": "administrative",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#fefefe"
                    }, {
                        "lightness": 20
                    }]
                }, {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                        "color": "#fefefe"
                    }, {
                        "lightness": 17
                    }, {
                        "weight": 1.2
                    }]
                }];

                var src = get_static_style(mapStyle);

                //var markersText = '|41.444024,2.230580';
                console.log(attr);
                var markersText = "|" + attr.coordinates;
                var center = attr.coordinates;

                var mapSrc = "https://maps.googleapis.com/maps/api/staticmap?center=" + center + "&zoom=" + zoom + "&format=png&sensor=false&size=700x400&maptype=roadmap&markers=icon:" + icon + markersText + "&" + src;
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
