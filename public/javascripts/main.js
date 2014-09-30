var deletePost;

$(document).ready(function() {
    $('.ui .down.arrow').popup({on: 'click'});

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

    $(".posting.submit.button").click(function(){
        var validForm = postForm.form('validate form');
        var errorMessage = $(".error.message");

        if (validForm) {
            var title = $("[name='title']").val();
            var body = $("[name='body']").val();
            var params = {title:title, body:body};
            $.ajax({
                url: "/submitpost",
                data: params,
                contentType: 'json',
                beforeSend: function() {
                    postForm.addClass("loading");
                },
                success: function(data) {window.setTimeout(function (){
                    postForm.removeClass("loading");
                    window.location.replace("/");
                } ,1000)},
                dataType: 'json'
            });
        } else {
            errorMessage.removeClass("hidden");
            errorMessage.addClass("visible");
        }
    });

    deletePost = function() {
        var postId = $(".deletePost").attr('value');
        var params = {postId:postId};
        $.ajax({
            url: "/deletepost",
            data: params,
            contentType: 'json',
            beforeSend: function() {
            },
            success: function(data) {
                window.location.replace("/");
            },
            dataType: 'json'
        });
    };

    editPost = function() {
        var postId = $(".editPost").attr('value');
        var post = $("#"+postId);
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

        var editForm = $('#f'+postId);

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
        
        $("#b"+postId).click(function(){
            var validForm = editForm.form('validate form');
            var errorMessage = $("#e"+postId);

            if (validForm) {
                var title = $("[name='title"+postId+"']").val();
                var body = $("[name='body"+postId+"']").val();
                var params = {postId:postId, title:title, body:body};
                $.ajax({
                    url: "/editpost",
                    data: params,
                    contentType: 'json',
                    beforeSend: function() {
                        editForm.addClass("loading");
                    },
                    success: function(data) {window.setTimeout(function (){
                        editForm.removeClass("loading");
                        window.location.replace("/");
                    } ,1000)},
                    dataType: 'json'
                });
            } else {
                errorMessage.removeClass("hidden");
                errorMessage.addClass("visible");
            }
        });
    };
});