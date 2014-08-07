window.autoAdmin = window.autoAdmin || {};

autoAdmin.render = {

	renderGrid: function( args ){

		var target = args.target;
		var columns = args.columns;
		var records = args.records;
		var gridActions = args.gridActions;

    	// create the table
    	target.html( autoAdmin.render.hbsTemplate( 'autoAdminGrid', {} ) );

    	// render the header row
		autoAdmin.render.renderGridHeader({
    		"target" : target.find('.auto-admin-grid thead tr'),
    		"columns" : columns
    	})

    	// render the grid
		autoAdmin.render.renderGridBody({
    		"target" : target.find('.auto-admin-grid tbody'),
    		"columns" : columns,
    		"records" : records
    	})

    	autoAdmin.grid.refreshFilters({
    		"grid" : target.find('.auto-admin-grid'),
    		"columns" : columns
    	})

    	if( gridActions ){
	    	autoAdmin.grid.gridActions({
	    		"grid" : target.find('.auto-admin-grid'),
	    		"gridActions" : gridActions
	    	})
    	}

	},

    renderForm: function( args ){

        var $form = args.target;

        $form.removeClass('loading').html('');

        for( var field in args.fields ){

            // create an empty object
            var fieldObj = {};

            // get the "type" and convert it to a template name
            tmpltName = autoAdmin.utils.inptTypeTplName(args.fields[field].type);

            // extend our new object with the stuff from the fields object
            $.extend( fieldObj, args.fields[field] );

            // use that template to create the input field as a property of the object
            fieldObj.inputField = autoAdmin.render.hbsTemplate( tmpltName, args.fields[field] );

            autoAdmin.utils.log('debug',"render","renderForm","fieldObj appended to form",fieldObj);

            // use that object to create our form field
            $form.append( autoAdmin.render.hbsTemplate( 'formField', fieldObj ) );

        }

		$form.find('.select2').each(function(){
			autoAdmin.render.renderSelect2({
				select2Obj : $(this)
			})
		})
    },

    renderGridHeader: function( args ){

    	var cols = args.columns;
    	var $target = args.target;
    	var $gridWrapper = $target.closest('.auto-admin-grid-wrapper');
    	var dropdownObj = {};
    	if( $gridWrapper.find('.column-selector').size() === 0 ){

    		dropdownObj.footerOptions = [
    			{
    				href : "#",
    				itemClass : "auto-admin-grid-column-group",
    				label : "All Columns",
			        dataAttributes : [
			            {
			                "name" : "column-select-type",
			                "value" : "all"
			            }
			        ]
    			},
    			{
    				href : "#",
    				itemClass : "auto-admin-grid-column-group",
    				label : "Minimum Columns",
			        dataAttributes : [
			            {
			                "name" : "column-select-type",
			                "value" : "min"
			            }
			        ]
    			},
    			{
    				href : "#",
    				itemClass : "auto-admin-grid-column-group",
    				label : "Default Columns",
			        dataAttributes : [
			            {
			                "name" : "column-select-type",
			                "value" : "dflt"
			            }
			        ]
    			}
    		]
    		dropdownObj.wrapClass = "column-selector";
    		dropdownObj.buttonLabel = "Select Columns";
    		$gridWrapper.prepend( autoAdmin.render.hbsTemplate( "dropdownMenu", dropdownObj ) )
    	}
    	var colSelectMenuDivider = $gridWrapper.find('.column-selector .dropdown-menu .divider');

	    for( var col in cols ){

            cols[col].colIndex = col;

	      $target.append( autoAdmin.render.hbsTemplate( "gridHeaderCell", cols[col] ) );

	      // if the priority is 0 that means it ALWAYS shows
	      // so we don't want it in the column picker
	      if( cols[col].columnSelectPriority != 0 ){

	        //check the visibility of this header which is now based on the media queries
	        if( $target.find('#'+cols[col].name).css('display') === 'table-cell' ){

	          //if it's visible then we should check the checkbox
	          cols[col].checked = true;

	        }

	        //append that information to the column selector
	        colSelectMenuDivider.before(autoAdmin.render.hbsTemplate( "dropdownSelectItem", $.extend( cols[col], {parent:"column-selector"} ) ) );

	      }

	    }

    },

    renderGridBody: function( args ){

    	args.records.forEach(function(element, index, array){
    		autoAdmin.render.renderGridRecord({
    			"target" : args.target,
    			"columns" : args.columns,
    			"dataObj" : element,
    			"createRow" : true
    		})
    	})

    },

  	renderGridRecord: function( args ){

  		var $target = args.target;
  		var cols = args.columns;
  		var dataObj = args.dataObj;
  		var row = $('<tr />');

		//append each field to the placeholder row object
		for( var col in cols ){

			cellObj = {};
			tmpltName = autoAdmin.utils.inptTypeTplName(cols[col].type);

			$.extend( cellObj, cols[col], { "currentValue" : dataObj[cols[col].name]} );

            // use that template to create the input field as a property of the object
			cellObj.inputField = autoAdmin.render.hbsTemplate( tmpltName, cellObj);

			row.append( autoAdmin.render.hbsTemplate( "gridCell", cellObj ) );

		}

		//make sure we have an ID value, even for new rows
		if( typeof dataObj.id == 'undefined' ){
			dataObj.id = 'a' + Math.round( Math.random() * 10000000 );
			rowClass = "added";
		}else{
			rowClass = "current";
		}

		//create the "row" object even if we're just reverting an existing record
		rowObj = {
			"id" : dataObj.id,
			"fieldCells" : row.html(),
			"rowClass" : rowClass
		}

		// check if we are creating a row
		// we have to get the createRow argument as non-false to do this
    	if( args.hasOwnProperty('createRow') && args.createRow !== false ){

      		if( !args.hasOwnProperty('adjSibObj') || args.adjSibObj === false ){
        		$target.append( autoAdmin.render.hbsTemplate( "autoAdminGridRow", rowObj ) );
      		}else{
        		adjSibObj.after( autoAdmin.render.hbsTemplate( "autoAdminGridRow", rowObj ) );
      		}

    	}else{	//false or non-existent createRow argument

      		$('.auto-admin-grid tbody tr#'+dataObj.id).replaceWith(ag.hbsTemplate( "autoAdminGridRow", rowObj))

    	}

    	$('#'+dataObj.id).find('.select2').each(function(){
			autoAdmin.render.renderSelect2({
				select2Obj : $(this)
			})
    	});

  	},

  	renderSelect2: function(){

  		var settings = {
  			"dropdownAutoWidth" : true,
  			"allowClear" : true,
  			"formatResult" : autoAdmin.render.select2Template
  		}

  		$.extend( settings, arguments[0] );

  		var select2Obj = settings.select2Obj;

  		delete settings.select2Obj;

  		select2Obj.select2(settings);

    	if( select2Obj.attr('readonly') === "readonly" ){
    		select2Obj.select2("readonly",true);
    	}


  	},

  	select2Template: function( object, container, query ){

        //make this into a jQ object so we can retrieve the data- attribute data
        var optObj = $(object.element);

        //have to do some manual stuff to "convert" this object that we get
        //into a normal js object that can be used in hour handlebars template
        //rather than just a plain old js-built template
        if( object.id === object.text || object.text.length === 0 ){
	        var entryObj = {
	          "value" : object.id,
	          "label" : object.id,
	          "helpText" : optObj.data('help-text')
	        }
        }else{
	        var entryObj = {
	          "value" : object.id,
	          "label" : "<span class='select2-option-value'>"+object.id+"</span><span class='select2-option-label'>"+object.text+"</span>",
	          "helpText" : optObj.data('help-text')
	        }
        }
        return autoAdmin.render.hbsTemplate( "inputHelperSelect2Record", entryObj );
    },

    hbsTemplate: function( templateId, dataObj ){

        // see if it's already been loaded to the ag object
        if( autoAdmin.templates.hasOwnProperty(templateId) ){

            // console.log('already loaded');
            return autoAdmin.templates[templateId](dataObj);

        }else{

            if( localStorage.getItem("tpl-"+templateId) ){

                autoAdmin.templates[templateId] = Handlebars.compile( localStorage.getItem("tpl-"+templateId) );
                return autoAdmin.templates[templateId](dataObj);

            }else{

                // now we need to see if it's in local storage
                // console.log('get from local storage or external file');

                $.ajax({
                    url: 'tpl/'+templateId.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+'.hbs',
                    async: false,
                    complete: function ( jqXHR, textStatus ) {
                        localStorage.setItem("tpl-"+templateId,jqXHR.responseText);
                        autoAdmin.templates[templateId] = Handlebars.compile( jqXHR.responseText );
                        // console.log(jqXHR.responseText);
                        return autoAdmin.templates[templateId](dataObj);
                    }
                });

            }

        }

    }

}