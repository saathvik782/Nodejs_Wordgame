$(document).on('ready',function(){
    $('#newkey').on('click',function(){
        $.ajax({url:"/play",method:"POST",dataType:"json"}).done(function(msg){
            $('keyout > .modal-body > p').html(msg);
            $('#keyout').modal({show:true});
            //#keyout > .modal-body > p
        });
    });
});
