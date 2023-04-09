/* ************* SOME FUNTION INIT INDEX ******************

1.SLIDER PADDING TOP CUSTOM FUNTION
2.HOME PAGE BIG BUTTON OVERLY ACTIVE CUSTOM FUNTION
3.HOME PAGE BIG BUTTON OVERLY ACTIVE CUSTOM FUNTION
4.HOME PAGE CIRCULAR PROGRESS INIT FUNTION
5.HOME PAGE UPCOMING EVENTS CAROUSEL INIT FUNTION
6.FITVIDS VIDEO JS INIT FUNCTION
7.COUNTER UP  INIT FUNCTION
8.ISOTOPE POST GALLERY
9.LATEST NEWS CAROUSEL INIT GALLERY
10.TWITTER FEEDS INIT GALLERY
11.MOBILE MENU
12.FOOTER COLUM AUTO ADJUST FUNCTION
13.PROGRESS BAR
14.SUCCESSFUL STORIES CAROUSEL INIT
15.HOME PAGE BIG BUTTON OVERLY ACTIVE CUSTOM FUNTION
16.HOME COUNT DOWN INIT FUNTION
17.LINK CLICK OFF FUNTION
18.HOME 3 SUCESSFULL STORIES CAROUSEL INIT FUNCTION
19.ISOTOPE FILTER INIT FUNCTION
19.OUR IMPACTS CAROUSEL INIT
20.GALLERY  CAROUSEL INIT
21.GOOGLE MAP CAROUSEL INIT
22.LATEST NEWS CAROUSEL INIT GALLERY
23.SOME CUSTOM  STYLE FOR CONTACT FORM  FUNCTION
24.SOME CUSTOM  STYLE FOR CONTACT FORM  FUNCTION
25.PROJECT DONORS CAROUSEL INIT GALLERY
26.WOOCOMMERCE  PRODUCT COLUMN FUNCTION
27.WOOCOMMERCE QUANTITY BUTTON FUNCTION
28.WOOCOMMERCE CHCKBOX AND RADIO INPUT STYLE INIT FUNCTION
29.HOME 4 SERVCIE BOX HOVER FUNCTION
30.HOME 4 PIE  CHART FUNCTION
31.SINGLE POST SOCIAL FUNTION FUNCTION

--------------------
->DOCUMENT READY ALL FUNCTION  CALL
->WINDOW LOAD RESIZE ALL FUNCTION  CALL
->ONLY WINDOW LOAD FUNTION CALL

************************************* */

(function($){
'use strict';
 $('#comments.comments-area #respond #commentform .form-submit .submit').addClass('btn');
/*============  1.SLIDER PADDING TOP CUSTOM FUNTION ===========*/
$('.grop-theme-carousel').carousel();
$('.single-donate-now').click(function(event) {
	event.preventDefault();
	$('.popup-dontate').addClass('active');
});
$('.single-donate-close').click(function(event) {
	event.preventDefault();
	$('.popup-dontate').removeClass('active');
});
$(document).keydown(function(e) {
    if (e.keyCode == 27) {
        $('.popup-dontate').removeClass('active');
    }
});
function grop_slider_section_padding(){
	var hederTop_height, hederNav_height,  contentHeader;

		hederTop_height = 0;
		hederNav_height = 0;

		hederTop_height = $(".grop-header_top").innerHeight();
		hederNav_height = $(".grop-header_navigations").innerHeight();

		contentHeader = $(".grop-header_area").has(".grop-header_sticky").length;

		$(window).on("scroll",function(){
			var availableCont, stickyHeader, activeposHeader;
				availableCont = $("body").has(".grop-header_top").length;
				stickyHeader = $(".sticky-header");
				activeposHeader = 100;
			if(true == availableCont){
				activeposHeader = $(".grop-header_top").outerHeight();
			}
			if(activeposHeader <= $(this).scrollTop()){
				stickyHeader.addClass("grop-header_sticky_active");
			}
			else{
				stickyHeader.removeClass("grop-header_sticky_deactive  grop-header_sticky_active");
			}
			return false;
		});
		return false;
}

/*============  2.HOME PAGE BIG BUTTON OVERLY ACTIVE CUSTOM FUNTION ===========*/
function grop_header_divider(){
	var hastSlider = $("body").has(".grop-header_area").length;
	if(true == hastSlider){
		$(".grop-header_area").after("<div class='grop-header-divider'></div>");
	}
	return false;
}

/*============  3.HOME PAGE BIG BUTTON OVERLY ACTIVE CUSTOM FUNTION ===========*/
function grop_big_link_overly(){
	$(".grop-big_link").hover(function(){
		$(".grop-big_link").removeClass("grop-big_link_overly_active");
		$(this).addClass("grop-big_link_overly_active");
	});

	$(".grop-hm-3sildcapst3_btn").hover(function(){
		$(".grop-hm-3sildcapst3_btn").removeClass("grop-btn_active");
		$(this).addClass("grop-btn_active");
	});
}

/*============  4.HOME PAGE CIRCULAR PROGRESS INIT FUNTION ===========*/
function grop_circular_progress(){
	//demo 3 active js
	 if(typeof($.fn.knob) != 'undefined') {

		$('.grop-knob').each(function () {
			 var $this = $(this),
			knobVal  = $this.attr('data-rel');

			 $this.knob({
				'draw' : function () {
				   $(this.i).val(this.cv + '%')
				}
			 });

			 $this.appear(function() {
				$({
				   value: 0
				})
				.animate({
				   value: knobVal
				},
					{
						duration : 2000,
						easing   : 'swing',
						step     : function () {
						$this.val(Math.ceil(this.value)).trigger('change');
					}
				});
			 }, {accX: 0, accY: -150});
		});
	}
}

/*============  5.HOME PAGE UPCOMING EVENTS CAROUSEL INIT FUNTION ===========*/
function grop_upcoming_event_carousel(){
	var $upEventCar = $("body").has(".grop-ucoming_evnt_carousel").length;
	if(true == $upEventCar){
		$(".grop-ucoming_evnt_carousel").each(function(){
			var $carousel, $loopItem ,$items, $items_tablet, $items_mobile;

				$carousel = $(this);
				$items = ($carousel.data("items") !== undefined) ? $carousel.data("items") : 2;
				$items_tablet = ($carousel.data("items-tablet") !== undefined) ? $carousel.data("items-tablet") : 2;
				$items_mobile = ($carousel.data("items-mobile") !== undefined) ? $carousel.data("items-mobile") : 1;

				$loopItem = $(".grop-ucoming_evnt_carousel  .grop-ucoming_evnt_sigl_item");
				$loopItem = $loopItem = ($loopItem.length > $items) ? true : false;

				$carousel.owlCarousel({
					autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
					loop:$loopItem,
					items: $items,
					dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
					nav:($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
					navContainer:".grop-ucoming_evnt_casel_nav",
					navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
					margin: ($carousel.data("margin") !== undefined) ? $carousel.data("margin") : 0,
					responsive:{
						0:{
							items:$items_mobile,
						},
						750:{
							items:$items_tablet,
						},
						970:{
							items:$items,
						},
						1170:{
							items:$items,

						}
					}

				});
		});
	}
	return false;
}

/*============ 6.FITVIDS VIDEO JS INIT FUNCTION ===========*/
function grop_videoFitvids(){
	$("#grop_page").fitVids();
}

/*============ 7.COUNTER UP  INIT FUNCTION ===========*/
function grop_counter_up_init(){
	$('.grop-conter').counterUp({
		delay: 10,
		time: 1000
	});

}

/*============  8.ISOTOPE POST GALLERY ===========*/
function grop_our_gallery(){
	var gallery = $("body").has(".grop-our_gallery_cntner").length;
	if(true == gallery){
		setTimeout(function(){
			var $grid = $('.grop-our_gallery_cntner').isotope({
			  itemSelector: '.grop-gallery-single-item',
			  percentPosition: true
			});
		},200);
	}
	return;
}

/*============  9.LATEST NEWS CAROUSEL INIT GALLERY ===========*/
function grop_latest_news(){
	var latestNews = $("body").has(".grop-latest_news_carousel").length;
	if(true == latestNews){
		$(".grop-latest_news_carousel").each(function(){

			var $carousel, $loopItem ,$items, $items_tablet, $items_mobile;

			$carousel = $(this);
			$items = ($carousel.data("items") !== undefined) ? $carousel.data("items") : 3;
			$items_tablet = ($carousel.data("items-tablet") !== undefined) ? $carousel.data("items-tablet") : 2;
			$items_mobile = ($carousel.data("items-mobile") !== undefined) ? $carousel.data("items-mobile") : 1;

			$loopItem = $(".grop-latest_news_carousel  .grop-news_single_post_warp");
			$loopItem = ($loopItem.length > $items) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: $items,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav:($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navContainer:".latest_news_caro_nav",
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
				margin: ($carousel.data("margin") !== undefined) ? $carousel.data("margin") : 0,
				responsive:{
					0:{
						items:$items_mobile,
					},
					750:{
						items:$items_tablet,
					},
					970:{
						items:$items,
					},
					1170:{
						items:$items,

					}
				}
			});
		});
	}
	return;
}

/*============  10.TWITTER FEEDS INIT GALLERY ===========*/
function grop_twitter_feeds(){
	$("#grop-latest_tweets").twitterFetcher({
        widgetid: $(".grop-twitter_feed_id").data("feed-id"),
        maxTweets:2,
        enableLinks: false,
        showRetweet: false,
        enablePermalink: true,
		lang: "en"
    });
}

/*============  11.MOBILE MENU ===========*/
function grop_mobil_menu(){
	$('#grop-mobil_menu').slimmenu({
		resizeWidth: '991',
		collapserTitle: '',
		animSpeed: 'medium',
		easingEffect: null,
		indentChildren: false,
		childrenIndenter: '&nbsp;',
		expandIcon: '<i class="fa fa-angle-down"></i>',
		collapseIcon: '<i class="fa fa-angle-up"></i>'
	});

	$("#grop-mobil_menu li.menu-item-has-children > a").on("click",function(){
		$(this).next(".sub-toggle").trigger("click");
	});

	$(".grop-mobil_menu_warp .collapse-button").on("click",function(){
		$(this).toggleClass("grop-mobil_menu-visible");
	});
}

/*============  12.FOOTER COLUM AUTO ADJUST FUNCTION ===========*/
function grop_footer_colum_auto_adjust(){
	var $Content = $("body").has(".grop-ftr_sngl_widget.col-sm-6").length;
	if(true == $Content){
		$(".grop-ftr_sngl_widget.col-sm-6").eq(1).after('<div class="clearfix visible-sm-block"></div>');
	}
	return;
}

/*============  13.PROGRESS BAR ===========*/
function grop_progress_bar(){
		$('.grop-skill_prgresbar').one('inview', function(event, isInView, visiblePartX, visiblePartY) {
			if (isInView) {
			// element
			  $('.grop-progress-bar').each(function() {
				$(this).find('.progress-content').animate({
				  width:$(this).attr('data-percentage')
				},2000);

				$(this).find('.progress-number-mark').animate(
				  {left:$(this).attr('data-percentage')},
				  {
				   duration: 2000,
				   step: function(now, fx) {
					 var data = Math.round(now);
					 $(this).find('.percent').html(data + '%');
				   }
				});
			  });

				} else {
				// element has gone out of viewport
			}
        });

}

/*============14.SUCCESSFUL STORIES CAROUSEL INIT ===========*/
function grop_suess_stris_carousel(){
	var $hasCont = $("body").has(".grop-suess_stris_carousel").length;
	if(true == $hasCont){
		$(".grop-suess_stris_carousel").each(function(){
			var $carousel, $loopItem;
			$carousel = $(this);
			$loopItem = $(".grop-suess_stris_carousel .grop-suess_stris_single");
			$loopItem = ($loopItem.length > 1) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: 1,
				center:($carousel.data("center") !== undefined) ? $carousel.data("center") : false,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav: ($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>']
			});

		});
	}
	return;
}

/*============  15.HOME PAGE BIG BUTTON OVERLY ACTIVE CUSTOM FUNTION ===========*/
function grop_hover_donators(){
	$('.grop-dnatrsd_single:first').addClass('grop-dnatrsd_active');
	$(".grop-dnatrsd_single").hover(function(){
		$(".grop-dnatrsd_single").removeClass("grop-dnatrsd_active");
		$(this).addClass("grop-dnatrsd_active");
	});
}

/*============  16.HOME COUNT DOWN INIT FUNTION ===========*/
function grop_count_Down(){
	var $hasCont = $("body").has(".grop-flipclock").length;
	if(true==$hasCont){

			var diffTime = $(".grop-flipclock").data("diff");
			$(".grop-flipclock").each(function(){
			var callbacks = new Object();
			callbacks.start = function() {
			  if(diffTime < (3600 * 24 * 100)) {
			    var leading_zero = $('ul.flip').first().clone();
			    $(leading_zero).find('li.flip-clock-active').removeClass('flip-clock-active');
			    $(leading_zero).find('li.flip-clock-before').removeClass('flip-clock-before');

			    $('span.days').after(leading_zero);
			  } else {
			  	var leading_zero = '';
			  }
			}
			var clock,gropFlipclock;
			gropFlipclock = $(this);
			clock = gropFlipclock.FlipClock(diffTime, {
				clockFace: (gropFlipclock.data("clockface") !== undefined) ? gropFlipclock.data("clockface") : 'DailyCounter',
				autoPlay:(gropFlipclock.data("autoplay") !== undefined) ? gropFlipclock.data("autoplay") :true,
				autoStart:(gropFlipclock.data("autostart") !== undefined) ? gropFlipclock.data("autostart") :true,
				countdown:(gropFlipclock.data("countdown") !== undefined) ? gropFlipclock.data("countdown") :false,
				defaultLanguage:(gropFlipclock.data("defaultlanguage") !== undefined) ? gropFlipclock.data("defaultlanguage") :'english',
				minimumDigits:(gropFlipclock.data("minimumdigits") !== undefined) ? gropFlipclock.data("minimumdigits") :0,
  			callbacks: callbacks
			});
			clock.setCountdown(true);
			clock.start();
		});
	}
	return;
}

/*============  17.LINK CLICK OFF FUNTION ===========*/
function grop_linkClick_false(){
	$(".flip-clock-wrapper .flip li a, .grop-locn-tooltip, .grop-evshare_share").on("click",function(e){
		e.preventDefault();
		return false;
	});
}

/*============  18.HOME 3 SUCESSFULL STORIES CAROUSEL INIT FUNCTION ===========*/
function grop_sucess2_stories(){
	var sucess2_sto = $("body").has(".grop-suess_strisst2_carousel").length;
	if(true == sucess2_sto){
		$(".grop-suess_strisst2_carousel").each(function(){

			var $carousel, $loopItem, $items, $items_tablet, $items_mobile;

			$carousel = $(this);
			$items = ($carousel.data("items") !== undefined) ? $carousel.data("items") : 2;
			$items_tablet = ($carousel.data("items-tablet") !== undefined) ? $carousel.data("items-tablet") : 2;
			$items_mobile = ($carousel.data("items-mobile") !== undefined) ? $carousel.data("items-mobile") : 1;

			$loopItem = $(".grop-suess_strisst2_carousel  .grop-suess_strisst2_post_item");
			$loopItem = ($loopItem.length > $items) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: $items,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav:($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navContainer:".latest_news_caro_nav",
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
				margin: ($carousel.data("margin") !== undefined) ? $carousel.data("margin") : 0,
				responsive:{
					0:{
						items:$items_mobile,
					},
					750:{
						items:$items_tablet,
					},
					970:{
						items:$items,
					},
					1170:{
						items:$items,

					}
				}
			});
		});
	}
	return;
}

/*============ 19.ISOTOPE FILTER INIT FUNCTION ===========*/
function grop_filter_function(){

	$('[data-toggle="tooltip"]').tooltip();

	var $content = $("body").has(".grop-filter_content").length;
	if(true == $content){
		setTimeout(function(){
			var $grid = $('.grop-filter_content').isotope({
			  itemSelector: '.grop-filter_content > .grop-filter_single_col',
			  layoutMode: 'fitRows'
			});

			$('#grop_filters').on( 'click', 'li', function() {
				  var filterValue = $(this).attr('data-filter');
				  $grid.isotope({ filter: filterValue });
				  $("#grop_filters ul > li").removeClass('is-active');
				  $(this).addClass('is-active');

			});
		},200);
	}
	return;
}

/*============19.OUR IMPACTS CAROUSEL INIT ===========*/
function grop_our_impacts_carousel(){
	var $hasCont = $("body").has(".grop-oimt_carousel").length;
	if(true == $hasCont){
		$(".grop-oimt_carousel").each(function(){
			var $carousel, $loopItem;
			$carousel = $(this);
			$loopItem = $(".grop-oimt_carousel .grop-oimt_single");
			$loopItem = ($loopItem.length > 1) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: 1,
				center:($carousel.data("center") !== undefined) ? $carousel.data("center") : false,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav: ($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>']
			});

		});
	}
	return;
}

/*============20.GALLERY  CAROUSEL INIT ===========*/
function grop_gallery_carousel(){
	var $hasCont = $("body").has(".grop-galry_carousel").length;
	if(true == $hasCont){
		$(".grop-galry_carousel").each(function(){
			var $carousel, $loopItem;
			$carousel = $(this);
			$loopItem = $(".grop-galry_carousel  .grop-galryslid_single");
			$loopItem = ($loopItem.length > 1) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: 1,
				center:($carousel.data("center") !== undefined) ? $carousel.data("center") : false,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav: ($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>']
			});

		});
	}
	return;
}

/*============21.GOOGLE MAP CAROUSEL INIT ===========*/
function grop_googlemap_event(){
	var $contentGoogleMap = $("body").has("#event_location_map").length;
	var $latitude = $(".event-map").data('latitude');
	var $langitude = $(".event-map").data('langitude');
	  if(true == $contentGoogleMap){
			var mapselect = $("#event_location_map");
			mapselect.googleMap({
			  zoom:10,
			  type: "ROADMAP",
			  streetViewControl: false,
			  scrollwheel: false,
			  mapTypeControl: false,
			  coords: ['40.712784', '-74.005941'],
			  styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}],
			});

			mapselect.addMarker({
			  coords: [$latitude, $langitude],
			  icon: 'assets/images/map-maker.png',
			  title: ' ',
			  text: '<p class="grop-gm-text">new work</p>'
			});

	}
	return;
}

/*============  22.LATEST NEWS CAROUSEL INIT GALLERY ===========*/
function grop_offic_lc_carousel(){
	var latestNews = $("body").has(".grop-offic_loc_carousel").length;
	if(true == latestNews){
		$(".grop-offic_loc_carousel").each(function(){

			var $carousel, $loopItem, $items, $items_tablet,  $items_mobile;

			$carousel = $(this);
			$items = ($carousel.data("items") !== undefined) ? $carousel.data("items") : 3;
			$items_tablet = ($carousel.data("items-tablet") !== undefined) ? $carousel.data("items-tablet") : 2;
			$items_mobile = ($carousel.data("items-mobile") !== undefined) ? $carousel.data("items-mobile") : 1;

			$loopItem = $(".grop-offic_loc_carousel  .grop-officlc_single");
			$loopItem = ($loopItem.length > $items) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: $items,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav:($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navContainer:".grop-officlc_caro_nav",
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
				margin: ($carousel.data("margin") !== undefined) ? $carousel.data("margin") : 0,
				responsive:{
					0:{
						items:$items_mobile,
					},
					750:{
						items:$items_tablet,
					},
					970:{
						items:$items,
					},
					1170:{
						items:$items,

					}
				}
			});
		});
	}
	return;
}

/*============= 23.SOME CUSTOM  STYLE FOR CONTACT FORM  FUNCTION ===========*/
function grop_contact_form_input(){
	// input range and number filed
		var $rangeSelect,$numberFi;
		$rangeSelect = $(".grop-stylest-contact-form input[type='range'], .wpcf7-form-control-wrap input[type='range']");
		$numberFi = $(".grop-stylest-contact-form input[type='number'] , .wpcf7-form-control-wrap input[type='number']");

		$numberFi.on("change",function(){
			var max = parseInt($(this).attr('max'));
			var min = parseInt($(this).attr('min'));

		    if ($(this).val() > max)
		    {
		          $(this).attr("disabled","disabled");
		          $(this).val(max);
		    }
		    if($(this).val() < min){
		    	$(this).attr("disabled","disabled");
		        $(this).val(min);
		    }

			$rangeSelect.val($(this).val());

		});

		$rangeSelect.on("change",function(){
			var $rangeVal = $(this).val();
			$numberFi.removeAttr("disabled");
			$numberFi.val($rangeVal);
		});

	// input file upload
	var fileSelec = $(".grop-stylest-contact-form input[type='file'], .wpcf7-form-control-wrap input[type='file']");
	fileSelec.parent().addClass("grop-file-upload");
	fileSelec.before("<span class='grop-file-btn'>Upload</span>");
	fileSelec.after("<span class='grop-file-name'>No file selected</span>");
	fileSelec.on("change",function(){
		var fileName = $(this).val();
		$(this).next(".grop-file-name").text(fileName);
	});

  // input checkbox
  var $checkBoxSelector = $(".grop-stylest-contact-form input[type='checkbox'], .wpcf7-checkbox label input[type='checkbox']");
  $checkBoxSelector.after("<span class='grop-checkbox-btn'></span>");

  // input radio
  var $radioSelector = $(".grop-stylest-contact-form input[type='radio'], .wpcf7-radio label input[type='radio']");
  $radioSelector.after("<span class='grop-radio-btn'></span>");
}

/*============= 24.SOME CUSTOM  STYLE FOR CONTACT FORM  FUNCTION ===========*/
function grop_some_custom_fun(){

	$(".grop-hadr_search a").on("click",function(e){
		e.preventDefault();
		$(".grop-hadrsrch_form_warp").toggleClass("hadrsrch_active");
		$(".grop-hadrsrch_form  input[type='search']").on("blur",function(){
			$(".grop-hadrsrch_form_warp").removeClass("hadrsrch_active");
		});
		setTimeout(function(){
			$(".grop-hadrsrch_form  input[type='search']").focus();
		},100);
	});

	var tableclass = $(".grop-sigl_content table, .comment-content table").attr("class");

	if(undefined == tableclass || null == tableclass){
		$(".grop-sigl_content  table, .comment-content table").addClass("table");
	}
	return;
}

/*============  25.PROJECT DONORS CAROUSEL INIT GALLERY ===========*/
function grop_project_donors_caro(){
	var pjdnatr = $("body").has(".grop-pjdnatrsd_carousel").length;
	if(true == pjdnatr){
		$(".grop-pjdnatrsd_carousel").each(function(){

			var $carousel, $loopItem, $items, $items_tablet, $items_mobile;

			$carousel = $(this);
			$items = ($carousel.data("items") !== undefined) ? $carousel.data("items") : 4;
			$items_tablet = ($carousel.data("items-tablet") !== undefined) ? $carousel.data("items-tablet") : 2;
			$items_mobile = ($carousel.data("items-mobile") !== undefined) ? $carousel.data("items-mobile") : 1;

			$loopItem = $(".grop-pjdnatrsd_carousel  .dnatrsd_single_item");
			$loopItem = ($loopItem.length > $items) ? true : false;

			$carousel.owlCarousel({
				autoplay:($carousel.data("autoplay") !== undefined) ? $carousel.data("autoplay") : false,
				loop:$loopItem,
				items: $items,
				dots:($carousel.data("dots") !== undefined) ? $carousel.data("dots") : false,
				nav:($carousel.data("nav") !== undefined) ? $carousel.data("nav") : false,
				navText:['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
				margin: ($carousel.data("margin") !== undefined) ? $carousel.data("margin") : 0,
				responsive:{
					0:{
						items:$items_mobile,
					},
					750:{
						items:$items_tablet,
					},
					970:{
						items:$items,
					},
					1170:{
						items:$items,

					}
				}
			});
		});
	}
	return;
}

/*============ 28.WOOCOMMERCE CHCKBOX AND RADIO INPUT STYLE INIT FUNCTION ===========*/
function grop_input_chckbox_radio_style(){
	$(".woocommerce-checkout, .woocommerce-page, .woocommerce")
	.find("input[type='checkbox']")
	.after("<span class='grop-woo-check-style'></span>");
}

/*============= 29.HOME 4 SERVCIE BOX HOVER FUNCTION ===========*/
function grop_srvbox_hover_fun(){
	var srvbox = $("body").has(".grop-hm4srv_box_single").length;
	if(true == srvbox){
		$(".grop-hm4srv_box_warp").hover(function(){
			$(".grop-hm4srv_box_warp").removeClass("hm4srv_active");
			$(this).addClass("hm4srv_active");
		});
	}
	return;
}

/*============= 30.HOME 4 PIE  CHART FUNCTION ===========*/
function grop_pie_chart_fun(){
	var piechart = $("body").has("#donut").length;
	if(true == piechart){
		$("#donut").before("<div class='grop-chart_tolltip_list'></div>");
		var Html = "";
		$(".grop-piechart_list li").each(function(){
			var $this = $(this);
			$this.find(".grop-pc_box").css("background-color",$this.data("color"));
			Html+= '<div id="'+$this.data("id")+'">'+$this.data("title")+' - '+$this.data("value")+'%</div>';
		});

		$(".grop-chart_tolltip_list").html(Html);

		setTimeout(function(){
			$("#donut svg").find("text").each(function(i,txt){
				var pos = $(this).offset();
				$(".grop-chart_tolltip_list > div").eq(i).offset(pos);
			});

			$(".grop-chart_tolltip_list > div").each(function(i,txt){
				var $this,mar,marh;
				$this = $(this);
				mar = $this.width();
				marh = $this.height();
				$this.css({
					"margin-left":"-"+(mar/2)+"px",
					"margin-top":"-"+(marh/2)+"px",
				});
			});

		},100);

		$(".grop-chart_tolltip_list > div").hover(function(){
			$(".grop-chart_tolltip_list > div").removeClass("active");
			$(this).addClass("active");
		});

		function chartHover($select,find){
			$select.find(find).hover(function(){
				var $this,id;
					$this = $(this);
					id = $this.data("id");
					$("#"+id).addClass("active");
			},function(){
				var $this,id;
					$this = $(this);
					id = $this.data("id");
				$("#"+id).removeClass("active");
			});
		}

		chartHover($(".grop-piechart_list"),"li");
		chartHover($("#donut svg"),"g");

	}
	return;
}

/*============= 31.SINGLE POST SOCIAL FUNTION FUNCTION ===========*/
function grop_spsocial_expand_fun(){
	var spsocial = $("body").has(".grop-siglso_share_warp").length;
	if(true == spsocial){
		$(".grop-siglso_plus").on("click",function(e){
			e.preventDefault();
			$(".grop-siglso_share").toggleClass("spsocial_expand");
		});
	}
	return;
}

/*============= 32.POST CAROUSEL FUNCTION ===========*/
function grop_post_carousel_fun(){

	return;
}

/*============= xxxxxxxxxxxxxxxxxxxxxxxxx ===========*/

/*============= DOCUMENT READY ALL FUNCTION  CALL ===========*/
$(function(){

	if (typeof grop_slider_section_padding == 'function'){
		grop_slider_section_padding();
	}
	if (typeof grop_header_divider == 'function'){
		grop_header_divider();
	}
	if (typeof grop_big_link_overly == 'function'){
		grop_big_link_overly();
	}
	if (typeof grop_circular_progress == 'function'){
		grop_circular_progress();
	}
	if (typeof grop_upcoming_event_carousel == 'function'){
		grop_upcoming_event_carousel();
	}
	if (typeof grop_videoFitvids == 'function'){
		grop_videoFitvids();
	}
	if (typeof grop_counter_up_init == 'function'){
		grop_counter_up_init();
	}
	if (typeof grop_latest_news == 'function'){
		grop_latest_news();
	}
	// if (typeof grop_twitter_feeds == 'function'){
	// 	grop_twitter_feeds();
	// }
	if (typeof grop_mobil_menu == 'function'){
		grop_mobil_menu();
	}
	if (typeof grop_footer_colum_auto_adjust == 'function'){
		grop_footer_colum_auto_adjust();
	}
	if (typeof grop_progress_bar == 'function'){
		grop_progress_bar();
	}
	if (typeof grop_suess_stris_carousel == 'function'){
		grop_suess_stris_carousel();
	}
	if (typeof grop_hover_donators == 'function'){
		grop_hover_donators();
	}
	if (typeof grop_count_Down == 'function'){
		grop_count_Down();
	}
	if (typeof grop_linkClick_false == 'function'){
		grop_linkClick_false();
	}
	if (typeof grop_sucess2_stories == 'function'){
		grop_sucess2_stories();
	}
	if (typeof grop_offic_lc_carousel == 'function'){
		grop_offic_lc_carousel();
	}
	if (typeof grop_filter_function == 'function'){
		grop_filter_function();
	}
	if (typeof grop_our_impacts_carousel == 'function'){
		grop_our_impacts_carousel();
	}
	if (typeof grop_gallery_carousel == 'function'){
		grop_gallery_carousel();
	}
	if (typeof grop_our_gallery == 'function'){
		grop_our_gallery();
	}
	if (typeof grop_googlemap_event == 'function'){
		grop_googlemap_event();
	}
	if (typeof grop_contact_form_input == 'function'){
		grop_contact_form_input();
	}
	if (typeof grop_some_custom_fun == 'function'){
		grop_some_custom_fun();
	}
	if (typeof grop_project_donors_caro == 'function'){
		grop_project_donors_caro();
	}
	if (typeof grop_woocom_spinner == 'function'){
		grop_woocom_spinner();
	}
	if (typeof grop_input_chckbox_radio_style == 'function'){
		grop_input_chckbox_radio_style();
	}
	if (typeof grop_srvbox_hover_fun == 'function'){
		grop_srvbox_hover_fun();
	}
	if (typeof grop_pie_chart_fun == 'function'){
		grop_pie_chart_fun();
	}
	if (typeof grop_spsocial_expand_fun == 'function'){
		grop_spsocial_expand_fun();
	}
	if ( $('body div').hasClass('gradient') ) {
		$('.gradient .grop-banner_overly-op-22').addClass('grop-slider-gradient');
	}
});

/*============= WINDOW LOAD RESIZE FUNTION CALL ===========*/
$(window).on("load  resize",function(){
	if (typeof grop_slider_section_padding == 'function'){
		grop_slider_section_padding();
	}

	if (typeof grop_our_gallery == 'function'){
		grop_our_gallery();
	}
	if (typeof grop_filter_function == 'function'){
		grop_filter_function();
	}

});

$(window).load(function() {
  if (screen.width >= 650) {
    var maxheight = 0;
    $('.grop-cause_txts_content').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-cause_txts_content').height(maxheight);

    $('ul.products li.product').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('ul.products li.product').height(maxheight);

    $('.grop-causes_grid_area .grop-ucoming_evnt_txt_cont').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-causes_grid_area .grop-ucoming_evnt_txt_cont').height(maxheight);

    $('.grop-evnt_fltr_itm_warp .grop-ucoming_evnt_txt_cont').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-evnt_fltr_itm_warp .grop-ucoming_evnt_txt_cont').height(maxheight);

    $('.grop-vltrs_peple_sngle_intro .grop-vltrs_peple_intro_txt').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-vltrs_peple_sngle_intro .grop-vltrs_peple_intro_txt').height(maxheight);  

    $('.grop-hm3news_single_post_warp.grop-blog_grid .grop-news_pst_cont').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-hm3news_single_post_warp.grop-blog_grid .grop-news_pst_cont').height(maxheight);  

    $('.grop-news_single_post_warp .grop-news_pst_cont').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-news_single_post_warp .grop-news_pst_cont').height(maxheight);

    $('.grop-related_project .grop-projct_content_warp p').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-related_project .grop-projct_content_warp p').height(maxheight);  

    $('.grop-related_project .grop-projct_itm_warp').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-related_project .grop-projct_itm_warp').height(maxheight);

    $('.grop-officlc_single').each(function () {
      maxheight = ($(this).height() > maxheight ? $(this).height() : maxheight);
    });
    $('.grop-officlc_single').height(maxheight);
  }
});

/*============= ONLY WINDOW LOAD FUNTION CALL ===========*/
$(window).on("load",function(){

	//$("#grop-preloder-warp").delay(350).fadeOut("slow"); // will fade out the white DIV that covers the website.
	//$("body").removeAttr("data-preloder");
});

})(jQuery);