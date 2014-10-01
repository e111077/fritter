// deletes the user cookie on logout button click
$(document).ready(function() {
    $("#logout").click(function() {
        document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    });
});