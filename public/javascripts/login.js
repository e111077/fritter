$(document).ready(function() {
    // login form validation
    var loginForm = $('.ui.form');

    loginForm.form({
        username: {
            identifier  : 'username',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please enter your username'
                }
            ]
        },
        password: {
            identifier  : 'password',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please enter your password'
                }
            ]
        }
    });

    // submit button
    $(".submit.button").click(function(){
        // attempts to validate the form
        var validForm = loginForm.form('validate form');
        var errorMessage = $(".error.message");
        // if valid form submit to db
        if (validForm) {
            // gets the username and password
            var username = $("[name='username']").val();
            var password = $("[name='password']").val();
            var params = {username:username, password:password};

            // performs an ajax call to the server
            $.ajax({
                url: "/loginattempt",
                data: params,
                contentType: 'json',
                beforeSend: function() {
                    // makes the form seem as if it loading
                    loginForm.addClass("loading");
                },
                success: function(data) {window.setTimeout(function (){
                    // upon success waits one second for the sake of the loading screen and
                    // continues to parse the data
                    loginForm.removeClass("loading");
                    // set the session cookie and redirect the user if authentication worked
                    if (data.auth) {
                        document.cookie = "id="+data.ID+";";
                        window.location.replace("/");
                    } else {
                        // shows error messages if auth failed
                        errorMessage.removeClass("hidden");
                        errorMessage.addClass("visible");
                        errorMessage.html('<div class="header">Login Error</div><p>Your username or password was wrong. Try again or try signing up!</p>');
                    }
                } ,1000)},
                dataType: 'json'
            });
        } else {
            // if not a valid form, show the error message
            errorMessage.removeClass("hidden");
            errorMessage.addClass("visible");
        }
    })
});