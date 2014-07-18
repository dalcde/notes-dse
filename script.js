// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
const RESOURCE_TABLE = [];
RESOURCE_TABLE["Physics"] = ["Past Paper"];
RESOURCE_TABLE["Chemistry"] = ["Notes"];
RESOURCE_TABLE["Economics"] = ["Notes"];

var activeSubject;
var activeResource;

// Setup
$("#header").load("header.html", function() {
    $("a.option-subject").click(function() {
        setSubject($(this).text());
    });
    if (activeSubject) setSubject(activeSubject);
});

function setSubject(subject) {
    activeSubject = subject;
    $("a").removeClass("option-subject-current");
    $("#option-subject-" + subject).addClass("option-subject-current");
    var arr = RESOURCE_TABLE[activeSubject];
    var html = "";
    for (var i in arr) {
        html += '<a href="#" class="option-resource">' + arr[i] + '</a>';
    }
    $("#resource_list").html(html);

    $("a.option-resource").click(function() {
        activeResource = $(this).text();
        window.location = activeSubject + "_" + activeResource.replace(" ", "_") + ".html";
    });
}

