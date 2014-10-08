$(document).ready(function() {
	// deletes the user cookie on logout button click
    $("#logout").click(function() {
        document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    });
    // adds an overarching listener ont he search button
    $("#searchButton").click(function () {
        var query = $("#searchText").val();
        window.location.replace("/user?username="+query);
    });
});