define(function () {
	return "<tbody>\
	<% _.each(routes, function(route){ \
		var cssClass = 'inactive-route-row';\
		if (route === activeRoute) {\
			cssClass = 'active-route-row';\
		}\
		%>\
			<tr class='<%= cssClass %>'>\
				<td><%= route %></td>\
				<td><button>&times</button></td>\
			</tr>\
	<% }); %>\
</tbody>";
});