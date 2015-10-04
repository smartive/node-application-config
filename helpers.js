exports = module.exports = {
    isNumeric: function (number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    },

    isBoolean: function (str) {
        return (/^true|false$/i).test(str);
    },

    toBoolean: function (str) {
        return str == 'true';
    }
};