document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEYS = {
    active: 'urbanChimneyAuth',
    loginTime: 'urbanChimneyLoginTime',
    sessionExpiry: 'urbanChimneySessionExpiry',
    ownerActive: 'urbanChimneyOwnerAuth',
    ownerLoginTime: 'urbanChimneyOwnerLoginTime',
    ownerSessionExpiry: 'urbanChimneyOwnerSessionExpiry',
    mobile: 'customerMobile',
    name: 'customerName',
    city: 'customerCity',
    bookingHistory: 'bookingHistory',
    bookingId: 'bookingId',
    selectedService: 'selectedService',
    address: 'address',
    date: 'date',
    time: 'time',
    location: 'location',
    paymentMethod: 'paymentMethod',
    paymentStatus: 'paymentStatus',
    bookingStatus: 'bookingStatus',
    bookingAmount: 'bookingAmount',
    bookingPriceLabel: 'bookingPriceLabel',
    customerEmail: 'customerEmail',
    customerAddress: 'customerAddress',
    profileImage: 'customerProfileImage',
    bookingTime: 'bookingTime'
  };

  const SESSION_DURATION_MS = 30 * 60 * 1000;
  const DEMO_OTP = '123456';
  const OWNER_MOBILE = '9701434006';
  const OWNER_CONTACT = {
    mobile: '+91 90000 12345',
    email: 'KRS.MF66@gmail.com'
  };

  let adminSearchQuery = '';
  let adminFilterType = 'all';
  let adminPhoneSearchQuery = '';
  let adminStatusFilter = 'all';
  let adminTechnicianFilter = 'all';
  let adminDateFilter = '';
  let adminEditingBookingId = null;
  let adminDrafts = {};

  const clearCustomerSession = () => {
    [AUTH_KEYS.active, AUTH_KEYS.loginTime, AUTH_KEYS.sessionExpiry, AUTH_KEYS.mobile, AUTH_KEYS.name, AUTH_KEYS.city, AUTH_KEYS.customerEmail, AUTH_KEYS.customerAddress, AUTH_KEYS.profileImage].forEach((key) => localStorage.removeItem(key));
  };

  const clearOwnerSession = () => {
    [AUTH_KEYS.ownerActive, AUTH_KEYS.ownerLoginTime, AUTH_KEYS.ownerSessionExpiry].forEach((key) => localStorage.removeItem(key));
  };

  const saveAuthSession = (mobile) => {
    localStorage.setItem(AUTH_KEYS.active, 'active');
    localStorage.setItem(AUTH_KEYS.mobile, mobile);
    localStorage.setItem(AUTH_KEYS.loginTime, String(Date.now()));
    localStorage.setItem(AUTH_KEYS.sessionExpiry, String(Date.now() + SESSION_DURATION_MS));
    localStorage.setItem(AUTH_KEYS.name, localStorage.getItem(AUTH_KEYS.name) || 'Guest');
    localStorage.setItem(AUTH_KEYS.city, localStorage.getItem(AUTH_KEYS.city) || 'Not provided');
    localStorage.setItem(AUTH_KEYS.customerEmail, localStorage.getItem(AUTH_KEYS.customerEmail) || '');
    localStorage.setItem(AUTH_KEYS.customerAddress, localStorage.getItem(AUTH_KEYS.customerAddress) || '');
  };

  const saveOwnerSession = () => {
    localStorage.setItem(AUTH_KEYS.ownerActive, 'active');
    localStorage.setItem(AUTH_KEYS.ownerLoginTime, String(Date.now()));
    localStorage.setItem(AUTH_KEYS.ownerSessionExpiry, String(Date.now() + SESSION_DURATION_MS));
  };

  const isSessionValid = () => {
    const expiry = Number(localStorage.getItem(AUTH_KEYS.sessionExpiry) || 0);
    const isActive = localStorage.getItem(AUTH_KEYS.active) === 'active';
    return isActive && expiry > Date.now();
  };

  const isOwnerSessionValid = () => {
    const expiry = Number(localStorage.getItem(AUTH_KEYS.ownerSessionExpiry) || 0);
    const isActive = localStorage.getItem(AUTH_KEYS.ownerActive) === 'active';
    return isActive && expiry > Date.now();
  };

  const redirectBasedOnSession = () => {
    if (currentPage === 'index.html') {
      if (isOwnerSessionValid()) {
        window.location.replace('admin.html');
        return;
      }
      if (isSessionValid()) {
        window.location.replace('home.html');
      }
      return;
    }

    if (currentPage === 'admin.html') {
      if (isOwnerSessionValid()) return;
      if (isSessionValid()) {
        window.location.replace('home.html');
        return;
      }
      clearOwnerSession();
      clearCustomerSession();
      window.location.replace('index.html');
      return;
    }

    if (protectedPages.includes(currentPage)) {
      if (isOwnerSessionValid()) {
        window.location.replace('admin.html');
        return;
      }
      if (!isSessionValid()) {
        clearCustomerSession();
        window.location.replace('index.html');
      }
    }
  };

  const checkSession = () => {
    if (currentPage === 'admin.html') {
      if (!isOwnerSessionValid()) {
        if (isSessionValid()) {
          window.location.replace('home.html');
          return true;
        }
        clearOwnerSession();
        clearCustomerSession();
        window.location.replace('index.html');
        return true;
      }
      return false;
    }

    if (protectedPages.includes(currentPage)) {
      if (isOwnerSessionValid()) {
        window.location.replace('admin.html');
        return true;
      }
      if (!isSessionValid()) {
        clearCustomerSession();
        window.location.replace('index.html');
        return true;
      }
    }
    return false;
  };
  const protectedPages = ['home.html', 'booking.html', 'payment.html', 'profile.html', 'track.html', 'success.html', 'services.html', 'spare-parts.html', 'admin.html', 'settings.html', 'bookings.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const body = document.body;
  const loginForm = document.getElementById('loginForm');
  const bookingForm = document.getElementById('bookingForm');
  const locationButton = document.getElementById('locationButton');
  const locationField = document.getElementById('location');
  const mobileInput = document.getElementById('mobile');
  const otpInput = document.getElementById('otp');
  const sendOtpButton = document.getElementById('sendOtpButton');
  const verifyOtpButton = document.getElementById('verifyOtpButton');
  const formMessage = document.getElementById('formMessage');
  const otpStep = document.getElementById('otpStep');
  const verifyStep = document.getElementById('verifyStep');

  const toggleOtpFields = (visible) => {
    if (otpStep) otpStep.hidden = !visible;
    if (verifyStep) verifyStep.hidden = !visible;
  };

  const showToast = (message, type = 'info') => {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    stack.appendChild(toast);
    window.setTimeout(() => toast.classList.add('show'), 10);
    window.setTimeout(() => {
      toast.classList.remove('show');
      window.setTimeout(() => toast.remove(), 220);
    }, 3200);
  };

  const setFormMessage = (message, type) => {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  };

  const isOwnerMobile = (mobile) => mobile === OWNER_MOBILE;

  const showLoading = (message = 'Working on it...') => {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-card"><div class="spinner"></div><p></p></div>';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('active');
  };

  const hideLoading = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  };

  const clearAuthState = () => {
    [AUTH_KEYS.active, AUTH_KEYS.loginTime, AUTH_KEYS.sessionExpiry, AUTH_KEYS.ownerActive, AUTH_KEYS.ownerLoginTime, AUTH_KEYS.ownerSessionExpiry, AUTH_KEYS.mobile, AUTH_KEYS.name, AUTH_KEYS.city, AUTH_KEYS.bookingId, AUTH_KEYS.selectedService, AUTH_KEYS.address, AUTH_KEYS.date, AUTH_KEYS.time, AUTH_KEYS.location, AUTH_KEYS.paymentMethod, AUTH_KEYS.paymentStatus, AUTH_KEYS.bookingAmount, AUTH_KEYS.bookingPriceLabel, AUTH_KEYS.customerEmail, AUTH_KEYS.customerAddress, AUTH_KEYS.profileImage, AUTH_KEYS.bookingTime].forEach((key) => localStorage.removeItem(key));
  };

  const requestOtp = async (mobile) => new Promise((resolve) => {
    window.setTimeout(() => resolve({ ok: true, message: `Demo OTP sent to +91 ${mobile}. Use ${DEMO_OTP} to continue.` }), 250);
  });

  const verifyOtp = async (otp) => new Promise((resolve) => {
    window.setTimeout(() => resolve(otp === DEMO_OTP), 250);
  });

  const startResendCountdown = (button, seconds = 30) => {
    if (!button) return;
    let remaining = seconds;
    button.disabled = true;
    button.textContent = `Resend OTP (${remaining}s)`;

    const countdown = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        button.textContent = `Resend OTP (${remaining}s)`;
      } else {
        window.clearInterval(countdown);
        button.disabled = false;
        button.textContent = 'Resend OTP';
      }
    }, 1000);
  };

  const normalizeBookingStatus = (status = 'Pending') => {
    const normalized = String(status || 'Pending').trim();
    if (normalized === 'Technician On The Way') return 'On The Way';
    if (normalized === 'Booking On Hold') return 'Holding';
    if (normalized === 'Service Completed') return 'Completed';
    if (normalized === 'Booking Cancelled') return 'Cancelled';
    return normalized || 'Pending';
  };

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const getBookingHistory = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEYS.bookingHistory) || '[]');
    } catch (error) {
      return [];
    }
  };

  const notifyBookingHistoryChanged = () => {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('urbanChimneyBookingsChanged'));
      } catch (error) {
        // Ignore custom event issues in older environments.
      }
    }
  };

  const normalizeBookingRecord = (booking = {}) => {
    const service = booking.service || 'Chimney Basic Cleaning';
    const bookingDate = booking.date || booking.serviceDate || '';
    const bookingTimeValue = booking.time || '';
    const createdAt = booking.createdAt || booking.bookingTime || new Date().toLocaleString();
    const bookingAmount = booking.amount || booking.bookingAmount || '';
    const priceLabel = booking.priceLabel || booking.bookingPriceLabel || getServicePriceLabel(service);

    return {
      id: booking.id || `UC-${Math.floor(10000 + Math.random() * 90000)}`,
      service,
      address: booking.address || 'Not provided',
      date: bookingDate,
      time: bookingTimeValue,
      city: booking.city || 'Not provided',
      mobile: booking.mobile || 'N/A',
      customerName: booking.customerName || 'Guest',
      amount: bookingAmount,
      priceLabel,
      paymentMethod: booking.paymentMethod || 'Pending selection',
      paymentStatus: booking.paymentStatus || 'Pending',
      bookingStatus: normalizeBookingStatus(booking.bookingStatus || 'Pending'),
      bookingTime: booking.bookingTime || createdAt,
      createdAt,
      serviceDate: booking.serviceDate || bookingDate,
      technician: booking.technician || '',
      notes: booking.notes || '',
      customerEmail: booking.customerEmail || '',
      emailSent: Boolean(booking.emailSent)
    };
  };

  const saveBookingHistory = (booking) => {
    const normalized = normalizeBookingRecord(booking);
    const history = getBookingHistory();
    const existingIndex = history.findIndex((item) => item.id === normalized.id);
    if (existingIndex >= 0) {
      history[existingIndex] = normalized;
    } else {
      history.unshift(normalized);
    }
    localStorage.setItem(AUTH_KEYS.bookingHistory, JSON.stringify(history));
    notifyBookingHistoryChanged();
    return normalized;
  };

  const updateBookingRecord = (bookingId, updates = {}) => {
    const history = getBookingHistory();
    const existingBooking = history.find((item) => item.id === bookingId);
    if (!existingBooking) return null;

    const updatedBooking = normalizeBookingRecord({ ...existingBooking, ...updates, id: bookingId });
    const nextHistory = history.map((item) => (item.id === bookingId ? updatedBooking : item));
    localStorage.setItem(AUTH_KEYS.bookingHistory, JSON.stringify(nextHistory));
    notifyBookingHistoryChanged();
    return updatedBooking;
  };

  const formatLocalDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isSameDay = (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const isBookingToday = (booking) => {
    if (booking.createdAt) {
      return isSameDay(booking.createdAt, new Date());
    }
    return isSameDay(booking.bookingTime, new Date());
  };

  const getBookingDateValue = (booking) => booking.serviceDate || booking.date || booking.bookingDate || '';

  const getBookingDateTimestamp = (dateValue) => {
    if (!dateValue) return Number.MAX_SAFE_INTEGER;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  const formatBookingDateLabel = (dateValue) => {
    if (!dateValue) return 'Unscheduled';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Unscheduled';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const STATUS_FLOW = [
    { key: 'Pending', label: 'Pending', badgeClass: 'pending', tone: 'yellow', summary: 'Waiting for confirmation.', message: 'Waiting for confirmation.' },
    { key: 'Technician Assigned', label: 'Technician Assigned', badgeClass: 'assigned', tone: 'blue', summary: 'Technician has been assigned.', message: 'Technician has been assigned.' },
    { key: 'On The Way', label: 'On The Way', badgeClass: 'on-the-way', tone: 'orange', summary: 'Technician is on the way to your location.', message: 'Technician is on the way to your location.' },
    { key: 'Holding', label: 'Holding', badgeClass: 'on-hold', tone: 'purple', summary: 'Your booking is temporarily on hold.', message: 'Your booking is temporarily on hold.' },
    { key: 'Completed', label: 'Completed', badgeClass: 'completed', tone: 'green', summary: 'Your service has been completed successfully.', message: 'Your service has been completed successfully.' },
    { key: 'Cancelled', label: 'Cancelled', badgeClass: 'cancelled', tone: 'red', summary: 'Your booking has been cancelled.', message: 'Your booking has been cancelled.' }
  ];

  const TECHNICIAN_OPTIONS = ['Select Technician', 'Technician 1', 'Technician 2', 'Technician 3'];

  const getBookingStatusMeta = (status = 'Pending') => STATUS_FLOW.find((entry) => entry.key === normalizeBookingStatus(status)) || STATUS_FLOW[0];

  const updateBookingStatus = (bookingId, status) => {
    const updatedBooking = updateBookingRecord(bookingId, { bookingStatus: normalizeBookingStatus(status) });
    localStorage.setItem(AUTH_KEYS.bookingStatus, normalizeBookingStatus(status));
    renderAdminPanel();
    renderTracking();
    renderSuccessPage();
    return updatedBooking;
  };

  const deleteBooking = (bookingId) => {
    const history = getBookingHistory().filter((booking) => booking.id !== bookingId);
    localStorage.setItem(AUTH_KEYS.bookingHistory, JSON.stringify(history));
    notifyBookingHistoryChanged();
    renderAdminPanel();
  };

  const getAdminFilteredBookings = (history) => {
    const searchQuery = adminSearchQuery.trim().toLowerCase();
    const phoneQuery = adminPhoneSearchQuery.trim().toLowerCase();
    const idQuery = adminIdSearchQuery.trim().toLowerCase();
    const customerQuery = adminCustomerFilter;
    const dateQuery = adminDateFilter;
    const statusQuery = adminStatusFilter;
    const technicianQuery = adminTechnicianFilter;
    const paymentQuery = adminPaymentFilter;
    const serviceQuery = adminServiceFilter;
    const filterMode = adminFilterType || 'all';

    const filtered = history.filter((booking) => {
      const normalizedStatus = normalizeBookingStatus(booking.bookingStatus || 'Pending');
      const bookingDateValue = getBookingDateValue(booking);
      const searchText = [booking.customerName, booking.mobile, booking.id, booking.service, booking.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const paymentStatus = booking.paymentStatus || (normalizedStatus === 'Completed' ? 'Paid' : 'Pending');
      const matchesSearch = !searchQuery || searchText.includes(searchQuery);
      const matchesPhone = !phoneQuery || String(booking.mobile || '').toLowerCase().includes(phoneQuery);
      const matchesId = !idQuery || String(booking.id || '').toLowerCase().includes(idQuery);
      const matchesCustomer = customerQuery === 'all' || (booking.customerName || '').toLowerCase() === customerQuery;
      const matchesStatus = statusQuery === 'all' || normalizedStatus === statusQuery;
      const matchesTechnician = technicianQuery === 'all' || (booking.technician || '') === technicianQuery;
      const matchesPayment = paymentQuery === 'all' || paymentStatus === paymentQuery;
      const matchesService = serviceQuery === 'all' || (booking.service || '') === serviceQuery;
      const matchesDate = !dateQuery || bookingDateValue === dateQuery;
      const matchesMode = filterMode === 'all'
        || (filterMode === 'today' && isSameDay(bookingDateValue, new Date()))
        || (filterMode === 'pending' && normalizedStatus !== 'Completed' && normalizedStatus !== 'Cancelled')
        || (filterMode === 'confirmed' && normalizedStatus !== 'Pending' && normalizedStatus !== 'Cancelled')
        || (filterMode === 'active' && ['Pending', 'Technician Assigned', 'On The Way', 'Holding'].includes(normalizedStatus))
        || (filterMode === 'completed' && normalizedStatus === 'Completed')
        || (filterMode === 'cancelled' && normalizedStatus === 'Cancelled');
      return matchesSearch && matchesPhone && matchesId && matchesCustomer && matchesStatus && matchesTechnician && matchesPayment && matchesService && matchesDate && matchesMode;
    });

    return filtered.sort((left, right) => {
      const leftTime = new Date(left.createdAt || left.bookingTime || 0).getTime();
      const rightTime = new Date(right.createdAt || right.bookingTime || 0).getTime();
      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
      return rightTime - leftTime;
    });
  };

  const renderAdminPanel = () => {
    const statsContainer = document.getElementById('adminStats');
    const emptyState = document.getElementById('adminEmptyState');
    const tableWrap = document.getElementById('adminBookingsTable');
    if (!statsContainer && !emptyState && !tableWrap) return;

    const history = getBookingHistory();
    const visibleBookings = getAdminFilteredBookings(history);
    const pendingBookings = history.filter((booking) => normalizeBookingStatus(booking.bookingStatus || 'Pending') !== 'Completed' && normalizeBookingStatus(booking.bookingStatus || 'Pending') !== 'Cancelled');
    const completedBookings = history.filter((booking) => normalizeBookingStatus(booking.bookingStatus || 'Pending') === 'Completed');
    const todayRevenue = history
      .filter((booking) => normalizeBookingStatus(booking.bookingStatus || 'Pending') === 'Completed' && isSameDay(getBookingDateValue(booking), new Date()))
      .reduce((sum, booking) => sum + Number(booking.amount || booking.bookingAmount || 0), 0);

    if (statsContainer) {
      statsContainer.innerHTML = `
        <button class="stat-card admin-stat-card" type="button" data-admin-card="all">
          <span class="stat-label">Total Bookings</span>
          <strong>${history.length}</strong>
        </button>
        <button class="stat-card admin-stat-card" type="button" data-admin-card="active">
          <span class="stat-label">Active Bookings</span>
          <strong>${pendingBookings.length}</strong>
        </button>
        <button class="stat-card admin-stat-card" type="button" data-admin-card="completed">
          <span class="stat-label">Completed Bookings</span>
          <strong>${completedBookings.length}</strong>
        </button>
        <button class="stat-card admin-stat-card" type="button" data-admin-card="today">
          <span class="stat-label">Today's Revenue</span>
          <strong>₹${todayRevenue.toLocaleString()}</strong>
        </button>`;
    }

    if (emptyState) {
      emptyState.hidden = visibleBookings.length > 0;
      emptyState.textContent = visibleBookings.length ? '' : 'No matching bookings found.';
    }

    if (tableWrap) {
      if (!visibleBookings.length) {
        tableWrap.innerHTML = '';
        return;
      }

      tableWrap.innerHTML = `
        <div class="admin-table-shell">
          <table class="admin-bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Date</th>
                <th>Address</th>
                <th>Technician</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${visibleBookings.map((booking) => {
                const isEditing = adminEditingBookingId === booking.id;
                const draft = adminDrafts[booking.id] || booking;
                const statusMeta = getBookingStatusMeta(draft.bookingStatus || 'Pending');
                const statusClass = `status-badge-${statusMeta.badgeClass}`;
                return `
                  <tr data-booking-id="${booking.id}">
                    <td><strong>${escapeHtml(booking.id)}</strong><div class="meta-caption">Created ${escapeHtml(booking.createdAt || booking.bookingTime || '—')}</div></td>
                    <td>${isEditing ? `<div class="edit-stack"><input data-edit-field="customerName" value="${escapeHtml(draft.customerName || '')}" /></div>` : `<div class="customer-name">${escapeHtml(booking.customerName || 'Guest')}</div>`}</td>
                    <td>${isEditing ? `<input data-edit-field="mobile" value="${escapeHtml(draft.mobile || '')}" />` : escapeHtml(booking.mobile || 'N/A')}</td>
                    <td>${isEditing ? `<input data-edit-field="service" value="${escapeHtml(draft.service || '')}" />` : escapeHtml(booking.service || 'Chimney Cleaning')}</td>
                    <td>${isEditing ? `<input data-edit-field="date" type="date" value="${escapeHtml(draft.date || '')}" />` : escapeHtml(booking.date || '—')}</td>
                    <td>${isEditing ? `<textarea data-edit-field="address">${escapeHtml(draft.address || '')}</textarea>` : escapeHtml(booking.address || 'Not provided')}</td>
                    <td>${isEditing ? `<select data-edit-field="technician">${TECHNICIAN_OPTIONS.map((option) => `<option value="${option}" ${draft.technician === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select>` : escapeHtml(booking.technician || '—')}</td>
                    <td>${isEditing ? `<div class="edit-stack"><select data-edit-field="bookingStatus">${STATUS_FLOW.map((item) => `<option value="${item.key}" ${normalizeBookingStatus(draft.bookingStatus || 'Pending') === item.key ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></div>` : `<span class="status-badge ${statusClass}">${escapeHtml(statusMeta.label)}</span>`}</td>
                    <td>
                      ${isEditing ? `
                        <div class="table-actions">
                          <button class="btn btn-primary btn-small" data-action="save-booking" data-id="${booking.id}">Save</button>
                          <button class="btn btn-secondary btn-small" data-action="cancel-edit" data-id="${booking.id}">Cancel</button>
                        </div>` : `
                        <div class="table-actions">
                          <button class="btn btn-secondary btn-small" data-action="edit-booking" data-id="${booking.id}">Edit</button>
                          <button class="btn btn-danger btn-small" data-action="delete-booking" data-id="${booking.id}">Delete</button>
                        </div>`}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>`;
    }
  };

  window.UrbanChimneyAdmin = {
    renderAdminPanel,
    getAdminFilteredBookings
  };

  const getServiceDetails = (service) => {
    const services = {
      'Chimney Basic Cleaning': { amount: 599, priceLabel: '₹599' },
      'Chimney Deep Cleaning': { amount: 1199, priceLabel: '₹1199' },
      'Chimney Repair': { amount: 0, priceLabel: 'Price After Inspection' },
      'Chimney Cleaning': { amount: 799, priceLabel: '₹799' },
      'AC Service': { amount: 699, priceLabel: '₹699' },
      Electrical: { amount: 599, priceLabel: '₹599' },
      Plumbing: { amount: 649, priceLabel: '₹649' },
      Cleaning: { amount: 749, priceLabel: '₹749' },
      Painting: { amount: 899, priceLabel: '₹899' }
    };
    return services[service] || { amount: 599, priceLabel: '₹599' };
  };

  const getServiceAmount = (service) => getServiceDetails(service).amount;
  const getServicePriceLabel = (service) => getServiceDetails(service).priceLabel;

  const fillProfileFields = () => {
    const fields = [
      { id: 'profileName', value: localStorage.getItem(AUTH_KEYS.name) || 'Guest' },
      { id: 'profileMobile', value: localStorage.getItem(AUTH_KEYS.mobile) || 'Not available' },
      { id: 'profileCity', value: localStorage.getItem(AUTH_KEYS.city) || 'Not provided' },
      { id: 'profileEmail', value: localStorage.getItem(AUTH_KEYS.customerEmail) || '' },
      { id: 'profileAddress', value: localStorage.getItem(AUTH_KEYS.customerAddress) || '' },
      { id: 'settingsName', value: localStorage.getItem(AUTH_KEYS.name) || 'Guest' },
      { id: 'settingsMobile', value: localStorage.getItem(AUTH_KEYS.mobile) || 'Not available' },
      { id: 'settingsCity', value: localStorage.getItem(AUTH_KEYS.city) || 'Not provided' },
      { id: 'settingsEmail', value: localStorage.getItem(AUTH_KEYS.customerEmail) || '' },
      { id: 'settingsAddress', value: localStorage.getItem(AUTH_KEYS.customerAddress) || '' }
    ];

    fields.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    });

    const avatar = document.querySelector('.profile-avatar');
    const avatarValue = localStorage.getItem(AUTH_KEYS.profileImage);
    if (avatar && avatarValue) {
      avatar.src = avatarValue;
    }
  };

  const renderBookingHistory = () => {
    const list = document.getElementById('bookingHistoryList');
    if (!list) return;

    const history = getBookingHistory();
    if (!history.length) {
      list.innerHTML = '<div class="empty-state">No bookings yet. Your recent service requests will appear here.</div>';
      return;
    }

    list.innerHTML = history.map((item) => `
      <div class="history-item history-card">
        <div>
          <strong>${escapeHtml(item.service || 'Service')}</strong>
          <p>${escapeHtml(item.address || 'Address not provided')}</p>
          <div class="booking-pill-row">
            <span class="booking-pill">${escapeHtml(item.date || 'Scheduled')}</span>
            <span class="booking-pill">${escapeHtml(item.time || 'As scheduled')}</span>
            <span class="booking-pill">${escapeHtml(item.bookingStatus || 'Pending')}</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-secondary btn-small" type="button" data-action="view-booking" data-id="${item.id}">View Details</button>
          <button class="btn btn-secondary btn-small" type="button" data-action="reschedule-booking" data-id="${item.id}">Reschedule</button>
          <button class="btn btn-danger btn-small" type="button" data-action="cancel-booking" data-id="${item.id}">Cancel</button>
        </div>
      </div>
    `).join('');
  };


  const setupAdminPanel = () => {
    const resetButtons = [document.getElementById('resetBookingsButton'), document.getElementById('sidebarResetBookingsButton')];
    const searchInput = document.getElementById('adminSearchInput');
    const phoneInput = document.getElementById('adminPhoneSearch');
    const idInput = document.getElementById('adminIdSearch');
    const customerSelect = document.getElementById('adminCustomerFilter');
    const statusSelect = document.getElementById('adminStatusFilter');
    const technicianSelect = document.getElementById('adminTechnicianFilter');
    const paymentSelect = document.getElementById('adminPaymentFilter');
    const serviceSelect = document.getElementById('adminServiceFilter');
    const dateInput = document.getElementById('adminDateFilter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tableWrap = document.getElementById('adminBookingsTable');
    const statsContainer = document.getElementById('adminStats');
    const drawerToggle = document.getElementById('adminDrawerToggle');
    const drawerClose = document.getElementById('adminDrawerClose');
    const drawerOverlay = document.getElementById('adminDrawerOverlay');
    const sidebar = document.getElementById('adminSidebar');
    const logoutButton = document.getElementById('sidebarLogoutButton');
    const headerLogoutButton = document.getElementById('logoutButton');
    if (!tableWrap) return;

    const resetAdminState = () => {
      adminSearchQuery = '';
      adminPhoneSearchQuery = '';
      adminIdSearchQuery = '';
      adminCustomerFilter = 'all';
      adminStatusFilter = 'all';
      adminTechnicianFilter = 'all';
      adminPaymentFilter = 'all';
      adminServiceFilter = 'all';
      adminDateFilter = '';
      adminEditingBookingId = null;
      adminDrafts = {};
      if (searchInput) searchInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (idInput) idInput.value = '';
      if (customerSelect) customerSelect.value = 'all';
      if (statusSelect) statusSelect.value = 'all';
      if (technicianSelect) technicianSelect.value = 'all';
      if (paymentSelect) paymentSelect.value = 'all';
      if (serviceSelect) serviceSelect.value = 'all';
      if (dateInput) dateInput.value = '';
      filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
      adminFilterType = 'all';
    };

    const populateAdminSelects = () => {
      const history = getBookingHistory();
      if (customerSelect) {
        const customers = [...new Set(history.map((booking) => booking.customerName).filter(Boolean))].sort();
        customerSelect.innerHTML = '<option value="all">All customers</option>' + customers.map((customer) => `<option value="${customer.toLowerCase()}">${escapeHtml(customer)}</option>`).join('');
      }
      if (serviceSelect) {
        const services = [...new Set(history.map((booking) => booking.service).filter(Boolean))].sort();
        serviceSelect.innerHTML = '<option value="all">All services</option>' + services.map((service) => `<option value="${service}">${escapeHtml(service)}</option>`).join('');
      }
      if (paymentSelect) {
        const paymentOptions = ['Pending', 'Paid', 'Partial'];
        paymentSelect.innerHTML = '<option value="all">All payments</option>' + paymentOptions.map((option) => `<option value="${option}">${escapeHtml(option)}</option>`).join('');
      }
    };

    resetButtons.forEach((button) => {
      if (button) {
        button.addEventListener('click', () => {
          [AUTH_KEYS.bookingHistory, AUTH_KEYS.bookingId, AUTH_KEYS.selectedService, AUTH_KEYS.address, AUTH_KEYS.date, AUTH_KEYS.time, AUTH_KEYS.location, AUTH_KEYS.paymentMethod, AUTH_KEYS.bookingAmount].forEach((key) => localStorage.removeItem(key));
          showToast('Demo bookings reset successfully.', 'success');
          resetAdminState();
          populateAdminSelects();
          renderAdminPanel();
        });
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        adminSearchQuery = event.target.value.trim();
        renderAdminPanel();
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', (event) => {
        adminPhoneSearchQuery = event.target.value.trim();
        renderAdminPanel();
      });
    }

    if (idInput) {
      idInput.addEventListener('input', (event) => {
        adminIdSearchQuery = event.target.value.trim();
        renderAdminPanel();
      });
    }

    if (customerSelect) {
      customerSelect.addEventListener('change', (event) => {
        adminCustomerFilter = event.target.value;
        renderAdminPanel();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (event) => {
        adminStatusFilter = event.target.value;
        renderAdminPanel();
      });
    }

    if (technicianSelect) {
      technicianSelect.addEventListener('change', (event) => {
        adminTechnicianFilter = event.target.value;
        renderAdminPanel();
      });
    }

    if (paymentSelect) {
      paymentSelect.addEventListener('change', (event) => {
        adminPaymentFilter = event.target.value;
        renderAdminPanel();
      });
    }

    if (serviceSelect) {
      serviceSelect.addEventListener('change', (event) => {
        adminServiceFilter = event.target.value;
        renderAdminPanel();
      });
    }

    if (dateInput) {
      dateInput.addEventListener('change', (event) => {
        adminDateFilter = event.target.value;
        renderAdminPanel();
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        adminFilterType = button.dataset.filter || 'all';
        filterButtons.forEach((item) => item.classList.toggle('active', item === button));
        renderAdminPanel();
      });
    });

    if (statsContainer) {
      statsContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('[data-admin-card]');
        if (!targetButton) return;
        const cardType = targetButton.dataset.adminCard;
        adminFilterType = cardType === 'all' ? 'all' : cardType;
        filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === cardType));
        renderAdminPanel();
      });
    }

    const toggleSidebar = () => {
      if (!sidebar) return;
      const isOpen = sidebar.classList.toggle('open');
      sidebar.setAttribute('aria-hidden', String(!isOpen));
      if (drawerOverlay) {
        drawerOverlay.classList.toggle('active', isOpen);
        drawerOverlay.setAttribute('aria-hidden', String(!isOpen));
      }
    };

    if (drawerToggle) {
      drawerToggle.addEventListener('click', toggleSidebar);
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', toggleSidebar);
    }

    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', toggleSidebar);
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
      });
    }

    if (headerLogoutButton) {
      headerLogoutButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
      });
    }

    populateAdminSelects();
    resetAdminState();

    tableWrap.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const bookingId = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'edit-booking') {
        const booking = getBookingHistory().find((item) => item.id === bookingId);
        adminEditingBookingId = bookingId;
        if (booking) {
          adminDrafts[bookingId] = { ...booking };
        }
        renderAdminPanel();
      }
      if (action === 'save-booking') {
        const draft = adminDrafts[bookingId];
        if (draft) {
          saveBookingHistory({ ...draft, id: bookingId });
          adminEditingBookingId = null;
          delete adminDrafts[bookingId];
          showToast('Booking updated successfully.', 'success');
          renderAdminPanel();
        }
      }
      if (action === 'cancel-edit') {
        adminEditingBookingId = null;
        delete adminDrafts[bookingId];
        renderAdminPanel();
      }
      if (action === 'delete-booking') {
        deleteBooking(bookingId);
        showToast('Booking deleted successfully.', 'success');
      }
    });

    tableWrap.addEventListener('change', (event) => {
      const target = event.target;
      const bookingId = target.closest('[data-booking-id]')?.dataset.bookingId;
      if (!bookingId || !target.dataset.editField) return;
      const draft = adminDrafts[bookingId] || getBookingHistory().find((item) => item.id === bookingId) || {};
      adminDrafts[bookingId] = { ...draft, [target.dataset.editField]: target.value };
      saveBookingHistory({ ...adminDrafts[bookingId], id: bookingId });
      renderAdminPanel();
      showToast('Booking updated instantly.', 'success');
    });
  };

  const renderTracking = () => {
    const bookingIdEl = document.getElementById('trackBookingId');
    const serviceEl = document.getElementById('trackService');
    const addressEl = document.getElementById('trackAddress');
    const dateEl = document.getElementById('trackDate');
    const timeEl = document.getElementById('trackTime');
    const timelineEl = document.getElementById('trackTimeline');
    const statusBadgeEl = document.getElementById('trackStatusBadge');
    const statusMessageEl = document.getElementById('trackStatusMessage');
    if (!bookingIdEl && !serviceEl && !addressEl && !dateEl && !timeEl && !timelineEl && !statusBadgeEl && !statusMessageEl) return;

    const history = getBookingHistory();
    const latestBooking = history.find((booking) => booking.id === (localStorage.getItem(AUTH_KEYS.bookingId) || '')) || history[0] || null;
    const bookingStatus = latestBooking?.bookingStatus || localStorage.getItem(AUTH_KEYS.bookingStatus) || 'Pending';
    const booking = {
      bookingId: latestBooking?.id || localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001',
      service: latestBooking?.service || localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning',
      address: latestBooking?.address || localStorage.getItem(AUTH_KEYS.address) || 'Not provided',
      date: latestBooking?.date || localStorage.getItem(AUTH_KEYS.date) || 'Today',
      time: latestBooking?.time || localStorage.getItem(AUTH_KEYS.time) || 'As scheduled'
    };
    const statusMeta = getBookingStatusMeta(bookingStatus);

    if (bookingIdEl) bookingIdEl.textContent = booking.bookingId;
    if (serviceEl) serviceEl.textContent = booking.service;
    if (addressEl) addressEl.textContent = booking.address;
    if (dateEl) dateEl.textContent = booking.date;
    if (timeEl) timeEl.textContent = booking.time;
    if (statusBadgeEl) {
      statusBadgeEl.textContent = bookingStatus;
      statusBadgeEl.className = `status-pill status-pill-${statusMeta.badgeClass}`;
    }
    if (statusMessageEl) {
      statusMessageEl.textContent = statusMeta.summary;
    }

    if (timelineEl) {
      const steps = [
        { label: 'Pending', description: 'Your service request is confirmed.', active: ['Pending', 'Technician Assigned', 'On The Way', 'Holding', 'Completed', 'Cancelled'].includes(bookingStatus) },
        { label: 'Technician Assigned', description: 'A verified professional is preparing for your home.', active: ['Technician Assigned', 'On The Way', 'Holding', 'Completed'].includes(bookingStatus) },
        { label: 'On The Way', description: 'Our expert is travelling to your location.', active: ['On The Way', 'Holding', 'Completed'].includes(bookingStatus) },
        { label: 'Holding', description: 'We have paused the booking for updates.', active: ['Holding', 'Completed'].includes(bookingStatus) },
        { label: 'Completed', description: 'We have completed the job and checked quality.', active: ['Completed'].includes(bookingStatus) }
      ];
      const cancelled = bookingStatus === 'Cancelled';
      timelineEl.innerHTML = steps.map((step) => `
        <div class="timeline-item ${step.active ? 'active' : ''} ${cancelled && step.label === 'Service Completed' ? 'cancelled' : ''}">
          <div class="timeline-dot"></div>
          <div>
            <strong>${step.label}</strong>
            <p>${step.description}</p>
          </div>
        </div>
      `).join('');
      if (cancelled) {
        timelineEl.innerHTML += `<div class="timeline-item active cancelled-step"><div class="timeline-dot"></div><div><strong>Booking Cancelled</strong><p>Your booking has been cancelled.</p></div></div>`;
      }
    }
  };

  const playSuccessTone = () => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gainNode.gain.setValueAtTime(0.0025, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.24);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.24);
    } catch (error) {
      console.warn('Success sound not supported.', error);
    }
  };

  const createSuccessConfetti = () => {
    const existing = document.querySelector('.success-confetti');
    if (existing) existing.remove();
    const confetti = document.createElement('div');
    confetti.className = 'success-confetti';
    const count = 22;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'confetti-dot';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.background = `hsl(${110 + Math.random() * 70}, 82%, ${50 + Math.random() * 12}%)`;
      dot.style.width = `${8 + Math.random() * 8}px`;
      dot.style.height = dot.style.width;
      dot.style.animationDuration = `${1.4 + Math.random() * 0.8}s`;
      dot.style.animationDelay = `${Math.random() * 0.2}s`;
      dot.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.appendChild(dot);
    }
    document.body.appendChild(confetti);
    window.setTimeout(() => confetti.remove(), 2400);
  };

  const animateSuccessScreen = () => {
    const badge = document.querySelector('.success-badge');
    if (badge) badge.classList.add('success-badge-animate');
    playSuccessTone();
    createSuccessConfetti();
  };

  const renderSuccessPage = () => {
    const bookingIdEl = document.getElementById('successBookingId');
    const customerNameEl = document.getElementById('successCustomerName');
    const mobileEl = document.getElementById('successMobile');
    const serviceEl = document.getElementById('successService');
    const paymentEl = document.getElementById('successPayment');
    const dateEl = document.getElementById('successDate');
    const timeEl = document.getElementById('successTime');
    const addressEl = document.getElementById('successAddress');
    const statusEl = document.getElementById('successStatus');
    const amountEl = document.getElementById('successAmount');
    if (!bookingIdEl && !customerNameEl && !mobileEl && !serviceEl && !paymentEl && !dateEl && !timeEl && !addressEl && !statusEl && !amountEl) return;

    const bookingId = localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001';
    const customerName = localStorage.getItem(AUTH_KEYS.name) || 'Guest';
    const mobile = localStorage.getItem(AUTH_KEYS.mobile) || 'N/A';
    const service = localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning';
    const payment = localStorage.getItem(AUTH_KEYS.paymentMethod) || 'UPI';
    const date = localStorage.getItem(AUTH_KEYS.date) || 'Today';
    const time = localStorage.getItem(AUTH_KEYS.time) || 'As scheduled';
    const address = localStorage.getItem(AUTH_KEYS.address) || 'Not provided';
    const status = localStorage.getItem(AUTH_KEYS.paymentStatus) || 'Completed';
    const amount = localStorage.getItem(AUTH_KEYS.bookingPriceLabel) || localStorage.getItem(AUTH_KEYS.bookingAmount) || getServicePriceLabel(service);

    if (bookingIdEl) bookingIdEl.textContent = bookingId;
    if (customerNameEl) customerNameEl.textContent = customerName;
    if (mobileEl) mobileEl.textContent = mobile;
    if (serviceEl) serviceEl.textContent = service;
    if (paymentEl) paymentEl.textContent = payment;
    if (dateEl) dateEl.textContent = date;
    if (timeEl) timeEl.textContent = time;
    if (addressEl) addressEl.textContent = address;
    if (statusEl) statusEl.textContent = status;
    if (amountEl) amountEl.textContent = amount;

    window.setTimeout(animateSuccessScreen, 120);
  };

  const renderHomeDashboard = () => {
    const welcomeName = document.getElementById('welcomeName');
    const welcomeMobile = document.getElementById('welcomeMobile');
    const bookingSnapshot = document.getElementById('bookingSnapshot');
    if (!welcomeName && !welcomeMobile && !bookingSnapshot) return;

    const customerName = localStorage.getItem(AUTH_KEYS.name) || 'Guest';
    const mobile = localStorage.getItem(AUTH_KEYS.mobile) || 'Not available';
    const lastBooking = getBookingHistory()[0];

    if (welcomeName) welcomeName.textContent = `Welcome back, ${customerName}`;
    if (welcomeMobile) welcomeMobile.textContent = `Mobile: ${mobile}`;
    if (bookingSnapshot) {
      bookingSnapshot.innerHTML = lastBooking
        ? `<strong>Next up:</strong> ${lastBooking.service} on ${lastBooking.date}`
        : '<strong>Next up:</strong> Book your first premium service';
    }
  };

  const setupBookingWizard = () => {
    const bookingForm = document.getElementById('bookingForm');
    const serviceField = document.getElementById('service');
    const servicePriceField = document.getElementById('servicePrice');
    const address = document.getElementById('address');
    const date = document.getElementById('date');
    const time = document.getElementById('time');
    const serviceNameEl = document.getElementById('bookingServiceName');
    const servicePriceEl = document.getElementById('bookingPriceLabel');

    if (!bookingForm) return;

    const params = new URLSearchParams(window.location.search);
    const initialService = params.get('service') || localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Basic Cleaning';
    const initialPrice = params.get('price') || '';
    const selectedServiceDetails = getServiceDetails(initialService);
    const displayPrice = initialPrice || selectedServiceDetails.priceLabel;

    if (serviceField) serviceField.value = initialService;
    if (servicePriceField) servicePriceField.value = displayPrice;
    if (serviceNameEl) serviceNameEl.textContent = initialService;
    if (servicePriceEl) servicePriceEl.textContent = displayPrice;

    const updateBookingSummary = () => {
      if (serviceNameEl) serviceNameEl.textContent = serviceField?.value || 'Chimney Basic Cleaning';
      if (servicePriceEl) servicePriceEl.textContent = servicePriceField?.value || 'Price After Inspection';
    };

    [address, date, time].forEach((field) => {
      if (field) {
        field.addEventListener('input', updateBookingSummary);
        field.addEventListener('change', updateBookingSummary);
      }
    });

    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!date?.value) {
        showToast('Please select a booking date.', 'error');
        return;
      }
      if (!time?.value) {
        showToast('Please select a preferred time.', 'error');
        return;
      }
      if (!address?.value.trim()) {
        showToast('Please add your full address.', 'error');
        return;
      }

      const bookingId = `UC-${Math.floor(10000 + Math.random() * 90000)}`;
      const serviceValue = serviceField?.value || initialService;
      const bookingTime = new Date().toLocaleString();
      const booking = normalizeBookingRecord({
        id: bookingId,
        service: serviceValue,
        address: address.value.trim(),
        date: date.value,
        time: time.value,
        city: localStorage.getItem(AUTH_KEYS.city) || 'Not provided',
        mobile: localStorage.getItem(AUTH_KEYS.mobile) || 'N/A',
        customerName: localStorage.getItem(AUTH_KEYS.name) || 'Guest',
        paymentMethod: 'Pending selection',
        paymentStatus: 'Pending',
        bookingStatus: 'Pending',
        bookingTime,
        createdAt: bookingTime,
        serviceDate: date.value
      });

      const bookingAmount = getServiceAmount(serviceValue);
      const bookingPriceLabel = servicePriceField?.value || getServicePriceLabel(serviceValue);
      localStorage.setItem(AUTH_KEYS.bookingId, bookingId);
      localStorage.setItem(AUTH_KEYS.selectedService, booking.service);
      localStorage.setItem(AUTH_KEYS.address, booking.address);
      localStorage.setItem(AUTH_KEYS.date, booking.date);
      localStorage.setItem(AUTH_KEYS.time, booking.time);
      localStorage.setItem(AUTH_KEYS.location, localStorage.getItem(AUTH_KEYS.location) || '');
      localStorage.setItem(AUTH_KEYS.bookingAmount, String(bookingAmount));
      localStorage.setItem(AUTH_KEYS.bookingPriceLabel, bookingPriceLabel);
      localStorage.setItem(AUTH_KEYS.paymentMethod, 'Pending selection');
      localStorage.setItem(AUTH_KEYS.paymentStatus, 'Pending');
      localStorage.setItem(AUTH_KEYS.bookingTime, bookingTime);
      saveBookingHistory(booking);
      renderBookingHistory();
      renderAdminPanel();
      showToast('Booking saved. Continue to payment.', 'success');
      window.setTimeout(() => window.location.href = 'payment.html', 400);
    });
  };

  const setupPayments = () => {
    const confirmButton = document.getElementById('confirmPaymentButton');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const amountLabel = document.getElementById('paymentAmountLabel');
    if (!paymentOptions.length) return;

    const currentAmount = localStorage.getItem(AUTH_KEYS.bookingPriceLabel) || localStorage.getItem(AUTH_KEYS.bookingAmount) || '₹599';
    if (amountLabel) {
      amountLabel.textContent = currentAmount;
    }

    paymentOptions.forEach((option) => {
      option.addEventListener('click', (event) => {
        if (event.target.closest('button[data-copy], button[data-open]')) {
          return;
        }
        paymentOptions.forEach((item) => item.classList.remove('selected'));
        option.classList.add('selected');
        const input = option.querySelector('input');
        if (input) input.checked = true;
      });
    });

    document.querySelectorAll('button[data-copy]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(button.getAttribute('data-copy') || '');
          showToast('UPI ID copied successfully.', 'success');
        } catch (error) {
          showToast('Copy failed. Please copy manually.', 'error');
        }
      });
    });

    document.querySelectorAll('button[data-open]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const amount = Number(localStorage.getItem(AUTH_KEYS.bookingAmount) || '599');
        const upiLink = `upi://pay?pa=9701434006-2@OKAXIS&pn=Rajasekhar&am=${Number.isFinite(amount) ? amount : 599}&tn=Urban%20Chimney%20Service`;
        const deepLink = button.getAttribute('data-open') === 'phonepe'
          ? `phonepe://pay?pa=9701434006-2@OKAXIS&pn=Rajasekhar&am=${Number.isFinite(amount) ? amount : 599}&tn=Urban%20Chimney%20Service`
          : `tez://upi/pay?pa=9701434006-2@OKAXIS&pn=Rajasekhar&am=${Number.isFinite(amount) ? amount : 599}&tn=Urban%20Chimney%20Service`;
        window.location.href = deepLink;
        window.setTimeout(() => {
          window.location.href = upiLink;
        }, 800);
      });
    });

    if (confirmButton) {
      confirmButton.addEventListener('click', async () => {
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) {
          showToast('Please choose a payment method.', 'error');
          return;
        }

        const paymentMethod = selectedPayment.value;
        const bookingId = localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001';
        const bookingTime = localStorage.getItem(AUTH_KEYS.bookingTime) || new Date().toLocaleString();
        const bookingRecord = normalizeBookingRecord({
          id: bookingId,
          service: localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Basic Cleaning',
          address: localStorage.getItem(AUTH_KEYS.address) || 'Not provided',
          date: localStorage.getItem(AUTH_KEYS.date) || 'Today',
          time: localStorage.getItem(AUTH_KEYS.time) || 'As scheduled',
          mobile: localStorage.getItem(AUTH_KEYS.mobile) || 'N/A',
          customerName: localStorage.getItem(AUTH_KEYS.name) || 'Guest',
          amount: localStorage.getItem(AUTH_KEYS.bookingPriceLabel) || localStorage.getItem(AUTH_KEYS.bookingAmount) || '₹599',
          paymentMethod,
          paymentStatus: 'Completed',
          bookingStatus: 'Pending',
          bookingTime,
          createdAt: bookingTime,
          serviceDate: localStorage.getItem(AUTH_KEYS.date) || new Date().toISOString().slice(0, 10)
        });

        localStorage.setItem(AUTH_KEYS.paymentMethod, paymentMethod);
        localStorage.setItem(AUTH_KEYS.paymentStatus, 'Completed');
        localStorage.setItem(AUTH_KEYS.bookingTime, bookingTime);
        saveBookingHistory(bookingRecord);
        renderBookingHistory();
        renderAdminPanel();

        showLoading('Finalizing your booking...');
        try {
          await sendBookingConfirmationEmails(bookingRecord);
          showToast('Payment received. Your booking is confirmed.', 'success');
        } catch (error) {
          console.error('Unable to send booking emails.', error);
          showToast('Booking confirmed. Email delivery could not be completed automatically.', 'error');
        } finally {
          hideLoading();
          window.setTimeout(() => {
            window.location.href = 'success.html';
          }, 400);
        }
      });
    }
  };

  const setupReceiptDownload = () => {
    const button = document.getElementById('downloadReceiptButton');
    if (!button) return;

    button.addEventListener('click', () => {
      const bookingId = localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001';
      const customerName = localStorage.getItem(AUTH_KEYS.name) || 'Guest';
      const mobile = localStorage.getItem(AUTH_KEYS.mobile) || 'N/A';
      const service = localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Basic Cleaning';
      const date = localStorage.getItem(AUTH_KEYS.date) || 'Today';
      const time = localStorage.getItem(AUTH_KEYS.time) || 'As scheduled';
      const address = localStorage.getItem(AUTH_KEYS.address) || 'Not provided';
      const paymentMethod = localStorage.getItem(AUTH_KEYS.paymentMethod) || 'UPI';
      const paymentStatus = localStorage.getItem(AUTH_KEYS.paymentStatus) || 'Completed';
      const amount = localStorage.getItem(AUTH_KEYS.bookingPriceLabel) || localStorage.getItem(AUTH_KEYS.bookingAmount) || '₹599';
      const receiptMarkup = `
        <div class="receipt-shell">
          <div class="receipt-card">
            <div class="receipt-logo">
              <span class="receipt-logo-mark">UC</span>
              <div>
                <div>Urban Chimney</div>
                <div class="receipt-subtitle">Booking Receipt</div>
              </div>
            </div>
            <h2 class="receipt-title">Booking Receipt</h2>
            <p class="receipt-subtitle">Professional service confirmation for your chimney care needs.</p>
            <div class="receipt-section">
              <h3>Booking ID</h3>
              <div class="receipt-row"><span class="receipt-label">Booking ID</span><span class="receipt-value">${bookingId}</span></div>
            </div>
            <div class="receipt-section">
              <h3>Customer Details</h3>
              <div class="receipt-row"><span class="receipt-label">Customer Name</span><span class="receipt-value">${customerName}</span></div>
              <div class="receipt-row"><span class="receipt-label">Mobile Number</span><span class="receipt-value">${mobile}</span></div>
            </div>
            <div class="receipt-section">
              <h3>Service Details</h3>
              <div class="receipt-row"><span class="receipt-label">Service</span><span class="receipt-value">${service}</span></div>
              <div class="receipt-row"><span class="receipt-label">Address</span><span class="receipt-value">${address}</span></div>
            </div>
            <div class="receipt-section">
              <h3>Payment Details</h3>
              <div class="receipt-row"><span class="receipt-label">Payment Method</span><span class="receipt-value">${paymentMethod}</span></div>
              <div class="receipt-row"><span class="receipt-label">Booking Status</span><span class="receipt-value">${paymentStatus}</span></div>
            </div>
            <div class="receipt-section">
              <h3>Booking Date &amp; Time</h3>
              <div class="receipt-row"><span class="receipt-label">Booking Date</span><span class="receipt-value">${date}</span></div>
              <div class="receipt-row"><span class="receipt-label">Booking Time</span><span class="receipt-value">${time}</span></div>
            </div>
            <div class="receipt-section">
              <h3>Total Amount</h3>
              <div class="receipt-row"><span class="receipt-label">Amount</span><span class="receipt-value">${amount}</span></div>
            </div>
            <div class="receipt-footer">
              <p>Thank you for choosing Urban Chimney.</p>
              <p>Customer Support: +91 90000 12345</p>
            </div>
          </div>
        </div>`;
      const blob = new Blob([receiptMarkup], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'urban-chimney-receipt.html';
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('Receipt downloaded successfully.', 'success');
    });
  };

  const sendBookingConfirmationEmails = async (booking) => {
    const emailService = window.UrbanChimneyEmail;
    const customerName = booking.customerName || localStorage.getItem(AUTH_KEYS.name) || 'Guest';
    const mobileNumber = booking.mobile || localStorage.getItem(AUTH_KEYS.mobile) || 'N/A';
    const amount = booking.amount || localStorage.getItem(AUTH_KEYS.bookingPriceLabel) || localStorage.getItem(AUTH_KEYS.bookingAmount) || getServicePriceLabel(booking.service);
    const paymentMethod = booking.paymentMethod || localStorage.getItem(AUTH_KEYS.paymentMethod) || 'Pending selection';
    const bookingTime = booking.bookingTime || localStorage.getItem(AUTH_KEYS.bookingTime) || new Date().toLocaleString();
    const paymentStatus = booking.paymentStatus || localStorage.getItem(AUTH_KEYS.paymentStatus) || 'Completed';

    const bookingPayload = {
      customerName,
      mobile: mobileNumber,
      address: booking.address || localStorage.getItem(AUTH_KEYS.address) || 'Not provided',
      service: booking.service || localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning',
      date: booking.date || localStorage.getItem(AUTH_KEYS.date) || 'Today',
      time: booking.time || localStorage.getItem(AUTH_KEYS.time) || 'As scheduled',
      paymentMethod,
      paymentStatus,
      id: booking.id || localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001',
      bookingTime,
      createdAt: bookingTime
    };

    if (!emailService || typeof emailService.buildEmailParams !== 'function') {
      throw new Error('Email service helper is unavailable.');
    }

    if (!emailService.isConfigured()) {
      console.warn('EmailJS is not configured yet. Update the placeholder values in email-service.js before deployment.');
      return;
    }

    if (!window.emailjs || typeof window.emailjs.init !== 'function' || typeof window.emailjs.send !== 'function') {
      throw new Error('EmailJS SDK is not available.');
    }

    window.emailjs.init(emailService.EMAILJS_CONFIG.publicKey);
    const ownerEmail = emailService.buildEmailParams(bookingPayload);
    await window.emailjs.send(emailService.EMAILJS_CONFIG.serviceId, emailService.EMAILJS_CONFIG.templateId, ownerEmail.params);
  };

  const initAuth = () => {
    if (currentPage === 'index.html') {
      redirectBasedOnSession();
      return;
    }

    if (protectedPages.includes(currentPage)) {
      redirectBasedOnSession();
      window.setInterval(checkSession, 1000);
    }
  };

  const initHeaderActions = () => {
    document.querySelectorAll('#logoutButton').forEach((button) => {
      button.addEventListener('click', () => {
        clearAuthState();
        clearOwnerSession();
        window.location.href = 'index.html';
      });
    });
  };

  const initDrawerMenu = () => {
    const drawerToggle = document.getElementById('drawerToggle');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerItems = document.querySelectorAll('.drawer-item');

    if (!drawerToggle || !drawerClose || !drawerOverlay || !sideDrawer) return;

    const closeDrawer = () => {
      sideDrawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
      drawerOverlay.setAttribute('aria-hidden', 'true');
      sideDrawer.setAttribute('aria-hidden', 'true');
    };

    const openDrawer = () => {
      sideDrawer.classList.add('open');
      drawerOverlay.classList.add('active');
      document.body.classList.add('drawer-open');
      drawerOverlay.setAttribute('aria-hidden', 'false');
      sideDrawer.setAttribute('aria-hidden', 'false');
    };

    drawerToggle.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    drawerItems.forEach((item) => {
      item.addEventListener('click', (event) => {
        const action = item.dataset.action;
        if (action === 'logout') {
          event.preventDefault();
          clearAuthState();
          clearOwnerSession();
          window.location.href = 'index.html';
          return;
        }
        closeDrawer();
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sideDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  };

  const initLogin = () => {
    if (!loginForm) return;
    let otpSent = false;

    const updateSendOtpButtonState = () => {
      if (!sendOtpButton) return;
      sendOtpButton.disabled = !/^[0-9]{10}$/.test(mobileInput?.value.trim() || '');
    };

    const updateVerifyButtonState = () => {
      if (!verifyOtpButton || !otpInput) return;
      verifyOtpButton.disabled = !otpSent || otpInput.value.trim().length !== 6;
    };

    if (mobileInput) {
      mobileInput.addEventListener('input', () => {
        updateSendOtpButtonState();
        if (!otpSent) {
          toggleOtpFields(false);
        }
      });
    }

    if (otpInput) {
      otpInput.addEventListener('input', updateVerifyButtonState);
    }

    if (sendOtpButton) {
      sendOtpButton.addEventListener('click', async () => {
        const mobile = mobileInput?.value.trim() || '';
        if (!/^[0-9]{10}$/.test(mobile)) {
          setFormMessage('Please enter a valid 10-digit mobile number.', 'error');
          showToast('Please enter a valid 10-digit mobile number.', 'error');
          return;
        }

        showLoading('Sending OTP...');
        const result = await requestOtp(mobile);
        hideLoading();
        otpSent = true;
        toggleOtpFields(true);
        if (otpInput) {
          otpInput.value = '';
          otpInput.focus();
        }
        updateVerifyButtonState();
        startResendCountdown(sendOtpButton);
        setFormMessage(result.message, 'success');
      });
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const mobile = mobileInput?.value.trim() || '';
      const otp = otpInput?.value.trim() || '';

      if (!/^[0-9]{10}$/.test(mobile)) {
        setFormMessage('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }
      if (!otpSent) {
        setFormMessage('Please request the OTP first.', 'error');
        return;
      }
      if (!/^[0-9]{6}$/.test(otp)) {
        setFormMessage('Please enter a valid 6-digit OTP.', 'error');
        return;
      }

      showLoading('Verifying OTP...');
      const isValidOtp = await verifyOtp(otp);
      hideLoading();
      if (!isValidOtp) {
        setFormMessage('Incorrect OTP. Use 123456 for the demo.', 'error');
        return;
      }

      if (isOwnerMobile(mobile)) {
        saveOwnerSession();
        setFormMessage('Login successful. Redirecting...', 'success');
        showToast('Login successful. Redirecting...', 'success');
        window.setTimeout(() => window.location.href = 'admin.html', 500);
        return;
      }

      saveAuthSession(mobile);
      localStorage.setItem(AUTH_KEYS.name, 'Guest');
      localStorage.setItem(AUTH_KEYS.city, 'Not provided');
      setFormMessage('Login successful. Redirecting to your dashboard...', 'success');
      showToast('Login successful. Redirecting to your dashboard...', 'success');
      window.setTimeout(() => window.location.href = 'home.html', 500);
    });

    updateSendOtpButtonState();
    updateVerifyButtonState();
    toggleOtpFields(false);
  };

  const initLocation = () => {
    if (!locationButton || !locationField) return;
    locationButton.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported on this device.', 'error');
        return;
      }
      showLoading('Finding your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          hideLoading();
          locationField.value = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          showToast('Location attached successfully.', 'success');
        },
        () => {
          hideLoading();
          showToast('Location access was denied. Please add it manually.', 'error');
        }
      );
    });
  };

  const initProfileExperience = () => {
    const avatarInput = document.getElementById('profileImageInput');
    const removeAvatarButton = document.getElementById('removeProfileImageButton');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const settingsForm = document.getElementById('settingsForm');
    const profileAvatar = document.querySelector('.profile-avatar');

    if (avatarInput && profileAvatar) {
      avatarInput.addEventListener('change', (event) => {
        const [file] = event.target.files || [];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          localStorage.setItem(AUTH_KEYS.profileImage, dataUrl);
          profileAvatar.src = dataUrl;
          showToast('Profile photo updated.', 'success');
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeAvatarButton && profileAvatar) {
      removeAvatarButton.addEventListener('click', () => {
        localStorage.removeItem(AUTH_KEYS.profileImage);
        profileAvatar.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80';
        showToast('Profile photo removed.', 'success');
      });
    }

    if (saveSettingsButton && settingsForm) {
      saveSettingsButton.addEventListener('click', () => {
        const name = document.getElementById('settingsName')?.value.trim() || 'Guest';
        const mobile = document.getElementById('settingsMobile')?.value.trim() || '';
        const email = document.getElementById('settingsEmail')?.value.trim() || '';
        const address = document.getElementById('settingsAddress')?.value.trim() || '';

        if (!/^[0-9]{10}$/.test(mobile)) {
          showToast('Please enter a valid 10-digit mobile number.', 'error');
          return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast('Please enter a valid email address.', 'error');
          return;
        }

        localStorage.setItem(AUTH_KEYS.name, name);
        localStorage.setItem(AUTH_KEYS.mobile, mobile);
        localStorage.setItem(AUTH_KEYS.customerEmail, email);
        localStorage.setItem(AUTH_KEYS.customerAddress, address);
        localStorage.setItem(AUTH_KEYS.city, document.getElementById('settingsCity')?.value.trim() || 'Not provided');
        fillProfileFields();
        renderHomeDashboard();
        renderBookingHistory();
        showToast('Profile settings saved successfully.', 'success');
      });
    }

    document.getElementById('bookingHistoryList')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const bookingId = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'cancel-booking') {
        const shouldCancel = window.confirm('Cancel this booking?');
        if (!shouldCancel) return;
        updateBookingRecord(bookingId, { bookingStatus: 'Cancelled', paymentStatus: 'Refund Pending' });
        renderBookingHistory();
        renderAdminPanel();
        showToast('Booking cancelled successfully.', 'success');
      }
      if (action === 'reschedule-booking') {
        const booking = getBookingHistory().find((item) => item.id === bookingId);
        if (!booking) return;
        const nextDate = window.prompt('Select a new date (YYYY-MM-DD)', booking.date || '');
        if (!nextDate) return;
        const nextTime = window.prompt('Select a new time (HH:MM)', booking.time || '');
        if (!nextTime) return;
        updateBookingRecord(bookingId, { date: nextDate, time: nextTime, bookingStatus: 'Pending' });
        renderBookingHistory();
        renderAdminPanel();
        showToast('Booking rescheduled successfully.', 'success');
      }
      if (action === 'view-booking') {
        const booking = getBookingHistory().find((item) => item.id === bookingId);
        if (!booking) return;
        window.alert(`Booking ID: ${booking.id}\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}\nStatus: ${booking.bookingStatus}\nTechnician: ${booking.technician || 'Pending'}\nAddress: ${booking.address}`);
      }
    });
  };

  initAuth();
  initHeaderActions();
  initDrawerMenu();
  initLogin();
  initLocation();
  initProfileExperience();
  fillProfileFields();
  renderBookingHistory();
  renderTracking();
  renderSuccessPage();
  renderHomeDashboard();
  setupBookingWizard();
  setupPayments();
  setupReceiptDownload();
  setupAdminPanel();
  renderAdminPanel();

  const toastStack = document.getElementById('toastStack');
  if (!toastStack) {
    const stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }

  window.addEventListener('beforeunload', hideLoading);
});
