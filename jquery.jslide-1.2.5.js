/*
	jSlide by hallis2
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
	
	jQuery('#carousel').jslide({
		width:500,
		height:300,
		nextButton:'#next',
		prevButton:'#prev'
	});
	
	* ---------------------------------------------- *
	Parameters
	
	width: (int) The width of the carousel, default 640
	height: (int) The height of the carousel, default 480
	
	prevButton: (selector) The button to go to the previous item
	nextButton: (selector) The button to go to the next item
	
	align: (left|center|right) Horizontal alignment
	verticalCenter: (boolean) Verticaly centered
	
	interval: (int) Seconds between automatic change of item, not sett = off
	duration: (int) The speed of the animation in miliseconds, defalut = 200
	
	beforeRotate: (function) Callback before rotation - get aplied with current position of carousel and total number of items ("this" is the carousel object)
	onRotate: (function) Callback after a rotation - get aplied with current position of carousel and total number of items ("this" is the carousel object)
	onInit: (function) Callback after init - get aplied with current position of carousel and total number of items ("this" is the carousel object)
	
	gestures: (boolean) Let mobile users slide with touch gestures
*/
(function ($) {
	var methods, nextPicture;
	methods = {
		carouselData: {},
		savedSettings: {},
		init: function (settings) {
			var carousel, carouselId, wrapper, list, img, listCount, width, height, prevButton, nextButton, align, verticalCenter, interval, duration, onRotate, onInit;
			
			if(jQuery(this).length > 1) {
				jQuery(this).each(function() {
					jQuery(this).jslide(settings);
				});
				return;
			}
			
			carousel = jQuery(this);
			
			if(carousel.attr('id') == null || carousel.attr('id') == "") {
				carousel.attr('id', "jslider-" + (Math.random().toString().replace(".","")));
			}
			carouselId = carousel.attr('id');
			
			// Remove previous jSlides
			if(methods.carouselData[carouselId] != null) {
				methods.carouselData[carouselId] = null;
				methods.savedSettings[carouselId] = null;
				jQuery(this).parent(".jslide").replaceWith(this);
			}
			
			carousel.wrap('<div class="jslide" id="' + carouselId + 'Wrapper" />');
			
			wrapper = jQuery('#' + carouselId + 'Wrapper');
			list = carousel.children('li');
			img = list.children('img');
			listCount = list.size();
			
			// Canvas width/height
			width 	= !settings.width || isNaN(parseInt(settings.width, 10)) ? 640 : parseInt(settings.width, 10);
			height 	= !settings.height || isNaN(parseInt(settings.height, 10)) ? 480 : parseInt(settings.height, 10);
			
			// Navigation buttons
			prevButton 	= !settings.prevButton || jQuery(settings.prevButton).length == 0 ? null : jQuery(settings.prevButton);
			nextButton 	= !settings.nextButton || jQuery(settings.nextButton).length == 0 ? null : jQuery(settings.nextButton);
			
			// Item alignment
			align = !settings.align ? 'center' : settings.align;
			verticalCenter = !settings.verticalCenter && settings.verticalCenter !== false ? true : false;
			
			// Automatic carousel
			interval = !settings.interval || isNaN(parseInt(settings.interval, 10)) ? null : parseInt(settings.interval, 10);
			duration = !settings.duration || isNaN(parseInt(settings.duration, 10)) ? 200 : parseInt(settings.duration, 10);
			
			// Gestures for mobile units
			gestures = settings.gestures !== false ? true : false;
			
			// Callbacks
			beforeRotate = !settings.beforeRotate ? null : settings.beforeRotate;
			onRotate = !settings.onRotate ? null : settings.onRotate;
			onInit = !settings.onInit ? null : settings.onInit;
			
			// Save data about the carousel
			methods.carouselData[carouselId] = [0, listCount];
			methods.savedSettings[carouselId] = {};
			methods.savedSettings[carouselId].duration = duration;
			methods.savedSettings[carouselId].onRotate = onRotate;
			methods.savedSettings[carouselId].beforeRotate = beforeRotate;
			methods.savedSettings[carouselId].interval = interval;
			methods.savedSettings[carouselId].width = width;
			methods.savedSettings[carouselId].height = height;
			
			// Set style to the carousel
			wrapper.css({
				width: width.toString() + 'px', 
				height: height.toString() + 'px', 
				position:'relative', 
				overflow:'hidden' 
			});
			
			list.css({
				float:'left',
				position:'relative',
				width: width.toString() + 'px',
				height: height.toString() + 'px',
				overflow:'hidden',
				textAlign: align,
				margin:0,
				padding:0,
				listStyleType:'none',
				display:'list-item'
			});
			
			carousel.css({
				position:'absolute', 
				width: (width * listCount).toString() + 'px', 
				top:0,
				left:0,
				margin:0,
				padding:0
			});
			
			if (verticalCenter === true) {
				img.css({
					verticalAlign:'middle'
				});
				list.css({
					lineHeight: height.toString() + 'px'	
				});
			}
			
			// Set previous button event
			if (prevButton !== null && typeof prevButton === 'object') {
				prevButton.unbind('click');
				prevButton.click(function () {
					jQuery('#' + carouselId).jslide('previous');
				});
			}
			
			// Set next button event
			if (nextButton !== null && typeof nextButton === 'object') {
				nextButton.unbind('click');
				nextButton.click(function () {
					jQuery('#' + carouselId).jslide('next');
				});
			}
			
			// Set interval event
			if (interval !== null) {
				methods.interval(carousel, interval);
			}
			
			// Init callback
			if (onInit !== null) {
				onInit.apply(carousel, methods.carouselData[carouselId]);
			}
			
			// Set gesutres for mobile units
			if (gestures !== null && gestures === true) {
				methods.firstTouch = false;
				methods.touchDifference = false;
				methods.gesture(carousel);
			}
		},
		rotate: function (carouselId, nextPicture) {
			var carousel, width, carouselData, left, duration, callback;
			
			carousel = jQuery('#' + carouselId);
			carouselData = methods.carouselData[carouselId];
			beforeRotate = methods.savedSettings[carouselId].beforeRotate;
				duration = methods.savedSettings[carouselId].duration;
				onRotate = methods.savedSettings[carouselId].onRotate;
			
			width = carousel.children('li').width();
			left = width * nextPicture;
			carouselData[0] = nextPicture;
			
			// Before rotate callback
			if(beforeRotate !== null) {
				beforeRotate.apply(carousel, carouselData);
			}
			
			carousel.animate({'left': '-' + left.toString() + 'px'}, duration, function () {
				// Rotate callback
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
				element = jQuery(this);
			}
			
			carouselId = jQuery(element).attr('id');
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
			
			element = (typeof element !== 'object') ? jQuery(this) : element;
			carouselId = jQuery(element).attr('id');
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
				element = jQuery(this);
			}
			
			if (nextPicture === null) {
				nextPicture = 0;
			}
			
			var carouselId = jQuery(element).attr('id');
			methods.rotate(carouselId, nextPicture);
			
			return nextPicture;
		},
		interval: function (element, time) {
			var self, action, carouselId;
			element = (typeof element !== 'object') ? jQuery(this) : element;
			carouselId = jQuery(element).attr('id');
			self = typeof element === 'object' ? element : this;
			action = function() {
				methods.next(self);
			};
			methods.savedSettings[carouselId].intervalf = setInterval(action, time * 1000);
		},
		gesture: function(element) {
			// Set touch move event
			element.bind('touchmove', function(e) {
				var carouselId, carouselData, currentLeft, width;
				
				element = (typeof element !== 'object') ? jQuery(this) : element;
				carouselId = jQuery(element).attr('id');
				carouselData = methods.carouselData[carouselId];
				width = methods.savedSettings[carouselId].width;
				
				currentLeft = width * carouselData[0];
				
				methods.firstTouch = methods.firstTouch === false ? event.touches[0].pageX : methods.firstTouch;
				methods.touchDiffernce = methods.touchDiffernce === false ? 0 : methods.firstTouch - event.touches[0].pageX
				
				e.preventDefault();
				element.css('left', '-' + (currentLeft + methods.touchDiffernce).toString() + 'px');
			});
			
			// Set touch end event
			element.bind('touchend', function(e) {
				if(!methods.firstTouch) {
					return false;
				}
				
				var carouselId, carouselData, currentLeft, nextPicture, width;
				
				element = (typeof element !== 'object') ? jQuery(this) : element;
				carouselId = jQuery(element).attr('id');
				carouselData = methods.carouselData[carouselId];
				width = methods.savedSettings[carouselId].width;
				
				currentLeft = -parseInt(element.css('left'), 10);
				currentLeft = methods.touchDiffernce < 0 ? currentLeft - parseInt(width / 1.4, 10) : currentLeft + parseInt(width / 1.4, 10);
				currentLeft = currentLeft > (width * carouselData[1]) ? width * carouselData[0] : currentLeft;
				currentLeft = currentLeft < 0 ? 0 : currentLeft;
				
				nextPicture = parseInt(currentLeft / width, 10);
				
				methods.goto(element, nextPicture);
				
				methods.firstTouch = false;
				methods.touchDiffernce = false;
			});
		}
	};
	
	jQuery.fn.jslide = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, arguments);
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			jQuery.error('Method ' +  method + ' does not exist in jQuery.jSlide');
		}
	};
}(jQuery));