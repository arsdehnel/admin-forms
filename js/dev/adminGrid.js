var adminGrid = {

  init: function(){

    // just while developing the template stuff and until there is a built-in way to do this as needed
    localStorage.clear();

    //setup some variables
    this.grid = $('.auto-admin-grid');
    this.filters = $('.auto-admin-filters');
    this.colSelect = $('.auto-admin-column-select');
    this.messages = new Array();
    this.dataLkupForm = this.filters.find('form');

    //this loops through all handlebars templates that have an approrpriate class
    //and puts them into an array in the object
    //this.templates = this.compileTemplates();
    //this.templates = {};

    //this will return the meta data for all fields
    //and actual option data for static fields
    //but not all the ajax-y data for the dynamic ones
    //as that will be retrieved real-time upon row creation
    //or "revert" operation
    this.columns = this.getColumnData();

    console.log(this.columns);

    //setup any event handlers and whatnot
    this.bindUIFunctions();

    //using that information that we just got from getcolumndata
    //this will create the column picker UI elements and add any extra meta information to the
    //column headers that are needed
    this.headersSetup();

    this.filterSetup();

    this.dataLkup();

  },

  showMessages: function(){

    var ag = this;
    var msg = {};

    while( ag.messages.length > 0 ){
      msg = ag.messages.pop();

      if( msg.id ){
        ag.grid.find('tr#'+msg.id+' .auto-admin-grid-row-messages')
          .addClass(msg.type)
          .text(msg.text)
          .animate(
            {"left":"0"},
            800,
            function(){
              var self = $(this);
              setTimeout(function(){
                self.animate({"left":"100%"},800,function(){
                  $(this).text('').removeClass(msg.type);
                })
              },2000)
            })
      }else{
        alert(msg);
      }
    }

  },

  dataLkup: function(){

    var ag = this;

    $.ajax({
        url: ag.dataLkupForm.attr('action'),
        beforeSend: function( xhr ) {
            xhr.overrideMimeType( "text/json;" );
        },
        complete: function( jqXhr, textStatus ){

            var data = jqXhr.responseJSON;

            for( var record in data.records ){
                ag.renderRecord( true, data.records[record], false, "current" );
            }

            ag.getCurrentValues();

        }
    });

  },

  getCurrentValues: function(){

    var ag = this;
    var rows = ag.grid.find('tbody tr');
    var val;
    var values = {};

    //go through each column
    for( var col in ag.columns ){

      if( ag.columns[col].name == 'actions'){
        continue;
      }

      // reset this to empty for each column
      values = {};

      //for each column go through all the rows, accumulating the values from each
      rows.each(function(){

        // cache it
        val = $(this).find('td').eq(col).find(':input[name='+ag.columns[col].name+']').val();

        if( val.length > 0 ){
          values[val] = val;
        }

      })

      //add these to the main columns array
      if( _.size(values) > 0 ){
        ag.columns[col].currentValues = values;
      }

      //refresh the filter
      ag.refreshFilterOptions( col );

    }//columns

  },

  refreshFilterOptions: function( idx ){

    var ag = this;
    var th = ag.grid.find('thead tr th').eq(idx);
    var tmpltObj = {};
    var col = ag.columns[idx];

    //remove all filter data
    th.find('.auto-admin-filter-data').empty();

    //only attempt to do something if there are values in there
    if( _.size(col.currentValues) > 0 ){
      th.find('.auto-admin-filter-trigger').removeClass('hide')
      for( var value in col.currentValues ){

        tmpltObj.name = value;
        if( col.hasOwnProperty('data') ){
          for( var rec in col.data ){
            if( col.data[rec].value == value ){
              tmpltObj.label = col.data[rec].label;
              break;
            }
          }
        }else{
          tmpltObj.label = value;
        }

        th.find('.auto-admin-filter-data').append(ag.templates.autoAdminDropdownSelectItem(tmpltObj));
      }
    }else{
      th.find('.auto-admin-filter-trigger').addClass('hide');
    }

  },

  },

  bindUIFunctions: function(){

    var ag = this;

    $('body')
      .on('mouseenter', '.auto-admin-grid .auto-admin-tooltip-trigger', function(){
        ag.toolTipShow( $(this) );
      })
      .on('mouseleave', '.auto-admin-grid .auto-admin-tooltip-trigger', function(){
        ag.toolTipHide( $(this) );
      })
      .on('click', '.auto-admin-grid-dropdown-wrapper .dropdown-toggle', function(){
        ag.toggleDropdown( $(this) );
        return false;
      })
      .on('click', '.auto-admin-filter-trigger', function(){
        ag.toggleFilterSelect( $(this) );
        return false;
      })
      .on('click', '.auto-admin-grid-record-add', function(){
        ag.addRecords( $(this) );
        return false;
      })
      .on('click', '.auto-admin-cell-actions .action', function(){
        ag.rowActionHandler( $(this) );
        return false;
      })
      .on('change', '.auto-admin-column-select .dropdown-menu input', function(){
        ag.columnSelect( $(this) );
      })
      .on('change', '.auto-admin-grid tbody td :input', function(){
        ag.rowDataChange( $(this) );
      })
      .on('submit', '.auto-admin-filters form', function(){
        ag.filterSubmit();
        return false;
      })

  },

  rowActionHandler: function( clickObj ){

    var ag = this;
    var rec = clickObj.closest('tr');
    var type = clickObj.data('action-type');
    var dataObj = {};

    //remove the existing class and add "processing" class
    rec.removeClass('added updated current').addClass('processing');

    //do some variances for the different actions
    switch( type ){

      case "inactivate":

        // get the data from this record
        dataObj = rec.find(':input').serializeObject();

        //make the status code 'I'
        dataObj.status_code = 'I';

        //do an ajax submission
        //$.ajax({});

        //assuming that comes back properly just re-render the record
        ag.renderRecord( false, dataObj, false, "current" );

        //notify the user
        ag.messages.push({
          "id" : rec.attr('id'),
          "type" : "success",
          "text" : "Record inactivated"
        });
        ag.showMessages();
        break;

      case "revert":

        // get the data for this record
        //$.ajax({})

        //assuming that comes back properly just re-render the record
        ag.renderRecord( false, dataObj, false, "current" );

        //notify the user
        ag.messages.push({
          "id" : rec.attr('id'),
          "type" : "success",
          "text" : "Record reverted"
        });
        ag.showMessages();
        break;

      case "save":

        // get the data from this record
        dataObj = rec.find(':input').serializeObject();

        //do an ajax submission
        //$.ajax({});

        //assuming that comes back properly just re-render the record
        ag.renderRecord( false, dataObj, false, "current" );

        //notify the user
        ag.messages.push({
          "id" : rec.attr('id'),
          "type" : "success",
          "text" : "Record saved"
        });
        ag.showMessages();
        break;

      case "clone":
        // get the data from this record
        dataObj = rec.find(':input').serializeObject();

        //give is a new "fake" id
        dataObj.id = 'a' + Math.round( Math.random() * 10000000 );

        // and then create a new record with that data
        ag.renderRecord( true, dataObj, rec, "added" );

        //notify the user
        ag.messages.push({
          "id" : rec.attr('id'),
          "type" : "success",
          "text" : "Record cloned"
        });
        ag.showMessages();
        break;

    }

    //probably do this as part of the "success" callback
    //commented during development of the error handling
    rec.removeClass('processing').addClass('current');
    //message, too

  },

  rowDataChange: function( inputObj ){

    inputObj.closest('tr').removeClass('added current').addClass('updated');

  },

  columnSelect: function( clickObj ){

    var ag = this;
    var id = clickObj.val();
    var cells = $('#'+id+", .auto-admin-grid td[data-header-id="+id+"]");

    if( clickObj.is(':checked') ){
      cells.show();
    }else{
      cells.hide();
    }

    clickObj.closest('.grid-dropdown').find('.dropdown-label').text('Custom columns');

  },

  addRecords: function( clickObj ){

    var ag = this;
    var recCount = clickObj.attr('data-record-count');

    clickObj.closest('.grid-dropdown').find('.dropdown-menu').addClass('hide');

    for( i = 1; i <= recCount; i++ ){
      ag.renderRecord(true, {}, false, "added");
    }

  },

  renderRecord: function( createRow, dataObj, adjSibObj, rowClass ){

    var ag = this;
    var tmpltName;
    var inputField;
    var rowClass;
    var rowObj = {};
    var cellObj = {};
    var row = $('<tr />');

    //append each field to the placeholder row object
    for( var col in ag.columns ){
      cellObj = {};
      tmpltName = (ag.columns[col].type);
      tmpltName = tmpltName[0].toUpperCase() + tmpltName.slice(1);

      $.extend( cellObj, ag.columns[col], { "currentValue" : dataObj[ag.columns[col].name]} );

      cellObj.inputField = ag.hbsTemplate( 'autoAdminGridInputType-'+tmpltName, cellObj);

      row.append(ag.hbsTemplate( "autoAdminGridCell", cellObj));
    }

    //make sure we have an ID value, even for new rows
    if( typeof dataObj.id == 'undefined' ){
      dataObj.id = 'a' + Math.round( Math.random() * 10000000 );
      //rowClass = "added";
    }else{
      //rowClass = "current";
    }

    //create the "row" object even if we're just reverting an existing record
    rowObj = {
      "id" : dataObj.id,
      "fieldCells" : row.html(),
      "rowClass" : rowClass
    }

    if( createRow ){

      if( adjSibObj ){
        adjSibObj.after(ag.hbsTemplate( "autoAdminGridRow", rowObj))
      }else{
        ag.grid.find('tbody').append(ag.hbsTemplate( "autoAdminGridRow", rowObj))
      }

    }else{

      $('.auto-admin-grid tbody tr#'+dataObj.id).replaceWith(ag.hbsTemplate( "autoAdminGridRow", rowObj))

    }

    $('#'+dataObj.id).find('.select2').select2({
      formatResult: ag.select2Template,
      dropdownAutoWidth: true,
      allowClear: true
    });


  },

  getColumnData: function(){

    var ag = this;
    var columns = {};

    $.ajax({
        url: ag.grid.attr('data-column-lkup-url'),
        async: false,
        beforeSend: function( xhr ) {
            xhr.overrideMimeType( "text/json;" );
        },
        complete: function( jqXhr, textStatus ){

            columns = jqXhr.responseJSON.columns;

        }
    });

    return columns;

  },

  filterSetup: function(){

    var ag = this;

    ag.filters.find('.select2').select2();

    var firstFilter = ag.filters.find(':input');

    if( firstFilter.hasClass('select2') ){
      //commenting this for now because it's super annoying to have it steal focus in CodePen
      //firstFilter.select2('open');
    }else{
      firstFilter.focus();
    }

  },

  filterSubmit: function(){

    var ag = this;
    var form = ag.filters.find('form');
    var data = form.serializeObject();

    alert(data);

  }

}

adminGrid.init();