var marked = require('./deps/marked');


var os = require('os');
var setted = false;
var failed = false;

module.exports = function(object, opts) {

  if (!setted) {
    try {
      marked.setOptions({gfm: true, terminal: true});
      setted = true;
    } catch (e) {
      failed = true;
      console.log(e);
    }
  }

  opts = opts || {};

  opts.match = opts.match || [/^README$/];
  opts.recurse = opts.recurse || [/^\$/];
  opts.replace = typeof opts.replace == 'boolean' ? opts.replace : true;

  opts.suffix = opts.suffix || '_md'; // only used if replace is false

  var recurse = function(obj, parent) {
    Object.keys(obj).forEach(function(key) {
      try {
        var next = obj[key];
        if (typeof next === 'function') {
          for (var i = 0; i < opts.match.length; i++) {
            if (key.match(opts.match[i])) {
              if (opts.replace) {
                module.exports.replace(obj, key);
              } else {
                module.exports.suffix(obj, key, opts.suffix);
              }
              break;
            }
          }
        }

        if (typeof next === 'object' || typeof next === 'function') {
          for (var i = 0; i < opts.recurse.length; i++) {
            if (key.match(opts.recurse[i])) {
              recurse(next, obj);
              break;
            }
          }
        }
      } catch (e) {
        console.log(e);
      } 
    });
  }

  recurse(object);
}

var cant = function() {
  console.log();
  console.log('Readme not available...');
  console.log('see https://github.com/nomilous/emdee/blob/master/index.js#L4');
  console.log();
}

module.exports.replace = function(obj, key) {

  if (!setted) {
    try {
      marked.setOptions({gfm: true, terminal: true});
      setted = true;
    } catch (e) {
      failed = true;
    }
  }

  var formatted = module.exports.parse(obj[key]);

  Object.defineProperty(obj, key, {
    enumerable: true,
    get: function() {
      if (failed) return cant();
      try {
        console.log(marked.parse( formatted ));
      } catch (e) {
        console.log(e);
        return cant();
      }
    }
  });

}


module.exports.suffix = function(obj, key, suffix) {

  if (typeof obj[key + suffix] !== 'undefined') return;

  if (!setted) {
    try {
      marked.setOptions({gfm: true, terminal: true});
      setted = true;
    } catch (e) {
      failed = true;
    }
  }

  var formatted = module.exports.parse(obj[key]);

  Object.defineProperty(obj, key + suffix, {
    enumerable: true,
    get: function() {
      if (failed) return cant();
      try {
        console.log(marked.parse( formatted ));
      } catch (e) {
        console.log(e);
        return cant();
      }
    }
  });
}

module.exports.parse = function(fn) {

  var leftSpace, lines = fn.toString().split(os.EOL);
  
  lines.shift(); // remove first line: function() {/*
  lines.pop();  // remove last line:   */} 

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].match(/#/)) {
      var leftSpace = lines[i].indexOf('#');
      break;
    }
  }

  return lines.map(function(line) {
    return line.substr(leftSpace);
  }).join(os.EOL);

}

