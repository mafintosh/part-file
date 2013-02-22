# random-access-file

Random Access File allows you to read or write to a file using random offsets and lengths

	npm install random-access-file

# Usage is easy

``` js
var raf = require('random-access-file');

var file = raf('my-file.txt', {
	size: 1024 // if a size is given the file will be truncted to fit this size
});

file.write(10, new Buffer('hello'), function(err) {
	// write a buffer to offset 10
	file.read(10, 5, function(err, buffer) {
		console.log(buffer); // read 5 bytes from offset 10
	});
});
```

The file will use an open file descriptor.
When you are done with the file you should call `file.close()`.

## License

MIT