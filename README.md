# js-calendar

在jquery的基础上，写的日期控件。

在页面中引入jquery类库，然后再引入calendar.js之后，再通过下面代码初始化日期控件：

$(function () {
    $.calendar.init({lang: 'zh-CN'});
    $('body').calendar();
});

里面简单的写了一下用到的样式custom.css，如果想修改样式可以直接替换一下这个问题。

具体参考calendar.html。
