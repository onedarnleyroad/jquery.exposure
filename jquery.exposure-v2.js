(function($) {

    var _uidCounter = 0;

    // layout all the things!
    function _layout($container, elements, options) {
        var row, rowWidth, rowHeight, elementWidth, remainingWidth,
            containerWidth = $container.width(),
            _w = function(width, height) {
                // resize an element so that it matches the height
                // of the row's first element, and return the width
                return (row.length > 1) ? Math.round(width * row[0].height / height) : width;
            },
            _reset = function() {
                // console.log('reset');
                row = [];
                rowWidth = rowHeight = elementWidth = remainingWidth = 0;
            };

        // reset for first run
        _reset();

        for (i=0; i < elements.length; i++) {

            // add element to end of row
            row.push(elements[i]);
            // console.log(elements[i]);

            // update total row width
            rowWidth += _w(elements[i].width, elements[i].height);
            // console.log('row width: ' + rowWidth);

            // calculate row height if the row was sized to 100% of container
            rowHeight = Math.round(row[0].width / rowWidth * containerWidth * row[0].aspectRatio);
            // console.log('row height: ' + rowHeight);

            // is row height within bounds, or have we reached the last row?
            if (rowHeight <= options.maxHeight || i == elements.length - 1) {

                // console.log('within bounds or at last row');

                // set remaining width to container width
                remainingWidth = containerWidth;

                for (j=0; j < row.length; j++) {

                    // calculate element width based on row height
                    elementWidth = Math.round(rowHeight / row[j].aspectRatio);
                    // console.log('element width: ' + elementWidth);

                    // if the calculated width is less than remaining,
                    // or if it's the last element in row,
                    // then set element width to remaining width
                    if(remainingWidth < elementWidth || j == row.length - 1) {
                        elementWidth =  remainingWidth;
                    }

                    // apply width & height styles to element
                    $(row[j].el).css({
                        width: elementWidth + 'px',
                        height : rowHeight + 'px'
                    });

                    // re-calculate remaining width
                    remainingWidth -= elementWidth;
                    // console.log('remaining width: ' + remainingWidth);
                }

                // start a new row
                _reset();
            }
        }
    };

    var Exposure = function(el, o) {

        this.options = $.extend({
            selector: 'img',
            maxHeight: 500
            }, o);

        this.$container = $(el);
        this.$elements = this.$container.find(this.options.selector);
        this.elements = [];
        this.uid = _uidCounter + 1;
        _uidCounter++;


        // build array of element attributes
        for (i=0; i < this.$elements.length; i++) {

            var e = this.$elements[i],
                w = parseInt(e.getAttribute('data-w')),
                h = parseInt(e.getAttribute('data-h')),
                r = h / w;

            this.elements.push({
                el          : e,
                width       : w,
                height      : h,
                aspectRatio : r
            });
        }

        // fire layout for the first time
       this.layout();

       return this;
    };

    Exposure.prototype.layout = function() {
        _layout(this.$container, this.elements, this.options)
        return this;
    };

    Exposure.prototype.update = function(o) {
        this.options = $.extend(this.options, o);
        return this;
    };



    $.fn.exposure = function(o) {

        // @TODO - the destory method
        // doesn't really work if other
        // parts of the app are calling Exposure.layout()
        // which might be okay, but in other words
        // the app is responsible for killing events
        // as well as destorying things

        if (o === 'destroy') {

            var _exp = $(this).data('exposure');

            if (_exp.hasOwnProperty('$elements')) {
                _exp.$elements.each(function() {
                    $(this).css({
                        width: '',
                        height : ''
                    });
                });
            }

            $(window).off('resize.exposure' + _exp.uid );
            $(this).data('exposure', false);

            return;
        }

        if ($(this).data('exposure')) {
            return $(this).data('exposure');
        }

        // extend default options with user-defined overrides
        var _exp = new Exposure( $(this), o );

        // unbind any previous resize events of same uid
        $(window).off('resize.exposure' + _exp.uid );

        // bind layout to resize event
        $(window).on('resize.exposure' + _exp.uid, function() {
            _exp.layout();
        });

        // store functionality on the container
        $(this).data('exposure', _exp);

        return _exp;

    };


}(jQuery));
