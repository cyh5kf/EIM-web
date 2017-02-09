.<%= options.prefix.replace(/-$/, '')  %> {
  background-image: url('<%= options.spritePath %>');
  background-size: <%= getCSSValue(layout.width) %> <%= getCSSValue(layout.height) %>;
}

<% layout.images.forEach(function (image) { %>.<%= image.className %> { background-position: <%= getCSSValue(-image.x) %> <%= getCSSValue(-image.y) %>; width: <%= getCSSValue(image.width) %>; height: <%= getCSSValue(image.height) %>; }
<% }); %>
