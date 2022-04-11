$(function () {
    $('#form-submit').click(function () {
        var ajaxbg = $("#background,#progressBar");

        var web_url = $('input[name="web_url"]').val();
        var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp=new RegExp(Expression);

        if(objExp.test(web_url) != true){
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
                if (result['code'] == 200) {
                    $('#img').empty();
                    $.each(result['data'], function (index, value) {
                        console.log(value)
                        $('#img').append('<img width="200" height="200"  src="' + value + '" alt="">')
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

    })
});
