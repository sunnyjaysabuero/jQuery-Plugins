(function($){
	$.fn.cropZoom = function(options) {
		var defaults = {
			zoomIndicator: 'cursor' /* what shows when you mouseover the image, the cursor or a box*/
			,zoomBox: {
						 width: 75  			/*width of the zoom box in px*/
						,height: 75			/*height of the zoom box in px*/
						,background: '#777' 	/*background color of the zoom box*/
						,border: '#000' 		/*border color of the zoom box*/
						,opacity: .5			/*opacity of the zoom box*/
						}
		};
	
		options = $.extend(defaults, options);
		
		return this.each(function(){
			imageContainer = $(this);
			zoomImage = imageContainer.find('img');
			zoomOptions = options;
			imageContainer.append('<div class="cz_zoomBox"></div>');
			zoomBox = imageContainer.find('.cz_zoomBox');
			zoomBox.hide();

			imageContainer.css({position: 'relative', overflow: 'hidden'});
			proportionalResize();
			setVerticalCenter();
			initalizeZoomBox();
			
			/* set these as key/value to support pre 1.4 */
				zoomImage.data('zoomFactor', (imageContainer.width() / zoomBox.width()));
				zoomImage.data('zoom', 1);
				zoomImage.data('top', 0);
				zoomImage.data('left', 0);
				zoomImage.data('width', zoomImage.width());
				zoomImage.data('height', zoomImage.height());
				zoomImage.data('originalWidth', zoomImage.width());
				zoomImage.data('originalHeight', zoomImage.height());
			
			zoomBox.bind('click',function(e){
				e.preventDefault();
				scaleImage($(this).position().left,$(this).position().top);
			});

		function proportionalResize(){
			if(zoomImage.attr('width') > zoomImage.attr('height'))
			{
				var ratio = imageContainer.css('width').replace('px','')/zoomImage.attr('width');
				zoomImage.css('height',(zoomImage.attr('height')*ratio));
			}else{
				var ratio = imageContainer.css('height').replace('px','')/zoomImage.attr('height');
				zoomImage.css('width',(zoomImage.attr('width')*ratio));		
			}
		};
		
		function setVerticalCenter(){
			var containerCenter = (imageContainer.css('height').replace('px','')/2);
			var vc = containerCenter - (zoomImage.css('height').replace('px','')/2);
			zoomImage.css({position: 'absolute',left: 0, top: vc });
			zoomImage.data('verticalCenter',vc);
		};	
		function initalizeZoomBox(){
			viewOffset = imageContainer.offset();
			zoomBox.css({
				width: zoomOptions.zoomBox.width + 'px'
				,height: zoomOptions.zoomBox.height + 'px'
				,background: zoomOptions.zoomBox.background
				,border: '1px solid ' + zoomOptions.zoomBox.border
				,position: 'absolute'
				,opacity: zoomOptions.zoomBox.opacity
			});
			
			switch(zoomOptions.zoomIndicator){
				case 'box':
				break;
				case 'pointer':
					zoomBox.css({background: 'none', border: 'none'});
				break;
			}		
			
			//bind events
			imageContainer.bind('mouseover',function(e){
				zoomBox.show();
			});
			imageContainer.bind('mouseout',function(e){
				zoomBox.hide();
				
			});
			
			zoomBox.bind('mouseout',function(e){
				resetImage();			
			});
			
			imageContainer.bind('mousemove',function(e){
				var wst = $(window).scrollTop();
				var wsl = $(window).scrollLeft();
				setZoomPosition(Math.floor(e.clientX - viewOffset.left + wsl), Math.floor(e.clientY - viewOffset.top + wst));
			});
		};
	
		function setZoomPosition(mouseLeft,mouseTop){
			var zoomLeft = (mouseLeft - (zoomOptions.zoomBox.width / 2));
			var zoomTop = (mouseTop - (zoomOptions.zoomBox.height / 2));
			zoomLeft = Math.max(zoomLeft,0);
			zoomTop = Math.max(zoomTop,0);
			
			zoomLeft = Math.min(zoomLeft,(imageContainer.width() - zoomBox.outerWidth()));
			zoomTop = Math.min(zoomTop,(imageContainer.height() - zoomBox.outerHeight()));
			
			zoomBox.css({left: (zoomLeft + 'px'), top: (zoomTop + 'px')});
			
		};
		
		function scaleImage(zoomLeft,zoomTop){
			if((zoomImage.data('zoom') == 4) || (zoomImage.is(":animated")))
			{
				resetImage();
				return
			}
			zoomImage.data('width',(zoomImage.width() * zoomImage.data('zoomFactor')));
			zoomImage.data('height',(zoomImage.height() * zoomImage.data('zoomFactor')));
			zoomImage.data('left',((zoomImage.data('left') - zoomLeft) *zoomImage.data('zoomFactor')));
			zoomImage.data('top',((zoomImage.data('top') - zoomTop) *zoomImage.data('zoomFactor')));
			zoomImage.data('zoom',(zoomImage.data('zoom')+1));
			
			zoomImage.animate(
				{
					width: zoomImage.data('width')
					,height: zoomImage.data('height')
					,left: zoomImage.data('left')
					,top: zoomImage.data('top')
				},
				500
			);
		};
		
		function resetImage(){
			zoomImage.data('width',zoomImage.data('originalWidth'));
			zoomImage.data('height',zoomImage.data('originalHeight'));
			zoomImage.data('left',0);
			zoomImage.data('top',0);
			zoomImage.data('zoom',1);	
			zoomImage.animate(
				{
					width: zoomImage.data('width')
					,height: zoomImage.data('height')
					,left: zoomImage.data('left')
					,top: zoomImage.data('verticalCenter')
				},
				{
					duration: 500,
					complete: function(){
						setVerticalCenter();
					}
				}
				
			);		
			
		};			
		
		
		
		});
	};
})(jQuery);