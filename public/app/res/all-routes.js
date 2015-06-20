define(function () {
	return "<tbody>\
	<% _.each(_.keys(routes), function(route){ %>\
		<tr>\
			<td><%= route %></td>\
			<td><%= routes[route] %></td>\
		</tr>\
	<% }); %>\
</tbody>";
});