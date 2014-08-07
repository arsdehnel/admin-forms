window.autoAdmin = window.autoAdmin || {};

autoAdmin.grid = {

	showOverlayEditor: function( overlayEditorObj ){

		overlayEditorObj.addClass('open').find('.overlay-editor').addClass('auto-admin-onload-ajax');
		autoAdmin.utils.pageOverlay({show: true});
		overlayEditorObj.find('.auto-admin-onload-ajax').trigger('autoAdmin.ajaxComplete');

	},

	hideOverlayEditor: function( overlayEditorObj ){

		overlayEditorObj.removeClass('open');
		autoAdmin.utils.pageOverlay({show: false});

	},

    filterSelect: function( inputObj ){

        var grid = inputObj.closest('.auto-admin-grid');
        var selectedFilters = inputObj.closest('.dropdown-menu').find(':input:checked');

            // convert jquery object to JS array
            selectedFilters = selectedFilters.map(function () {
                return $(this).val();
            }).get();

        var colIdx = parseInt( inputObj.closest('th').attr('data-column-index'), 10 );
        var tbody = grid.find('tbody');
        var rows = tbody[0].rows;
        var rowCount = rows.length;
        var cellObj;
        var rowFilterValue;

        // go through all the rows
        for (i = 0; i < rowCount; i++) {

            cellObj = $(rows[i].cells[colIdx]);

            //the first element will be the sorting value
            if( cellObj.find(':input.auto-admin-grid-filter-value').size() ){
                rowFilterValue = cellObj.find(':input.auto-admin-grid-filter-value').val();
            }else{
                rowFilterValue = $.trim(cellObj.find('.auto-admin-grid-filter-value').html());
            }

            if( selectedFilters.length === 0 || selectedFilters.indexOf(rowFilterValue) >= 0 ){
                $(rows[i]).removeClass('hide');
            }else{
                $(rows[i]).addClass('hide');
            }

        }

    },

    sort: function( inputObj ){

        var grid = inputObj.closest('.auto-admin-grid');
        var colIdx = parseInt( inputObj.closest('th').attr('data-column-index'), 10 );
        var tbody = grid.find('tbody');
        var rows = tbody[0].rows;
        var rowCount = rows.length;
        var cellCount;
        var arr = new Array();

        // go through all the rows
        for (i = 0; i < rowCount; i++) {

            // get the cells for that row and the count
            cells = rows[i].cells;
            cellCount = cells.length;

            // create a new array for this row
            arr[i] = new Array();

            //the first element will be the sorting value
            if( $(cells[colIdx]).find(':input.auto-admin-grid-filter-value').size() ){
                arr[i][0] = $(cells[colIdx]).find(':input.auto-admin-grid-filter-value').val();
            }else{
                arr[i][0] = $.trim($(cells[colIdx]).find('.auto-admin-grid-filter-value').html());
            }

            // and then create a third dimension to this array that will be the HTML
            arr[i][1] = new Array();

            for (j = 0; j < cellCount; j++) {
                if( $(cells[j]).find(':input.auto-admin-grid-filter-value').size() ){
                    arr[i][1][j] = $(cells[j]).find(':input.auto-admin-grid-filter-value').val();
                }else{
                    arr[i][1][j] = $.trim($(cells[j]).find('.auto-admin-grid-filter-value').html());
                }
            }

        }

        arr.sort(function(a, b){
            // return (a[1][col] == b[1][col]) ? 0 : ((a[1][col] > b[1][col]) ? asc : -1*asc);
            return a[1][colIdx] - b[1][colIdx];
        });

        console.log(arr);

    },

	addRecords: function( clickObj ){

	    var ag = this;
    	var recCount = clickObj.attr('data-record-count');

    	clickObj.closest('.grid-dropdown').find('.dropdown-menu').addClass('hide');

    	for( i = 1; i <= recCount; i++ ){
      		ag.renderRecord(true, {}, false, "added");
    	}

  	},

	refreshFilters: function( args ){

		var $grid = args.grid;
		var rows = $grid.find('tbody tr');
		var cols = args.columns;
    	var val;
    	var values = {};

    	// go through each column
    	for( var col in cols ){

      		if( cols[col].name === 'actions'){
        		continue;
      		}

      		// reset for each column
      		values = {}

      		rows.each(function(){

				// cache it
      			var inputElement = $(this).find('td').eq(col).find(':input[name='+cols[col].name+']');

        		val = ( inputElement.val() ? inputElement.val() : inputElement.select2("val") );

        		if( val && val.length > 0 ){
          			values[val] = val;
        		}

      		})

      		//add these to the main columns array
      		if( _.size(values) > 0 ){
        		cols[col].currentValues = values;
      		}

      		//refresh the filter
      		autoAdmin.grid.refreshFilterOptions({
      			"columns" : cols,
      			"colIndex" : col,
      			"grid" : $grid
      		});

    	}

	},

  	refreshFilterOptions: function(args){

		var th = args.grid.find('thead tr th').eq(args.colIndex);
		var tmpltObj = {};
		var col = args.columns[args.colIndex];
		var dropdownObj = {
			wrapClass : "grid-header-filter",
			footerOptions : [
				{
					href : "#",
					itemClass : "grid-header-filter-clear",
					label : "Clear Filters"
				}
			]
		}

		//remove all filter data
		th.find('.dropdown-wrapper').remove();
		th.append( autoAdmin.render.hbsTemplate( "dropdownMenu", dropdownObj ) );

		//only attempt to do something if there are values in there
		if( _.size(col.currentValues) > 0 ){

			th.find('.icon-filter').removeClass('hide')

			for( var value in col.currentValues ){

				tmpltObj.name = value;
				tmpltObj.parent = col.name;
				if( col.hasOwnProperty('data') ){

		  			for( var rec in col.data ){

		    			if( col.data[rec].value == value ){

		      				tmpltObj.label = ( col.data[rec].hasOwnProperty('label') ? col.data[rec].label : col.data[rec].value );
		      				break;

					    }

					}

				}else{

		  			tmpltObj.label = value;

				}

				th.find('.dropdown-menu .divider').before( autoAdmin.render.hbsTemplate( "dropdownSelectItem", tmpltObj ) );

			}

		}else{

			th.find('.icon-filter').addClass('hide');

		}

	},

  	columnSelect: function( clickObj, groupType ){

  		if( !groupType ){

	    	var id = clickObj.val();
	    	var cells = $('#'+id+", .auto-admin-grid td[data-header-id="+id+"]");

	    	if( clickObj.is(':checked') ){
	      		cells.show();
	    	}else{
	      		cells.hide();
	    	}

  		}else{

  			switch( groupType ){

  				case "all":
  					clickObj.closest('.dropdown-wrapper').find('.dropdown-menu :input').not(':checked').trigger('click');
  					break;

  				case "min":
  					clickObj.closest('.dropdown-wrapper').find('.dropdown-menu :input').each(function(){
  						var inputObj = $(this);
  						var priority = parseInt( $('#'+inputObj.val()).attr('data-column-select-priority'), 10 );
  						if( ( inputObj.is(':checked') && priority > 1 ) || ( inputObj.is(':not(:checked)') && priority <= 1 ) ){
  							inputObj.trigger('click');
  						}
  					})
  					break;

  				case "dflt":
  					var dropdownMenu = clickObj.closest('.dropdown-wrapper').find('.dropdown-menu');
  					$('.auto-admin-grid th, .auto-admin-grid td').css("display", "");
  					$('.auto-admin-grid th').each(function(){

  						var inputObj = dropdownMenu.find(':input[value='+$(this).attr('id')+']');

  						console.log(inputObj);

  						//check the visibility of this header which is now based on the media queries
				        if( $(this).css('display') === 'table-cell' && inputObj.is(':not(:checked)') ){

				        	inputObj.trigger('click');

	        			}else if( $(this).css('display') === 'none' && inputObj.is(':checked') ){

	        				inputObj.trigger('click');

	        			}

  					})
  					break;

  			}

  			autoAdmin.ui.dropdownToggle( clickObj.closest('.dropdown-wrapper').find('.dropdown-toggle') );

  		}

  	},

  	gridActions: function( args ){

  		var $grid = args.grid;
  		var $gridWrapper = $grid.closest('.auto-admin-grid-wrapper');
  		var dropdownObj = {};

    	if( $gridWrapper.find('.grid-actions').size() === 0 ){
    		dropdownObj.wrapClass = "grid-actions";
    		dropdownObj.buttonLabel = "Actions";
    		dropdownObj.defaultActions = args.gridActions;
    		$gridWrapper.prepend( autoAdmin.render.hbsTemplate( "dropdownMenu", dropdownObj ) )
    	}


  	}

}