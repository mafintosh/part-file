var fs = require('fs');

var RandomAccessFile = function(path, options) {
	if (!(this instanceof RandomAccessFile)) return new RandomAccessFile(path, options);

	options = options || {};

	this.partial = options.partial;
	this.path = path;
	this.size = options.size;

	var open = function(callback) {
		var stack = [callback];

		action = function(callback) {
			stack.push(callback);
		};

		var onfd = function(err, fd) {
			action = err ? open : function(callback) {
				callback(err, fd);
			};

			while (stack.length) stack.shift()(err, fd);
		};

		fs.open(path, 'a+', function(err, fd) {
			if (err || typeof options.size !== 'number') return onfd(err, fd);

			fs.truncate(fd, options.size, function(err) {
				if (!err) return onfd(null, fd);

				fs.close(fd, function() {
					onfd(err);
				});
			});
		});
	};

	var action = open;

	this.open = function(callback) {
		action(callback);
	};
};

RandomAccessFile.prototype.stat = function(callback) {
	this.open(function(err, fd) {
		if (err) return callback(err);
		fs.fstat(fd, callback);
	});
};

RandomAccessFile.prototype.write = function(offset, data, callback) {
	if (this.size && offset < 0) offset += this.size;
	if (!Buffer.isBuffer(data)) data = new Buffer(data);

	this.open(function(err, fd) {
		if (err) return callback(err);
		console.log(data.toString());
		fs.write(fd, data, 0, data.length, offset, callback);
	});
};

RandomAccessFile.prototype.read = function(offset, length, callback) {
	if (this.size && offset < 0) offset += this.size;

	var buffer = new Buffer(length);
	var partial = this.partial;

	this.open(function(err, fd) {
		if (err) return callback(err);
		fs.read(fd, buffer, 0, length, offset, function(err, read) {
			if (err) return callback(err);
			if (partial && read) return callback(null, buffer.slice(0, read));
			if (read < buffer.length) return callback();
			callback(null, buffer);
		});
	});
};

RandomAccessFile.prototype.close = function(callback) {
	this.open(function(err, fd) {
		if (err) return callback(err);
		fs.close(fd, callback);
	});
};

module.exports = RandomAccessFile;