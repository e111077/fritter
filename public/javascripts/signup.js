$(document).ready(function() {
    var signupForm = $('.ui.form');

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

    $(".submit.button").click(function(){
        var validForm = signupForm.form('validate form');
        var errorMessage = $(".error.message");
        if (validForm) {
            var firstName = $("[name='first-name']").val();
            var lastName = $("[name='last-name']").val();
            var username = $("[name='username']").val();
            var password = $("[name='password']").val();
            var params = {first:firstName, last:lastName, username:username, password:password};
            $.ajax({
                url: "/signupattempt",
                data: params,
                contentType: 'json',
                beforeSend: function() {
                    signupForm.addClass("loading");
                },
                success: function(data) {window.setTimeout(function (){
                    signupForm.removeClass("loading");
                    if (data.success) {
                        document.cookie = "id="+data.ID+";";
                        console.log("FUCKING SIGNUP");
                        window.location.replace("/");
                    } else {
                        errorMessage.removeClass("hidden");
                        errorMessage.addClass("visible");
                        errorMessage.html('<div class="header">Username Error</div><p>That username is already taken, try another one!</p>');
                    }
                } ,1000)},
                dataType: 'json'
            });
        } else {
            errorMessage.removeClass("hidden");
            errorMessage.addClass("visible");
        }
    });
});