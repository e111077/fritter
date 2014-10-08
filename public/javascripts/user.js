$(document).ready(function() {
    // when the follow button is clicked, send a follow request to the server
    $("#followButton").click(function () {
        var username = $(this).attr('whois');
        // gets the id number of the authenticated user
        var id = document.cookie.split("=")[1];
        var params = {requestor:id, target:username}

        $.ajax({
            url: "/follow",
            data: params,
            contentType: 'json',
            beforeSend: function() {
            },
            success: function(data) {
                // reloads hte page
                window.location.reload();
            },
            dataType: 'json'
        });
    });

    // when the unfollow button is clicked, send an unfollow request to the server
    $("#unfollowButton").click(function () {
        var username = $(this).attr('whois');
        // gets the id number of the authenticated user
        var id = document.cookie.split("=")[1];
        var params = {requestor:id, target:username}

        $.ajax({
            url: "/unfollow",
            data: params,
            contentType: 'json',
            beforeSend: function() {
            },
            success: function(data) {
                // reloads hte page
                window.location.reload();
            },
            dataType: 'json'
        });
    });
});