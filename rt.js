(function () {
    'use strict';

    function rating_rotten_tomatoes(card) {
        var network = new Lampa.Reguest();
        var imdbId = card.imdb_id;
        var params = {
            url: 'https://www.omdbapi.com/',
            apiKey: 'b7fc6bc6',
            timeout: 15000
        };

        getRating();

        function getRating() {
            if (!imdbId) return showError('IMDB ID not found');

            var url = `${params.url}?apikey=${params.apiKey}&i=${encodeURIComponent(imdbId)}`;
            network.clear();
            network.timeout(params.timeout);
            network.silent(url, function (data) {
                if (data && data.Ratings) {
                    var rtRating = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                    var rating = rtRating ? rtRating.Value : 'N/A';
                    _showRating(rating);
                } else {
                    _showRating('N/A');
                }
            }, function (a, c) {
                showError(network.errorDecode(a, c));
            }, false);
        }

        function _showRating(rating) {
            var render = Lampa.Activity.active().activity.render();
            $('.wait_rating_rt', render).remove();
            var rtHtml = `<div class="full-start__rate rate--rt"><div>${rating}</div><div>RT</div></div>`;
            $('.info__rate', render).after(rtHtml);
        }

        function showError(error) {
            Lampa.Noty.show('Rotten Tomatoes: ' + error);
        }
    }

    function startPlugin() {
        window.rotten_tomatoes_plugin = true;
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                if ($('.rate--rt', render).length === 0 && !$('.wait_rating_rt', render).length) {
                    $('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating_rt"><div class="broadcast__scan"><div></div></div><div>');
                    rating_rotten_tomatoes(e.data.movie);
                }
            }
        });
    }

    if (!window.rotten_tomatoes_plugin) startPlugin();
})();
