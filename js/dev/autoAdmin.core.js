window.autoAdmin = window.autoAdmin || {};

autoAdmin.core = {

    init: function(){

    	// for logging and whatnot
    	autoAdmin.log = {};

        // initialize this to an object so we can use it as such later on
        autoAdmin.templates = {};

        // check to see if we need to update our templates in local storage
    	if( !localStorage.getItem("tpl-cache-id") ){
    		localStorage.setItem('tpl-cache-id',$('html').attr('data-tpl-cache-id'))
	        autoAdmin.core.refreshTemplates(true);
    	}else if( parseInt( $('html').attr('data-tpl-cache-id'), 10 ) < parseInt( localStorage.getItem("tpl-cache-id"), 10 ) ){
    		localStorage.setItem('tpl-cache-id',$('html').attr('data-tpl-cache-id'))
	        autoAdmin.core.refreshTemplates(true);
        }else{
        	autoAdmin.core.refreshTemplates(false);
        }

    	autoAdmin.core.bindUIFunctions();
    	autoAdmin.upload.init();

        // trigger any onload ajax calls
        $('body').find('.auto-admin-onload-ajax').trigger('autoAdmin.ajaxComplete');

    },

  	bindUIFunctions: function(){

	    $('html')
			.on('click', '.dropdown-wrapper .dropdown-toggle', function(e){
				autoAdmin.ui.dropdownToggle( e, $(this) );
			})
			.on('click', '.auto-admin-grid-record-add', function(e){
				e.preventDefault();
				ag.addRecords( $(this) );
			})
			// .on('click', '.auto-admin-cell-actions .action', function(){
			// 	ag.rowActionHandler( $(this) );
			// 	return false;
			// })
			.on('change', '.column-selector .dropdown-menu input', function(){
				autoAdmin.grid.columnSelect( $(this), null );
			})
            .on('change', '.grid-header-filter .dropdown-menu input', function(){
                autoAdmin.grid.filterSelect( $(this) );
            })
			.on('click', '.auto-admin-grid-column-group', function(e){
				e.preventDefault();
				autoAdmin.grid.columnSelect( $(this), $(this).attr('data-column-select-type') );
			})
			.on('change', '.auto-admin-grid tbody td :input', function(){
				ag.rowDataChange( $(this) );
			})
			.on('submit', '.auto-admin-filters form', function(e){
				e.preventDefault();
				ag.filterSubmit();
			})
	        .on('autoAdmin.ajaxComplete','.auto-admin-onload-ajax',function(e){

	        	var triggerObj = $(this);

	        	if( triggerObj.attr('data-onload-ajax-target-id') === "" ){
	        		target = triggerObj;
	        	}else{
	        		target = $('#'+triggerObj.attr('data-onload-ajax-target-id'));
	        	}

	        	autoAdmin.core.ajaxHandler({
	        		"event" : e,
	        		"url" : triggerObj.attr('data-onload-ajax-url'),
	        		"method" : "GET",
	        		"data" : "",
	        		"target" : target,
	        		"resultType" : triggerObj.attr('data-onload-ajax-result-type')
	        	});

	        })
	        .on('click','.load-on-click',function(e){

	        	var linkObj = $(this);

	        	autoAdmin.core.ajaxHandler({
	        		"event" : e,
	        		"url" : linkObj.attr('href'),
	        		"method" : "GET",
	        		"data" : "",
	        		"target" : $('#'+linkObj.attr('data-load-on-click-target-id')),
	        		"resultType" : linkObj.attr('data-result-type')
	        	});

	        })
	        .on('change','.submit-on-change',function(e){

				var form = $(this).closest('form');

	        	autoAdmin.core.ajaxHandler({
	        		"event" : e,
	        		"url" : form.attr('action'),
	        		"method" : form.attr('method'),
	        		"data" : form.serializeObject(),
	        		"target" : $('#'+form.attr('data-target-id')),
	        		"resultType" : form.attr('data-result-type')
	        	});

	        })
	        .on('click', function(e){
	        	autoAdmin.core.hideDropdowns(e);
	        })

	},

	hideDropdowns: function( event ){

		var crntDropdown = $(event.target).closest('.dropdown-wrapper');

		// if it's not on ANY dropdown then close them all
    	if( !crntDropdown.length ){

        	$('.dropdown-menu').addClass('hide')

        // otherwise it IS in a dropdown but maybe there is another open one somewhere else
    	}else{

			$('.dropdown-wrapper').not(crntDropdown).find('.dropdown-menu').addClass('hide');

    	}

	},

    refreshTemplates: function( clearCache ){

		var itemType;
		var itemKey;
    	autoAdmin.utils.pageSpin();

    	if( clearCache ){

    		autoAdmin.utils.log('debug',"refreshTemplates clearing cache begin");

	    	$.ajax({
	    		url: 'tpl/index.php',
	    		dataType: 'json',
	    		complete: function( jqXHR, textStatus ){
	    			if( textStatus === 'error' ){
	    				alert( jqXHR.responseText );
	    			}else{
	    				jqXHR.responseJSON.forEach(function(element, index, array){
			                $.ajax({
			                    url: 'tpl/'+element,
			                    complete: function ( tplXHR, tplTextStatus ) {
			                    	templateId = element.replace(/\.[^/.]+$/, "").replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
			                    	autoAdmin.utils.log('debug',"refreshTemplates ajax loading of template "+templateId+" completed",localStorage.getItem( itemKey ));
			                        localStorage.setItem("tpl-"+templateId,tplXHR.responseText);
			                        autoAdmin.templates[templateId] = Handlebars.compile( tplXHR.responseText );
			                    }
			                });
	    				})
	    			}
	    			autoAdmin.utils.pageSpinStop();

	    			autoAdmin.utils.log('debug',"refreshTemplates clearing cache ajax call completed");

	    		}
	    	})

    	}else{

    		autoAdmin.utils.log('debug',"refreshTemplates reading from cache begin");

    		for (var i = 0; i < localStorage.length; i++){
    			itemKey = localStorage.key(i);
    			itemType = (itemKey.split('-'))[0];
    			if( itemType === "tpl" ){
	    			templateId = (itemKey.split('-'))[1]
    				autoAdmin.utils.log('debug',"refreshTemplates local storage loading of template "+templateId+" completed",localStorage.getItem( itemKey ));
    				autoAdmin.templates[templateId] = Handlebars.compile( localStorage.getItem( itemKey ) );
    			}
			}

    		autoAdmin.utils.pageSpinStop();

    		autoAdmin.utils.log('debug',"refreshTemplates reading from cache completed");

    	}

    },

    ajaxHandler: function( args ){

    	var e = args.event;
    	var url = args.url;
    	var target = args.target;
    	var method = args.method;
    	var data = args.data;
    	var resultType = args.resultType;

    	// if we're missing something then let the link work
    	if( target === "" || resultType === "" ){
    		return true;
    	}else{
	    	// otherwise we'll handle things here
        	e.preventDefault();
    	}

    	autoAdmin.utils.spin(target);

        $.ajax({
            url: url,
            type: method,
            data: data,
            dataType: ( resultType === "html" ? "html" : "json" ),
            complete: function( jqXHR, textStatus ){

        		if( textStatus == "success" ){

	            	switch( resultType ){

	            		case "grid":
	                    	autoAdmin.render.renderGrid({
	                    		"target" : target,
	                    		"columns" : jqXHR.responseJSON.columns,
	                    		"records" : jqXHR.responseJSON.records,
	                    		"gridActions" : jqXHR.responseJSON.gridActions
	                    	})
	                    	break;

	                    case "html":
	                    	target.html(jqXHR.responseText);
	                    	break;

	                    case "form":
	                    	autoAdmin.render.renderForm({
	                    		"target" : target,
	                    		"fields" : jqXHR.responseJSON.columns
	                    	})
	                    	break;

	                    default:
	                    	alert('invalid result type ('+resultType+')');
	                    	break;

	            	}

	            	target.find('.auto-admin-onload-ajax').trigger('autoAdmin.ajaxComplete');

            	}else{

            		alert(textStatus+'! Probably going to need to get a TA involved.');
            		console.log('args',args);
            		console.log(jqXHR);
            		target.html(jqXHR.responseText);

            	}

            }
        })

    }

}