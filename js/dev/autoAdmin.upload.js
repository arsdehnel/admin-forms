window.autoAdmin = window.autoAdmin || {};

autoAdmin.upload = {

	init: function(){

		this.bindUIFunctions();
		this.dndTimer;

	},

	bindUIFunctions: function(){

		$('body')
		    .on('drop', function(e) {
		    	autoAdmin.upload.drop(e);
			})
			.on("dragover", function(e) {
				autoAdmin.upload.dragover(e);
				// clearTimeout(autoAdmin.upload.dndTimer);

	  	// 		// Do something to UI to make page look droppable
				// if (e.currentTarget == $('body')[0]) {
	   //        		$('body').addClass('droppable');
		  //       }

	  	// 		// Required for drop to work
	  	// 		return false;

			})
			.on("dragleave", function(e){
				autoAdmin.upload.dragover(e);
				// if (e.currentTarget == $('body')[0]) {
	   //        		// Flicker protection
	   //        		autoAdmin.upload.dndTimer = setTimeout(function() {
	   //          		$('body').removeClass('droppable');
	   //        		}, 200);
	   //      	}
			})
			.on('click', '#upload-progress .close', function(e){
				e.preventDefault();
				autoAdmin.ui.dialog({
					id : "upload-progress",
					action : "close"
				})
			})

	},

	drop: function( event ){

		// Or else the browser will open the file
		event.preventDefault();

		autoAdmin.upload.dragover();

		autoAdmin.ui.dialog({
			id : "upload-progress",
			header : "File Upload Progress",
			footer : "<a href='#' class='btn icon icon-cancel upload-cancel'>Cancel</a>",
			action : "showModal"
		})

		var files = event.target.files || event.dataTransfer.files;

		for( i = 0; file = files[i]; i++ ) {

			var xhr = new XMLHttpRequest();

			if (xhr.upload && file.size <= 30000000) {
				// start upload
				xhr.upload.filename = file.name;
				// generate a random number to be used for this file's progress
				xhr.progressId = "progress-" + Math.floor((Math.random() * 100000));
				xhr.upload.progressId = xhr.progressId;
				xhr.upload.addEventListener('loadstart', autoAdmin.upload.start, false)
				xhr.upload.addEventListener('progress', autoAdmin.upload.progress, false);
				xhr.upload.addEventListener('load', autoAdmin.upload.complete, false);
				xhr.upload.addEventListener('error', autoAdmin.upload.error, false);
				xhr.upload.addEventListener('abort', autoAdmin.upload.abort, false);
				xhr.addEventListener('load',function(e){
					autoAdmin.upload.response( this.status, this.progressId, e.currentTarget.responseText );
				})
				xhr.open("POST", "json/file-upload.json", true);
				xhr.setRequestHeader("Content-Type", "application/octet-stream");
				xhr.setRequestHeader("X-File-Name", file.name);
				xhr.send(file);
			}else{
				console.log('file not uploaded',file);
			}

		}

	},

	dragover: function( event ){

		event.stopPropagation();
		event.preventDefault();

		if( event.type == "dragover" ){
			clearTimeout(autoAdmin.upload.dndTimer);
			$('body').addClass('droppable');
			if( $(event.target).hasClass('upload-drop-zone') ){
				$(event.target).addClass('hover');
			}else{
				$('.upload-drop-zone').removeClass('hover');
			}
		}else{
			autoAdmin.upload.dndTimer = setTimeout(function() {
				$('body').removeClass('droppable');
				$('.upload-drop-zone').removeClass('hover');
      		}, 200);
		}
	},

	start: function( event ){

		// append to the dialog body
		$('#upload-progress .dialog-body').append('<div class="upload-progress" id="'+this.progressId+'"><label for="'+this.progressId+'-meter">'+this.filename+'</label><progress id="'+this.progressId+'-meter" max="100" value="0" /></div>')

		var percent = 0;
	},

	progress: function( event ){
		if (event.lengthComputable) {
       		var progress = Math.ceil( ( event.loaded / event.total ) * 100 );
       		$("#"+this.progressId+"-meter").attr('value',progress);
   		}
	},

	complete: function( event ){
		$('#upload-progress .dialog-footer .upload-cancel').replaceWith('<a href="#" class="btn close icon icon-close">done</a>');
	},

	response: function( status, progressId, responseText ){

		if( status == 200 ){

		    var data = JSON.parse(responseText);
		    var records = data.records;

			records.forEach(function( element, index, array ){
				autoAdmin.render.renderGridRecord({
					"target" : $('.auto-admin-grid tbody'),
					"columns" : data.columns,
					"dataObj" : element,
					"createRow" : true
				})
			})

			$("#"+progressId).after('<p>'+records.length+' records added successfully.</p>');


		}else{

			alert('Oh no. Error. Bad one, too.');
			autoAdmin.utils.log('error','Error processing upload of file',responseText)

		}

	}

}