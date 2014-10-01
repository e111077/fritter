var deletePost;

$(document).ready(function() {
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
            var params = {title:title, body:body};

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
        if (editForm.length == 0) {
            // animates the editing button
            post.transition('slide down', function() {
                // inserts a form to edit the post
                post.html(
                    '<div class="ui purple error editing form segment" id="f'+postId+'">\
                        <div class="ui hidden error message" id="e'+postId+'">\
                        </div>\
                        <div class="purple-text title">\
                            Changed your mind, eh?\
                        </div>\
                        <div class="field" style="padding-top:10px;">\
                            <input type="text" name="title'+postId+'" placeholder="Title">\
                        </div>\
                        <div class="field">\
                            <textarea name="body'+postId+'" placeholder="What do you want to share?"></textarea>\
                        </div>\
                        <div class="field">\
                            <div class="ui purple editing submit button" id="b'+postId+'">\
                                Edit\
                            </div>\
                            <a href="/">\
                                <div class="ui purple button">\
                                    Cancel\
                                </div>\
                            </a>\
                        </div>\
                    </div>');
                
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
                        var params = {postId:postId, title:title, body:body};

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