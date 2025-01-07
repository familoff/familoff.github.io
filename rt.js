(function () {
    'use strict';

    function rating_rotten_tomatoes(card) {
        var network = new Lampa.Reguest();
        var params = {
            id: card.id,
            api_url: 'https://www.omdbapi.com/',
            api_key: 'b7fc6bc6',
            cache_time: 60 * 60 * 24 * 1000 // 1 day
        };
        getRating();

        function getRating() {
            var movieRating = _getCache(params.id);
            if (movieRating) {
                return _showRating(movieRating);
            } else {
                fetchRating();
            }
        }

        function fetchRating() {
            var url = params.api_url + '?apikey=' + params.api_key + '&i=' + encodeURIComponent(card.imdb_id);
            network.clear();
            network.timeout(15000);
            network.silent(url, function (data) {
                if (data && data.Ratings) {
                    var rtRating = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                    var score = rtRating ? parseInt(rtRating.Value) : 0;
                    var movieRating = {
                        rt: score,
                        timestamp: new Date().getTime()
                    };
                    _setCache(params.id, movieRating);
                    return _showRating(movieRating);
                } else {
                    showError('No rating found');
                }
            }, function (a, c) {
                showError(network.errorDecode(a, c));
            }, false);
        }

        function _getCache(movie) {
            var cache = JSON.parse(localStorage.getItem('rt_rating_cache') || '{}');
            var timestamp = new Date().getTime();
            if (cache[movie] && (timestamp - cache[movie].timestamp) <= params.cache_time) {
                return cache[movie];
            } else {
                delete cache[movie];
                localStorage.setItem('rt_rating_cache', JSON.stringify(cache));
                return null;
            }
        }

        function _setCache(movie, data) {
            var cache = JSON.parse(localStorage.getItem('rt_rating_cache') || '{}');
            cache[movie] = data;
            localStorage.setItem('rt_rating_cache', JSON.stringify(cache));
        }

        function _showRating(data) {
            if (data) {
                var rt_rating = !isNaN(data.rt) && data.rt !== null ? data.rt + '%' : '0%';
                var render = Lampa.Activity.active().activity.render();
                $('.wait_rating_rt', render).remove();
                $('.rate--rt', render).removeClass('hide').find('> div').eq(0).text(rt_rating);
            }
        }

        function showError(error) {
            Lampa.Noty.show('Rating RT: ' + error);
        }
    }

    function startPlugin() {
        window.rotten_tomatoes_plugin = true;
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                if ($('.rate--rt', render).hasClass('hide') && !$('.wait_rating_rt', render).length) {
                    $('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating_rt"><div class="broadcast__scan"><div></div></div><div>');
                    rating_rotten_tomatoes(e.data.movie);
                }
            }
        });
    }

    if (!window.rotten_tomatoes_plugin) startPlugin();
})();
