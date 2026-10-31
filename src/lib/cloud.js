import { supabase, emailFor } from './supabase.js';

// Turn raw Supabase/network errors into messages a user can act on.
function friendly(error, fallback) {
  const msg = (error && error.message) || '';
  if (error instanceof TypeError || /failed to fetch|network|load failed/i.test(msg)) {
    return 'Could not reach the server. Check your internet connection and try again.';
  }
  if (/invalid api key|apikey/i.test(msg)) return 'Server key is wrong. Check the project settings.';
  return fallback || msg || 'Something went wrong. Try again.';
}

export const USERNAME_RULE = /^[a-z0-9_]{3,20}$/;

export async function signUp(username, displayName, password) {
  let result;
  try {
    result = await supabase.auth.signUp({
      email: emailFor(username),
      password,
      options: { data: { username, display_name: displayName } },
    });
  } catch (e) {
    throw new Error(friendly(e));
  }
  const { data, error } = result;
  if (error) {
    if (/already/i.test(error.message)) throw new Error('That username is taken. Try another one.');
    throw new Error(friendly(error));
  }
  return data.session;
}

export async function signIn(username, password) {
  let result;
  try {
    result = await supabase.auth.signInWithPassword({ email: emailFor(username), password });
  } catch (e) {
    throw new Error(friendly(e));
  }
  const { data, error } = result;
  if (error) throw new Error(friendly(error, 'Username or password is wrong.'));
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Public profile: username and display name only (never the password or email).
export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('username, display_name').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

// Private progress: attempts, bests, sound and theme for this one account.
export async function loadData(userId) {
  const { data, error } = await supabase.from('app_data').select('data').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? data.data : {};
}

export async function saveData(userId, data) {
  const { error } = await supabase
    .from('app_data')
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}
