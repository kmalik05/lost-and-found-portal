const moment = require('moment');

module.exports = {
  formatDate: function(date, format) {
    return moment(date).format(format || 'MMM Do YYYY');
  },
  eq: function(a, b) {
    return a === b;
  }
};