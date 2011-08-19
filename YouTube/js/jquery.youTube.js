/* jquery YouTube grabber, from systemseven (http://www.systemsevendesigns.com) released on blog : webdevkungfu.com */
(function($){
	$.fn.youTube = function(options) {
		var defaults = {
			videoHeader: null							/* header to display above video list*/
			,results : 5								/* number of results to return / display */
			,orderBy : null								/* what to order the results by */
			,query  : null								/* query to run against youTube videos */
			,author : null								/* author of the video */
			,showRatings : true							/* Display the rating stars assigns a class of 00,05,10,15,20,25,30,35,40,45,50 */
			,showNumRatings : true						/* Displays the actual number of ratings */
			,showViews : false							/* show number of views for the video */
			,showDescription : true						/* show a clipped version of the video description */
			,descriptionLength : 150					/* length of the description to bring back, will append ... to the end */
			,thumbnail : 'small'						/* small: 120x90 | large: 480 x 360 */
			,onload : null								/* function to call after data has been retreived */
		};
		options = $.extend(defaults, options);
		
		return this.each(function(){
			var container = $(this);
			requestYouTubeVideos();
			
			function requestYouTubeVideos()
			{
				if(options.videoHeader != null){container.append('<h3>'+options.videoHeader+'</h3>');}
				
				var requestUrl = 'http://gdata.youtube.com/feeds/api/videos?alt=json&max-results='+options.results;
				if(options.author != null){
					requestUrl += '&author='+options.author;
				}
				if(options.orderBy != null){
					requestUrl += '&orderby='+options.orderBy;
				}
				if(options.query != null){
					requestUrl += '&q='+options.query;
				}

				if (options.onload == null) {
					options.onload = defaultShow;
				}
				
				$.ajax({
				    type: "GET",
				    url: requestUrl,
				    dataType: 'jsonp',
				    success: onYouTubeSuccess,
					error: onYouTubeError
					})		
			}	
			
			function onYouTubeSuccess(result) {
				var feed = result.feed;
				var rfeed = feed.entry || [];
				var relVideos = [];

				if(rfeed.length > 0) {
					$(rfeed).each(function(i) {
						relVideos[i] = [];
						relVideos[i].id = stripFeature(rfeed[i].link[0].href.substring(rfeed[i].link[0].href.indexOf('=')+1,rfeed[i].link[0].href.length));
						relVideos[i].url = rfeed[i].link[0].href;
						relVideos[i].title = rfeed[i].title.$t;
						
						if (options.thumbnail == 'large') {
							var index = rfeed[i].media$group.media$thumbnail.length-1
						} else {
							var index = 0;
						}
						
						relVideos[i].thumbnail = rfeed[i].media$group.media$thumbnail[index].url;
						relVideos[i].description = rfeed[i].media$group.media$description.$t;
						relVideos[i].author = rfeed[i].author[0].name.$t;

						if (rfeed[i].media$group.media$keywords.$t.length > 0) {
							relVideos[i].tags = $.map(
								rfeed[i].media$group.media$keywords.$t.split(','), 
								jQuery.trim
							);
						} else {
							relVideos[i].tags = [];
						}

						if(rfeed[i].yt$statistics) {
							relVideos[i].views = rfeed[i].yt$statistics.viewCount;
						} else if(!rfeed[i].yt$statistics) {
							relVideos[i].views = '0';
						}

						if(rfeed[i].gd$rating){
							relVideos[i].rating = rfeed[i].gd$rating.average;
							relVideos[i].numRaters = rfeed[i].gd$rating.numRaters;
						} else if(!rfeed[i].gd$rating) {
							relVideos[i].rating = '0.00';
							relVideos[i].numRaters = '0';
						}
					}).ready(function(){
						options.onload(relVideos)
					});							
				} else {
					options.onload(null)
				}
			}

			function defaultShow(relVideos) {
				if (relVideos == null) {
					/* if we have no youtube videos returned, let's hide the container */
					container.hide();
					return 0;
				}

				relVideos.sort(arraySort);
				if (relVideos.length > 0) {
					$(relVideos).each(function(i){
						numRatings = (relVideos[i].numRaters != 1) ? 'ratings' : 'rating';
						numStars = getStarRating(relVideos[i].rating);
						
						container.append('<div class="video-item">');
							videoItem = container.find('.video-item:last');
							
							videoItem.append('<div class="video-thumb"><a href="'+relVideos[i].url+'" target="_blank" title="'+relVideos[i].title+'"><img src="' + relVideos[i].thumbnail + '" alt="' + relVideos[i].title + '" /></a></div>');
							
							videoItem.append('<div class="video-info">');
							videoInfo = videoItem.find('.video-info');
							videoInfo.append('<a href="'+relVideos[i].url+'" target="_blank" title="'+relVideos[i].title+'" class="video-title">' + relVideos[i].title + '</a>');
							if(options.showDescription){
								videoInfo.append('<p class="video-desc">'+setDescription(relVideos[i].description)+'</p>');
							}
							if (options.showRatings) {
								videoInfo.append('<div class="video-rating-'+numStars+'"></div>');
							}
							if (options.showNumRatings){
								videoInfo.append('<div class="video-num-ratings">'+relVideos[i].numRaters+' ratings</div>');
							}
							if (options.showViews) {
								videoInfo.append('<p class="video-num-views">' + relVideos[i].views + ' views</p>');
							}
							
					});
					container.append('<p class="moreabout"><a href="'+options.viewMoreLink+'" class="learn-more">'+options.viewMoreText+'</a></p>');	
					if (options.linkAction == 'modal') {
						$('.modalvideo').videoDialog({});
					}
				}

				return relVideos.length;
			}
			
			function onYouTubeError(result)
			{
				container.append('<p>Error connecting to YouTube</p>');
			}
			
			function setDescription(desc){
				if(desc.length > options.descriptionLength){
					return desc.substring(0,options.descriptionLength) + '...'
				}else{
					return desc;
				}
			}			
			
			function arraySort(a,b){
				if (a.title < b.title){ 
					return -1; 
				}
				else if (a.title > b.title){
					return 1; 
				}
				else{
					return 0;
				}
			}

			function stripFeature(vidID){
				var featureLoc = vidID.indexOf('&feature=youtube_gdata');
				if(featureLoc >= 0){
					return vidID.substring(0,featureLoc);
				} else {
					return vidID;	
				}
			}

			function getStarRating(rating){
				if (rating >= 5.00){
					return '50';
				}
				else if(rating >=4.50 && rating <= 4.99){
					return '45';
				}
				else if(rating >=4.00 && rating <=4.49){
					return '40';
				}
				else if(rating >=3.50 && rating <= 3.99){
					return '35';
				}
				else if(rating >=3.00 && rating <= 3.49){
					return '30';
				}
				else if(rating >=2.50 && rating <= 2.99){
					return '25';
				}
				else if(rating >=2.00 && rating <= 2.49){
					return '20';
				}
				else if(rating >=1.50 && rating <= 1.99){
					return '15';
				}
				else if(rating >= 1.00 && rating <= 1.49){
					return '10';
				}
				else if(rating >=0.50 && rating <= 0.99){
					return '05';
				}
				else if(rating == 0.00){
					return '00';
				}
			}
			
		});
	};
})(jQuery);