var SliderBar = function(container, options) {
    var _this = this;

    // defaults:
    _this.$parent = '';
    _this.$container = '';
    _this.$items = '';
    _this.currentPage = 1;
    _this.currentItem = 0;
    _this.perPage = 5;
    _this.totalItems = 0;
    _this.itemSpeed = 450;
    _this.itemEasing = 'swing';
    _this.initialDir = 'left';
    _this.containerWidth = 0;
    _this.edge = 0;
    _this.isAnimating = false;

    var arrow = '<a rel="PREVNEXT" style="display: none; position: absolute;" class="arrow dir_DIR"><img src="img/arrow_DIR.png" /></a>';

    // initialize:
    if (container !== undefined) {
        _this.$container = $(container + ' ul');
        _this.$parent = $(container);
        _this.$items = _this.$container.children('li');
    } else {
        throw new Error("Container selector (string) is a required parameter.");
    }
    if (options !== null && options !== undefined) {
        if (options.perpage !== undefined) {
            _this.perPage = options.perpage;
        }
        if (options.itemSpeed !== undefined) {
            _this.itemSpeed = options.itemSpeed;
        }
        if (options.itemEasing !== undefined) {
            _this.itemEasing = options.itemEasing;
        }
        if (options.initialDir !== undefined) {
            _this.initialDir = options.initialDir;
        }
    }

    // boot up (prepare the work area and get it ready for UI)
    _this.bootUp = function bootup() {
        _this.totalItems = _this.$items.length;
        _this.$container.css({
            'position': 'relative',
            'height': '100%',
            'overflow': 'hidden'
        });
        _this.$container.before(arrow.replace('PREVNEXT', 'right').replace(/DIR/g, 'left')).before(arrow.replace('PREVNEXT', 'left').replace(/DIR/g, 'right'));
        _this.$items.css('display', 'inline-block');
        _this.itemWidth = $(_this.$items[0]).width();

        // determine outer right edge of screen:
        _this.containerWidth = _this.$container.width();
        _this.edge = _this.containerWidth - _this.$container.position().left;

        $(_this.$items).css({
            'position': 'absolute',
            'top': '0px',
            'left': _this.edge + 'px'
        });

        // events
        _this.$parent.on('click', 'a.arrow', function() {
            if (!_this.isAnimating) {
                _this.$parent.find('a.arrow').fadeOut('fast');
                _this.isAnimating = true;
                _this.groupOut($(this).attr('rel'));
            }
        });
    };

    // animations
    _this.itemIn = function itemIn(currentItem, dir, callback) {
        if (currentItem < _this.$items.length) {
            var $item = $(_this.$items[currentItem]);
            var itemIndex = currentItem - (_this.perPage * (_this.currentPage - 1));

            var start = 0,
                dest = 0;
            if (dir === 'left') {
                start = _this.edge;
            } else if (dir === 'right') {
                start = '-' + ((1 * _this.itemWidth));
            }
            $item.css('left', start + 'px').animate({
                'left': (itemIndex * _this.itemWidth) + 'px'
            }, _this.itemSpeed, _this.itemEasing, callback);
        } else {
            if (typeof(callback) === 'function')
                callback();
        }
    };
    _this.itemOut = function itemOut(currentItem, dir, callback) {
        if (currentItem < _this.$items.length) {
            var dest = 0;
            if (dir === 'right') {
                dest = _this.edge;
            } else if (dir === 'left') {
                dest = '-' + ((1 * _this.itemWidth));
            }
            var $item = $(_this.$items[currentItem]);
            $item.animate({
                'left': dest + 'px'
            }, _this.itemSpeed * 0.65, _this.itemEasing, callback);
        } else {
            if (typeof(callback) === 'function')
                callback();
        }
    };

    _this.groupIn = function groupIn(dir) {
        var currentItem,
            itemsin;
        if (dir === 'left') {
            currentItem = _this.currentItem;
            itemsin = window.setInterval(function() {
                if (currentItem < (_this.perPage * _this.currentPage) - 1) {
                    _this.itemIn(currentItem, dir);
                    currentItem++;
                } else {
                    _this.itemIn(currentItem, dir, function() {
                        _this.showArrows();
                        _this.isAnimating = false;
                    });
                    window.clearInterval(itemsin);
                }
            }, _this.itemSpeed * 0.5);
        } else if (dir === 'right') {
            currentItem = (_this.currentItem + _this.perPage) - 1;
            itemsin = window.setInterval(function() {
                if (currentItem > ((_this.currentPage - 1) * _this.perPage)) {
                    _this.itemIn(currentItem, dir);
                    currentItem--;
                } else {
                    _this.itemIn(currentItem, dir, function() {
                        _this.showArrows();
                        _this.isAnimating = false;
                    });
                    window.clearInterval(itemsin);
                }
            }, _this.itemSpeed * 0.5);

        }
    };

    _this.groupOut = function groupOut(dir) {
        var currentItem,
            itemsin;
        if (dir === 'left') {
            currentItem = _this.currentItem;
            itemsout = window.setInterval(function() {
                if (currentItem < (_this.perPage * _this.currentPage) - 1) {
                    _this.itemOut(currentItem, dir);
                    currentItem++;
                } else {
                    _this.currentPage++;
                    _this.currentItem = currentItem + 1;
                    _this.groupIn(dir);

                    _this.itemOut(currentItem, dir, function() {
                        _this.isAnimating = false;
                    });
                    window.clearInterval(itemsout);
                }
            }, _this.itemSpeed * 0.30);
        } else if (dir === 'right') {
            currentItem = (_this.currentItem + _this.perPage) - 1;
            itemsout = window.setInterval(function() {
                if (currentItem > ((_this.currentPage - 1) * _this.perPage)) {
                    _this.itemOut(currentItem, dir);
                    currentItem--;
                } else {
                    _this.currentPage--;
                    _this.currentItem = currentItem - (_this.perPage);
                    _this.groupIn(dir);

                    _this.itemOut(currentItem, dir, function() {
                        _this.isAnimating = false;
                    });
                    window.clearInterval(itemsout);
                }
            }, _this.itemSpeed * 0.30);
        }
    };

    _this.showArrows = function showArrows() {
        if (_this.currentPage > 1)
            _this.$parent.find('a.arrow.dir_left').fadeIn('fast');
        else
            _this.$parent.find('a.arrow.dir_left').fadeOut('fast');

        if (_this.currentPage < (_this.$items.length / _this.perPage))
            _this.$parent.find('a.arrow.dir_right').fadeIn('fast');
        else
            _this.$parent.find('a.arrow.dir_right').fadeOut('fast');
    };

    _this.bootUp();
    // load the first group in on startup
    _this.groupIn(_this.initialDir);

};
