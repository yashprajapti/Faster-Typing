// Music source: YouTube songs play as audio only. The player lives in a 1px hidden box, so no video is shown.
export const SONGS = [
  'AJVU4i237lc', '4NRXx6U8ABQ', '16jA-6hiSUo', 'Lk6KHRW0MB0', '48ydDUQ16RE',
  '-DPOPsDw2Y4', 'SOJpE1KMUbo', '158plNHX4vw', 'PP2fELH8uTQ', 'RgKAFK5djSk',
  '3AtDnEC4zak', 'dhYOPzcsbGM', 'PfGaX8G0f2E', 'XXYlFuWEuKI', 'nkjwn240AMc',
  'MlgywoV_2h0',
  'RFz-7TXjqMM',
  'uj3FIwVKjDo',
  'PT2_F-1esPk',
  'JGwWNGJdvx8',
  'XwxLwG2_Sxk',
  'BUFKqQPGN2k',
  '-Y4TYhbP2zc',
  'PrDUPEj8188',
  'b5PbJglCjjY',
  'AsEd5OAys9E',
  'p2EdDiiVHh4',
  'lKml0bQT63k',
  '5gIpqS-Qpzw',
  '2VuqX_ygwSc',
].map((id, i) => ({ id, title: `Song ${i + 1}` }));

// Accepts watch, youtu.be, shorts and embed links. Playlist or radio parameters are ignored; only the video plays.
export function parseYouTubeId(url) {
  const m = String(url || '').trim().match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

let player = null;
let ready = false;
let queued = null;
let creating = null;
let handlers = {};

function loadApi() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => reject(new Error('YouTube could not be reached'));
    document.head.appendChild(s);
  });
}

// Creates the hidden player once. onState receives YouTube state codes: 0 ended, 1 playing, 2 paused.
export function ensurePlayer(h) {
  handlers = h || {};
  if (!creating) {
    creating = loadApi().then(() => new Promise((resolve) => {
      let host = document.getElementById('yt-audio-host');
      if (!host) {
        host = document.createElement('div');
        host.id = 'yt-audio-host';
        host.setAttribute('aria-hidden', 'true');
        host.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-10px;top:-10px;';
        document.body.appendChild(host);
      }
      const el = document.createElement('div');
      host.appendChild(el);
      player = new window.YT.Player(el, {
        width: 1,
        height: 1,
        playerVars: { controls: 0, playsinline: 1, rel: 0, modestbranding: 1, disablekb: 1, iv_load_policy: 3 },
        events: {
          onReady: () => {
            ready = true;
            if (queued) { player.loadVideoById(queued); queued = null; }
            resolve(player);
          },
          onStateChange: (e) => { if (handlers.onState) handlers.onState(e.data); },
        },
      });
    }));
  }
  return creating;
}

// Starts a song from the very beginning. Works even if the player is still loading.
export function playVideo(id) {
  ensurePlayer(handlers).catch(() => {});
  if (ready && player) player.loadVideoById(id);
  else queued = id;
}

export function resumeVideo() { if (ready && player) player.playVideo(); }
export function pauseVideo() { if (ready && player) player.pauseVideo(); }
