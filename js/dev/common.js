$(function(){

	$.event.props.push('dataTransfer');

    $('body')
        .on('click','.refresh-menu',function(e){
        	e.preventDefault();
        	autoAdmin.core.refreshTemplates(true);
        })
        .on('click', '.auto-admin-grid-overlay-editor .display-value',function(){
        	autoAdmin.grid.showOverlayEditor( $(this).parent() );
        })
        .on('click', '.auto-admin-grid-overlay-editor .close',function(){
        	autoAdmin.grid.hideOverlayEditor( $(this).closest('.auto-admin-grid-overlay-editor') );
        })

    $('.select2').select2().each(function(){
		autoAdmin.render.renderSelect2({
			select2Obj : $(this)
		})
    });

    $(':input').first().focus();

    autoAdmin.core.init();

})