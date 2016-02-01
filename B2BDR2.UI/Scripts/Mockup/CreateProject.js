// !! js 為 mockup 示意暫時使用 !!
$(document).ready(function () {

    $('#t_BackLog tr').on('click', function () {
        var $this = $(this);
        $this.fadeOut();

        AddTabNav("54321");
        AddTabContent("54321", "Add the pb into Project");

        // 暫時判斷法
        if ($('#t_BackLog tr:visible').length == 1) {
            $('#t_BackLog').append("<div class=\"well text-center\"><h5>CLEAR!</h5></div>")
        }
    })

    setTimeout(loading5Second, 5000);

    fromStyle();
})

function fromStyle() {
    $('form .form-group').addClass("animated fadeInUp");
}

function loading5Second() {
    $('#iconLoading').hide();
    $('#t_BackLog').fadeIn();
}

function AddTabNav(pbNumber) {
    $('#projectPBs').find('.nav-tabs').append('<li><a href="#TCBB0001" data-toggle="tab">TCBB689</a></li>');
}

function ReciprocalAccept() {
    var index = 5;
    var myinterval = setInterval(function () {
        index--;
        var $btAccept = $('#bt_accept');
        var countSpan = $('#bt_accept').find('span');
        countSpan.text("(" + (index).toString() + ")");
        if (index == 0) {
            $btAccept.removeClass("disabled");
            countSpan.remove();
            clearInterval(myinterval);
        }
    }, 1000);
}