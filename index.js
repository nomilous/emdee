var marked = require('marked'); // if a more recent version of marked has already been 'required'
                              // this might fail to render the markdown to console.
                             //
                            // Recent versions of marked no longer support console renderning.

module.exports = function(object, opts) {

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

module.exports.replace = function(obj, key) {

  console.log('replace', key, 'on', obj);

}


module.exports.suffix = function(obj, key, suffix) {

  Object.defineProperty(obj, key + suffix, {
    enumerable: true,
    get: function() {
      try {

      } catch (e) {
        console.log('Readme not available.')
      }
    }
  });

  // console.log('suffix', key, 'on', obj);

}