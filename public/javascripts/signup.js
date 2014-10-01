$(document).ready(function() {
    var signupForm = $('.ui.form');

    // form validationrules
    signupForm.form({
        firstName: {
            identifier  : 'first-name',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please enter your first name'
                }
            ]
        },
        lastName: {
            identifier  : 'last-name',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please enter your last name'
                }
            ]
        },
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

    // adds a listener to the form submit button
    $(".submit.button").click(function() {
        // attempts a form validation
        var validForm = signupForm.form('validate form');
        var errorMessage = $(".error.message");

        // if the form is valid, submit it to the server
        if (validForm) {
            // gets the approptiate info from the form
            var firstName = $("[name='first-name']").val();
            var lastName = $("[name='last-name']").val();
            var username = $("[name='username']").val();
            var password = $("[name='password']").val();
            var params = {first:firstName, last:lastName, username:username, password:password};

            // submits the signup request to the server
            $.ajax({
                url: "/signupattempt",
                data: params,
                contentType: 'json',
                beforeSend: function() {
                    // sets the form as loading
                    signupForm.addClass("loading");
                },
                success: function(data) {window.setTimeout(function (){
                    // waits a second for the sake of animation
                    signupForm.removeClass("loading");

                    // if the signup was a success
                    if (data.success) {
                        // sets the cookie id to create the session
                        document.cookie = "id="+data.ID+";";
                        // sends to user to the main page
                        window.location.replace("/");
                    } else {
                        // shows error messages if the username was taken (server returns success:false)
                        errorMessage.removeClass("hidden");
                        errorMessage.addClass("visible");
                        errorMessage.html('<div class="header">Username Error</div><p>That username is already taken, try another one!</p>');
                    }
                } ,1000)},
                dataType: 'json'
            });
        } else {
            // shows error messages upon form validation failure
            errorMessage.removeClass("hidden");
            errorMessage.addClass("visible");
        }
    });
});