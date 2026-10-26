// Download page text in English (the default), Bahasa Melayu and Simplified Chinese. Moon phase names
// match the game's own Notes. Elements opt in with data-i18n (text), data-i18n-html (trusted markup
// from this file only) and data-i18n-attr="attribute:key". The choice is remembered per browser.
(function () {
  const PHASES = {
    en: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'],
    ms: ['Anak Bulan', 'Bulan Sabit', 'Bulan Separa Pertama', 'Bulan Hampir Purnama', 'Bulan Purnama', 'Bulan Hampir Purnama', 'Bulan Separa Terakhir', 'Bulan Sabit'],
    zh: ['新月', '娥眉月', '上弦月', '凸月', '满月', '凸月', '下弦月', '残月'],
  };
  const FACTS = {
    en: ['Its sunlit side faces away from us.', 'A thin sliver of sunlight appears.', 'Half the disc is lit.', 'More than half lit, and growing.',
      'Earth sits between the Sun and the Moon.', 'The lit part starts to shrink.', 'Half lit again, the other half.', 'A last sliver before the new Moon.'],
    ms: ['Bahagian yang disinari matahari menghadap jauh daripada kita.', 'Secebis cahaya nipis mula kelihatan.', 'Separuh permukaan Bulan bercahaya.',
      'Lebih separuh bercahaya, dan makin besar.', 'Bumi berada di antara Matahari dan Bulan.', 'Bahagian bercahaya mula mengecil.',
      'Separuh bercahaya semula, separuh yang lain.', 'Cebisan terakhir sebelum anak bulan.'],
    zh: ['被太阳照亮的一面背对着我们。', '出现一弯细细的亮光。', '月面亮了一半。', '亮面超过一半，还在变大。',
      '地球位于太阳和月亮之间。', '亮面开始变小。', '又亮了一半，这次是另一半。', '新月前的最后一弯。'],
  };
  const T = {
    en: {
      skip: 'Skip to content', 'nav.game': 'The game', 'nav.download': 'Download', 'nav.reviews': 'Reviews', 'nav.install': 'Install help',
      play: 'Play online', sky: 'The Moon tonight', moon: 'The Moon, changing phase as you scroll', nova: 'Nova, the LunarCade astronaut, waving in front of the Moon',
      h1a: 'Explore the Moon.', h1b: 'Play Among the Stars.',
      lede: 'Moon phases for Year 5 Science, as a game. Watch it in 3D, prove it in two games, then draw it yourself.',
      'dl.windows': 'Download for Windows', 'dl.android': 'Download for Android', 'dl.apk': 'Download APK', 'dl.mac': 'Download for Mac',
      version: 'Version {v}', offline: 'Works offline', day: 'Day {n}', lit: '{p}% lit',
      'c1.h': 'Watch the Moon move.', 'c1.p': 'Nova explains each phase. Then pupils spin the Sun, Earth and Moon in 3D.',
      'cap.hub': 'The hub', 'cap.story': 'Nova tells the story', 'cap.sim': 'The 3D simulator',
      'c2.h': 'Prove it in a game.', 'c2.p': 'A jump-and-answer quiz, and a space race through the right Moon. Live leaderboard, no accounts.',
      'cap.quiz': 'Astro-Jump Quiz', 'cap.jump': 'Jump to answer', 'cap.racer': 'Galactic Racer', 'cap.steer': 'Steer through the right Moon', 'cap.board': 'Live leaderboard',
      'c3.h': 'Draw it to own it.', 'c3.p': 'Pupils paint each phase and check it against the real shape.',
      'cap.draw': 'Draw the Moon', 'cap.notes': 'Interactive Notes', 'cap.langs': 'Also in BM and 中文',
      'get.h': 'Get LunarCade Hub.', 'get.p': 'Plays offline once installed.',
      'spec.version': 'Version', 'spec.size': 'Size', 'spec.needs': 'Needs', 'spec.win': 'Windows 10 or 11',
      'mac.note': 'Not signed by Apple. First time: right-click the app, then Open.',
      'ios.p': 'No install. Open in Safari, then Share › Add to Home Screen.',
      'rv.h': 'What families and teachers say.', 'rv.empty': 'No reviews yet. Be the first.', 'rv.loadError': 'Reviews could not load. Try again later.',
      'rv.count1': 'from 1 review', 'rv.countN': 'from {n} reviews', 'rv.more': 'Show all {n} reviews', 'rv.fewer': 'Show fewer',
      'rv.formH': 'Leave a review', 'rv.note': 'Public. Use a nickname.', 'rv.name': 'Nickname', 'rv.iam': 'I am a', 'rv.rating': 'Rating',
      'rv.body': 'Your review', 'rv.placeholder': 'What did they enjoy or learn?', 'rv.submit': 'Post review', 'rv.posting': 'Posting…',
      'rv.ok': 'Thank you. Your review is up.', 'rv.stars': '{n} out of 5 stars', 'rv.love': 'Love this review',
      'role.parent': 'Parent', 'role.teacher': 'Teacher', 'role.pupil': 'Pupil', 'role.other': 'Other', 'role.chip.other': 'Player',
      'err.name': 'Please add a nickname.', 'err.role': 'Please choose who you are.', 'err.stars': 'Please choose a rating.',
      'err.short': 'Reviews need at least 10 characters.', 'err.length': 'Reviews need 10 to 300 characters.',
      'err.links': 'Links are not allowed in reviews.', 'err.words': 'Please keep it friendly. Pupils read these reviews too.',
      'err.limit': 'Thanks! You can post again tomorrow.', 'err.generic': 'Your review could not be posted. Please try again.',
      'err.network': 'Your review could not be posted. Check your connection and try again.',
      'in.h': 'Install in two steps.', 'in.p': 'Not from an app store, so your device asks once.',
      'in.win1': 'Open the <b>.exe</b>.', 'in.win2': 'See “Windows protected your PC”? Choose <b>More info</b>, then <b>Run anyway</b>.',
      'in.and1': 'Open the <b>.apk</b>.', 'in.and2': 'Allow installs when asked, then tap <b>Install</b>.',
      'in.ios1': 'Open the website in <b>Safari</b>.', 'in.ios2': 'Tap <b>Share</b>, then <b>Add to Home Screen</b>.',
      'safe.account': 'No account, just a nickname', 'safe.ads': 'No ads, nothing to buy', 'safe.updates': 'Updates keep your progress',
      'close.h': 'See you at the next new Moon.', tagline: 'Explore. Learn. Play.', by: 'Developed by Moon Phase Traveller',
      'a.prev': 'Previous screen', 'a.next': 'Next screen', 'a.close': 'Close', 'a.view': 'View larger: {s}', 'a.screen': 'Screen {n}: {s}',
      title: 'Download LunarCade Hub · Explore the Moon. Play Among the Stars.',
    },
    ms: {
      skip: 'Langkau ke kandungan', 'nav.game': 'Permainan', 'nav.download': 'Muat turun', 'nav.reviews': 'Ulasan', 'nav.install': 'Bantuan pasang',
      play: 'Main dalam talian', sky: 'Bulan malam ini', moon: 'Bulan, berubah fasa semasa anda menatal', nova: 'Nova, angkasawan LunarCade, melambai di depan Bulan',
      h1a: 'Terokai Bulan.', h1b: 'Bermain di Antara Bintang.',
      lede: 'Fasa Bulan untuk Sains Tahun 5, dalam bentuk permainan. Tonton dalam 3D, buktikan dalam dua permainan, kemudian lukis sendiri.',
      'dl.windows': 'Muat turun untuk Windows', 'dl.android': 'Muat turun untuk Android', 'dl.apk': 'Muat turun APK', 'dl.mac': 'Muat turun untuk Mac',
      version: 'Versi {v}', offline: 'Boleh main luar talian', day: 'Hari {n}', lit: '{p}% bercahaya',
      'c1.h': 'Lihat Bulan bergerak.', 'c1.p': 'Nova terangkan setiap fasa. Kemudian murid memutar Matahari, Bumi dan Bulan dalam 3D.',
      'cap.hub': 'Hab utama', 'cap.story': 'Nova bercerita', 'cap.sim': 'Simulator 3D',
      'c2.h': 'Buktikan dalam permainan.', 'c2.p': 'Kuiz lompat dan jawab, serta perlumbaan angkasa melalui Bulan yang betul. Papan pendahulu langsung, tanpa akaun.',
      'cap.quiz': 'Kuiz Astro-Jump', 'cap.jump': 'Lompat untuk menjawab', 'cap.racer': 'Galactic Racer', 'cap.steer': 'Pandu melalui Bulan yang betul', 'cap.board': 'Papan pendahulu langsung',
      'c3.h': 'Lukis supaya faham.', 'c3.p': 'Murid melukis setiap fasa dan menyemaknya dengan bentuk sebenar.',
      'cap.draw': 'Lukis Bulan', 'cap.notes': 'Nota Interaktif', 'cap.langs': 'Juga dalam BM dan 中文',
      'get.h': 'Dapatkan LunarCade Hub.', 'get.p': 'Boleh dimainkan tanpa internet selepas dipasang.',
      'spec.version': 'Versi', 'spec.size': 'Saiz', 'spec.needs': 'Perlu', 'spec.win': 'Windows 10 atau 11',
      'mac.note': 'Tidak ditandatangani oleh Apple. Kali pertama: klik kanan aplikasi, kemudian Open.',
      'ios.p': 'Tak perlu pasang. Buka dalam Safari, kemudian Kongsi › Tambah ke Skrin Utama.',
      'rv.h': 'Kata keluarga dan guru.', 'rv.empty': 'Belum ada ulasan. Jadilah yang pertama.', 'rv.loadError': 'Ulasan tidak dapat dimuatkan. Cuba lagi nanti.',
      'rv.count1': 'daripada 1 ulasan', 'rv.countN': 'daripada {n} ulasan', 'rv.more': 'Tunjuk semua {n} ulasan', 'rv.fewer': 'Tunjuk kurang',
      'rv.formH': 'Tulis ulasan', 'rv.note': 'Umum. Guna nama samaran.', 'rv.name': 'Nama samaran', 'rv.iam': 'Saya seorang', 'rv.rating': 'Penilaian',
      'rv.body': 'Ulasan anda', 'rv.placeholder': 'Apa yang mereka suka atau pelajari?', 'rv.submit': 'Hantar ulasan', 'rv.posting': 'Menghantar…',
      'rv.ok': 'Terima kasih. Ulasan anda sudah disiarkan.', 'rv.stars': '{n} daripada 5 bintang', 'rv.love': 'Suka ulasan ini',
      'role.parent': 'Ibu bapa', 'role.teacher': 'Guru', 'role.pupil': 'Murid', 'role.other': 'Lain-lain', 'role.chip.other': 'Pemain',
      'err.name': 'Sila masukkan nama samaran.', 'err.role': 'Sila pilih siapa anda.', 'err.stars': 'Sila pilih penilaian.',
      'err.short': 'Ulasan perlu sekurang-kurangnya 10 aksara.', 'err.length': 'Ulasan perlu 10 hingga 300 aksara.',
      'err.links': 'Pautan tidak dibenarkan dalam ulasan.', 'err.words': 'Sila gunakan bahasa yang sopan. Murid juga membaca ulasan ini.',
      'err.limit': 'Terima kasih! Anda boleh menghantar lagi esok.', 'err.generic': 'Ulasan tidak dapat dihantar. Sila cuba lagi.',
      'err.network': 'Ulasan tidak dapat dihantar. Semak sambungan anda dan cuba lagi.',
      'in.h': 'Pasang dalam dua langkah.', 'in.p': 'Bukan dari kedai aplikasi, jadi peranti anda akan bertanya sekali.',
      'in.win1': 'Buka fail <b>.exe</b>.', 'in.win2': 'Nampak “Windows protected your PC”? Pilih <b>More info</b>, kemudian <b>Run anyway</b>.',
      'in.and1': 'Buka fail <b>.apk</b>.', 'in.and2': 'Benarkan pemasangan apabila diminta, kemudian ketik <b>Pasang</b>.',
      'in.ios1': 'Buka laman web dalam <b>Safari</b>.', 'in.ios2': 'Ketik <b>Kongsi</b>, kemudian <b>Tambah ke Skrin Utama</b>.',
      'safe.account': 'Tiada akaun, hanya nama samaran', 'safe.ads': 'Tiada iklan, tiada pembelian', 'safe.updates': 'Kemas kini mengekalkan kemajuan',
      'close.h': 'Jumpa lagi pada anak bulan seterusnya.', tagline: 'Teroka. Belajar. Bermain.', by: 'Dibangunkan oleh Moon Phase Traveller',
      'a.prev': 'Skrin sebelumnya', 'a.next': 'Skrin seterusnya', 'a.close': 'Tutup', 'a.view': 'Lihat lebih besar: {s}', 'a.screen': 'Skrin {n}: {s}',
      title: 'Muat turun LunarCade Hub · Terokai Bulan. Bermain di Antara Bintang.',
    },
    zh: {
      skip: '跳到内容', 'nav.game': '游戏', 'nav.download': '下载', 'nav.reviews': '评价', 'nav.install': '安装帮助',
      play: '在线玩', sky: '今晚的月亮', moon: '月亮，随页面滚动变换月相', nova: 'LunarCade 的宇航员 Nova 在月亮前挥手',
      h1a: '探索月亮。', h1b: '在星空中游戏。',
      lede: '把五年级科学的月相课变成游戏。先看3D动画，再在两个游戏中挑战，最后亲手画出来。',
      'dl.windows': '下载 Windows 版', 'dl.android': '下载 Android 版', 'dl.apk': '下载 APK', 'dl.mac': '下载 Mac 版',
      version: '版本 {v}', offline: '可离线使用', day: '第 {n} 天', lit: '亮面 {p}%',
      'c1.h': '看月亮怎么动。', 'c1.p': 'Nova 讲解每个月相，学生再亲手转动3D的太阳、地球和月亮。',
      'cap.hub': '主页', 'cap.story': 'Nova 讲故事', 'cap.sim': '3D 模拟器',
      'c2.h': '在游戏中证明。', 'c2.p': '跳跃答题测验，再驾驶飞船穿过正确的月相。实时排行榜，无需注册。',
      'cap.quiz': '太空跳跃测验', 'cap.jump': '跳起来答题', 'cap.racer': '银河赛车', 'cap.steer': '驶过正确的月相', 'cap.board': '实时排行榜',
      'c3.h': '画出来，记得牢。', 'c3.p': '学生画出每个月相，再和真实形状对照。',
      'cap.draw': '画月亮', 'cap.notes': '互动笔记', 'cap.langs': '也有马来文和中文',
      'get.h': '下载 LunarCade Hub。', 'get.p': '安装后可离线游玩。',
      'spec.version': '版本', 'spec.size': '大小', 'spec.needs': '需要', 'spec.win': 'Windows 10 或 11',
      'mac.note': '未经 Apple 签名。首次打开：右键点击应用，再选“打开”。',
      'ios.p': '无需安装。用 Safari 打开，点“分享” › “添加到主屏幕”。',
      'rv.h': '家长和老师怎么说。', 'rv.empty': '还没有评价，来写第一条吧。', 'rv.loadError': '评价加载失败，请稍后再试。',
      'rv.count1': '共 1 条评价', 'rv.countN': '共 {n} 条评价', 'rv.more': '显示全部 {n} 条评价', 'rv.fewer': '收起',
      'rv.formH': '写评价', 'rv.note': '公开显示，请用昵称。', 'rv.name': '昵称', 'rv.iam': '我是', 'rv.rating': '评分',
      'rv.body': '你的评价', 'rv.placeholder': '他们喜欢什么？学到了什么？', 'rv.submit': '发布评价', 'rv.posting': '发布中…',
      'rv.ok': '谢谢！你的评价已发布。', 'rv.stars': '{n} 星（满分 5 星）', 'rv.love': '喜欢这条评价',
      'role.parent': '家长', 'role.teacher': '老师', 'role.pupil': '学生', 'role.other': '其他', 'role.chip.other': '玩家',
      'err.name': '请填写昵称。', 'err.role': '请选择你的身份。', 'err.stars': '请选择评分。',
      'err.short': '评价至少需要 10 个字。', 'err.length': '评价需要 10 到 300 个字。',
      'err.links': '评价中不能包含链接。', 'err.words': '请文明用语，学生也会看到这些评价。',
      'err.limit': '谢谢！明天可以再发布。', 'err.generic': '评价发布失败，请再试一次。',
      'err.network': '评价发布失败，请检查网络后再试。',
      'in.h': '两步完成安装。', 'in.p': '不是从应用商店下载，所以设备会询问一次。',
      'in.win1': '打开 <b>.exe</b> 文件。', 'in.win2': '看到“Windows 已保护你的电脑”？选择<b>更多信息</b>，再点<b>仍要运行</b>。',
      'in.and1': '打开 <b>.apk</b> 文件。', 'in.and2': '按提示允许安装，再点<b>安装</b>。',
      'in.ios1': '用 <b>Safari</b> 打开网站。', 'in.ios2': '点<b>分享</b>，再点<b>添加到主屏幕</b>。',
      'safe.account': '无需账号，只用昵称', 'safe.ads': '没有广告，无需付费', 'safe.updates': '更新不会丢失进度',
      'close.h': '下一个新月再见！', tagline: '探索 · 学习 · 游戏', by: '由 Moon Phase Traveller 开发',
      'a.prev': '上一张', 'a.next': '下一张', 'a.close': '关闭', 'a.view': '查看大图：{s}', 'a.screen': '第 {n} 张：{s}',
      title: '下载 LunarCade Hub · 探索月亮，在星空中游戏',
    },
  };
  const HTML_LANG = { en: 'en', ms: 'ms', zh: 'zh-Hans' };
  const LOCALE = { en: 'en-MY', ms: 'ms-MY', zh: 'zh-CN' };
  let lang = 'en';
  try {
    const saved = localStorage.getItem('lc-lang');
    if (saved && T[saved]) lang = saved;
  } catch (e) {}

  const t = (key, vars) => {
    let s = (T[lang] && T[lang][key]) ?? T.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split('{' + k + '}').join(v);
    return s;
  };
  function apply(root = document) {
    document.documentElement.lang = HTML_LANG[lang];
    document.title = t('title');
    for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
    for (const el of root.querySelectorAll('[data-i18n-attr]')) {
      const [attr, key] = el.dataset.i18nAttr.split(':');
      el.setAttribute(attr, t(key));
    }
    for (const b of root.querySelectorAll('.lang [data-lang]')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  }
  function set(next) {
    if (!T[next] || next === lang) return;
    lang = next;
    try { localStorage.setItem('lc-lang', lang); } catch (e) {}
    apply();
    document.dispatchEvent(new CustomEvent('lc:lang', { detail: lang }));
  }
  window.LC_I18N = {
    t, apply, set,
    get lang() { return lang; },
    get locale() { return LOCALE[lang]; },
    phase: (i) => PHASES[lang][i],
    fact: (i) => FACTS[lang][i],
  };
})();
