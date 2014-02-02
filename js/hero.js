/*
 * Featured Hero script
 * Scrolling carousel of speech bubbles
 * Scrolls (repeating) infinitely in the direction of the mouse.
 * If mouse scrolls left/right of middle, direction changes accordingly.
 * params: selector (CSS selector for the containing div)
 */
var Hero = function(selector, callback) {
    var _this = this;

    _this.currentX = -99;
    _this.currentY = -99;
    _this.stopped = false;
    _this.lastPopup = {};
    _this.lastBubble = null;
    _this.PopupHeight = '-590px';

    // defaults:
    var $container = $(selector + ' > ul'),
        screenWidth = $(selector).width(),
        itemWidth = $(selector + ' > ul li:first-child').width(),
        itemHeight = $(selector + ' > ul li:first-child').height(),
        $items = $(selector + ' > ul li'),
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

    // show the popup on click
    var showPopup = function(el) {
        el.animate({
            top: '20px'
        }, 800, 'easeOutBack');
    };

    var hidePopup = function(el) {
        _this.stopped = false;
        el.animate({
            top: _this.PopupHeight
        }, 600, 'easeInBack', function() {
            // hide share pane automatically on close of popup
            el.parent().find('.sharepane').css('left', '0px');
            // fade back in the list of bubbles
            $container.animate({'opacity': '1.0'});
            main();
        });
    };

    // click handler to stop/restart scrolling animation
    $(selector + ' > ul').on('click', 'li', function(e){
        if (_this.stopped) {
            hidePopup(_this.lastPopup);
        } else {
            var item = ($(this).attr('class').replace('over','').replace('item','') * 1) + 1;
            clearInterval(_this.loop);
            _this.stopped = true;
            $container.animate({'opacity': '0.25'});
            _this.lastPopup = $(selector + ' div.popup.item' + item);
            showPopup(_this.lastPopup);
        }
    });

    $(selector + ' div.popup .close').on('click', function(e){
        e.preventDefault();
        hidePopup($(this).parents('div.popup'));
    });
    $(selector + ' .popup .share').on('click', function(e) {
        if ($(this).parent().find('.sharepane').position().left === 0) {
            $(this).parent().find('.sharepane').animate({'left': '-80px'}, 500, 'easeOutQuad');
        } else {
            $(this).parent().find('.sharepane').animate({'left': '0px'}, 500, 'easeOutQuad')
        }
    });

    var animateOver = function(el) {
        if (_this.lastBubble) {
            animateOut(_this.lastBubble);
        }
        el.stop().animate({
            margin: '0px', width: '403px', height: '417px'
        }, 100, 'swing');
        _this.lastBubble = el;
    };
    var animateOut = function(el) {
        el.stop().animate({
            width: '370px', height: '383px', margin: '17px'
        }, 100, 'swing');
    };
    var applyHovers = function() {
        $(selector + ' > ul li').on('mouseover', 'img', function(e){
            e.stopPropagation();
            if (!_this.stopped) {
                animateOver($(this));
            }
        });
        $(selector + ' > ul li').on('mouseout', 'img', function(e){
            e.stopPropagation();
            if (!_this.stopped) {
                animateOut($(this));
                _this.currentX = -99;
                _this.currentY = -99;
            }
        });
    }
    applyHovers();

    // refresh cached list of items and reset UI events
    var refresh = function() {
        $items = $(selector + ' > ul li');
        applyHovers();
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

    $container.on('mousemove', function(e) {
        // flip 1 : -1 to reverse scroll direction based on mouse location
        // current implementation is more "touch like" (opposite scroll)
        direction = e.clientX < midpoint ? 1 : -1;
        _this.currentX = e.clientX;
        _this.currentY = e.clientY;
    });

    /*
     * Main loop:
     * Every N ms, move each item in the appropriate direction
     * If the right most item is about to be fully on screen,
     * duplicate the first item and append after the last.
     * If the left most item is about to be fully off screen, remove it.
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

                // make sure to animate hover on an idle mouse
                if (_this.currentX >= $(item).position().left &&
                    _this.currentX <= $(item).position().left + itemWidth &&
                    _this.currentY >= $(item).position().top &&
                    _this.currentY <= $(item).position().top + $(item).height()) {
                    animateOver($(item).children('img'));
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

    // set initial positions:
    $items.each(function(index, item) {
        var $item = $(item);
        var i = index;
        if (index > totalItems-1)
            i = index - totalItems;
        $item.css({'left':(index*itemWidth), 'top': '-' + (itemHeight+20) + 'px'}).addClass('item' + i);
    });

    if (callback)
        callback();

    // drop them in before starting the main animation
    var dropIt = function(n) {
        $($items[n]).animate({ 'top' : '0px'}, 800, 'easeOutBack');
        if (n < $items.length) {
            setTimeout(function() {
                dropIt(n+1);
            }, 300);
        } else {
            // start the main loop
            main();
        }
    }

    dropIt(0);
};
