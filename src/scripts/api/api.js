const SERVICE_URL = 'https://story-api.dicoding.dev/v1';

export function getStoredToken() {
  return localStorage.getItem('bt_token') || null;
}

export async function loginUser({ email, password, persist = true }) {
  const res = await fetch(`${SERVICE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data && data.message ? data.message : 'Login failed';
    const err = new Error(msg);
    err.response = data;
    throw err;
  }

  const token = data.loginResult && data.loginResult.token;
  if (persist && token) {
    localStorage.setItem('bt_token', token);
    localStorage.setItem('bt_user', data.loginResult.name || '');
  }

  return data.loginResult;
}

export async function registerUser({ name, email, password }) {
  const res = await fetch(`${SERVICE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data && data.message ? data.message : 'Register failed';
    const err = new Error(msg);
    err.response = data;
    throw err;
  }
  return data;
}

export async function fetchStories({ page = 1, size = 20, location = 1 } = {}) {
  try {
    const token = getStoredToken();
    if (!token) {
      console.warn('fetchStories: token not found in localStorage');
      return [];
    }

    const qs = `?page=${page}&size=${size}&location=${location}`;
    const res = await fetch(`${SERVICE_URL}/stories${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn('fetchStories: API returned error', data);
      return data.listStory || [];
    }

    return data.listStory || [];
  } catch (err) {
    console.error('fetchStories error', err);
    return [];
  }
}

export async function submitStory({ description, photoFile, lat, lon }) {
  try {
    const token = getStoredToken();
    if (!token) throw new Error('Token tidak tersedia. Silakan login.');

    const fd = new FormData();
    fd.append('description', description);
    if (photoFile) fd.append('photo', photoFile);
    if (lat !== undefined && lat !== null) fd.append('lat', lat);
    if (lon !== undefined && lon !== null) fd.append('lon', lon);

    const res = await fetch(`${SERVICE_URL}/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data && data.message ? data.message : 'Gagal mengirim story';
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    console.error('submitStory error:', err);
    throw err;
  }
}

export async function submitGuestStory({ description, photoFile, lat, lon }) {
  try {
    const fd = new FormData();
    fd.append('description', description);
    if (photoFile) fd.append('photo', photoFile);
    if (lat !== undefined && lat !== null) fd.append('lat', lat);
    if (lon !== undefined && lon !== null) fd.append('lon', lon);

    const res = await fetch(`${SERVICE_URL}/stories/guest`, {
      method: 'POST',
      body: fd,
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data && data.message ? data.message : 'Gagal mengirim story guest';
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    console.error('submitGuestStory error:', err);
    throw err;
  }
}
