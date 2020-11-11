function Banner() {
    this.bannerWidth = 798;
    this.bannerGroup = $("#banner-group");
    this.index = 1;
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");
    this.bannerUI = $("#banner-ul");
    this.liList = this.bannerUI.children("li");
    this.bannerCount = this.liList.length;
    this.pageControl = $(".page-control");
};

Banner.prototype.initPageControl = function () {
    var self = this;
    for (var i = 0; i < self.bannerCount; i++) {
        var circle = $("<li></li>");
        self.pageControl.append(circle);
        if (i === 0) {
            circle.addClass("active");
        }
    }
    ;
    self.pageControl.css({"width": self.bannerCount * 12 + 8 * 2 + 16 * (self.bannerCount - 1)})
};

Banner.prototype.initBanner = function () {
    var self = this;
    var firstBanner = self.liList.eq(0).clone();

    var lastBanner = self.liList.eq(self.bannerCount - 1).clone();
    self.bannerUI.append(firstBanner);
    self.bannerUI.prepend(lastBanner);
    this.bannerUI.css({
        "width": self.bannerWidth * (self.bannerCount + 2),
        "left": -self.bannerWidth
    })
}

Banner.prototype.toggleArrow = function (isShow) {
    var self = this
    if (isShow) {
        this.leftArrow.show();
        this.rightArrow.show();
    } else {
        this.leftArrow.hide();
        this.rightArrow.hide();
    }
    ;
};

Banner.prototype.listenBannerHover = function () {
    var self = this;
    this.bannerGroup.hover(function () {
        clearInterval(self.timer)
        self.toggleArrow(true)
    }, function () {
        self.loop();
        self.toggleArrow(false)
    });
};

Banner.prototype.animate = function () {
    var self = this;
    self.bannerUI.stop().animate({"left": -798 * self.index}, 500);
    var index = self.index;
    if (index === 0) {
        index = self.bannerCount - 1;
    } else if (index === self.bannerCount + 1) {
        index = 0;
    } else {
        index = self.index - 1;
    }
    self.pageControl.children('li').eq(index).addClass("active").siblings().removeClass("active");
}

Banner.prototype.loop = function () {
    var self = this;
    this.timer = setInterval(function () {
        if (self.index >= self.bannerCount + 1) {
            self.bannerUI.css({"left": -self.bannerWidth})
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    }, 2000);
};

Banner.prototype.listenArrowClick = function () {
    var self = this;
    self.leftArrow.click(function () {
        if (self.index === 0) {
            self.bannerUI.css({"left": -self.bannerCount * self.bannerWidth})
            self.index = self.bannerCount - 1;
        } else {
            self.index--;
        }
        self.animate();
    });
    self.rightArrow.click(function () {

        if (self.index === self.bannerCount + 1) {
            self.bannerUI.css({"left": -self.bannerWidth})
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    });
};

Banner.prototype.listenPageControl = function () {
    var self = this;
    self.pageControl.children("li").each(function (index, obj) {
        $(obj).click(function () {
            self.index = index + 1;
            self.animate();
        })
    })
};

function Index() {
    var self = this;
    self.page = 2;
    self.category_id = 0;
    self.loadBtn = $("#load-more-btn");

};

Index.prototype.listenLoadMoreEvent = function () {
    var self = this;
    var loadBtn = $('#load-more-btn');
    loadBtn.click(function () {
        xfzajax.get({
            'url': '/news/list/',
            'data': {
                'p': self.page,
                'category_id': self.category_id
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    if (newses.length > 0) {
                        var tpl = template("news-item", {"newses": newses})
                        var ul = $(".list-inner-group");
                        ul.append(tpl);
                        self.page += 1;
                    } else {
                        loadBtn.hide();
                    }
                }
            }
        })
    })
}

Index.prototype.listenCategorySwitchEvent = function() {
    var self = this;
    var tabGroup = $(".list-tab");
    tabGroup.children().click(function () {
        var li = $(this);
        var category_id = li.attr("data-category");
        var page = 1;
        xfzajax.get({
            'url': '/news/list/',
            'data': {
                'category_id': category_id,
                'p': page
            },
            'success': function (result) {
                if(result['code'] == 200){
                    var newses = result['data'];
                    var tpl = template("news-item", {"newses": newses})
                    //empty把当前标签的所有子元素豆删除
                    var newsListGroup = $(".list-inner-group");
                    newsListGroup.empty();
                    newsListGroup.append(tpl);
                    self.page = 2;
                    self.category_id = category_id;
                    li.addClass('active').siblings().removeClass('active');
                    self.loadBtn.show();
                }
            }
        })
    })
}

Index.prototype.run = function () {
    var self = this;
    self.listenLoadMoreEvent();
    self.listenCategorySwitchEvent();
}


Banner.prototype.run = function () {
    this.initPageControl();
    this.initBanner();
    this.loop();
    this.listenPageControl();
    this.listenBannerHover();
    this.listenArrowClick();
};

$(function () {
    var banner = new Banner();
    banner.run();

    var index = new Index();
    index.run();
})