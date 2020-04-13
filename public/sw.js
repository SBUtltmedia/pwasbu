const staticCacheName = 'site-static-v4';
const dynamicCacheName = 'site-dynamic-v4';
// TODO: Add firebase js files in assets locally and locally to index.html
const assets = [
    '/',
    '/index.html',
    '/js/index.js',
    '/js/router.js',
    '/js/routes.js',
    '/js/templates.js',
    '/js/menu.js',
    '/js/bootstrap.min.js',
    '/js/jquery-3.4.1.min.js',
    '/css/app.css',
    '/css/bluetooth.css',
    '/css/login.css',
    '/css/menu.css',
    '/css/bootstrap.min.css',
    '/img/logobackground.png',
    '/templates/About.html',
    '/templates/Contact.html',
    '/templates/Home.html',
    '/Product.html'
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

self.addEventListener('install', evt => {
    console.log('install completed');
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
});

// activate event
self.addEventListener('activate', evt => {
    console.log('activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// fetch events
self.addEventListener('fetch', evt => {
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        // check cached items size
                        limitCacheSize(dynamicCacheName, 15);
                        return fetchRes;
                    })
                });
            }).catch(() => {
                if(evt.request.url.indexOf('.html') > -1){
                    console.log("An error has occurred when fetching");
                }
            })
        );
    }
});
