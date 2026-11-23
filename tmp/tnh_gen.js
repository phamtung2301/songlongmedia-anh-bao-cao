// GĐ3 Tai nghe: sinh bài cuối trang cho các trang hãng (con id 7). 24/11/2026
// Chạy trong tab songlongmedia.com, cần window._CR (SP theo hãng + tình trạng), window._TY (loại SP), window._INTRO
window._GEN = (function () {
  const BAD = ['cực kỳ', 'hoàn hảo', 'đỉnh cao', 'tốt nhất', 'tuyệt vời', 'nâng tầm', 'không chỉ', 'đáng kinh ngạc', 'chất âm'];
  const BRANDLINK = { '490': '/brand/noble-audio', '702': '/brand/moondrop', '462': '/brand/hifiman' };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ACC = /(lẻ 1 bên|tai lẻ|dock sạc|eartip|ear tip|đệm tai|earpad|\bcáp\b|dây cáp|hộp sạc|case |bao da|túi đựng)/i;
  function parse(it, brand) {
    let n = it.n.replace(/^Tai [Nn]ghe\s+/, '').trim();
    const i = n.indexOf('(');
    let model = (i > 0 ? n.slice(0, i) : n).trim();
    const nb = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
    { let k = 0, j = 0; const ml = model.toLowerCase();
      while (j < ml.length && k < nb.length) { if (/[a-z0-9]/.test(ml[j])) { if (ml[j] !== nb[k]) break; k++; } j++; }
      if (k === nb.length && nb.length > 2 && (j >= ml.length || !/[a-z0-9]/.test(ml[j]))) model = brand + model.slice(j); }
    let spec = i > 0 ? n.slice(i + 1).replace(/\)\s*$/, '') : '';
    const segs = spec.split('|').map(s => s.trim()).filter(Boolean);
    const cond = segs.find(s => /like\s*new|nobox|un-?seal|refurbished|99%/i.test(s)) || (/like\s*new|nobox/i.test(n) ? 'Like New' : '');
    const keep = segs.filter(s => !/like\s*new|nobox|un-?seal|refurbished|99%|phân phối|chính hãng|bản quốc tế|mã vn/i.test(s)).slice(0, 3);
    return { u: it.u, model, keep, cond, img: it.img, full: n };
  }
  function kind(it, ty) {
    const t = ty[it.u] || [];
    const bt = /bluetooth|true wireless|wireless|không dây|2\.4ghz|dongle usb/i.test(it.n) || t.includes('tws') || t.includes('bt');
    if (ACC.test(it.n)) return 'acc';
    if (t.includes('game') || /gaming/i.test(it.n)) return 'game';
    if (t.includes('tws')) return 'tws';
    if (t.includes('open') || t.includes('neck') || /open-ear|truyền xương|neckband|vòng cổ/i.test(it.n)) return 'open';
    if ((t.includes('full') || t.includes('onear') || t.includes('studio')) && bt) return 'btover';
    if (t.includes('full') || t.includes('onear') || t.includes('studio')) return 'wover';
    if (t.includes('earbud')) return bt ? 'tws' : 'earbud';
    if (t.includes('inear')) return bt ? 'tws' : 'iem';
    return bt ? 'btother' : 'wother';
  }
  const LAB = {
    tws: 'Tai nghe true wireless', btover: 'Tai nghe chụp tai Bluetooth', open: 'Tai nghe open-ear, vòng cổ',
    game: 'Tai nghe gaming', iem: 'Tai nghe in-ear có dây', earbud: 'Tai nghe earbud có dây', wover: 'Tai nghe chụp tai có dây',
    btother: 'Tai nghe Bluetooth khác', wother: 'Tai nghe có dây khác', acc: 'Tai lẻ, phụ kiện thay thế'
  };
  const ORD = ['btover', 'tws', 'open', 'game', 'iem', 'earbud', 'wover', 'btother', 'wother', 'acc'];
  const ALTK = { tws: 'Tai nghe true wireless', btover: 'Tai nghe chụp tai Bluetooth', open: 'Tai nghe open-ear', game: 'Tai nghe gaming', iem: 'Tai nghe in-ear có dây', earbud: 'Tai nghe earbud', wover: 'Tai nghe chụp tai', btother: 'Tai nghe Bluetooth', wother: 'Tai nghe' };
  function link(p) {
    let s = '<a href="' + esc(p.u) + '">' + esc(p.model) + '</a>';
    const ex = [];
    if (p.keep.length) ex.push(p.keep.join(', '));
    if (p.cond) ex.push(p.cond.toLowerCase());
    if (p.pre) ex.push('đặt trước');
    if (ex.length) s += ' (' + esc(ex.join('; ')) + ')';
    return s;
  }
  const SH = { tws: 'true wireless', btover: 'chụp tai Bluetooth', open: 'open-ear, vòng cổ', game: 'gaming', iem: 'in-ear có dây', earbud: 'earbud có dây', wover: 'chụp tai có dây', btother: 'Bluetooth khác', wother: 'có dây khác' };
  const bare = p => '<a href="' + esc(p.u) + '">' + esc(p.model) + '</a>';
  const ipw = p => { const m = p.full.match(/\bIP(X|[0-6])([0-8])\b/i); return m ? { r: m[0].toUpperCase(), w: +m[2] } : null; };
  function build(b, ty, intro) {
    const AD = (window._ADR || {});
    const idOf = it => ((it.img.match(/\/250_(\d+)[_-]/) || it.img.match(/\/(\d+)[_-]/) || [])[1]);
    const S = b.items.filter(it => {
      if (!/InStock|PreOrder/i.test(window._CR.prod[it.u] || '')) return false;
      if ((window._EXU || []).includes(it.u)) return false;
      const a = AD[idOf(it)]; if (!a) return false;
      return a.q > 0 && a.show && a.age <= (window._MAXAGE || 540);
    });
    if (!S.length) return null;
    const name = b.name.replace(/\s*\(.*\)$/, '');
    const G = {};
    for (const it of S) {
      const p = parse(it, name); p.pre = /PreOrder/i.test(window._CR.prod[it.u]); p.t = ty[it.u] || [];
      const k = kind(it, ty); (G[k] = G[k] || []).push(p);
    }
    const main = S.length - (G.acc ? G.acc.length : 0);
    let h = '';
    h += '<h2>Tai nghe ' + esc(name) + ' tại Song Long Media có những mẫu nào?</h2>\n<p>';
    if (intro) h += esc(intro) + ' ';
    h += 'Hiện Song Long Media có ' + main + ' mẫu tai nghe ' + esc(name) + ' đang bán' + (G.acc ? ', kèm tai lẻ và phụ kiện thay thế' : '') + '; danh sách dưới đây chia theo kiểu đeo để dễ chọn.';
    if (BRANDLINK[b.id]) h += ' Lịch sử và các dòng sản phẩm khác của hãng xem tại <a href="' + BRANDLINK[b.id] + '">trang thương hiệu ' + esc(name) + '</a>.';
    h += '</p>\n';
    const imgs = []; const used = new Set();
    const groups = ORD.filter(k => G[k]);
    for (const k of groups) {
      const arr = G[k];
      if (groups.length > 1 || arr.length > 3) h += '<h3>' + LAB[k] + ' ' + esc(name) + '</h3>\n';
      if (arr.length <= 3) h += '<p>' + arr.map(link).join('; ') + '.</p>\n';
      else h += '<ul>\n' + arr.slice(0, 14).map(p => '<li>' + link(p) + '</li>').join('\n') + (arr.length > 14 ? '\n<li>Và ' + (arr.length - 14) + ' mẫu khác trong danh sách sản phẩm phía trên.</li>' : '') + '\n</ul>\n';
      if (k !== 'acc' && imgs.length < 3) {
        const p = arr.find(x => x.img && !x.cond && !used.has(x.img)) || arr.find(x => x.img && !used.has(x.img));
        if (p) { used.add(p.img); imgs.push(p);
          const f = p.img.replace(/^\/media\/product\/250_/, '');
          const alt = (ALTK[k] || 'Tai nghe') + ' ' + (p.model.toLowerCase().includes(name.toLowerCase()) ? p.model : name + ' ' + p.model);
          h += '<p><a href="' + esc(p.u) + '"><img src="https://songlongmedia.com/media/product/' + esc(f) + '" alt="' + esc(alt.replace(/\s+/g, ' ').trim()) + '" width="600" /></a><br /><em>' + esc(p.model + (p.keep.length ? ': ' + p.keep.join(', ') : '')) + '</em></p>\n';
        }
      }
    }
    // chọn nhanh
    const all = groups.filter(k => k !== 'acc').flatMap(k => G[k]);
    const pick = (f, n) => all.filter(f).filter(p => !p.cond).slice(0, n);
    const Q = [];
    const anc = pick(p => p.t.includes('anc') || /chống ồn|\bANC\b/i.test(p.full), 4);
    const studio = pick(p => (p.t.includes('studio') || /kiểm âm|monitor/i.test(p.full)) && !/bluetooth/i.test(p.full), 4);
    const water = pick(p => { const x = ipw(p); return x && x.w >= 5; }, 4);
    const openp = pick(p => p.t.includes('open') || p.t.includes('neck') || /open-ear|truyền xương/i.test(p.full), 4);
    const game = G.game ? G.game.filter(p => !p.cond).slice(0, 3) : [];
    if (anc.length) Q.push('<li><strong>Cần chống ồn khi đi lại, làm việc:</strong> ' + anc.map(bare).join(', ') + '.</li>');
    if (water.length) Q.push('<li><strong>Hay ra mồ hôi, đi mưa (chống nước từ IPX5/IP55):</strong> ' + water.map(p => bare(p) + ' (' + ipw(p).r + ')').join(', ') + '.</li>');
    if (openp.length) Q.push('<li><strong>Muốn nghe được tiếng xung quanh khi chạy bộ, đạp xe:</strong> ' + openp.map(bare).join(', ') + '.</li>');
    if (studio.length) Q.push('<li><strong>Kiểm âm, thu âm:</strong> ' + studio.map(bare).join(', ') + '.</li>');
    if (game.length) Q.push('<li><strong>Chơi game:</strong> ' + game.map(bare).join(', ') + '.</li>');
    if (G.iem && G.iem.length) Q.push('<li><strong>Nghe nhạc bằng tai nghe có dây:</strong> điện thoại không có jack 3.5mm cần thêm <a href="/dongle-dac-amp.html">dongle DAC</a> cổng USB-C hoặc Lightning.</li>');
    if (Q.length >= 2) h += '<h2>Chọn nhanh tai nghe ' + esc(name) + ' theo nhu cầu</h2>\n<ul>\n' + Q.join('\n') + '\n</ul>\n';
    // FAQ
    const F = [];
    const cnt = groups.filter(k => k !== 'acc').map(k => G[k].length + ' ' + SH[k]);
    F.push(['Tai nghe ' + name + ' tại Song Long Media có những loại nào?', 'Hiện có ' + main + ' mẫu đang bán: ' + cnt.join(', ') + '. Danh sách cập nhật theo hàng thực tế ở phần sản phẩm phía trên.']);
    if (anc.length) F.push(['Tai nghe ' + name + ' nào có chống ồn?', 'Các mẫu có chống ồn chủ động (ANC) đang bán gồm ' + anc.map(p => p.model).join(', ') + '.']);
    if (all.some(p => p.cond)) F.push(['Hàng like new, nobox khác gì hàng mới?', 'Tình trạng máy (like new, nobox) ghi rõ trên tên sản phẩm; giá thấp hơn hàng mới. Thời gian bảo hành của từng sản phẩm ghi ở trang sản phẩm.']);
    F.push(['Mua tai nghe ' + name + ' ở đâu tại Hà Nội, có được nghe thử không?', 'Song Long Media ở 93 Trung Liệt, Đống Đa, Hà Nội; bạn có thể đến nghe thử các mẫu đang có hàng trước khi mua. Bảo hành theo từng sản phẩm, ghi ở trang sản phẩm; hotline 094.1144.666.']);
    h += '<h2>Câu hỏi thường gặp</h2>\n' + F.map(([q, a]) => '<h3>' + esc(q) + '</h3>\n<p>' + esc(a) + '</p>').join('\n') + '\n';
    const j = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: F.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
    h += '<script type="application/ld+json">' + JSON.stringify(j) + '</script>\n';
    const low = h.toLowerCase();
    const bad = BAD.filter(w => low.includes(w));
    const words = h.replace(/<script[\s\S]*?<\/script>|<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return { id: b.id, name, url: b.url, html: h, n: S.length, main, imgs: imgs.length, faq: F.length, bad, words, groups: groups.map(k => k + ':' + G[k].length).join(' ') };
  }
  return { build, parse, kind };
})();
