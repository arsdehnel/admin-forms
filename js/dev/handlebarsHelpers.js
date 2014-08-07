Handlebars.registerHelper('optionSelected', function(value, currentValue) {
	if( Array.isArray( currentValue ) ){
		var selectedProperty = currentValue.indexOf( value ) ? 'selected="selected"' : '';
	}else{
		var selectedProperty = value == currentValue ? 'selected="selected"' : '';
	}
  return new Handlebars.SafeString(selectedProperty);
});