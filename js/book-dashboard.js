// (2026-07-13) Book tab dashboard state, filters & modals; was static listing
/* PIKOL Courtside Pickleball - Book Tab Dashboard Engine */

(function initBookDashboardScope() {
  const defaultFavorites = ['kapenarra', 'servicebox'];
  let favoriteVenues = new Set((() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pikol_favorites'));
      return Array.isArray(saved) ? saved : defaultFavorites;
    } catch (_) {
      return defaultFavorites;
    }
  })());

  let activeRadius = 40;
  let activeLocationName = 'Bogo City';
  let isLocationEnabled = true;
  let isDetectingGps = false;
  let activeQuickFilter = 'all';
  let venueSortMode = 'nearest';
  let venueDisplayMode = 'list';
  let priceFilterMax = 500;
  let filterCourtType = 'all';
  let filterOpenNowOnly = false;
  let selectedAmenities = new Set();
  let tipDismissed = (() => {
    try {
      return localStorage.getItem('pikol_tourney_tip_dismissed') === '1';
    } catch (_) {
      return false;
    }
  })();

  const userStatsData = {
    gamesThisMonth: 14,
    hoursBooked: 22,
    totalSpent: 4200,
    currentStreak: 4
  };

  const loyaltyPointsBalance = 320;

  let upcomingBooking = {
    id: 'BK-8902',
    venueId: 'kapenarra',
    venueName: 'Kapenarra Courtside',
    courtName: 'Court 1',
    dateLabel: 'Today, Oct 27',
    timeLabel: '4:00 PM – 5:00 PM',
    startsIn: 'Starts in 2h 15m',
    amount: 350,
    status: 'CONFIRMED'
  };

  const bookingHistoryRecords = [
    {
      id: 'BK-8740',
      venueId: 'kapenarra',
      venueName: 'Kapenarra Courtside',
      courtName: 'Court 1',
      date: 'Oct 22, 2026',
      time: '5:00 PM – 7:00 PM',
      price: '₱700',
      status: 'Completed',
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'BK-8512',
      venueId: 'servicebox',
      venueName: 'Service Box Courts',
      courtName: 'Court 2',
      date: 'Oct 18, 2026',
      time: '4:00 PM – 6:00 PM',
      price: '₱640',
      status: 'Completed',
      statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'BK-8301',
      venueId: 'aminova',
      venueName: 'Aminova Cafe & Recreation',
      courtName: 'Court 1',
      date: 'Oct 12, 2026',
      time: '6:00 PM – 8:00 PM',
      price: '₱600',
      status: 'Cancelled',
      statusClass: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];

  const venueDistancesAndRatings = {
    kapenarra: { distKm: 1.8, rating: 4.9, reviews: 48, openNow: true, nextAvailable: '4:00 PM', priceVal: 350, indoor: false, cafe: true, lighted: true, lounge: true, parking: true, showers: true },
    servicebox: { distKm: 2.4, rating: 4.8, reviews: 36, openNow: true, nextAvailable: '5:00 PM', priceVal: 320, indoor: false, cafe: true, lighted: true, lounge: false, parking: true, showers: false },
    aminova: { distKm: 3.1, rating: 4.7, reviews: 29, openNow: true, nextAvailable: '6:00 PM', priceVal: 300, indoor: true, cafe: true, lighted: true, lounge: false, parking: true, showers: true },
    laguerta: { distKm: 4.2, rating: 4.6, reviews: 24, openNow: true, nextAvailable: '5:00 PM', priceVal: 280, indoor: false, cafe: false, lighted: true, lounge: false, parking: true, showers: false },
    tambayanan: { distKm: 4.8, rating: 4.7, reviews: 31, openNow: false, nextAvailable: '6:00 PM', priceVal: 300, indoor: false, cafe: true, lighted: true, lounge: true, parking: true, showers: false },
    lima: { distKm: 5.5, rating: 4.5, reviews: 19, openNow: true, nextAvailable: '6:00 PM', priceVal: 260, indoor: true, cafe: false, lighted: true, lounge: false, parking: true, showers: false }
  };

  const todayAvailabilityHours = [
    { hour: '3:00 PM', courtsLeft: 3, urgent: false, offPeak: true },
    { hour: '4:00 PM', courtsLeft: 1, urgent: true, offPeak: false },
    { hour: '5:00 PM', courtsLeft: 2, urgent: false, offPeak: false },
    { hour: '6:00 PM', courtsLeft: 4, urgent: false, offPeak: false },
    { hour: '7:00 PM', courtsLeft: 2, urgent: false, offPeak: false },
    { hour: '8:00 PM', courtsLeft: 3, urgent: false, offPeak: false },
    { hour: '9:00 PM', courtsLeft: 5, urgent: false, offPeak: false }
  ];

  const promoCardsData = [
    {
      title: '20% OFF First Booking',
      code: 'PIKOLFIRST',
      desc: 'Use promo code upon checkout. Valid for all Bogo City courts.',
      badge: 'PROMO CODE',
      bgGrad: 'linear-gradient(135deg, #093822 0%, #15803d 100%)',
      textCol: '#bef264'
    },
    {
      title: 'Loyalty Points Balance',
      code: '★ 320 PTS',
      desc: 'You have 320 points. Redeem ₱50 discount for every 50 points!',
      badge: 'REWARDS',
      bgGrad: 'linear-gradient(135deg, #1e293b 0%, #064e3b 100%)',
      textCol: '#fde047'
    },
    {
      title: 'Invite a Friend, Get ₱50',
      code: 'SHARE & EARN',
      desc: 'Give friends ₱50 off their first session and earn ₱50 wallet credit.',
      badge: 'REFERRAL',
      bgGrad: 'linear-gradient(135deg, #0f172a 0%, #065f46 100%)',
      textCol: '#6ee7b7'
    },
    {
      title: 'Weekday Morning Drop-in',
      code: '₱100/HR',
      desc: 'Play between 7:00 AM – 11:00 AM Monday to Thursday for special rates.',
      badge: 'OFF-PEAK',
      bgGrad: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
      textCol: '#bef264'
    }
  ];

  function getTimeGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function getUserFirstName() {
    const raw = (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : 'Alex';
    return raw.split(' ')[0] || 'Alex';
  }

  // Render Section 1: Greeting Header
  function renderGreetingHeader() {
    const el = document.getElementById('bookGreetingHeader');
    if (!el) return;
    const greeting = getTimeGreeting();
    const name = getUserFirstName();
    el.innerHTML = `
      <div class="book-greeting-block">
        <div class="book-greeting-text">
          <h1 class="book-greeting-title">${greeting}, ${name} <span class="wave-hand">👋</span></h1>
          <p class="book-greeting-sub">Ready to play today? Find your court in Bogo.</p>
        </div>
        <div class="book-location-trigger-wrap">
          <button type="button" class="compact-location-chip" onclick="openLocationSheet()" aria-label="Location settings: ${activeLocationName}">
            <div class="loc-chip-icon-box">
              <i data-lucide="map-pin" class="loc-pin-icon"></i>
              ${isDetectingGps ? '<span class="loc-pulse-dot"></span>' : ''}
            </div>
            <div class="loc-chip-text">
              <span class="loc-chip-city">${activeLocationName}</span>
              <span class="loc-chip-sub">${isLocationEnabled ? `Within ${activeRadius}km` : 'Location off'}</span>
            </div>
            <i data-lucide="chevron-down" class="loc-chip-chevron"></i>
          </button>
        </div>
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 3: Search + Filter Row
  function renderSearchFilterRow() {
    const container = document.getElementById('bookSearchFilterSection');
    if (!container) return;
    const filterPills = [
      { id: 'all', label: 'All Courts' },
      { id: 'open', label: 'Open Now' },
      { id: 'lighted', label: '💡 Lighted' },
      { id: 'cheapest', label: 'Cheapest' },
      { id: 'nearest', label: 'Nearest' },
      { id: 'cafe', label: '☕ Has Cafe' },
      { id: 'top-rated', label: '★ Top Rated' }
    ];

    container.innerHTML = `
      <div class="book-search-filter-row">
        <div class="book-search-input-wrap">
          <i data-lucide="search" class="book-search-icon"></i>
          <input type="text" id="dashboardCourtSearch" placeholder="Search courts, amenities, venues..." 
            oninput="handleDashboardSearch(this.value)" autocomplete="off" aria-label="Search courts">
          <button type="button" id="dashboardClearSearch" class="book-search-clear" onclick="clearDashboardSearch()" style="display:none" aria-label="Clear search">
            <i data-lucide="x"></i>
          </button>
        </div>
        <button type="button" class="book-filter-btn ${hasActiveAdvancedFilters() ? 'has-active' : ''}" onclick="openFilterSheet()" aria-label="Open filter settings">
          <i data-lucide="sliders-horizontal"></i>
          ${hasActiveAdvancedFilters() ? '<span class="filter-indicator-dot"></span>' : ''}
        </button>
      </div>
      <div class="book-quick-chips-scroll" role="tablist" aria-label="Quick venue filters">
        ${filterPills.map(p => `
          <button type="button" class="book-quick-chip ${activeQuickFilter === p.id ? 'active' : ''}" 
            onclick="setDashboardQuickFilter('${p.id}')" role="tab" aria-selected="${activeQuickFilter === p.id}">
            ${p.label}
          </button>
        `).join('')}
      </div>
    `;
    if (window.icons) icons();
  }

  function hasActiveAdvancedFilters() {
    return priceFilterMax < 500 || filterCourtType !== 'all' || filterOpenNowOnly || selectedAmenities.size > 0;
  }

  // Render Section 4: Upcoming Booking Card (Hero)
  function renderUpcomingBookingCard() {
    const container = document.getElementById('bookUpcomingHeroSection');
    if (!container) return;
    if (upcomingBooking) {
      const v = (typeof venueById === 'function') ? venueById(upcomingBooking.venueId) : null;
      const venueImg = v?.image || 'venues/kapenarra.jpg';
      container.innerHTML = `
        <div class="upcoming-hero-card" style="background-image:linear-gradient(135deg, rgba(6,37,25,0.94) 0%, rgba(15,61,30,0.88) 100%), url('${venueImg}')">
          <div class="upcoming-hero-badge-row">
            <span class="upcoming-status-badge">
              <span class="pulse-live-dot"></span> UPCOMING BOOKING
            </span>
            <span class="upcoming-countdown-tag">${upcomingBooking.startsIn}</span>
          </div>
          <div class="upcoming-hero-details">
            <h2 class="upcoming-venue-name">${upcomingBooking.venueName}</h2>
            <p class="upcoming-meta-line">
              <i data-lucide="calendar"></i> ${upcomingBooking.dateLabel}
              <span class="mx-1.5">·</span>
              <i data-lucide="clock"></i> ${upcomingBooking.timeLabel}
              <span class="mx-1.5">·</span>
              <span class="upcoming-court-pill">${upcomingBooking.courtName}</span>
            </p>
          </div>
          <div class="upcoming-hero-actions">
            <button type="button" class="upcoming-action-btn primary-checkin" onclick="openBookingCheckinQr()" aria-label="Show check-in QR code">
              <i data-lucide="qr-code"></i> Check-in QR
            </button>
            <button type="button" class="upcoming-action-btn" onclick="openVenueDirections('${upcomingBooking.venueId}')" aria-label="Directions to venue">
              <i data-lucide="navigation"></i> Directions
            </button>
            <button type="button" class="upcoming-action-btn" onclick="rescheduleUpcomingBooking()" aria-label="Reschedule booking">
              <i data-lucide="calendar-sync"></i> Reschedule
            </button>
            <button type="button" class="upcoming-action-btn" onclick="shareBookingInvite()" aria-label="Share or invite players">
              <i data-lucide="share-2"></i> Invite
            </button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="upcoming-empty-card">
          <div class="upcoming-empty-icon">
            <i data-lucide="calendar-off"></i>
          </div>
          <div class="upcoming-empty-info">
            <h3>No upcoming games</h3>
            <p>Your court is waiting. Reserve a slot tonight and get ready to play.</p>
          </div>
          <button type="button" class="upcoming-empty-cta" onclick="scrollToVenueCatalog()">
            Book a court <i data-lucide="arrow-right"></i>
          </button>
        </div>
      `;
    }
    if (window.icons) icons();
  }

  // Render Section 5: Quick Actions Row (4 Icon Buttons)
  function renderQuickActionsRow() {
    const container = document.getElementById('bookQuickActionsSection');
    if (!container) return;
    container.innerHTML = `
      <div class="quick-actions-grid">
        <button type="button" class="quick-action-card" onclick="rebookLastCourt()" aria-label="Rebook last court">
          <div class="quick-action-icon-wrap bg-emerald-50 text-emerald-800">
            <i data-lucide="rotate-ccw"></i>
          </div>
          <span class="quick-action-label">Rebook Last</span>
          <small class="quick-action-sub">Kapenarra C1</small>
        </button>
        <button type="button" class="quick-action-card" onclick="navigateToTab('feed')" aria-label="Find open players in Play tab">
          <div class="quick-action-icon-wrap bg-lime-50 text-emerald-900">
            <i data-lucide="users-round"></i>
          </div>
          <span class="quick-action-label">Find Players</span>
          <small class="quick-action-sub">6 Open Plays</small>
        </button>
        <button type="button" class="quick-action-card" onclick="navigateToTab('split')" aria-label="Split court bill">
          <div class="quick-action-icon-wrap bg-amber-50 text-amber-900">
            <i data-lucide="wallet"></i>
          </div>
          <span class="quick-action-label">Split Bill</span>
          <small class="quick-action-sub">GCash / Maya</small>
        </button>
        <button type="button" class="quick-action-card" onclick="openMyBookingsSheet()" aria-label="View all my bookings">
          <div class="quick-action-icon-wrap bg-slate-100 text-slate-800">
            <i data-lucide="receipt"></i>
          </div>
          <span class="quick-action-label">My Bookings</span>
          <small class="quick-action-sub">3 Recorded</small>
        </button>
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 6: Today's Availability / Book Tonight
  function renderTodayAvailability() {
    const container = document.getElementById('bookTodayAvailabilitySection');
    if (!container) return;
    container.innerHTML = `
      <div class="book-section-header">
        <div>
          <span class="book-section-kicker">COURT TIME READY</span>
          <h3 class="book-section-title">Today's Availability</h3>
        </div>
        <span class="book-peak-pricing-pill">
          <i data-lucide="tag"></i> Off-peak ₱250 · Peak ₱350
        </span>
      </div>
      <div class="today-slots-scroller" role="region" aria-label="Today court availability hours">
        ${todayAvailabilityHours.map(s => `
          <button type="button" class="today-slot-chip ${s.urgent ? 'is-urgent' : ''}" onclick="quickSelectHourSlot('${s.hour}')" aria-label="${s.hour}, ${s.courtsLeft} courts left">
            <b class="today-slot-hour">${s.hour}</b>
            <span class="today-slot-count">${s.courtsLeft} court${s.courtsLeft === 1 ? '' : 's'} left</span>
            ${s.urgent ? '<span class="today-slot-urgency">⚡ Only 1 left!</span>' : `<span class="today-slot-rate">${s.offPeak ? 'Off-peak' : 'Peak'}</span>`}
          </button>
        `).join('')}
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 7: Your Stats Strip
  function renderStatsStrip() {
    const container = document.getElementById('bookStatsStripSection');
    if (!container) return;
    container.innerHTML = `
      <div class="user-stats-strip-card" onclick="navigateToTab('leader')" role="button" tabindex="0" aria-label="Your pickleball statistics. Tap to view leaderboards.">
        <div class="stats-strip-head">
          <div class="stats-strip-user">
            <div class="stats-avatar">AR</div>
            <div>
              <b class="stats-user-name">${getUserFirstName()}'s Month at a Glance</b>
              <small class="stats-user-sub">Bogo Courtside Rating · Tap for leaderboards</small>
            </div>
          </div>
          <div class="stats-streak-pill">
            🔥 4-Day Streak
          </div>
        </div>
        <div class="stats-metrics-grid">
          <div class="metric-col">
            <span class="metric-num">${userStatsData.gamesThisMonth}</span>
            <span class="metric-label">Games Played</span>
          </div>
          <div class="metric-col">
            <span class="metric-num">${userStatsData.hoursBooked}h</span>
            <span class="metric-label">Hours On Court</span>
          </div>
          <div class="metric-col">
            <span class="metric-num">₱${userStatsData.totalSpent.toLocaleString()}</span>
            <span class="metric-label">Total Spent</span>
          </div>
          <div class="metric-col">
            <span class="metric-num">3.42</span>
            <span class="metric-label">DUPR Rating</span>
          </div>
        </div>
      </div>
    `;
  }

  // Render Section 8: Open Games Near You
  function renderOpenGamesCarousel() {
    const container = document.getElementById('bookOpenGamesSection');
    if (!container) return;
    const events = (typeof openPlayEvents !== 'undefined' && Array.isArray(openPlayEvents)) ? openPlayEvents.slice(0, 4) : [];
    container.innerHTML = `
      <div class="book-section-header">
        <div>
          <span class="book-section-kicker">NEED PLAYERS</span>
          <h3 class="book-section-title">Open Games Near You</h3>
        </div>
        <button type="button" class="book-see-all-btn" onclick="navigateToTab('feed')">
          See all <i data-lucide="arrow-right"></i>
        </button>
      </div>
      <div class="open-games-scroller" role="region" aria-label="Open pickleball games">
        ${events.map(ev => {
          const joined = (typeof joinedOpenPlays !== 'undefined') && joinedOpenPlays.has(ev.id);
          const spotsLeft = ev.spots - (joined ? 1 : 0);
          return `
            <article class="open-game-chip-card">
              <div class="open-game-card-top">
                <span class="open-game-level-tag level-${ev.level.toLowerCase().replace(/[^a-z]/g, '')}">${ev.level}</span>
                <span class="open-game-spots-badge ${spotsLeft <= 1 ? 'is-low' : ''}">${spotsLeft} / ${ev.total} spots left</span>
              </div>
              <b class="open-game-venue-name">${ev.venue}</b>
              <div class="open-game-time-line">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-700"></i> ${ev.time}
              </div>
              <div class="open-game-footer">
                <span class="open-game-price">${ev.price}</span>
                <button type="button" class="open-game-join-btn ${joined ? 'is-joined' : ''}" onclick="toggleJoinDashboardGame('${ev.id}')">
                  ${joined ? 'Joined ✓' : 'Join Game'}
                </button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 9: Promos & Rewards Banner
  function renderPromosBanner() {
    const container = document.getElementById('bookPromosBannerSection');
    if (!container) return;
    container.innerHTML = `
      <div class="book-section-header">
        <div>
          <span class="book-section-kicker">SAVE ON COURT TIME</span>
          <h3 class="book-section-title">Deals & Loyalty Rewards</h3>
        </div>
        <span class="loyalty-points-badge">
          ★ ${loyaltyPointsBalance} Points
        </span>
      </div>
      <div class="promos-scroller" role="region" aria-label="Promos and coupons">
        ${promoCardsData.map(pr => `
          <div class="promo-card" style="background:${pr.bgGrad}">
            <div class="promo-card-top">
              <span class="promo-kicker-badge">${pr.badge}</span>
              <b class="promo-code-val" style="color:${pr.textCol}">${pr.code}</b>
            </div>
            <h4 class="promo-title">${pr.title}</h4>
            <p class="promo-desc">${pr.desc}</p>
            <div class="promo-card-action">
              <button type="button" class="promo-copy-btn" onclick="copyPromoCode('${pr.code}')">
                Apply Promo <i data-lucide="check"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 10: Favorites / Recently Booked Venues
  function renderFavoritesSection() {
    const container = document.getElementById('bookFavoritesSection');
    if (!container) return;
    const favList = Array.from(favoriteVenues);
    if (!favList.length) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';
    container.innerHTML = `
      <div class="book-section-header">
        <div>
          <span class="book-section-kicker">FAVORITE COURTS</span>
          <h3 class="book-section-title">Book Again</h3>
        </div>
      </div>
      <div class="favorites-scroller" role="region" aria-label="Favorite courts">
        ${favList.map(ownerId => {
          const v = (typeof venueById === 'function') ? venueById(ownerId) : null;
          if (!v) return '';
          const meta = venueDistancesAndRatings[ownerId] || { distKm: 2.0, rating: 4.8 };
          return `
            <div class="favorite-venue-chip" onclick="focusVenueCourt('${v.id}', 1)" role="button" tabindex="0">
              <div class="favorite-thumb" style="background-image:url('${v.image}')">
                <button type="button" class="fav-heart-btn is-favorited" onclick="event.stopPropagation(); toggleFavoriteVenue('${v.id}')" aria-label="Remove from favorites">
                  <i data-lucide="heart" class="fill-rose-500 text-rose-500"></i>
                </button>
              </div>
              <div class="favorite-info">
                <b class="favorite-name truncate">${v.name}</b>
                <span class="favorite-meta">★ ${meta.rating} · ${meta.distKm}km</span>
                <button type="button" class="favorite-rebook-cta" onclick="event.stopPropagation(); focusVenueCourt('${v.id}', 1)">
                  Reserve Court
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 11: Venues Near You (Upgraded)
  function renderUpgradedVenueCatalog() {
    const catalog = document.getElementById('courtCatalog');
    if (!catalog) return;

    // Filter courts based on search, radius, amenities, court type, open now
    const rawQuery = (document.getElementById('dashboardCourtSearch')?.value || '').trim().toLowerCase();
    const list = (typeof courtList !== 'undefined') ? courtList : [];

    let filtered = list.filter(c => {
      const v = (typeof venueById === 'function') ? venueById(c.owner) : null;
      const meta = venueDistancesAndRatings[c.owner] || { distKm: 3.0, rating: 4.7, priceVal: 300, openNow: true, indoor: false, cafe: true, lighted: true };

      // Search match
      if (rawQuery) {
        const text = `${c.name} ${v?.name || ''} ${v?.location || ''} ${c.features || ''} ${c.rate || ''}`.toLowerCase();
        if (!text.includes(rawQuery)) return false;
      }

      // Radius match
      if (meta.distKm > activeRadius) return false;

      // Price filter
      if (meta.priceVal > priceFilterMax) return false;

      // Court type
      if (filterCourtType === 'indoor' && !meta.indoor) return false;
      if (filterCourtType === 'outdoor' && meta.indoor) return false;

      // Open now filter
      if (filterOpenNowOnly && !meta.openNow) return false;

      // Quick filter checks
      if (activeQuickFilter === 'open' && !meta.openNow) return false;
      if (activeQuickFilter === 'lighted' && !meta.lighted) return false;
      if (activeQuickFilter === 'cafe' && !meta.cafe) return false;
      if (activeQuickFilter === 'top-rated' && meta.rating < 4.8) return false;

      // Amenities sheet
      for (const am of selectedAmenities) {
        if (!meta[am]) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const mA = venueDistancesAndRatings[a.owner] || { distKm: 3.0, rating: 4.7, priceVal: 300 };
      const mB = venueDistancesAndRatings[b.owner] || { distKm: 3.0, rating: 4.7, priceVal: 300 };
      if (activeQuickFilter === 'cheapest' || venueSortMode === 'cheapest') return mA.priceVal - mB.priceVal;
      if (activeQuickFilter === 'top-rated' || venueSortMode === 'rating') return mB.rating - mA.rating;
      if (venueSortMode === 'courts') {
        const cA = (typeof venueById === 'function') ? venueById(a.owner)?.courts || 1 : 1;
        const cB = (typeof venueById === 'function') ? venueById(b.owner)?.courts || 1 : 1;
        return cB - cA;
      }
      return mA.distKm - mB.distKm; // nearest default
    });

    const countEl = document.getElementById('courtCatalogCount');
    if (countEl) countEl.textContent = `${filtered.length} venue${filtered.length === 1 ? '' : 's'} available · ${activeLocationName}`;

    if (!filtered.length) {
      catalog.innerHTML = `
        <div class="court-empty-search">
          <i data-lucide="search-x"></i>
          <b>No courts found</b>
          <p>No venues match your current search and filters. Try adjusting the radius or clearing filters.</p>
          <button type="button" onclick="resetAllDashboardFilters()">Reset filters</button>
        </div>
      `;
      if (window.icons) icons();
      return;
    }

    // List vs Map mode
    if (venueDisplayMode === 'map') {
      catalog.innerHTML = renderMapPlaceholder(filtered);
      if (window.icons) icons();
      return;
    }

    catalog.innerHTML = filtered.map(c => {
      const owner = (typeof venueById === 'function') ? venueById(c.owner) : null;
      if (!owner) return '';
      const meta = venueDistancesAndRatings[c.owner] || { distKm: 2.1, rating: 4.8, reviews: 32, openNow: true, nextAvailable: '4:00 PM', priceVal: 300 };
      const isFav = favoriteVenues.has(c.owner);

      return `
        <article class="court-card venue-listing upgraded-court-card" onclick="focusVenueCourt('${c.owner}', ${c.court})" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')focusVenueCourt('${c.owner}', ${c.court})">
          <div class="court-photo" style="background-image:linear-gradient(180deg,transparent 30%,rgba(2,24,16,.85)),url('${owner.image}')">
            <img src="${owner.logo}" alt="${owner.name} logo" class="venue-logo-badge">
            <span class="court-photo-courts">${owner.courts} COURTS</span>
            <div class="court-photo-top-badges">
              <span class="court-open-status-badge ${meta.openNow ? 'is-open' : 'is-closed'}">
                <span class="open-status-dot"></span> ${meta.openNow ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <button type="button" class="court-fav-btn ${isFav ? 'is-favorited' : ''}" onclick="event.stopPropagation(); toggleFavoriteVenue('${c.owner}')" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              <i data-lucide="heart" class="${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}"></i>
            </button>
          </div>
          <div class="court-card-body">
            <div class="court-card-header">
              <div class="court-name-rating-row">
                <b class="court-card-title">${c.name}</b>
                <span class="court-rating-pill">★ ${meta.rating} <small>(${meta.reviews})</small></span>
              </div>
              <p class="court-location">
                <i data-lucide="map-pin"></i> ${owner.location}
                <span class="court-dist-dot">·</span>
                <span class="court-distance-text">${meta.distKm} km away</span>
              </p>
            </div>
            <div class="court-timing-strip">
              <span class="next-avail-tag"><i data-lucide="clock"></i> Next: ${meta.nextAvailable}</span>
              <span class="court-features-text">${c.features}</span>
            </div>
            <div class="court-rate-row">
              <div class="court-price-box">
                <small class="court-price-label">Starting at</small>
                <b class="court-price-val">${c.rate}</b>
              </div>
              <button type="button" class="court-book-btn" onclick="focusVenueCourt('${c.owner}', ${c.court})">
                Book Now! <i data-lucide="arrow-up-right"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
    if (window.icons) icons();
  }

  function renderMapPlaceholder(venuesList) {
    return `
      <div class="bogo-court-map-card">
        <div class="map-view-header">
          <div class="map-view-title-group">
            <i data-lucide="map" class="text-emerald-700"></i>
            <b>Bogo City Courts Map</b>
          </div>
          <span class="text-xs text-slate-500">${venuesList.length} courts mapped</span>
        </div>
        <div class="simulated-map-canvas">
          <div class="map-grid-overlay"></div>
          <div class="map-bogo-center-pin">
            <span class="bogo-center-dot"></span>
            <b>Bogo Center</b>
          </div>
          ${venuesList.map((c, i) => {
            const meta = venueDistancesAndRatings[c.owner] || { distKm: 2 };
            const offsets = [
              { top: '32%', left: '48%' },
              { top: '48%', left: '38%' },
              { top: '60%', left: '55%' },
              { top: '24%', left: '62%' },
              { top: '72%', left: '42%' },
              { top: '40%', left: '70%' }
            ];
            const pos = offsets[i % offsets.length];
            return `
              <div class="map-court-pin" style="top:${pos.top}; left:${pos.left}" onclick="focusVenueCourt('${c.owner}', 1)">
                <span class="court-pin-badge">₱${meta.priceVal}</span>
                <span class="court-pin-dot"></span>
                <span class="court-pin-label">${c.name.split(' ')[0]}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="map-view-footer">
          <small class="text-slate-500 text-xs">Tap any court pin above to choose booking hours</small>
          <button type="button" class="text-xs font-bold text-emerald-800" onclick="toggleVenueDisplayMode('list')">Return to list view</button>
        </div>
      </div>
    `;
  }

  // Render Section 12: Booking History Preview
  function renderBookingHistoryPreview() {
    const container = document.getElementById('bookHistorySection');
    if (!container) return;
    container.innerHTML = `
      <div class="book-section-header">
        <div>
          <span class="book-section-kicker">PAST GAMES</span>
          <h3 class="book-section-title">Recent Bookings</h3>
        </div>
        <button type="button" class="book-see-all-btn" onclick="openMyBookingsSheet()">
          See all <i data-lucide="arrow-right"></i>
        </button>
      </div>
      <div class="recent-bookings-list">
        ${bookingHistoryRecords.slice(0, 3).map(b => `
          <div class="history-item-card">
            <div class="history-item-left">
              <div class="history-item-icon">
                <i data-lucide="calendar-check"></i>
              </div>
              <div class="history-item-meta">
                <b class="history-item-title">${b.venueName} · ${b.courtName}</b>
                <span class="history-item-sub">${b.date} · ${b.time}</span>
              </div>
            </div>
            <div class="history-item-right">
              <span class="history-item-price">${b.price}</span>
              <span class="history-status-pill ${b.statusClass}">${b.status}</span>
              <button type="button" class="history-rebook-btn" onclick="focusVenueCourt('${b.venueId}', 1)">
                Rebook
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    if (window.icons) icons();
  }

  // Render Section 13: Tips / Announcements
  function renderTipsAnnouncement() {
    const container = document.getElementById('bookAnnouncementSection');
    if (!container) return;
    if (tipDismissed) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';
    container.innerHTML = `
      <div class="book-tip-card">
        <div class="book-tip-icon">
          <i data-lucide="trophy"></i>
        </div>
        <div class="book-tip-content">
          <b>1st Bogo City Pickleball Open 2026</b>
          <p>Registration is now live! Join singles and doubles divisions on Nov 14–16 at Kapenarra Courtside.</p>
        </div>
        <button type="button" class="book-tip-dismiss" onclick="dismissDashboardTip()" aria-label="Dismiss tournament tip">
          <i data-lucide="x"></i>
        </button>
      </div>
    `;
    if (window.icons) icons();
  }

  // Master render of Book tab dashboard
  window.renderBookDashboard = function() {
    renderGreetingHeader();
    renderSearchFilterRow();
    renderUpcomingBookingCard();
    renderQuickActionsRow();
    renderTodayAvailability();
    renderStatsStrip();
    renderOpenGamesCarousel();
    renderPromosBanner();
    renderFavoritesSection();
    renderUpgradedVenueCatalog();
    renderBookingHistoryPreview();
    renderTipsAnnouncement();
  };

  // User Actions
  window.setDashboardQuickFilter = function(id) {
    activeQuickFilter = id;
    renderSearchFilterRow();
    renderUpgradedVenueCatalog();
  };

  window.handleDashboardSearch = function(query) {
    const clearBtn = document.getElementById('dashboardClearSearch');
    if (clearBtn) clearBtn.style.display = query ? 'grid' : 'none';
    renderUpgradedVenueCatalog();
  };

  window.clearDashboardSearch = function() {
    const input = document.getElementById('dashboardCourtSearch');
    if (input) {
      input.value = '';
      input.focus();
    }
    const clearBtn = document.getElementById('dashboardClearSearch');
    if (clearBtn) clearBtn.style.display = 'none';
    renderUpgradedVenueCatalog();
  };

  window.toggleFavoriteVenue = function(venueId) {
    if (favoriteVenues.has(venueId)) {
      favoriteVenues.delete(venueId);
      if (typeof notify === 'function') notify('Removed from favorite courts');
    } else {
      favoriteVenues.add(venueId);
      if (typeof notify === 'function') notify('Saved to favorite courts');
    }
    try {
      localStorage.setItem('pikol_favorites', JSON.stringify(Array.from(favoriteVenues)));
    } catch (_) {}
    renderFavoritesSection();
    renderUpgradedVenueCatalog();
  };

  window.toggleVenueDisplayMode = function(mode) {
    venueDisplayMode = mode;
    renderUpgradedVenueCatalog();
  };

  window.setVenueSortMode = function(mode) {
    venueSortMode = mode;
    renderUpgradedVenueCatalog();
  };

  window.dismissDashboardTip = function() {
    tipDismissed = true;
    try {
      localStorage.setItem('pikol_tourney_tip_dismissed', '1');
    } catch (_) {}
    renderTipsAnnouncement();
  };

  window.copyPromoCode = function(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    if (typeof notify === 'function') notify(`Promo ${code} applied to booking checkout!`);
  };

  window.quickSelectHourSlot = function(hour) {
    if (typeof focusVenueCourt === 'function') {
      focusVenueCourt('kapenarra', 1);
    }
    if (typeof notify === 'function') notify(`Selected ${hour} slot · choose court to confirm`);
  };

  window.rebookLastCourt = function() {
    if (typeof focusVenueCourt === 'function') {
      focusVenueCourt('kapenarra', 1);
    }
    if (typeof notify === 'function') notify('Rebooking Kapenarra Courtside · Court 1');
  };

  window.navigateToTab = function(tabId) {
    if (typeof setTab === 'function') setTab(tabId);
  };

  window.scrollToVenueCatalog = function() {
    const el = document.getElementById('courtCatalog');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.toggleJoinDashboardGame = function(id) {
    if (typeof joinOpenPlay === 'function') {
      joinOpenPlay(id);
    }
    renderOpenGamesCarousel();
  };

  // Location Sheet
  window.openLocationSheet = function() {
    const modal = document.getElementById('locationSheetModal');
    if (modal) {
      modal.classList.add('open');
      syncLocationSheetUI();
    }
  };

  window.closeLocationSheet = function() {
    const modal = document.getElementById('locationSheetModal');
    if (modal) modal.classList.remove('open');
  };

  window.setSearchLocationRadius = function(val) {
    activeRadius = Number(val) || 40;
    const radNum = document.getElementById('locRadiusValue');
    if (radNum) radNum.textContent = `${activeRadius} km`;
    document.querySelectorAll('.radius-chip-btn').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.radius) === activeRadius);
    });
  };

  window.selectRecentLocation = function(name, km) {
    activeLocationName = name;
    activeRadius = km;
    isLocationEnabled = true;
    closeLocationSheet();
    renderGreetingHeader();
    renderUpgradedVenueCatalog();
    if (typeof notify === 'function') notify(`Location set to ${name} · ${km}km range`);
  };

  window.detectGpsLocationAction = function() {
    isDetectingGps = true;
    renderGreetingHeader();
    const statusTxt = document.getElementById('gpsDetectionStatus');
    if (statusTxt) statusTxt.textContent = 'Acquiring GPS coordinates in Cebu...';

    if (!navigator.geolocation) {
      isDetectingGps = false;
      renderGreetingHeader();
      if (typeof notify === 'function') notify('GPS unavailable · using Bogo City');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        isDetectingGps = false;
        activeLocationName = 'Bogo City';
        isLocationEnabled = true;
        renderGreetingHeader();
        renderUpgradedVenueCatalog();
        closeLocationSheet();
        if (typeof notify === 'function') notify('GPS locked: Bogo City, Cebu (within range)');
      },
      err => {
        isDetectingGps = false;
        activeLocationName = 'Bogo City';
        isLocationEnabled = true;
        renderGreetingHeader();
        renderUpgradedVenueCatalog();
        closeLocationSheet();
        if (typeof notify === 'function') notify('Defaulted to Bogo City, Cebu · 40km');
      },
      { timeout: 5000 }
    );
  };

  window.toggleLocationEnabled = function() {
    isLocationEnabled = !isLocationEnabled;
    const btn = document.getElementById('locToggleStateBtn');
    if (btn) btn.textContent = isLocationEnabled ? 'Disable' : 'Enable';
    renderGreetingHeader();
    renderUpgradedVenueCatalog();
    if (typeof notify === 'function') notify(isLocationEnabled ? 'Location filtering enabled' : 'Location filtering turned off');
  };

  function syncLocationSheetUI() {
    const radInput = document.getElementById('locationRadiusSlider');
    if (radInput) radInput.value = activeRadius;
    const radNum = document.getElementById('locRadiusValue');
    if (radNum) radNum.textContent = `${activeRadius} km`;
    document.querySelectorAll('.radius-chip-btn').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.radius) === activeRadius);
    });
    const btn = document.getElementById('locToggleStateBtn');
    if (btn) btn.textContent = isLocationEnabled ? 'Disable' : 'Enable';
  }

  // Filter Sheet
  window.openFilterSheet = function() {
    const modal = document.getElementById('filterSheetModal');
    if (modal) {
      modal.classList.add('open');
      syncFilterSheetUI();
    }
  };

  window.closeFilterSheet = function() {
    const modal = document.getElementById('filterSheetModal');
    if (modal) modal.classList.remove('open');
  };

  window.setFilterPriceRange = function(val) {
    priceFilterMax = Number(val);
    const label = document.getElementById('filterPriceValue');
    if (label) label.textContent = `₱${priceFilterMax}/hr`;
  };

  window.toggleAmenityFilter = function(amKey) {
    if (selectedAmenities.has(amKey)) selectedAmenities.delete(amKey);
    else selectedAmenities.add(amKey);
  };

  window.setFilterCourtType = function(type) {
    filterCourtType = type;
  };

  window.applyFilterSheet = function() {
    const openCheck = document.getElementById('filterOpenNowCheckbox');
    if (openCheck) filterOpenNowOnly = openCheck.checked;
    closeFilterSheet();
    renderSearchFilterRow();
    renderUpgradedVenueCatalog();
    if (typeof notify === 'function') notify('Filters applied to venues');
  };

  window.resetAllDashboardFilters = function() {
    priceFilterMax = 500;
    filterCourtType = 'all';
    filterOpenNowOnly = false;
    selectedAmenities.clear();
    activeQuickFilter = 'all';
    activeRadius = 40;
    closeFilterSheet();
    renderSearchFilterRow();
    renderUpgradedVenueCatalog();
    if (typeof notify === 'function') notify('Filters reset to default');
  };

  function syncFilterSheetUI() {
    const slider = document.getElementById('filterPriceSlider');
    if (slider) slider.value = priceFilterMax;
    const label = document.getElementById('filterPriceValue');
    if (label) label.textContent = `₱${priceFilterMax}/hr`;
    const openCheck = document.getElementById('filterOpenNowCheckbox');
    if (openCheck) openCheck.checked = filterOpenNowOnly;
    document.querySelectorAll('.amenity-checkbox-item input').forEach(input => {
      input.checked = selectedAmenities.has(input.value);
    });
  }

  // QR Modal
  window.openBookingCheckinQr = function() {
    const modal = document.getElementById('bookingQrCheckinModal');
    if (modal) modal.classList.add('open');
  };

  window.closeBookingCheckinQr = function() {
    const modal = document.getElementById('bookingQrCheckinModal');
    if (modal) modal.classList.remove('open');
  };

  // My Bookings Sheet
  window.openMyBookingsSheet = function() {
    const modal = document.getElementById('myBookingsSheetModal');
    if (modal) modal.classList.add('open');
  };

  window.closeMyBookingsSheet = function() {
    const modal = document.getElementById('myBookingsSheetModal');
    if (modal) modal.classList.remove('open');
  };

  window.shareBookingInvite = function() {
    const shareData = {
      title: 'Play Pickleball with me at Kapenarra Courtside!',
      text: 'I reserved Court 1 at Kapenarra Courtside for 4:00 PM today. Tap to view match and confirm your spot on Pikol!',
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
      if (typeof notify === 'function') notify('Match invite link copied to clipboard!');
    }
  };

  window.openVenueDirections = function(venueId) {
    const v = (typeof venueById === 'function') ? venueById(venueId) : null;
    const q = encodeURIComponent(`${v?.name || 'Kapenarra Courtside'} Bogo City Cebu`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  window.rescheduleUpcomingBooking = function() {
    if (typeof focusVenueCourt === 'function') {
      focusVenueCourt(upcomingBooking.venueId, 1);
    }
    if (typeof notify === 'function') notify('Choose new time slot to reschedule');
  };

  // Auto-init on load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (typeof window.renderBookDashboard === 'function') {
        window.renderBookDashboard();
      }
    }, 120);
  });
})();
