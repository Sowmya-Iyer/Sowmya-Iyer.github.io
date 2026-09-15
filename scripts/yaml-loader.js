(function () {
  function stripQuotes(value) {
    value = value.trim();
    if ((value[0] === '"' && value[value.length - 1] === '"') ||
        (value[0] === "'" && value[value.length - 1] === "'")) {
      return value.slice(1, -1)
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\n/g, '\n');
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
  }

  function parse(text) {
    var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(function (line) {
      return line.replace(/\t/g, '    ');
    });

    var root = {};
    var stack = [{ indent: -1, value: root }];

    function nextMeaningful(index) {
      for (var j = index + 1; j < lines.length; j++) {
        var candidate = lines[j];
        if (!candidate.trim() || candidate.trim().charAt(0) === '#') continue;
        return { indent: candidate.search(/\S|$/), text: candidate.trim() };
      }
      return null;
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      if (!raw.trim() || raw.trim().charAt(0) === '#') continue;

      var indent = raw.search(/\S|$/);
      var line = raw.trim();

      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }

      var parent = stack[stack.length - 1].value;

      if (line.charAt(0) === '-') {
        if (!Array.isArray(parent)) {
          throw new Error('Invalid YAML structure near: ' + line);
        }

        var itemText = line.slice(1).trim();
        var item;
        if (!itemText) {
          item = {};
          parent.push(item);
          stack.push({ indent: indent, value: item });
          continue;
        }

        var colon = itemText.indexOf(':');
        if (colon >= 0) {
          item = {};
          parent.push(item);
          var key = itemText.slice(0, colon).trim();
          var valueText = itemText.slice(colon + 1).trim();
          item[key] = valueText ? stripQuotes(valueText) : {};
          stack.push({ indent: indent, value: item });

          if (!valueText) {
            var next = nextMeaningful(i);
            if (next && next.indent > indent && next.text.charAt(0) === '-') {
              item[key] = [];
              stack.push({ indent: next.indent - 1, value: item[key] });
            }
          }
        } else {
          parent.push(stripQuotes(itemText));
        }
        continue;
      }

      var separator = line.indexOf(':');
      if (separator < 0) continue;

      var key = line.slice(0, separator).trim();
      var valueText = line.slice(separator + 1).trim();

      if (valueText) {
        parent[key] = stripQuotes(valueText);
      } else {
        var next = nextMeaningful(i);
        if (next && next.indent > indent && next.text.charAt(0) === '-') {
          parent[key] = [];
        } else {
          parent[key] = {};
        }
        stack.push({ indent: indent, value: parent[key] });
      }
    }

    return root;
  }

  window.loadYaml = function (path) {
    return fetch(path, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Unable to load ' + path + ' (' + response.status + ')');
        return response.text();
      })
      .then(parse);
  };
})();
