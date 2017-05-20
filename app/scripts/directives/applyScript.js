'use strict';

/**
 * @ngdoc directive
 * @name playerApp.directive:applyScript
 * @description
 * # applyScript
 */
angular.module('playerApp')
        .directive('applyScript', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {


                    $('#content-search-filter-accordion').accordion();
                    $('.dropdown.content-search-filter').dropdown({
                        useLabels: false,
                        forceSelection: false,
                        label: {
                            duration: 0,
                        },
                        debug: false,
                        performance: true,
                    });
                    
                    if (attrs.id == 'content-video-player-youtube-holder') {
                        var oldPlayer = document.getElementById('content-video-player-youtube');
                        videojs(oldPlayer).dispose();
                        $(element).append("<video id='content-video-player-youtube' class='video-js vjs-default-skin' controls  data-setup='{ \"fluid\": true,\"techOrder\": [\"youtube\"], \"sources\": [{ \"type\": \"video/youtube\", \"src\": \"\"}] }'></video>");
                        videojs('content-video-player-youtube').ready(function () {
                            var newPlayer = this;
                            newPlayer.src({type: 'video/youtube', src: attrs.videosrc});
                        });
                    }

                }
            };
        });