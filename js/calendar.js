/**
 * @author Linyu(linyu03@baidu.com)
 * @file Calendar
 * 日期选择控件
 * 可以自定义配置日期可选的范围: minDate ~ maxDate
 */

/* globals calendarLang */
(function ($) {

    /**
     * 日历控件中用到的常量信息,
     * _CLASS后缀的常量是控件中用到的样式类
     * _COMMAND后缀表示控件中用到的执行命令
     */
    var NUMBER_REG                  = /\d+/g;

    var INPUT_DATE_CLASS            = 'date-picker';
    var CALENDAR_PANEL_CLASS        = 'cal-container';
    var CALENDAR_TOP_BAR_CLASS      = 'cal-top-bar';

    var YEAR_OR_MONTH_WRAPPER_CLASS = 'cal-title';
    var INPUT_YEAR_CLASS            = 'txt-year';
    var INPUT_MONTH_CLASS           = 'txt-month';
    var LABEL_YEAR_CLASS            = 'lbl-year';
    var LABEL_MONTH_CLASS           = 'lbl-month';

    var LIST_YEAR_CLASS             = 'year-list';
    var LIST_MONTH_CLASS            = 'month-list';

    var CALENDAR_CELL_CLASS         = 'cal-cell';
    var CALENDAR_ROW_CLASS          = 'cal-row';
    var CALENDAR_WEEK_CLASS         = 'cal-week';

    var CALENDAR_HOLIDAY_CLASS      = 'holiday';
    var HIGHLIGHT_CLASS             = 'highlight';
    var SELECTED_DAY_CLASS          = 'on';

    var PREV_YEAR_CLASS             = 'prev-year';
    var NEXT_YEAR_CLASS             = 'next-year';
    var PREV_MONTH_CLASS            = 'prev-month';
    var NEXT_MONTH_CLASS            = 'next-month';

    var PREV_YEAR_COMMAND           = 'prevYear';
    var NEXT_YEAR_COMMAND           = 'nextYear';
    var PREV_MONTH_COMMAND          = 'prevMonth';
    var NEXT_MONTH_COMMAND          = 'nextMonth';
    var EDIT_YEAR_COMMAND           = 'editYear';
    var EDIT_MONTH_COMMAND          = 'editMonth';
    var SELECT_YEAR_COMMAND         = 'selectYear';
    var SELECT_MONTH_COMMAND        = 'selectMonth';
    var SELECT_DAY_COMMAND          = 'selectDay';

    /**
     * 日期控件的可选的配置信息，以后扩展其他可选项可以添加在此处
     * 当前包含日期可选范围、默认语言
     */
    var $settings = {
        minDate: '1900-01-01', // 默认指定最小日期
        maxDate: '2199-12-31', // 默认指定最大日期
        lang   : 'zh-CN' // 指定默认语言
    };
    var $date = new Date();

    /**
     * 定义日期控件的默认值
     */
    var $defaults = {
        year : $date.getFullYear(),
        month: $date.getMonth(),
        day  : $date.getDate(),
        week : $date.getDay()
    };

    /**
     * 用于记录当前的日期的输入控件
     */
    var $curInputControl = null;

    // 添加jquery成员方法
    $.fn.extend({
        calendar: function (options) {
            $.calendar.render($(this), options);
        },
        validate: function () {
            var self = $(this);
            if (!self.hasClass(INPUT_DATE_CLASS)) {
                return;
            }
            var v = self.val();
            if (v) {
                return $.calendar.isValidDate(v);
            }
        }
    });

    /**
     * 定义calendar静态方法
     */
    $.calendar = {
        container: null,
        options: {},
        init: function (s) {
            $.extend($settings, s);
            if (typeof calendarLang === 'undefined' || !calendarLang) {
                this.initLanguage();
            }
        },
        render: function (c, options) {
            this.container = c;
            this.options   = $.extend({}, $settings, options || {});

            this.appendCalendarPanel();
            this.bindInputEvent();
        },

        /**
         * 初始化语言包
         */
        initLanguage: function () {
            $.ajax({
                url: 'js/lang/' + $settings.lang + '.js',
                type: 'GET',
                dataType: 'script',
                async: false
            });
        },

        /**
         * 给输入框绑定focus和change事件，以及给日历面板绑定click事件
         */
        bindInputEvent: function () {
            var inputDates = this.container.find('.' + INPUT_DATE_CLASS);
            inputDates.bind('focus', {options: this.options}, showCalender)
                      .bind('change', onInputDateChange);
        },

        /**
         * 打印日历面板, 初始化时调用
         */
        appendCalendarPanel: function () {
            var year  = $defaults.year;

            // month是通过getMonth()取到的值，范围是从0～11
            var month = $defaults.month;

            // 页面上展现的月份范围应该是1～12，所以要加1
            var m = month + 1;
            var calPanel = $('.' + CALENDAR_PANEL_CLASS);
            if (!(calPanel && calPanel.length)) {
                var html = '<div class="' + CALENDAR_PANEL_CLASS + '">'
                + '    <div class="' + CALENDAR_TOP_BAR_CLASS + '">'
                + '        <div class="' + PREV_YEAR_CLASS + '" data-command="' + PREV_YEAR_COMMAND + '">&lt;</div>'
                + '        <div class="' + YEAR_OR_MONTH_WRAPPER_CLASS + '" data-year="'
                + year + '" data-month="' + month + '">'
                + '            <input type="text" class="' + INPUT_YEAR_CLASS + '" value="' + year + '" />'
                + '            <label class="' + LABEL_YEAR_CLASS + '" data-command="' + EDIT_YEAR_COMMAND + '">'
                + year + '</label>' + calendarLang.year
                + '        </div>'
                + '        <ul class="' + LIST_YEAR_CLASS + '"></ul>'
                + '        <div class="' + NEXT_YEAR_CLASS + '" data-command="' + NEXT_YEAR_COMMAND + '">&gt;</div>'
                + '        <div class="' + PREV_MONTH_CLASS + '" data-command="' + PREV_MONTH_COMMAND + '">&lt;</div>'
                + '        <div class="' + YEAR_OR_MONTH_WRAPPER_CLASS + '" data-year="' + year
                + '" data-month="' + month + '">'
                + '            <input type="text" class="' + INPUT_MONTH_CLASS + '" value="' + m + '" />'
                + '            <label class="' + LABEL_MONTH_CLASS + '" data-command="' + EDIT_MONTH_COMMAND + '">'
                + m + '</label>' + calendarLang.month
                + '        </div>'
                + '        <ul class="' + LIST_MONTH_CLASS + '"></ul>'
                + '        <div class="' + NEXT_MONTH_CLASS + '" data-command="' + NEXT_MONTH_COMMAND + '">&gt;</div>'
                + '    </div>'
                + '    <div class="' + CALENDAR_WEEK_CLASS + '">'
                + '        <span class="' + CALENDAR_HOLIDAY_CLASS + '">' + calendarLang.sunday + '</span>'
                + '        <span>' + calendarLang.monday + '</span>'
                + '        <span>' + calendarLang.tuesday + '</span>'
                + '        <span>' + calendarLang.wednesday + '</span>'
                + '        <span>' + calendarLang.thursday + '</span>'
                + '        <span>' + calendarLang.friday + '</span>'
                + '        <span class="' + CALENDAR_HOLIDAY_CLASS + '">' + calendarLang.saturday + '</span>'
                + '    </div>'
                + '</div>';
                $('body').append(html);

                /**
                 * 生成月份选择列表，1～12个月，当前月份显示高亮
                 * 显示6行2列，前6个月一列，后6个月一列
                 */
                var ulMonth = $('.' + LIST_MONTH_CLASS);
                for (var i = 1; i < 7; i++) {
                    var liStr    = '<li data-command="' + SELECT_MONTH_COMMAND + '"';
                    var classStr = ' class="' + HIGHLIGHT_CLASS + '"';
                    ulMonth.append(liStr + (i === m ? classStr : '') + '>' + i + '</li>');
                    var j = i + 6;
                    ulMonth.append(liStr + (j === m ? classStr : '') + '>' + j + '</li>');
                }
            }
        },

        /**
         * 验证某个日期是否是有效日期
         * @param {string} date 日期参数
         * @return {boolean} true or false
         */
        isValidDate: function (date) {
            var options = $curInputControl ? $curInputControl.options : $settings;
            var minDate = new Date(options.minDate);
            var maxDate = new Date(options.maxDate);
            var newDate = null;
            var valid   = false;
            var type    = typeof date;

            if (type === 'string') {
                date = date.match(NUMBER_REG);
                newDate =  date ? new Date(date[0], date[1] - 1, date[2]) : null;
                if (!newDate) {
                    return false;
                }
                valid = newDate.getFullYear() * 1 === parseInt(date[0], 10);
                valid = valid && (newDate.getMonth() * 1 + 1 === parseInt(date[1], 10));
            } else if (type === 'object') {
                newDate = date;
                valid   = true;
            }
            valid = valid && newDate >= minDate && newDate <= maxDate;
            return valid;
        }
    };

    /**
     * 显示日历面板
     */
    function showCalender() {
        var inputObj = $curInputControl = $(this);
        var dtValue  = inputObj.val();
        var offset   = inputObj.offset();

        // 把对应的可选信息赋给当前的日期对象
        $curInputControl.options = arguments.length ? arguments[0].data.options : $settings;

        // 设置日历面板显示的位置
        var calPanel = $('.' + CALENDAR_PANEL_CLASS);
        calPanel.css({
            top: offset.top + inputObj.height() + parseInt(calPanel.css('padding-top'), 10),
            left: offset.left
        });

        // 去掉选中日期的样式
        calPanel.find('span.data').removeClass(SELECTED_DAY_CLASS);

        var titleObjs = calPanel.find('.' + YEAR_OR_MONTH_WRAPPER_CLASS);
        if (dtValue) {
            dtValue = dtValue.replace(/\-/g, '/');

            // 验证输入框内的日期是否有效
            if (!inputObj.validate()) {
                dtValue = $curInputControl.options.minDate;
            }
            var selectedDate = new Date(dtValue);

            var year  = selectedDate.getFullYear();
            var month = selectedDate.getMonth();
            var day   = selectedDate.getDate();

            calResetYearMonth(year, month, titleObjs);

            var selector = 'span.data[data-year="' + year + '"]'
                        + '[data-month="' + month + '"][data-day="' + day + '"]';

            // 加上选中日期的样式
            calPanel.find(selector).addClass(SELECTED_DAY_CLASS);
        } else {
            calResetYearMonth($defaults.year, $defaults.month, titleObjs);
        }
        calPanel.show();

        bindCalendarEvents();
    }

    /**
     * 隐藏日历面板
     */
    function hideCalendar() {
        var calPanel   = $('.' + CALENDAR_PANEL_CLASS);
        var inputYear  = calPanel.find('.' + INPUT_YEAR_CLASS);
        var inputMonth = calPanel.find('.' + INPUT_MONTH_CLASS);

        // 解除日历面板相关的事件
        $(document).unbind('click', onDocumentClick);
        calPanel.unbind('click', onCalendarClick);
        inputYear.unbind('keypress', checkInputYear)
                 .unbind('change', afterEditYear);
        inputMonth.unbind('keypress', checkInputMonth)
                 .unbind('change', afterEditMonth);

        calPanel.hide();
    }

    /**
     * 鼠标点击事件在日历面板上，执行相应命令事件，再禁止往上冒泡
     * @param {Object} e click点击的对象
     * @return {boolean} true/false
     */
    function onCalendarClick(e) {
        var e = e || window.event;
        var target  = e.target || e.srcElement;
        var curElem = $(target);

        /**
         * 单击日历面板中其他地方（除年份label标签和年份编辑文本框）时
         * 隐藏年份列表以及年份编辑文本框
         */
        if (!(curElem.hasClass(INPUT_YEAR_CLASS) || curElem.hasClass(LABEL_YEAR_CLASS))) {
            $('.' + LIST_YEAR_CLASS).hide();
            $('.' + INPUT_YEAR_CLASS).hide();
            $('.' + LABEL_YEAR_CLASS).show();
        }

        /**
         * 单击日历面板中其他地方（除月份label标签和月份编辑文本框）时
         * 隐藏月份列表以及月份编辑文本框
         */
        if (!(curElem.hasClass(INPUT_MONTH_CLASS) || curElem.hasClass(LABEL_MONTH_CLASS))) {
            $('.' + LIST_MONTH_CLASS).hide();
            $('.' + INPUT_MONTH_CLASS).hide();
            $('.' + LABEL_MONTH_CLASS).show();
        }

        /**
         * 根据日历面板中不同元素执行对应的事件
         */
        var dataCmd = curElem.attr('data-command');
        switch (dataCmd) {
            case PREV_YEAR_COMMAND:
                onPrevYear();
                break;
            case NEXT_YEAR_COMMAND:
                onNextYear();
                break;
            case PREV_MONTH_COMMAND:
                onPrevMonth();
                break;
            case NEXT_MONTH_COMMAND:
                onNextMonth();
                break;
            case EDIT_YEAR_COMMAND:
                onEditYear(curElem);
                break;
            case EDIT_MONTH_COMMAND:
                onEditMonth(curElem);
                break;
            case SELECT_YEAR_COMMAND:
                onSelectYear(curElem);
                break;
            case SELECT_MONTH_COMMAND:
                onSelectMonth(curElem);
                break;
            case SELECT_DAY_COMMAND:
                onSelectDay(curElem);
                break;
        }
        return false;
    }

    /**
     * document的click事件
     * @param {Object} e click点击的对象
     */
    function onDocumentClick(e) {
        var e = e || window.event;
        var elm = e.target || e.srcElement;
        if (!$(elm).hasClass(INPUT_DATE_CLASS)) {
            hideCalendar();
        }
    }

    /**
     * 日期输入控件修改之后触发的事件
     */
    function onInputDateChange() {
        var self = $(this);
        if (!self.validate()) {
            var showtime = self.attr('show-time');
            if (showtime) {
                self.val($curInputControl.options.minDate + getCurrentTime());
            } else {
                self.val($curInputControl.options.minDate);
            }
        }
    }

    /**
     * 获取当前时间
     * @return {string} 返回时间(h:m:s)
     */
    function getCurrentTime() {
        var str = ' ';
        var dd = new Date();
        var hh = dd.getHours();
        var mm = dd.getMinutes();
        var ss = dd.getSeconds();
        str += hh > 9 ? hh.toString() : '0' + hh;
        str += ':';
        str += mm > 9 ? mm.toString() : '0' + mm;
        str += ':';
        str += ss > 9 ? ss.toString() : '0' + ss;
        return str;
    }

    /**
     * 绑定日历面板的相关事件
     */
    function bindCalendarEvents() {
        var calPanel   = $('.' + CALENDAR_PANEL_CLASS);
        var inputYear  = calPanel.find('.' + INPUT_YEAR_CLASS);
        var inputMonth = calPanel.find('.' + INPUT_MONTH_CLASS);

        // 确保解除日历面板之前相关的事件之后，再进行绑定
        $(document).unbind('click', onDocumentClick);
        calPanel.unbind('click', onCalendarClick);
        inputYear.unbind('keypress', checkInputYear)
                 .unbind('change', afterEditYear);
        inputMonth.unbind('keypress', checkInputMonth)
                 .unbind('change', afterEditMonth);

        // 绑定日历面板里的点击事件
        calPanel.bind('click', onCalendarClick);

        // 鼠标点击别的地方，让日历面板隐藏
        $(document).bind('click', onDocumentClick);
        inputYear.bind('keypress', checkInputYear)
                 .bind('change', afterEditYear);
        inputMonth.bind('keypress', checkInputMonth)
                 .bind('change', afterEditMonth);
    }

    /**
     * 修改年份
     * @param {Object} e click点击的标签元素
     */
    function onEditYear(e) {
        var labelObj = e;
        var inputObj = labelObj.siblings('.' + INPUT_YEAR_CLASS);
        var ulList   = $('.' + CALENDAR_PANEL_CLASS + ' .' + LIST_YEAR_CLASS);
        ulList.show();
        inputObj.show();
        inputObj.focus();

        // 设置年份列表显示的位置
        var pos = inputObj.position();
        ulList.css({
            top: pos.top + 5,
            left: pos.left + 34
        });

        // 重新生成年份列表信息
        ulList.html('');
        var year = parseInt(inputObj.val(), 10);
        var j = year;

        /**
         * 生成5行2列, 当前选中的年份高亮显示，并居中间位置
         * 即显示当前选中年份的前5年和后4年
         */
        for (var i = 5; i > 0; i--) {
            var str = '<li data-command="' + SELECT_YEAR_COMMAND + '">'
                    + (year - i) + '</li>'
                    + '<li' + (j === year ? ' class="' + HIGHLIGHT_CLASS + '"' : '')
                    + ' data-command="' + SELECT_YEAR_COMMAND + '"'
                    + '>' + j + '</li>';
            ulList.append(str);
            j++;
        }
        labelObj.hide();
    }

    /**
     * 修改月份
     * @param {Object} e click点击的标签元素
     */
    function onEditMonth(e) {
        var labelObj = e;
        var inputObj = labelObj.siblings('.' + INPUT_MONTH_CLASS);
        var ulList   = $('.' + CALENDAR_PANEL_CLASS + ' .' + LIST_MONTH_CLASS);
        ulList.show();
        inputObj.show();
        inputObj.focus();

        // 设置月份列表显示的位置
        var pos = inputObj.position();
        ulList.css({
            top: pos.top + 5,
            left: pos.left + 22
        });

        labelObj.hide();
    }

    /**
     * 修改年份或月份之后调用的事件
     */
    function afterEditYearOrMonth() {
        var inputObj = $(this);
        var labelObj = inputObj.next();
        var calPanel = $('.' + CALENDAR_PANEL_CLASS);

        var year  = parseInt(calPanel.find('.' + INPUT_YEAR_CLASS).val(), 10);
        var month = parseInt(calPanel.find('.' + INPUT_MONTH_CLASS).val(), 10) - 1;

        calResetYearMonth(year, month);

        labelObj.show();
        inputObj.hide();
    }

    /**
     * 隐藏年份列表
     */
    function hideYearPanel() {
        var ulYeal = $('.' + LIST_YEAR_CLASS);
        ulYeal.hide();
    }

    /**
     * 修改年份之后调用的事件
     */
    function afterEditYear() {
        afterEditYearOrMonth();
        hideYearPanel();
    }

    /**
     * 隐藏年份列表
     */
    function hideMonthPanel() {
        var ulMonth = $('.' + LIST_MONTH_CLASS);
        ulMonth.hide();
    }

    /**
     * 修改月份之后调用的事件
     */
    function afterEditMonth() {
        afterEditYearOrMonth();
        hideMonthPanel();
    }

    /**
     * 验证输入的年份
     * @param {Object} e 捕获的键盘对象
     * @return {boolean} 返回true or false
     */
    function checkInputYear(e) {
        var oldVal = $(this).val();
        var key    = window.event ? e.keyCode : e.which;

        // 目前年份不允许输入多于4个数字
        return /[\d]/.test(String.fromCharCode(key)) && oldVal.length < 4;
    }

    /**
     * 验证输入的月份
     * @param {Object} e 捕获的键盘对象
     * @return {boolean} 返回true or false
     */
    function checkInputMonth(e) {
        var self   = $(this);
        var valid  = true;
        var oldVal = self.val();
        var len    = oldVal.length;
        var key    = window.event ? e.keyCode : e.which;
        switch (len) {

            // 如果文本框没有填写任何数字，允许输入1～9数字
            case 0:
                valid = /[1-9]/.test(String.fromCharCode(key));
                break;

            // 如果文本框目前已输入一个数字，且这个数字大于1，则不允许输入，否则允许输入0～2数字
            case 1:
                if (oldVal > 1) {
                    valid = false;
                } else {
                    valid = /[0-2]/.test(String.fromCharCode(key));
                }
                break;
            default:
                valid = false;
                break;
        }
        return valid;
    }

    /**
     * 点选年份列表中的数字之后调用的事件
     * @param {Object} e click点击的标签元素
     */
    function onSelectYear(e) {
        var liObj = e;
        var year  = parseInt(liObj.text(), 10);
        var month = parseInt($('.' + CALENDAR_PANEL_CLASS + ' .' + LABEL_MONTH_CLASS).text(), 10) - 1;

        calResetYearMonth(year, month);

        $('.' + INPUT_YEAR_CLASS).hide();
        $('.' + LABEL_YEAR_CLASS).show();

        hideYearPanel();
    }

    /**
     * 点选月份列表中的数字之后调用的事件
     * @param {Object} e click点击的标签元素
     */
    function onSelectMonth(e) {
        var liObj = e;
        var year  = parseInt($('.' + CALENDAR_PANEL_CLASS + ' .' + LABEL_YEAR_CLASS).text(), 10);
        var month = parseInt(liObj.text(), 10) - 1;

        calResetYearMonth(year, month);

        $('.' + INPUT_MONTH_CLASS).hide();
        $('.' + LABEL_MONTH_CLASS).show();

        hideMonthPanel();
    }

    /**
     * 返回指定月份html信息
     * @param {integer} year 年份
     * @param {integer} month 月份
     * @return {string} 返回月份的html
     */
    function calMonthContent(year, month) {
        var html            = '';
        var daysOfMonth     = calDaysForMonth(year, month);
        var firstDayOfMonth = calFirstDayPosition(year, month);
        var day             = 1;
        var cellDay         = '';
        var isHoliday       = false;
        var isValid         = true;
        var isHignLight     = false;

        for (var i = 1; i < 7; i++) {
            html += '<div class="' + CALENDAR_ROW_CLASS + '">';
            for (var j = 0; j < 7; j++) {

                // 表示周六周日假日
                if (!j || j === 6) {
                    isHoliday = true;
                } else {
                    isHoliday = false;
                }

                /**
                 * 把第一行中不属于当月的天用空格表示，并不能点选
                 * 在有效范围内的日期可以点选
                 * 在有效范围外的日期颜色变灰，并不能点选
                 */
                if (j < firstDayOfMonth && i === 1) {
                    cellDay = '&nbsp;&nbsp;&nbsp;&nbsp;';
                    html += '<span class="' + CALENDAR_CELL_CLASS + '">' + cellDay + '</span>';
                } else {
                    isValid = $.calendar.isValidDate(new Date(year + '/' + (month + 1) + '/' + day));
                    cellDay = day < 10 ? ('&nbsp;' + day.toString() + '&nbsp;') : day.toString();

                    // 如果日期是今天，则启用高亮样式
                    if ($defaults.year === year && $defaults.day === day && $defaults.month === month) {
                        isHignLight = true;
                    } else {
                        isHignLight = false;
                    }
                    html += '<span class="' + CALENDAR_CELL_CLASS + ' data'
                         + (isHignLight ? ' ' + HIGHLIGHT_CLASS : '')
                         + (isHoliday ? ' ' + CALENDAR_HOLIDAY_CLASS : '')
                         + (isValid ? '" data-command="' + SELECT_DAY_COMMAND + '"' : ' disabled"')
                         + ' data-year="' + year
                         + '" data-month="' + month
                         + '" data-day="' + day + '">'
                         + cellDay + '</span>';
                    day++;
                    if (day > daysOfMonth) {
                        break;
                    }
                }
            }
            html += '<div style="clear:both;"></div>';
            html += '</div>';
            if (day > daysOfMonth) {
                break;
            }
        }
        return html;
    }

    /**
     * 点选上一年
     */
    function onPrevYear() {

        // 找到年月标题的外层容器
        var titleObjs = $('.' + CALENDAR_PANEL_CLASS + ' .' + YEAR_OR_MONTH_WRAPPER_CLASS);
        var year      = parseInt(titleObjs.attr('data-year'), 10) - 1;
        var month     = parseInt(titleObjs.attr('data-month'), 10);

        calResetYearMonth(year, month);
    }

    /**
     * 点选下一年
     */
    function onNextYear() {

        // 找到年月标题的外层容器
        var titleObjs = $('.' + CALENDAR_PANEL_CLASS + ' .' + YEAR_OR_MONTH_WRAPPER_CLASS);
        var year      = parseInt(titleObjs.attr('data-year'), 10) + 1;
        var month     = parseInt(titleObjs.attr('data-month'), 10);

        calResetYearMonth(year, month);
    }

    /**
     * 点选上一月
     */
    function onPrevMonth() {

        // 找到年月标题的外层容器
        var titleObjs = $('.' + CALENDAR_PANEL_CLASS + ' .' + YEAR_OR_MONTH_WRAPPER_CLASS);
        var year      = parseInt(titleObjs.attr('data-year'), 10);
        var month     = parseInt(titleObjs.attr('data-month'), 10) - 1;

        if (month === -1) {
            year -= 1;
            month = 11;
        }
        calResetYearMonth(year, month);
    }

    /**
     * 点选下一月
     */
    function onNextMonth() {

        // 找到年月标题的外层容器
        var titleObjs = $('.' + CALENDAR_PANEL_CLASS + ' .' + YEAR_OR_MONTH_WRAPPER_CLASS);
        var year      = parseInt(titleObjs.attr('data-year'), 10);
        var month     = parseInt(titleObjs.attr('data-month'), 10) + 1;

        if (month === 12) {
            year += 1;
            month = 0;
        }
        calResetYearMonth(year, month);
    }

    /**
     * 重置日历面板中的日期数字，以及最上面的年份和月份
     * @param {integer} year 年份
     * @param {integer} month 月份
     */
    function calResetYearMonth(year, month) {
        var mHtml    = calMonthContent(year, month);
        var calPanel = $('.' + CALENDAR_PANEL_CLASS);

        // 删除之前的日期元素，重新添加当前选择的年月对应的日期
        calPanel.find('.' + CALENDAR_ROW_CLASS).remove();
        calPanel.append(mHtml);

        var m = month + 1;

        // 找到标题行年月对象
        var titleObjs  = calPanel.find('.' + YEAR_OR_MONTH_WRAPPER_CLASS);
        var titleYear  = $(titleObjs[0]);
        var titleMonth = $(titleObjs[1]);

        titleYear.find('.' + INPUT_YEAR_CLASS).val(year);
        titleYear.find('.' + LABEL_YEAR_CLASS).html(year);
        titleMonth.find('.' + INPUT_MONTH_CLASS).val(m);
        titleMonth.find('.' + LABEL_MONTH_CLASS).html(m);
        titleObjs.attr('data-year', year);
        titleObjs.attr('data-month', month);
    }

    /**
     * 选中日历面板上的某一天，触发的事件
     * @param {Object} e click点击的标签元素
     */
    function onSelectDay(e) {
        var cellObj = e;
        var yy = cellObj.attr('data-year');
        var m  = parseInt(cellObj.attr('data-month'), 10) + 1;
        var d  = parseInt(cellObj.attr('data-day'), 10);
        var mm = m < 10 ? '0' + m.toString() : m.toString();
        var dd = d < 10 ? '0' + d.toString() : d.toString();

        var value = yy + '-' + mm + '-' + dd;

        var oldValue = $curInputControl.val();
        var showtime = $curInputControl.attr('show-time');
        if (showtime) {
            $curInputControl.val(value + getCurrentTime());
        } else {
            $curInputControl.val(value);
        }
        if ($curInputControl.change !== undefined && (typeof $curInputControl.change === 'function')) {
            $curInputControl.change();
        }

        hideCalendar();
    }

    /**
     * 计算一个月有多少天
     * @param {integer} year 年份
     * @param {integer} month 月份
     * @return {integer} 一个月的天数
     */
    function calDaysForMonth(year, month) {
        var days = (new Date(+(new Date(year, month + 1, 1)) - 86400000)).getDate();
        return days;
    }

    /**
     * 计算这个月的第一天显示的的位置，可以根据它的星期来计算
     * @param {integer} year 年份
     * @param {integer} month 月份
     * @return {integer} 第一天显示的的位置
     */
    function calFirstDayPosition(year, month) {
        return new Date(year, month, 1).getDay();
    }
})(jQuery);
