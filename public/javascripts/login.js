$(document).ready(function() {
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

    $(".submit.button").click(function(){
        var validForm = loginForm.form('validate form');
        var errorMessage = $(".error.message");
        if (validForm) {
            var username = $("[name='username']").val();
            var password = $("[name='password']").val();
            var params = {username:username, password:password};
            $.ajax({
                url: "/loginattempt",
                data: params,
                contentType: 'json',
                beforeSend: function() {
                    loginForm.addClass("loading");
                },
                success: function(data) {window.setTimeout(function (){
                    loginForm.removeClass("loading");
                    if (data.auth) {
                        document.cookie = "id="+data.ID+";";
                        window.location.replace("/");
                    } else {
                        errorMessage.removeClass("hidden");
                        errorMessage.addClass("visible");
                        errorMessage.html('<div class="header">Login Error</div><p>Your username or password was wrong. Try again or try signing up!</p>');
                    }
                } ,1000)},
                dataType: 'json'
            });
        } else {
            errorMessage.removeClass("hidden");
            errorMessage.addClass("visible");
        }
    })
});