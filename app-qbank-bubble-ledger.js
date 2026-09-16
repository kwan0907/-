(function () {
  'use strict';
  if (window.__SMARTBET_BUBBLE_LEDGER__) return;
  window.__SMARTBET_BUBBLE_LEDGER__ = '20260916-bl1';
  var observedPanel = null;
  var observer = null;
  var MAX = 180;
  var POOLS = ['WIN', 'PLA', 'QIN', 'QPL', 'FCT', 'TRI', 'FF'];

  function value(x) {
    if (x === null || x === undefined || x === '') return null;
    var n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  function raceKey() {
    if (typeof state === 'undefined' || !state || !state.meeting || !state.raceNo) return null;
    return 'sb-qspec-live-v2:' + [state.meeting.date || '?', state.meeting.venueCode || '?', state.raceNo].join(':');
  }
  function savedSnapshots() {
    var key = raceKey();
    if (!key) return [];
    try {
      var data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data.filter(function(s) {
        return s && value(s.t) !== null && value(s.mtp) !== null && s.rows && s.pools;
      }).sort(function(a, b) { return a.t - b.t; }).slice(-MAX) : [];
    } catch (_) { return []; }
  }
  function baseline(history, at, afterPost) {
    var best = null, distance = Infinity;
    for (var i = 0; i < history.length; i++) {
      var s = history[i];
      if (s.t >= at.t) break;
      if (afterPost ? (s.mtp < -.3 || s.mtp > .6) : (s.mtp < 2.2 || s.mtp > 3.8)) continue;
      var d = Math.abs(s.mtp - (afterPost ? 0 : 3));
      if (d < distance) { distance = d; best = s; }
    }
    return best;
  }
  // Mirrors the existing estimate of excess pool investment. No snapshots = no inferred bubbles.
  function inflow(current, base) {
    if (!base || current.t <= base.t) return null;
    var gains = {}, gross = 0, sum = 0;
    var keys = Object.keys(current.rows || {});
    keys.forEach(function(k) { gains[k] = 0; });
    POOLS.forEach(function(pool) {
      var a = current.pools[pool], b = base.pools && base.pools[pool];
      if (!a || !b || a.inv <= b.inv) return;
      var delta = a.inv - b.inv;
      if (delta < 1000) return;
      var eligible = keys.filter(function(k) {
        var x = current.rows[k], y = base.rows && base.rows[k];
        return x && y && value(x.shares && x.shares[pool]) !== null &&
          value(y.shares && y.shares[pool]) !== null && value(y.expected && y.expected[pool]) > 0;
      }).length;
      if (eligible < Math.max(6, Math.ceil(keys.length * .75))) return;
      gross += delta;
      keys.forEach(function(k) {
        var x = current.rows[k], y = base.rows[k];
        var v = x && value(x.shares && x.shares[pool]);
        var w = y && value(y.shares && y.shares[pool]);
        var e = y && value(y.expected && y.expected[pool]);
        if (v === null || w === null || e === null || e <= 0) return;
        gains[k] += a.inv * v - b.inv * w - delta * e;
      });
    });
    if (gross < 10000) return null;
    keys.forEach(function(k) { gains[k] = Math.max(0, gains[k]); sum += gains[k]; });
    if (sum <= 0) return null;
    var ratio = {};
    keys.forEach(function(k) { ratio[k] = gains[k] / sum * 100; });
    return ratio;
  }
  function relativeHigh(history, i, horse, current, t0) {
    var x = current.rows && current.rows[horse];
    if (!x || value(x.relative) === null) return false;
    var peak = t0.rows && t0.rows[horse] && value(t0.rows[horse].relative);
    if (peak === null) return false;
    for (var j = 0; j < i; j++) {
      var s = history[j];
      if (s.t < t0.t || s.mtp > 0) continue;
      var previous = s.rows && s.rows[horse];
      var rel = previous && value(previous.relative);
      if (rel !== null) peak = Math.max(peak, rel);
    }
    return x.relative > peak + .035;
  }
  function displayTime(m) {
    if (m > .35) return 'T-' + Math.round(m) + '分鐘';
    if (m >= -.35) return 'T0附近';
    return 'T+' + Math.round(-m * 60) + '秒';
  }
  function remembered(history, end) {
    var result = {};
    for (var i = 0; i <= end; i++) {
      var s = history[i];
      if (s.mtp > 3.8) continue;
      var post = s.mtp < 0;
      var base = baseline(history, s, post);
      var ratios = inflow(s, base);
      if (!ratios) continue;
      Object.keys(ratios).forEach(function(k) {
        var r = ratios[k];
        if (r < 10) return;
        if (post && !relativeHigh(history, i, k, s, base)) return;
        var previous = result[k];
        if (post || !previous || previous.kind !== 'red') {
          result[k] = {kind: post ? 'red' : 'white', percent: r, t: s.t, mtp: s.mtp};
        }
      });
    }
    return result;
  }
  function draw() {
    var p = observedPanel;
    if (!p || !p.isConnected || !p.querySelector('.qLiveBars')) return;
    var history = savedSnapshots();
    var input = p.querySelector('.qLiveTime input[type="range"]');
    if (!input || !history.length) return;
    var selected = Math.max(0, Math.min(history.length - 1, Number(input.value) || 0));
    var current = history[selected];
    var events = remembered(history, selected);
    p.querySelectorAll('.qLiveCol').forEach(function(col) {
      var no = col.querySelector('.qLiveNo');
      var bar = col.querySelector('.qLiveBar');
      if (!no || !bar) return;
      var horse = no.textContent.trim();
      var previous = col.querySelector('.qLiveBubble');
      if (previous) previous.remove();
      var e = events[horse];
      if (!e) return;
      var circle = document.createElement('div');
      circle.className = 'qLiveBubble qBubbleSaved' + (e.kind === 'red' ? ' red' : '') + (e.t < current.t ? ' held' : '');
      circle.style.bottom = (Math.round(bar.getBoundingClientRect().height) + 50) + 'px';
      circle.textContent = Math.round(e.percent) + '%';
      circle.title = (e.kind === 'red' ? 'T0後新增熱錢並破新高' : '最後3分鐘額外流入') +
        '：' + e.percent.toFixed(1) + '%｜最後達標 ' + displayTime(e.mtp) +
        (e.t < current.t ? '（保留記錄，非當刻流入）' : '');
      circle.setAttribute('aria-label', circle.title);
      col.appendChild(circle);
    });
    var legend = p.querySelector('.qLiveLegend');
    if (legend) {
      var labels = legend.querySelectorAll('span');
      if (labels[1]) labels[1].textContent = '○ 白波＝T-3後曾達標流入比例（保留記錄）';
      if (labels[2]) labels[2].textContent = '🔴 紅波＝T0後曾新增流入並破新高';
    }
    if (!Object.keys(events).length && current.mtp <= 3) {
      var note = p.querySelector('.qBubbleAvailability');
      if (!note) {
        note = document.createElement('div');
        note.className = 'qBubbleAvailability';
        var tabs = p.querySelector('.qSpecTabs');
        if (tabs) tabs.before(note);
      }
      var hadBaseline = history.some(function(s) { return s.t <= current.t && s.mtp >= 2.2 && s.mtp <= 3.8; });
      note.textContent = hadBaseline ? '暫未錄得符合門檻的白波／紅波；空白不代表沒有投注。' :
        '本機未有 T-3 實際快照，未能計出最後3分鐘比例波；不會補造記錄。';
    }
  }
  function attach() {
    var p = document.querySelector('#liveDashboard .qSpecHost .qSpec');
    if (!p || p === observedPanel) return;
    if (observer) observer.disconnect();
    observedPanel = p;
    observer = new MutationObserver(function(records) {
      if (records.some(function(r) { return r.type === 'childList'; })) draw();
    });
    observer.observe(p, {childList: true});
    draw();
  }
  var style = document.createElement('style');
  style.textContent = '.qSpec .qLiveBubble.qBubbleSaved.held{border-style:dashed;opacity:.95}' +
    '.qSpec .qBubbleAvailability{color:#666;font-size:11px;margin:8px 0;line-height:1.4}';
  document.head.appendChild(style);
  attach();
  setInterval(attach, 1200);
})();