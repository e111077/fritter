var deletePost;

$(document).ready(function() {
    function findHashtagsAndFormat(body) {
        var words = body.split(" ");
        var hashtags = [];
        var modifiedBody = "";

        for (var i = 0; i < words.length; i++) {
            var word = words[i];

            if (word.indexOf("#") == 0) {
                hashtags.push(word.substring(1, word.length));
                modifiedBody += "<a class='purple-text' href='/hashtag?hashtag=" + word.substring(1, word.length) +"'>"+word+"</a> ";
            } else {
                modifiedBody += word + " ";
            }
        }

        return [hashtags, modifiedBody];
    };
    // pops up the menu on the little arrows to edit and delete
    $('.ui .down.arrow').popup({on: 'click'});

    // form validation rules for posting
    var postForm = $('.ui.posting.form');
    postForm.form({
        title: {
            identifier  : 'title',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Enter a title of what you are gonna share'
                }
            ]
        }
    });

    // post submit button lsitener
    $(".posting.submit.button").click(function(){
        // attempts to validate the form
        var validForm = postForm.form('validate form');
        var errorMessage = $(".error.message");

        // if a valid form, submit it to the server / db
        if (validForm) {
            // get the title and body of the sumbitted post
            var title = $("[name='title']").val();
            var body = $("[name='body']").val();
            var modified = findHashtagsAndFormat(body);
            var hashtags = modified[0];
            body = modified[1];
            var params = {title:title, body:body, hashtags:hashtags};

            // perorm an ajax call to the sever sending the info
            $.ajax({
                url: "/submitpost",
                data: params,
                contentType: 'json',
                beforeSend: function() {
                    // make the form look as if it is loading
                    postForm.addClass("loading");
                },
                success: function(data) {window.setTimeout(function (){
                    // pause the function for a second for the sake of animation
                    postForm.removeClass("loading");
                    // relocate the user to the feed (can replace this with jquery 
                    // html edits later)
                    window.location.replace("/");
                } ,1000)},
                dataType: 'json'
            });
        } else {
            // show error messages if the avlidation failed
            errorMessage.removeClass("hidden");
            errorMessage.addClass("visible");
        }
    });
    
    // call this function when delete is clicked
    deletePost = function() {
        // finds the HTML that called this function and
        // gets the postID
        var postId = $(".deletePost").attr('value');
        var params = {postId:postId};

        // performs an ajax call to server to delete it
        $.ajax({
            url: "/deletepost",
            data: params,
            contentType: 'json',
            beforeSend: function() {
            },
            success: function(data) {
                // reloads hte page
                window.location.replace("/");
            },
            dataType: 'json'
        });
    };

    // call this function when edit is clicked
    editPost = function() {
        // finds the HTML that called this function and
        // gets the postID
        var postId = $(".editPost").attr('value');
        var post = $("#"+postId);
        var editForm = $('#f'+postId);

        // if the edit form is not there, make it show do nothing otherwise
        if (editForm.css("display") == "none") {
            // animates the editing button
            post.transition('slide down', function() {
                // shows a form to edit the post
                editForm.css("display", "inline");
                post.css("display", "none");
                
                // finds the form again
                editForm = $('#f'+postId);

                // sets form validation rules
                editForm.form({
                    title: {
                        identifier  : 'title',
                        rules: [
                            {
                                type   : 'empty',
                                prompt : 'Enter a title of what you are gonna share'
                            }
                        ]
                    }
                });
                
                // upon form submission send the edits to the server
                $("#b"+postId).click(function(){
                    // attempt to validate the form
                    var validForm = editForm.form('validate form');
                    var errorMessage = $("#e"+postId);

                    // if the form is valid, send the request
                    if (validForm) {
                        // get the new title and body
                        var title = $("[name='title"+postId+"']").val();
                        var body = $("[name='body"+postId+"']").val();
                        var modified = findHashtagsAndFormat(body);
                        var hashtags = modified[0];
                        body = modified[1];
                        var params = {postId:postId, title:title, body:body, hashtags:hashtags};

                        // submit the data to the server
                        $.ajax({
                            url: "/editpost",
                            data: params,
                            contentType: 'json',
                            beforeSend: function() {
                                // show the form as loading
                                editForm.addClass("loading");
                            },
                            success: function(data) {window.setTimeout(function (){
                                // waits one second for the sake of animation
                                editForm.removeClass("loading");
                                // reload the feed page
                                window.location.replace("/");
                            } ,1000)},
                            dataType: 'json'
                        });
                    } else {
                        // show an error if the form is not valid.
                        errorMessage.removeClass("hidden");
                        errorMessage.addClass("visible");
                    }
                });
            }).transition('slide down');
        }
    };
});