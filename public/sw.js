const staticCacheName = 'site-static-v7.4';
const dynamicCacheName = 'site-dynamic-v5.5';
// // TODO: Add firebase js files in assets locally and locally to index.html
const assets = [
    '/',
    'index.html',
    '/js/login.js',
    '/js/index.js',
    '/js/router.js',
    '/js/routes.js',
    '/js/templates.js',
    '/js/menu.js',
    '/js/jquery-3.4.1.min.js',
    '/style.css',
    '/css/app.css',
    '/css/bluetooth.css',
    '/css/login.css',
    '/css/menu.css',
    '/css/bootstrap.min.css',
    '/img/logobackground.png',
    '/templates/About.html',
    '/templates/Contact.html',
    '/templates/Home.html',
    '/templates/Product.html',
    '/js/bluetooth.js',
    '/js/controlpanel.js',
    '/js/evaluation.js',
    '/js/navbar.js',   
    '/js/settings.js',
    '/css/controlpanel.css',
    '/css/evaluation.css',
    '/css/home.css',
    '/css/jquery.dataTables.min.css',
    '/css/navbar.css',
    '/css/selectr.min.css',
    '/css/table.css',
    '/templates/ControlPanel.html',
    '/templates/EditProfile.html',
    '/templates/Evaluation.html',
    '/templates/ForgotPassword.html',
    '/templates/Login.html',
    '/templates/MissingInfo.html',
    '/templates/Navbar.html',
    '/templates/UserDetails.html'
];

// Limit Dynamic Cache Size
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

// Install Event
self.addEventListener('install', evt => {
    console.log('SW Installed');
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('Caching Assets');
            cache.addAll(assets.map(function(asset){
                return new Request(asset, { mode: 'no-cors' });
            }));
        })
    );
});

// Activate
self.addEventListener('activate', evt => {
    console.log('SW Activated');
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

// Fetch
self.addEventListener('fetch', evt => {
    // console.log('Fetch Event', evt);
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    console.log("Fetch Result")
                    return caches.open(dynamicCacheName).then(cache => {
                        console.log("Cache Result")
                        cache.put(evt.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCacheName, 300);
                        return fetchRes;
                    }).catch((e) => console.log(e)); //catch cache() error
                }).catch((e) => console.log(e)); //catch fetch() error
            }).catch((e) => console.log(e)) //catch match() error
            );
    }
    
});