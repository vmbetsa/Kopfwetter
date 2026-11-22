const C = "kopfwetter-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch (x) { d = { title: "Kopfwetter", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Kopfwetter", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || "kw", data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow(e.notification.data && e.notification.data.url || "./");
  }));
});
