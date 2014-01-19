/*
 * Featured Hero script
 * Scrolling carousel of speech bubbles
 * Scrolls (repeating) infinitely in the direction of the mouse.
 * If mouse scrolls left/right of middle, direction changes accordingly.
 * params: selector (CSS selector for the containing div)
 */
var Hero = function(selector) {
    var _this = this;

    _this.currentX = -99;
    _this.currentY = -99;
    _this.stopped = false;
    _this.lastPopup = {};

    // defaults:
    var $container = $(selector + ' ul'),
        screenWidth = $(selector).width(),
        itemWidth = $(selector + ' ul li:first-child').width(),
        $items = $(selector + ' ul li'),
        totalItems = $items.length,
        itemsPerScreen = parseInt(screenWidth / itemWidth)+1,
        screenOffset = (screenWidth - (itemsPerScreen*itemWidth))*-1,
        midpoint = screenWidth / 2,
        speed = 1,
        direction = -1;

    var logger = {
        screenWidth: screenWidth,
        itemWidth: itemWidth,
        items: $items,
        totalItems: totalItems,
        itemsPerScreen: itemsPerScreen,
        screenOffset: screenOffset};


    $(selector + ' ul').on('click', 'li', function(e){
        if (_this.stopped) {
            _this.stopped = false;
            _this.lastPopup.animate({
                top: '-570px'
            }, 600, 'easeInBack', function() {
                $container.animate({'opacity': '1.0'});
                main();
            });
        } else {
            clearInterval(_this.loop);
            _this.stopped = true;
            $container.animate({'opacity': '0.25'});
            _this.lastPopup = $(selector + ' div.popup.' + $(this).attr('class').replace('over',''));
            _this.lastPopup.animate({
                top: '20px'
            }, 800, 'easeOutBack');
        }
    });
    $(selector + ' ul').on('mouseover', 'li', function(e){
        if (!_this.stopped) {
            $(this).addClass('over');
        }
    });
    $(selector + ' ul').on('mouseout', 'li', function(e){
        if (!_this.stopped) {
            $(this).removeClass('over');
            _this.currentX = -99;
            _this.currentY = -99;
        }
    });

    // refresh cached list of items and reset UI events
    var refresh = function() {
        $items = $(selector + ' ul li');
    };

    // make sure there are enough to fill the loop - if not double the initial
    // collection of items (will correct itself after the first loop)
    if (itemsPerScreen+1 > $items.length) {
        for(var i = 0; i < $items.length; i+=1) {
            var $copy = $($items.get(i)).clone();
            $container.append($copy);
        }
        refresh();
    }

    // set initial positions:
    $items.each(function(index, item) {
        var $item = $(item);
        var i = index;
        if (index > totalItems-1)
            i = index - totalItems;
        $item.css({'left':index*itemWidth}).addClass('item' + i);
    });

    $container.on('mousemove', function(e) {
        direction = e.clientX < midpoint ? -1 : 1;
        _this.currentX = e.clientX;
        _this.currentY = e.clientY;
    });

    /*
     * Main loop:
     * Every N ms, move each item in the appropriate direction
     * If the right most item is about to be fully on screen,
     * duplicate the first item and append after the last.
     * If the left most item is about to be fully off screen, remove it.
     *
     * A bug exists where if there is only 1 > itemsPerScreen, the first item
     * will duplicate. To fix, have total items >= itemsPerScreen + 2 ;)
    */
    var main = function() {
        refresh();
        _this.loop = setInterval(function() {
            $items.each(function(i, item) {
                var dir = 'left',
                    offsetIndex = 0,
                    $copy;
                if (direction === 1) {
                    dir = 'right';
                    offsetIndex = $items.length-1;
                }

                // move the item (correct direction)
                $(item).css({'left': $(item).position().left + (direction * speed) + 'px'});
                if (_this.currentX >= $(item).position().left &&
                    _this.currentX <= $(item).position().left + itemWidth &&
                    _this.currentY >= $(item).position().top &&
                    _this.currentY <= $(item).position().top + $(item).height()) {
                    $items.removeClass('over');
                    $(item).addClass('over');
                }

                // check if we loop back around the item
                if(dir === 'left') {
                    if ($($items.get(0)).position().left <= (itemWidth*-1)) {
                        $copy = $($items.get(0)).clone();
                        $copy.css({'left': $($items.get($items.length-1)).position().left + itemWidth + 'px'}).removeClass('over');
                        $container.append($copy);
                        $($items.get(0)).remove();
                        clearInterval(_this.loop);
                        main();
                    }
                } else if (dir === 'right') {
                    if ($($items.get(0)).position().left >= 0) {
                        $copy = $($items.get(offsetIndex)).clone();
                        $copy.css({'left': (itemWidth*-1) + 'px'}).removeClass('over');
                        $container.prepend($copy);
                        $($items.get(offsetIndex)).remove();
                        clearInterval(_this.loop);
                        main();
                    }
                }
            });
        }, 15);
    };

    // start the main loop
    main();
};
