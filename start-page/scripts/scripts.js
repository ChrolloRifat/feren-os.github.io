var eng = {},
	current = {},
	fadeDur = 350,
    searchPrefix = "Search ",
    UA=navigator.userAgent;


function setCookie(name, value) {
    var expires = "";
    expires = "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    policy = "; SameSite=Lax; Secure";
    document.cookie = name + "=" + (value || "") + expires + policy;
}

function getCookie(cname) {
    var match = document.cookie.match(new RegExp('(^| )' + cname + '=([^;]+)'));
    if (match) return match[2];
}

function loadSP() {	
    // Migrate settings if required
    migrateSettings();
    
    // Create Engine Index
    buildEngineslist()
    
    // Resize Engines dialog
    calculateEnginesSize()
	
    // Set up first engine

    current.engine = (getCookie("lastengine") || "duckduckgo");
    selectEngine(current.engine, false);
    
    // Hover events
    setupHoverEvents();
    
    // Start clock
    startTime();
    
    // Load settings
    setSettings();
    
    // Browser optimisations
    browserOptimisations();
    
    // Give search box focus
    $("#input input").focus();
}

function browserOptimisations() {
    if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(UA) && /Firefox\/(\S+)/.test(UA)) { /*Firefox*/
        const myNode = document.getElementById("shortcutscontainer1").innerHTML = "<div style='text-align:left; color:rgba(255, 255, 255, 0.7); margin: 16px 17px'><p>It looks like you are using Mozilla Firefox. Look, you probably hate Chromium, I get it, but unfortunately there's a non-standard (for some weird reason) feature that this Start Page uses for the shortcuts bar - div scrollboxes - and the Gecko renderer lacks it. Therefore, we had to disable this bar and put this message here instead to make the page still look normal. Please switch to a browser with full Start Page compatibility, such as Vivaldi, or, if you know how to make this work in Firefox, submit a Pull Request. Link's in the settings.</p><p>⠀</p><p>Though, why are you even suffering with a browser that doesn't even support touch screens in 2021, anyway?</p></div>";
    } else if (window.document.documentMode) { /*I.E.*/
        const myNode = document.getElementById("shortcutscontainer1").innerHTML = "<div style='text-align:left; color:rgba(255, 255, 255, 0.7); margin: 16px 17px'><p>You're using Internet Explorer, it seems. I appreciate the ambition, but... look, unless Microsoft changes their mind, the official end of Internet Explorer begins in 2022 for basically ALL Windows releases, including Windows 10 too. Therefore, you NEED to switch browsers as soon as possible. Do yourself a favour and try out Vivaldi Browser - it's what Feren OS comes with by default. You can get Vivaldi via https://vivaldi.com/. Just enter that into the textbox at the top left of Internet Explorer and get downloading today.</p><p>⠀</p><p>I'm not gonna lie, I'll miss Internet Explorer, much as I'm glad to see it go. By the way, if you want to stick to Microsoft browsers for whatever reason, Microsoft Edge is where it's at these days.</p></div>";
    }
}

function doSearch() {
	var url = eng[current.engine].uri;
    url = url.replace("%query%", encodeURIComponent($("#i").val()));
	if (typeof eng[current.engine].languages == "object") 
		url = url.replace("%lang%", eng[current.engine].languages[current.language]);
	
	window.location.href = url;
	return false;
}

function buildEngineslist() {
    for (e in eng) {
        var searchenginescontaineritem = document.createElement("div");
        searchenginescontaineritem.classList.add("searchenginescontaineritem");
        searchenginescontaineritem.setAttribute("onclick", "selectEngine('" + e + "', true)");
        
        document.getElementById("searchenginescontainer").appendChild(searchenginescontaineritem);
        
        var searchengineitem = document.createElement("img");
        searchengineitem.classList.add("searchenginesitem");
        searchengineitem.src = eng[e].logo;
        
        searchenginescontaineritem.appendChild(searchengineitem);
    }
}

function calculateEnginesSize() {
    var numberofrows = 0;
    var numberofenginesdone = 0;
    for (e in eng) {
        numberofenginesdone += 1
        if (numberofenginesdone !== 0 && numberofenginesdone % 2 !== 0) {
            numberofrows += 1
        }
    }
    
    var currentboxsize = document.getElementById("searchenginepopup").offsetHeight;
    var calculatedboxsize = 33;
        
    if (numberofrows != 0) {
        calculatedboxsize += 10
    }
    calculatedboxsize += 100*numberofrows
        
    if (numberofrows != 0) {
        calculatedboxsize += 10
    }
    
    
    document.getElementById("searchenginepopup").style.height = calculatedboxsize+"px";
}

function nextEngine() {
	selectEngine(findNext(eng, current.engine), true);
}

function prevEngine() {
	selectEngine(findPrevious(eng, current.engine), true);
}


/*  CUSTOM BG SUPPORT
    -----------------------------------------------------  */
function setBG() {
    var bgurl = (getCookie('userbg') || "https://source.unsplash.com/collection/19065423")
    document.getElementById("bgparallax").style.backgroundImage = ("linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url("+bgurl+")")
}

function setSettings() {
    var bgurl = (getCookie('userbg') || "https://source.unsplash.com/collection/19065423");

    var bgimage = new Image();      
    bgimage.src=bgurl;
    
    bgimage.onerror=pageLoadedAnim

    $(bgimage).load(function() {
        document.getElementById("bgparallax").style.backgroundImage = ("linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("+bgurl+")");
        pageLoadedAnim();
    });
}

function pageLoadedAnim() {
    $(".blackscreen").fadeOut(500);
}

/*	TIME
	-----------------------------------------------------  */

function startTime() {
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    // add a zero in front of numbers less than 10
    m=checkTime(m);
    
    if (getCookie("12hrclock") == "true") {
        if (h >= 12 && h != 24) {
            h = h - 12
            if (h == 0) {
                h = 12
            }
            timesuffix="PM"
        } else if (h == 0) {
            h = 12
            timesuffix="AM"
        } else {
            timesuffix="AM"
        }
        h=checkTime(h);
        document.getElementById('timeid').innerHTML=h+":"+m+" "+timesuffix;
    } else {
        if (h == 24) {
            h = 0
        }
        h=checkTime(h);
        document.getElementById('timeid').innerHTML=h+":"+m;
    }
    
    t=setTimeout('startTime()',3000);
}

function checkTime(i) {
    if (i<10) {
        i="0" + i;
    }
    return i;
}

/*	KEYBOARD SHORTCUTS
	-----------------------------------------------------  */

var isCtrl = false;
var isCmd = false;

$(document).keyup(function(e) {
	if (e.which == 17) isCtrl=false;
	if (e.which == 91) isCmd=false;	
}
).keydown(function(e) {
	if (e.which == 17) isCtrl=true;
	if (e.which == 91) isCmd=true;
	
	if (e.which == 39 && isCtrl == true)				{ /* Arrow Right */	nextEngine(); toggleChangeEnginePopup(false); }
});



/*	SHORTCUTS SCROLLING
	-----------------------------------------------------  */
var h_amount = '';
function scroll_h() {
    $('#shortcutscontainer1').animate({
        scrollLeft: h_amount
    }, 100, 'linear',function() {
        if (h_amount != '') {
            scroll_h();
        }
    });
}

function setupHoverEvents() {
    var bottomshortcutsarea = document.getElementById("shortcutscontainer1");
    var leftscrollarea = document.getElementById("direction_left");
    var rightscrollarea = document.getElementById("direction_right");

    bottomshortcutsarea.addEventListener("mouseenter", function( event ) {
        $("#shortcutscontainer1").addClass("shownscrollbar");
    }, false);
    bottomshortcutsarea.addEventListener("mouseleave", function( event ) {
        $("#shortcutscontainer1").removeClass("shownscrollbar");
    }, false);


    $('.direction_left').hover(function() {
        h_amount = '-=50';
        scroll_h();
    }, function() {
        h_amount = '';
    });
    $('.direction_right').hover(function() {
        h_amount = '+=50';
        scroll_h();
    }, function() {
        h_amount = '';
    });
}
