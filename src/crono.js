(function (root, factory) {
  'use strict'

  if (typeof window.define === 'function' && window.define.amd) {
    window.define(factory)
  } else {
    root.crono = factory()
  }
}(this, function () {
  // default options for crono
  var defaultOptions = {
    locale: {
      prefixAgo: null,
      prefixFromNow: null,
      suffixAgo: 'ago',
      suffixFromNow: 'from now',
      inPast: 'any moment now',
      seconds: 'less than a minute',
      minute: 'about a minute',
      minutes: '%d minutes',
      hour: 'about an hour',
      hours: 'about %d hours',
      day: 'a day',
      days: '%d days',
      month: 'about a month',
      months: '%d months',
      year: 'about a year',
      years: '%d years',
      wordSeparator: ' ',
      numbers: []
    }
  }

  function parse (iso8601) {
    var s = iso8601.trim()
    s = s.replace(/\.\d+/, '') // remove milliseconds
    s = s.replace(/-/, '/').replace(/-/, '/')
    s = s.replace(/T/, ' ').replace(/Z/, ' UTC')
    s = s.replace(/([+-]\d\d):?(\d\d)/, ' $1$2') // -04:00 -> -0400
    s = s.replace(/([+-]\d\d)$/, ' $100') // +09 -> +0900
    return new Date(s)
  }

  function distance (date) {
    return (new Date().getTime() - date.getTime())
  }

  function inWords (distanceMillis, options) {
    var $l = options.locale
    var prefix = $l.prefixAgo
    var suffix = $l.suffixAgo

    var seconds = Math.abs(distanceMillis) / 1000
    var minutes = seconds / 60
    var hours = minutes / 60
    var days = hours / 24
    var years = days / 365

    function substitute (stringOrFunction, number) {
      var string = typeof stringOrFunction === 'string'
                    ? stringOrFunction
                    : stringOrFunction(number, distanceMillis)

      var value = ($l.numbers && $l.numbers[number]) || number
      return string.replace(/%d/i, value)
    }

    var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
      seconds < 90 && substitute($l.minute, 1) ||
      minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
      minutes < 90 && substitute($l.hour, 1) ||
      hours < 24 && substitute($l.hours, Math.round(hours)) ||
      hours < 42 && substitute($l.day, 1) ||
      days < 30 && substitute($l.days, Math.round(days)) ||
      days < 45 && substitute($l.month, 1) ||
      days < 365 && substitute($l.months, Math.round(days / 30)) ||
      years < 1.5 && substitute($l.year, 1) ||
      substitute($l.years, Math.round(years))

    var separator = $l.wordSeparator || ''
    if ($l.wordSeparator === undefined) { separator = ' ' }
    return [prefix, words, suffix].join(separator).trim()
  }

  // create a variable crono
  return function (selector, options) {
    options = options || defaultOptions
    var elements = document.querySelectorAll(selector)
    console.log(elements)
    for (var i = 0; i < elements.length; i++) {
      var date = elements[i].getAttribute('datetime')
      var iso8601Date = parse(date)
      elements[i].innerHTML = inWords(distance(iso8601Date), options)
    }
  }
}))
