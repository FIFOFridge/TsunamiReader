function Hashtable() {
    this._map = new Map();
    this._indexes = new Map();
    this._keys = [];
    this._values = [];
    this.put = function(key, value) {
        var newKey = !this.containsKey(key);
        this._map.set(key, value);
        if (newKey) {
            this._indexes.set(key, this.length);
            this._keys.push(key);
            this._values.push(value);
        }
    };
    this.remove = function(key) {
        if (!this.containsKey(key))
            return;
        this._map.delete(key);
        var index = this._indexes.get(key);
        this._indexes.delete(key);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
    };
    this.indexOfKey = function(key) {
        return this._indexes.get(key);
    };
    this.indexOfValue = function(value) {
        return this._values.indexOf(value) != -1;
    };
    this.get = function(key) {
        return this._map.get(key);
    };
    this.entryAt = function(index) {
        var item = {};
        Object.defineProperty(item, "key", {
            value: this.keys[index],
            writable: false
        });
        Object.defineProperty(item, "value", {
            value: this.values[index],
            writable: false
        });
        return item;
    };
    this.clear = function() {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var key = this.keys[i];
            this._map.delete(key);
            this._indexes.delete(key);
        }
        this._keys.splice(0, length);
    };
    this.containsKey = function(key) {
        return this._map.has(key);
    };
    this.containsValue = function(value) {
        return this._values.indexOf(value) != -1;
    };
    this.forEach = function(iterator) {
        for (var i = 0; i < this.length; i++)
            iterator(this.keys[i], this.values[i], i);
    };
    Object.defineProperty(this, "length", {
        get: function() {
            return this._keys.length;
        }
    });
    Object.defineProperty(this, "keys", {
        get: function() {
            return this._keys;
        }
    });
    Object.defineProperty(this, "values", {
        get: function() {
            return this._values;
        }
    });
    Object.defineProperty(this, "entries", {
        get: function() {
            var entries = new Array(this.length);
            for (var i = 0; i < entries.length; i++)
                entries[i] = this.entryAt(i);
            return entries;
        }
    });
}

module.exports = Hashtable;