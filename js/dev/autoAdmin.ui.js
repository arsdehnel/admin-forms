window.autoAdmin = window.autoAdmin || {};

autoAdmin.ui = {

	dropdownToggle: function( event, clickObj ){

		event.preventDefault();
		clickObj.closest('.dropdown-wrapper').find('.dropdown-menu').toggleClass('hide');

	},

	dialog: function( args ){

		var dialogElement = $('<dialog />');
		var dialogObj = {
			header : args.header,
			body : args.body,
			footer : args.footer
		}

		switch( args.action ){

			case "show":
				dialogElement
					.attr('id',args.id)
					.addClass(args.dialogClass)
					.html( autoAdmin.render.hbsTemplate( "dialog", dialogObj ) )
					.appendTo('body');
				$('#'+args.id)[0].show();
				break;

			case "showModal":
				dialogElement
					.attr('id',args.id)
					.addClass(args.dialogClass)
					.html( autoAdmin.render.hbsTemplate( "dialog", dialogObj ) )
					.appendTo('body');
				$('#'+args.id)[0].showModal();
				break;

			case "close":
				$('#'+args.id)[0].close();
				break;

		}

	}

}