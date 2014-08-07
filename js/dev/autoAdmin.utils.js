window.autoAdmin = window.autoAdmin || {};

autoAdmin.utils = {

    spin: function( targetObj ){

    	targetObj.removeClass('hide').addClass('loading').spin();

    },

    pageSpin: function(){

        this.pageOverlay({'show':true});
        $('.page-spin').removeClass('hide');
        this.pageSpinner = new Spinner({length: 60,width: 35, radius: 100}).spin(document.getElementById('page-spin'));

    },

    pageSpinStop: function(){

        this.pageOverlay({'show':false});
        $('.page-spin').addClass('hide');
        this.pageSpinner.stop();

    },

    pageOverlay: function( args ){

        if( args.show ){
            $('.body-overlay').removeClass('hide');
        }else{
            $('.body-overlay').addClass('hide');
        }

    },

    printObject: function(obj){
  		return JSON.stringify(obj,null,'\t').replace(/\n/g,'<br>').replace(/\t/g,'&nbsp;&nbsp;&nbsp;');
	},

	inptTypeTplName: function( inputType ){
		var tmpltName = inputType.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
		    tmpltName = tmpltName[0].toUpperCase() + tmpltName.slice(1)
		    tmpltName = "inputType" + tmpltName;
		return tmpltName;
	},

	log: function(){

		// convert to a true array
		var args = Array.prototype.slice.call(arguments);

		// pull off the level from the beginning
  		var msgLevel = args.shift();

		// add something indicating it's from the autoAdmin
		args.unshift( "::autoAdmin::");

		// make sure our history log is ready
  		autoAdmin.log.history = autoAdmin.log.history || [];   // store logs to an array for reference

  		// output it if this browser supports that
  		if(window.console){
    		console.log( arguments );
  		}

  		// add a datestamp
  		args.push(Date.now());

  		// put it into our history log with the datestamp added
  		autoAdmin.log.history.push(args);

	}

}