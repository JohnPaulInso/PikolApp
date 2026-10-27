// (2026-07-13) Player profile controller for bookings, orders, DUPR & posts
(function() {
  const profileBookings = [
    {
      id: 'BK-8902',
      venue: 'Kapenarra Courtside',
      court: 'Court 1 (Indoor Regulation)',
      venueId: 'kapenarra',
      courtNum: 1,
      date: 'Today, Oct 27',
      time: '4:00 PM – 5:00 PM',
      amount: '₱350.00',
      status: 'Upcoming · Paid',
      isUpcoming: true,
      ref: 'TXN-8902-GCASH'
    },
    {
      id: 'BK-8419',
      venue: 'Aminova Cafe & Recreation',
      court: 'Court 2 (Covered Court)',
      venueId: 'aminova',
      courtNum: 2,
      date: 'Oct 22, 2026',
      time: '5:00 PM – 7:00 PM (2 hrs)',
      amount: '₱600.00',
      status: 'Completed',
      isUpcoming: false,
      ref: 'TXN-8419-MAYA'
    },
    {
      id: 'BK-7992',
      venue: 'La Guerta Sports Hub',
      court: 'Court 1 (Pro Surface)',
      venueId: 'laguerta',
      courtNum: 1,
      date: 'Oct 15, 2026',
      time: '6:00 PM – 7:00 PM',
      amount: '₱280.00',
      status: 'Completed',
      isUpcoming: false,
      ref: 'TXN-7992-GCASH'
    }
  ];

  const profileOrders = [
    {
      id: 'ORD-9821-SLK',
      title: 'Selkirk Vanguard Control Carbon Paddle',
      store: 'Kapenarra Pro Shop · Bogo',
      date: 'Oct 24, 2026',
      status: 'Delivered',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      amount: '₱9,800.00',
      specs: 'Grip 4 1/4" · 8.0 oz · QuadCarbon FlexFace',
      icon: 'package-check'
    },
    {
      id: 'ORD-9844-JER',
      title: 'PIKOL Pro Tournament Jersey (Forest/Lime)',
      store: 'PIKOL Official Apparel Hub',
      date: 'Oct 26, 2026',
      status: 'Ready for Pickup',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
      amount: '₱1,250.00',
      specs: 'Size L · Customized: ALEX #7 · Kapenarra Desk',
      icon: 'shirt'
    },
    {
      id: 'ORD-9750-BAL',
      title: 'Franklin X-40 Pickleball Balls (6-Pack)',
      store: 'La Guerta Sports Hub Shop',
      date: 'Oct 18, 2026',
      status: 'Completed',
      statusColor: 'text-slate-700 bg-slate-100 border-slate-200',
      amount: '₱850.00',
      specs: 'Optic Yellow · USAPA Approved Tournament Balls',
      icon: 'circle-dot'
    },
    {
      id: 'ORD-9610-CAFE',
      title: 'Post-Match Whey Protein & Cold Brew',
      store: 'Kapenarra Courtside Cafe',
      date: 'Oct 27, 2026',
      status: 'Completed',
      statusColor: 'text-slate-700 bg-slate-100 border-slate-200',
      amount: '₱220.00',
      specs: 'Whey Isolate Shake + Bogo Cold Brew Espresso',
      icon: 'coffee'
    }
  ];

  const profileOpenPlays = [
    {
      id: 'op-1',
      title: 'Bogo Friday Night Dinks & Rally (3.5+)',
      role: 'HOSTING',
      roleBadge: 'bg-emerald-700 text-white',
      venue: 'Kapenarra Courtside · Court 3 & 4',
      date: 'Friday, Nov 1 · 6:00 PM – 9:00 PM',
      confirmedCount: 6,
      maxPlayers: 8,
      status: 'Active · 2 spots open',
      rate: '₱150 / player'
    },
    {
      id: 'op-2',
      title: 'Aminova Sunday Morning Scramble (All Levels)',
      role: 'REGISTERED',
      roleBadge: 'bg-slate-800 text-white',
      venue: 'Aminova Cafe & Recreation',
      date: 'Sunday, Nov 3 · 7:00 AM – 9:00 AM',
      confirmedCount: 8,
      maxPlayers: 8,
      status: 'Confirmed · Full Session',
      rate: '₱120 / player'
    }
  ];

  const profilePosts = [
    {
      id: 'post-1',
      author: 'Alex Rivera',
      avatar: 'AR',
      timeAgo: '2 hours ago',
      content: 'Epic 3-set battle at Kapenarra tonight! Court 2 surface is playing fast and crisp after the repaint. Huge thanks to Mark & Dave for the rallies! 🏓🔥',
      likes: 14,
      comments: 5,
      venueTag: 'Kapenarra Courtside'
    },
    {
      id: 'post-2',
      author: 'Alex Rivera',
      avatar: 'AR',
      timeAgo: 'Yesterday',
      content: 'Looking for 1 more intermediate-plus player for Friday doubles (6:00 PM at Kapenarra). Message here or join my posted open play! Spots filling up.',
      likes: 8,
      comments: 6,
      venueTag: 'Kapenarra Courtside'
    },
    {
      id: 'post-3',
      author: 'Alex Rivera',
      avatar: 'AR',
      timeAgo: '3 days ago',
      content: 'Hit 3.85 DUPR doubles rating after the Bogo weekend round robin! Loving the consistency on third shot drops. Ready for next week’s club tourney. 🏆',
      likes: 22,
      comments: 9,
      venueTag: 'PIKOL Tournaments'
    }
  ];

  const profileDuprMatches = [
    {
      id: 'm-1',
      type: 'Men’s Doubles',
      result: 'WIN',
      score: '11-8, 11-9',
      partner: 'Leo Torres (3.78)',
      opponents: 'Mark S. (3.65) & Kevin T. (3.70)',
      venue: 'Kapenarra Courtside · Court 1',
      date: 'Oct 25, 2026',
      impact: '+0.04 DUPR',
      isWin: true
    },
    {
      id: 'm-2',
      type: 'Mixed Doubles',
      result: 'WIN',
      score: '11-7, 8-11, 11-6',
      partner: 'Sarah Lim (3.80)',
      opponents: 'Dave M. (3.82) & Paolo V. (3.75)',
      venue: 'Aminova Recreation',
      date: 'Oct 21, 2026',
      impact: '+0.06 DUPR',
      isWin: true
    },
    {
      id: 'm-3',
      type: 'Men’s Singles',
      result: 'LOSS',
      score: '9-11, 8-11',
      partner: 'Singles Match',
      opponents: 'Paolo Vega (3.92)',
      venue: 'La Guerta Sports Hub',
      date: 'Oct 14, 2026',
      impact: '-0.02 DUPR',
      isWin: false
    },
    {
      id: 'm-4',
      type: 'Men’s Doubles',
      result: 'WIN',
      score: '11-4, 11-5',
      partner: 'Leo Torres (3.78)',
      opponents: 'Bryan C. (3.40) & Ron P. (3.45)',
      venue: 'Tambayanan Court',
      date: 'Oct 08, 2026',
      impact: '+0.03 DUPR',
      isWin: true
    },
    {
      id: 'm-5',
      type: 'Men’s Doubles',
      result: 'WIN',
      score: '11-9, 12-10',
      partner: 'Sarah Lim (3.80)',
      opponents: 'Chris D. (3.88) & Eric S. (3.75)',
      venue: 'Kapenarra Courtside',
      date: 'Oct 02, 2026',
      impact: '+0.07 DUPR',
      isWin: true
    }
  ];

  window.setProfileSubTab = function(tabName) {
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const targetBtn = document.getElementById('profileTabBtn-' + tabName);
    if (targetBtn) targetBtn.classList.add('active');

    document.querySelectorAll('.profile-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const targetPane = document.getElementById('profilePane-' + tabName);
    if (targetPane) targetPane.classList.add('active');
    if (window.icons) window.icons();
  };

  window.syncDuprProfile = function() {
    const btn = document.getElementById('duprSyncBtn');
    if (btn) {
      btn.classList.add('syncing');
      btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> <span>Syncing...</span>`;
      if (window.icons) window.icons();
      setTimeout(() => {
        btn.classList.remove('syncing');
        btn.innerHTML = `<i data-lucide="check" class="text-emerald-400"></i> <span>Synced!</span>`;
        if (window.icons) window.icons();
        if (typeof notify === 'function') notify('DUPR ratings successfully synced with global registry');
        setTimeout(() => {
          btn.innerHTML = `<i data-lucide="refresh-cw"></i> <span>Sync DUPR</span>`;
          if (window.icons) window.icons();
        }, 2200);
      }, 900);
    }
  };

  window.renderProfileData = function() {
    // Render bookings
    const bookingsEl = document.getElementById('profileBookingsList');
    if (bookingsEl) {
      bookingsEl.innerHTML = profileBookings.map(b => `
        <div class="profile-card profile-booking-item ${b.isUpcoming ? 'is-upcoming-card' : ''}">
          <div class="profile-booking-head">
            <div class="flex items-center gap-2">
              <span class="profile-booking-badge ${b.isUpcoming ? 'badge-upcoming' : 'badge-completed'}">${b.status}</span>
              <span class="profile-booking-ref font-mono text-[10px] text-slate-400">${b.ref}</span>
            </div>
            <b class="profile-booking-price">${b.amount}</b>
          </div>
          <b class="profile-booking-title">${b.venue}</b>
          <p class="profile-booking-sub">${b.court}</p>
          <div class="profile-booking-time-row">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-700"></i>
            <span>${b.date} · ${b.time}</span>
          </div>
          <div class="profile-booking-actions">
            ${b.isUpcoming ? `
              <button type="button" class="profile-btn-primary" onclick="openBookingCheckinQr()">
                <i data-lucide="qr-code"></i> Show QR Receipt
              </button>
              <button type="button" class="profile-btn-secondary" onclick="openVenueDirections('${b.venueId}')">
                <i data-lucide="navigation"></i> Directions
              </button>
            ` : `
              <button type="button" class="profile-btn-secondary" onclick="focusVenueCourt('${b.venueId}', ${b.courtNum})">
                <i data-lucide="repeat"></i> Book Again
              </button>
            `}
          </div>
        </div>
      `).join('');
    }

    // Render orders
    const ordersEl = document.getElementById('profileOrdersList');
    if (ordersEl) {
      ordersEl.innerHTML = profileOrders.map(o => `
        <div class="profile-card profile-order-item">
          <div class="profile-order-top">
            <div class="flex items-center gap-2.5">
              <div class="profile-order-icon-box">
                <i data-lucide="${o.icon}"></i>
              </div>
              <div>
                <b class="profile-order-title">${o.title}</b>
                <span class="profile-order-store">${o.store} · ${o.date}</span>
              </div>
            </div>
            <b class="profile-order-price">${o.amount}</b>
          </div>
          <div class="profile-order-footer">
            <span class="profile-order-specs">${o.specs}</span>
            <span class="profile-order-status-pill ${o.statusColor}">${o.status}</span>
          </div>
        </div>
      `).join('');
    }

    // Render open plays
    const openPlaysEl = document.getElementById('profileOpenPlaysList');
    if (openPlaysEl) {
      openPlaysEl.innerHTML = profileOpenPlays.map(op => `
        <div class="profile-card profile-openplay-item">
          <div class="flex items-center justify-between mb-2">
            <span class="profile-role-pill ${op.roleBadge}">${op.role}</span>
            <span class="text-xs font-black text-emerald-800">${op.rate}</span>
          </div>
          <b class="profile-openplay-name">${op.title}</b>
          <p class="profile-openplay-venue"><i data-lucide="map-pin"></i> ${op.venue}</p>
          <div class="profile-openplay-time"><i data-lucide="calendar"></i> ${op.date}</div>
          <div class="profile-openplay-bottom">
            <span class="profile-player-spots"><i data-lucide="users"></i> ${op.confirmedCount}/${op.maxPlayers} players</span>
            <button type="button" class="profile-btn-sm" onclick="setTab('feed')">View Session</button>
          </div>
        </div>
      `).join('');
    }

    // Render posts
    const postsEl = document.getElementById('profilePostsList');
    if (postsEl) {
      postsEl.innerHTML = profilePosts.map(p => `
        <div class="profile-card profile-post-item">
          <div class="profile-post-head">
            <div class="flex items-center gap-2">
              <div class="profile-post-mini-avatar">${p.avatar}</div>
              <div>
                <b class="profile-post-author">${p.author}</b>
                <span class="profile-post-time">${p.timeAgo} · ${p.venueTag}</span>
              </div>
            </div>
          </div>
          <p class="profile-post-content">${p.content}</p>
          <div class="profile-post-reactions">
            <span><i data-lucide="heart" class="w-3.5 h-3.5 text-rose-500 fill-rose-500"></i> ${p.likes} likes</span>
            <span><i data-lucide="message-circle" class="w-3.5 h-3.5"></i> ${p.comments} replies</span>
          </div>
        </div>
      `).join('');
    }

    // Render DUPR matches
    const duprEl = document.getElementById('profileDuprMatchesList');
    if (duprEl) {
      duprEl.innerHTML = profileDuprMatches.map(m => `
        <div class="profile-card profile-match-item">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="match-res-badge ${m.isWin ? 'res-win' : 'res-loss'}">${m.result}</span>
              <b class="text-xs font-extrabold text-slate-800">${m.score}</b>
            </div>
            <span class="match-impact-tag font-mono ${m.isWin ? 'text-emerald-700' : 'text-rose-600'}">${m.impact}</span>
          </div>
          <div class="text-[11.5px] text-slate-600">
            <span>With: <b>${m.partner}</b></span>
            <span class="mx-1">vs</span>
            <span><b>${m.opponents}</b></span>
          </div>
          <div class="match-meta-footer">
            <span><i data-lucide="map-pin"></i> ${m.venue}</span>
            <span>${m.date}</span>
          </div>
        </div>
      `).join('');
    }

    if (window.icons) window.icons();
  };

  // Run on dom ready and tab switches
  document.addEventListener('DOMContentLoaded', () => {
    renderProfileData();
  });
})();
