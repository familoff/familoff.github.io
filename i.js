(function () {
	'use strict';
	var num;
	function otzyv_kp_imdb(kpid, imdbid, num) {
		if (kpid == 'WERWER') {
			$.get('http://skaztv.online/otzyv.php?kp=' + kpid + '&tmdb=' + imdbid + '&num=' + num, function (data) {
				var modal = $('<div><div class="broadcast__text" style="text-align:left"><div class="otzyv">' + data + '</div></div></div>');
				var enabled = Lampa.Controller.enabled().name;
				Lampa.Modal.open({
					title: "",
					html: modal,
					size: "large",
					mask: !0,
					onBack: function () {
						Lampa.Modal.close(), Lampa.Controller.toggle(enabled)
					},
					onSelect: function () { }
				});
			});

		}
	}
	$('.otzyvb').on('hover:enter', function () {
		console.log(123);
	});

	function kp_reviews(params) {

	}

	function component() {
		var network = new Lampa.Reguest();
		var scroll = new Lampa.Scroll({
			mask: true,
			over: true,
			step: 250
		});
		var player = window.radio_player;
		var items = [];
		var html = $('<div></div>');
		var body = $('<div class="category-full"></div>');
		var active;
		var last;
		// 	this.create = function () {
		// 	  var _this = this;
		// 	  this.activity.loader(true);
		// 	  var prox = Lampa.Platform.is('webos') || Lampa.Platform.is('tizen') || Lampa.Storage.field('proxy_other') === false ? '' : '';
		// 	  network["native"](prox + 'http://lampa.insomnia247.nl/radio/api/stations/', this.build.bind(this), function () {
		// 		var empty = new Lampa.Empty();
		// 		html.append(empty.render());
		// 		_this.start = empty.start;
		// 		_this.activity.loader(false);
		// 		_this.activity.toggle();
		// 	  });
		// 	  return this.render();
		// 	};
		// 	this.build = function (data) {
		// 	  scroll.minus();
		// 	  var stations = data.result.stations.sort(function (a, b) {
		// 		return a.sort - b.sort;
		// 	  });
		// 	  this.append(stations);
		// 	  scroll.append(body);
		// 	  html.append(scroll.render());
		// 	  this.activity.loader(false);
		// 	  this.activity.toggle();
		// 	};
		// 	this.append = function (element) {
		// 	  element.forEach(function (el) {
		// 		var item$1 = new item(el);
		// 		item$1.render().on('hover:focus', function () {
		// 		  last = item$1.render()[0];
		// 		  active = items.indexOf(item$1);
		// 		  scroll.update(items[active].render(), true);
		// 		}).on('hover:enter', function () {
		// 		  player.play(el);
		// 		});
		// 		body.append(item$1.render());
		// 		items.push(item$1);
		// 	  });
		// 	};
		// 	this.back = function () {
		// 	  Lampa.Activity.backward();
		// 	};
		// 	this.background = function () {
		// 	  Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
		// 	};
		// 	this.start = function () {
		// 	  if (Lampa.Activity.active().activity !== this.activity) return;
		// 	  this.background();
		// 	  Lampa.Controller.add('content', {
		// 		toggle: function toggle() {
		// 		  Lampa.Controller.collectionSet(scroll.render());
		// 		  Lampa.Controller.collectionFocus(last || false, scroll.render());
		// 		},
		// 		left: function left() {
		// 		  if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
		// 		},
		// 		right: function right() {
		// 		  Navigator.move('right');
		// 		},
		// 		up: function up() {
		// 		  if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
		// 		},
		// 		down: function down() {
		// 		  if (Navigator.canmove('down')) Navigator.move('down');
		// 		},
		// 		back: this.back
		// 	  });
		// 	  Lampa.Controller.toggle('content');
		// 	};
		// 	this.pause = function () {};
		// 	this.stop = function () {};
		// 	this.render = function () {
		// 	  return html;
		// 	};
		// 	this.destroy = function () {
		// 	  network.clear();
		// 	  Lampa.Arrays.destroy(items);
		// 	  scroll.destroy();
		// 	  html.remove();
		// 	  items = null;
		// 	  network = null;
		// 	};
	}

	function startPlugin() {
		window.kp_reviews_plugin = true;
		window.kp_reviews_plugin = new kp_reviews();
		Lampa.Listener.follow('full', function (e) {
			if (e.type == 'complite') {
				//var num=0;
				$('.full-start-new__buttons').append('<div class="full-start__button selector button--reviews"><svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="currentColor" stroke-width="3"></rect><rect x="6" y="7" width="9" height="9" rx="1" fill="currentColor"></rect><rect x="6" y="19" width="16" height="3" rx="1.5" fill="currentColor"></rect><rect x="6" y="25" width="11" height="3" rx="1.5" fill="currentColor"></rect><rect x="17" y="7" width="5" height="3" rx="1.5" fill="currentColor"></rect> </svg><span>Отзывы</span></div>');
				$('.button--reviews').on('hover:enter', function () {
					console.log("GOOOD!!!!!!!!!!!!!!!! ");
					//if (num > 9) num = 0;
					//otzyv_kp_imdb(e.data.movie['kinopoisk_id'],e.data.movie['imdb_id'],num);
					//num += 1;
					Lampa.Activity.push({
						url: '',
						title: 'Рецензии',
						component: 'kpRreviews',
						page: 1
					})
				});
			}

		});

	}
	if (!window.kp_reviews_plugin) startPlugin();

})();

