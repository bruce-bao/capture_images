$(function () {
    $('#form-submit').click(function () {
        var ajaxbg = $("#background,#progressBar");

        var web_url = $('input[name="web_url"]').val();
        var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp = new RegExp(Expression);

        if (objExp.test(web_url) != true) {
            alert("Please enter the correct website");
            return false;
        }

        var image_type = [];
        $(".image_type:checked").each(function () {
            image_type.push($(this).val());
        })
        if (image_type.length == 0) {
            alert('Please select a picture type')
            return false
        }

        var min_image_size = $('input[name="min_image_size"]').val();
        var max_image_size = $('input[name="max_image_size"]').val();
        if (parseInt(max_image_size) < parseInt(min_image_size)) {
            alert('Please enter the correct picture size')
            return false
        }

        $.ajax({
            type: "post",
            data: {
                web_url: web_url,
                image_type: image_type,
                min_image_size: min_image_size,
                max_image_size: max_image_size,
            },
            dataType: "json",
            url: "../index.php",
            beforeSend: function () {
                ajaxbg.show();
            },
            success: function (result) {
                if (result['code'] === 200) {
                    var $currentElTop = $("#img").offset().top;
                    $(document).scrollTop($currentElTop);
                    $('#img').empty();
                    $.each(result['data'], function (index, value) {
                        console.log(value)
                        $('#img').append('<div class="layer-image" style="width:200px;height:250px; margin:0 10px 10px 0;border: 1px solid #ddd; border-radius: 3px;">' +
                            '<div class="image"><img onclick="largeImg(this)" style="width: 200px;height: 200px; object-fit: contain; cursor:pointer;"  src="' + value['url'] + '" alt=""></div>' +
                            '<div class="detail" style="margin-left: 10px;font-size: 14px;">' + value['detail'] + '</div>' +
                            '</div>')
                    });
                } else {
                    alert('error')
                }
            },
            complete: function () {
                ajaxbg.hide();
            },
            error: function (result) {
                ajaxbg.hide();
                console.info("error: " + result.message);
            }
        });

    });

});

function largeImg(imgObj){
    var src = imgObj.src
    var imgIns = new Image()
    imgIns.src = src
    imgIns.onload = function(){
        var width = imgIns.width
        var height = imgIns.height
        var img = $('<img class="larged-image" src="'+ src +'" style="position:absolute;left:50%;top:50%;margin-left:-'+(width/2)+'px;margin-top:-'+(height/2)+'px">')
        var largeImageContainer = $('<div class="large-container" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.1);z-index:99999;cursor:zoom-out"></div>')
        img.appendTo(largeImageContainer)
        largeImageContainer.appendTo($('body'))
        $('.large-container').click(function(){
            $(this).remove()
        })
    }
}