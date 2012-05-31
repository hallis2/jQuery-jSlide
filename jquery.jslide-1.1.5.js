/*
	JSlide by hallis2
	Simple jQuery carousel	
	
	* ---------------------------------------------- *
	Standard implementation
	
	<ul id="carousel">
		<li><img src="image1.jpg" alt="Image 1"></li>
		<li><img src="image2.jpg" alt="Image 2"></li>
		<li><img src="image3.jpg" alt="Image 3"></li>
	</ul>
	
	<button id="prev">Previous</button>
	<button id="next">Next</button>
	
	$('#carousel').jslide({
		width:500,
		height:300,
		nextButton:'#next',
		prevButton:'#prev'
	});
	
	* ---------------------------------------------- *
	Parameters
	
	width: (int) The width of the carousel
	height: (int) The height of the carousel
	
	prevButton: (selector) The button to go to the previous item
	nextButton: (selector) The button to go to the next item
	
	align: (left|center|right) Horizontal alignment
	verticalCenter: (boolean) Verticaly centered
	
	interval: (int) Seconds between automatic change of item, not sett = off
	duration: (int) The speed of the animation in miliseconds
	
	onRotate: (function) Callback after a rotation - get aplied with current position of carousel and total number of items
	onInit: (function) Callback after init - get aplied with current position of carousel and total number of items
*/
(function ($) {
	var methods, nextPicture;
	methods = {
		carouselData: {},
		savedSettings: {},
		init: function (settings) {
			var carousel, carouselId, wrapper, list, img, listCount, width, height, prevButton, nextButton, align, verticalCenter, interval, duration, onRotate, onInit;
			
			carousel = $(this);
			carouselId = carousel.attr('id');
			
			carousel.wrap('<div class="jslide" id="' + carouselId + 'Wrapper" />');
			
			wrapper = $('#' + carouselId + 'Wrapper');
			list = carousel.children('li');
			img = list.children('img');
			listCount = list.size();
			
			// Canvas width/height
			width 	= !settings.width || isNaN(parseInt(settings.width, 10)) ? 640 : parseInt(settings.width, 10);
			height 	= !settings.height || isNaN(parseInt(settings.height, 10)) ? 480 : parseInt(settings.height, 10);
			
			// Navigation buttons
			prevButton 	= !settings.prevButton || $(settings.prevButton).length == 0 ? null : $(settings.prevButton);
			nextButton 	= !settings.nextButton || $(settings.nextButton).length == 0 ? null : $(settings.nextButton);
			
			// Item alignment
			align = !settings.align ? 'center' : settings.align;
			verticalCenter = !settings.verticalCenter && settings.verticalCenter !== false ? true : false;
			
			// Automatic carousel
			interval = !settings.interval || isNaN(parseInt(settings.interval, 10)) ? null : parseInt(settings.interval, 10);
			duration = !settings.duration || isNaN(parseInt(settings.duration, 10)) ? 400 : parseInt(settings.duration, 10);
			
			// Callbacks
			onRotate = !settings.onRotate ? null : settings.onRotate;
			onInit = !settings.onInit ? null : settings.onInit;
			
			// Save data about the carousel
			methods.carouselData[carouselId] = [0, listCount];
			methods.savedSettings[carouselId] = {};
			methods.savedSettings[carouselId].duration = duration;
			methods.savedSettings[carouselId].onRotate = onRotate;
			methods.savedSettings[carouselId].interval = interval;
			
			// Set style to the carousel
			wrapper.css({
				'width': width.toString() + 'px', 
				'height': height.toString() + 'px', 
				'position': 'relative', 
				'overflow': 'hidden' 
			});
			list.css({
				'float': 'left',
				'position': 'relative',
				'width': width.toString() + 'px',
				'height': height.toString() + 'px',
				'overflow': 'hidden',
				'text-align': align,
				'margin': 0, 'padding': 0,
				'list-style-type': 'none'
			});
			carousel.css({
				'position': 'absolute', 
				'width': (width * listCount).toString() + 'px', 
				'top': 0, 'left': 0,
				'margin': 0, 'padding': 0
			});
			
			if (verticalCenter != null) {
				img.css({
					'vertical-align': 'middle'
				});
				list.css({
					'line-height': height.toString() + 'px'	
				});
			}
			
			// Set previous button event
			if (prevButton != null && typeof prevButton === 'object') {
				prevButton.click(function () {
					$('#' + carouselId).jslide('previous');
				});
			}
			
			// Set next button event
			if (nextButton != null && typeof nextButton === 'object') {
				nextButton.click(function () {
					$('#' + carouselId).jslide('next');
				});
			}
			
			// Set interval event
			if (interval !== null) {
				methods.interval(carousel, interval);
			}
			
			if (onInit !== null) {
				onInit.apply(carousel, methods.carouselData[carouselId]);
			}
		},
		rotate: function (carouselId, nextPicture) {
			var carousel, width, carouselData, left, duration, callback;
			
			carousel = $('#' + carouselId);
			width = carousel.children('li').width();
			carouselData = methods.carouselData[carouselId];
			left = width * nextPicture;
			duration = methods.savedSettings[carouselId].duration;
			onRotate = methods.savedSettings[carouselId].onRotate;
			
			carouselData[0] = nextPicture;
			
			carousel.animate({'left': '-' + left.toString() + 'px'}, duration, function () {
				if(onRotate !== null) {
					onRotate.apply(carousel, carouselData);
				}
			});
			
			// If interval is activated it resets it
			if(methods.savedSettings[carouselId].interval !== null) {
				clearTimeout(methods.savedSettings[carouselId].intervalf);
				methods.interval(carousel, methods.savedSettings[carouselId].interval);
			}
			
			return nextPicture;
		},
		next: function (element) {
			var carouselId, carouselData, activePicture, counted;
			
			if (typeof element !== 'object') {
				element = $(this);
			}
			
			carouselId = $(element).attr('id');
			carouselData = methods.carouselData[carouselId];
			activePicture = carouselData[0];
			counted = carouselData[1];
			
			if (activePicture === counted - 1) {
				nextPicture = 0;
			} else {
				nextPicture = activePicture + 1;
			}
			
			methods.rotate(carouselId, nextPicture);
			return nextPicture;
		},
		previous: function (element) {
			var carouselId, carouselData, activePicture, counted;
			
			element = (typeof element !== 'object') ? $(this) : element;
			carouselId = $(element).attr('id');
			carouselData = methods.carouselData[carouselId];
			activePicture = carouselData[0];
			counted = carouselData[1];
			
			if (activePicture === 0) {
				nextPicture = counted - 1;
			} else {
				nextPicture = activePicture - 1;
			}
			
			methods.rotate(carouselId, nextPicture);
			return nextPicture;
		},
		goto: function (element, nextPicture) {
			if (typeof element !== 'object') {
				element = $(this);
			}
			
			if (nextPicture === null) {
				nextPicture = 0;
			}
			
			var carouselId = $(element).attr('id');
			methods.rotate(carouselId, nextPicture);
			
			return nextPicture;
		},
		interval: function (element, time) {
			var self, action, carouselId;
			element = (typeof element !== 'object') ? $(this) : element;
			carouselId = $(element).attr('id');
			self = typeof element === 'object' ? element : this;
			action = function() {
				methods.next(self);
			};
			methods.savedSettings[carouselId].intervalf = setInterval(action, time * 1000);
		}
	};
	
	$.fn.jslide = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, arguments);
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist in jQuery.JSlide');
		}
	};
}(jQuery));