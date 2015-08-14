//忽然想起来第一行是匿名函数而不是jquery。。。
$(function() {
    $('.del').click(function(e) {
        var target = $(e.target)
        var id = target.data('id')
        var tr = $('.item-id-' + id)

        $.ajax({
            type: 'DELETE',
            url: '/admin/list?id=' + id
        }).done(function(results) {
            if (results.success === 1) {
                if (tr.length > 0) {
                    tr.remove()
                }
            }
        })
    })
})
