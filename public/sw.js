/*
 * Cache naming convention: {CACHENAME}-v{MAJOR RELEASE}.{MINOR RELEASE}.{PUSH}.{BUILD}
 *     MAJOR RELEASE => Update before deploying every large series of changes
 *     MINOR RELEASE => Update before deploying every small series of changes
 *     PUSH => Update everytime a branch is merged into master
 *     BUILD => Update as necessary for local development
 */
const staticCacheName = 'site-static-v1.1.0.0';
const dynamicCacheName = 'site-dynamic-v1.1.0.0';

// // TODO: Add firebase js files in assets locally and locally to index.html
const assets = [
    // Static HTML files to cache
    '/',
    '/index.html',
    '/templates/AccountSettings.html',
    '/templates/Contact.html',
    '/templates/ControlPanel.html',
    '/templates/EditProfile.html',
    '/templates/Evaluation.html',
    '/templates/ForgotPassword.html',
    '/templates/Home.html',
    '/templates/Login.html',
    '/templates/MissingInfo.html',
    '/templates/Navbar.html',
    '/templates/UserDetails.html',
    // Static CSS files to cache
    '/style.css',
    '/css/app.css',
    '/css/controlpanel.css',
    '/css/editProfile.css',
    '/css/evaluation.css',
    '/css/home.css',
    '/css/login.css',
    '/css/navbar.css',
    '/css/table.css',
    '/css/thirdParty/jquery.dataTables.min.css',
    '/css/thirdParty/micromodal.css',
    '/css/thirdParty/selectr.min.css',
    // Static JavaScript files to cache
    '/js/controlpanel.js',
    '/js/evaluation.js',
    '/js/index.js',
    '/js/login.js',
    '/js/navbar.js',
    '/js/router.js',
    '/js/routes.js',
    '/js/settings.js',
    '/js/template.js',
    '/js/templates.js',
    '/js/thirdParty/bluetooth.js',
    '/js/thirdParty/bootstrap.min.js',
    '/js/thirdParty/bootstrap.min.js.map',
    '/js/thirdParty/FileSaver.js',
    '/js/thirdParty/jquery-3.4.1.min.js',
    '/js/thirdParty/jquery.dataTables.min.js',
    '/js/thirdParty/jszip.js',
    '/js/thirdParty/micromodal.min.js',
    '/js/thirdParty/processing.min.js',
    // Static images to cache
    'img/infobutton.png',
    '/img/logobackground.png',
    '/img/icons/icon-72x72.png',
    '/img/icons/icon-96x96.png',
    '/img/icons/icon-128x128.png',
    '/img/icons/icon-144x144.png',
    '/img/icons/icon-152x152.png',
    '/img/icons/icon-192x192.png',
    '/img/icons/icon-384x384.png',
    '/img/icons/icon-512x512.png',
    '/img/user/default/user-480.png'
];

// Limit Dynamic Cache Size
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

// Install Event
self.addEventListener('install', evt => {
    console.log('SW Installed');

    // Skipping waiting for older service worker to shut down
    self.skipWaiting();

    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('Caching Assets');
            cache.addAll(assets.map(function (asset) {
                return new Request(asset, { mode: 'no-cors' });
            }));
        })
    );
});

// Activate
self.addEventListener('activate', evt => {
    console.log('SW Activated');
    evt.waitUntil(
        // Getting all keys in caches
        caches.keys().then(keys => {
            // Removing any old caches that are not the most recent version (whatever version is specified in the more recent sw.js file)
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Ensuring that newest service worker is in use whenever abailable
self.addEventListener('activate', async () => {
    // After we've taken over, iterate over all the current clients (windows)
    const tabs = await self.clients.matchAll({type: 'window'});
    tabs.forEach((tab) => {
        // ...and refresh each one of them
        tab.navigate(tab.url);
    });
});

// Fetch (Network first solution)
self.addEventListener('fetch', evt => {
    // console.log('Fetch Event', evt);

    // Don't want to check or add to cahce for resources with firestore.googleapis.com in the URL
    if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
        evt.respondWith(
            // First try to send out fetch request over the internet
            fetch(evt.request).then((fetchRes) => {
                // console.log("Fetch Result");
                // console.log(fetchRes);

                // Successfully acquired resource from the network
                return caches.open(staticCacheName).then((staticCache) => {
                    return staticCache.match(evt.request).then((cacheRes) => {
                        // If in cache, then match should not return undefined
                        if (cacheRes != undefined) {
                            // Resource already stored in static cache, so do not add to dynamic cache
                            // console.log("Already in static cache: ");
                            // console.log(cacheRes);

                            // Returning result from querying network
                            // console.log("Returning Fetch Result: ");
                            // console.log(fetchRes);
                            return fetchRes;
                        } else {
                        // If not in cache, then match should return undefined
                            // Resource not stored in static cache, so add to dynamic cache
                            return caches.open(dynamicCacheName).then((dynamicCache) => {
                                // console.log("Adding to Dynamic Cache");
                                // Adding resource to dynamic cache
                                dynamicCache.put(evt.request.url, fetchRes.clone());
                                limitCacheSize(dynamicCacheName, 15);

                                // Returning result from querying network
                                // console.log("Returning Fetch Result: ");
                                // console.log(fetchRes);
                                return fetchRes;
                            }).catch((e) => {
                                console.log("Failed to add to dynamic cache: ");
                                console.log(e);

                                // Returning result from querying network
                                // console.log("Returning Fetch Result: ");
                                return fetchRes;
                            });
                        }
                    }).catch((e) => {
                        // Resource not stored in static cache, so add to dynamic cache
                        return caches.open(dynamicCacheName).then((dynamicCache) => {
                            // console.log("Adding to Dynamic Cache");
                            // Adding resource to dynamic cache
                            dynamicCache.put(evt.request.url, fetchRes.clone());
                            limitCacheSize(dynamicCacheName, 15);

                            // // Returning result from querying network
                            // console.log("Returning Fetch Result: ");
                            // console.log(fetchRes);
                            return fetchRes;
                        }).catch((e) => {
                            console.log("Failed to add to dynamic cache: ");
                            console.log(e);
                            return fetchRes;
                        });
                    });
                }).catch((e) => {
                    console.log("Failed to open static cache: ");
                    console.log(e);
                    return fetchRes;
                });
            }).catch((e) => {
            // If fetch request fails then search caches
                console.log("Failed to make fetch request: ");
                console.log(e);
                // Searching caches for resource
                return caches.match(evt.request).then((cacheRes) => {
                    // If in cache, then match should not return undefined
                    if (cacheRes != undefined) {
                        console.log("Returning Cache Result: ");
                        console.log(cacheRes);
                        return cacheRes
                    } else {
                    // If not in cache, then match should return undefined
                        throw "Not found in cache";
                    }
                }).catch((e) => {
                    console.log("Failed to find in caches: ");
                    console.log(e);
                    return undefined;
                })
            })
        );
    }
});

// // Fetch (Cache first solution)
// self.addEventListener('fetch', evt => {
//     // console.log('Fetch Event', evt);
//     if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
//         evt.respondWith(
//             caches.match(evt.request).then(cacheRes => {
//                 return cacheRes || fetch(evt.request).then(fetchRes => {
//                     console.log("Fetch Result");
//                     return caches.open(dynamicCacheName).then(cache => {
//                         console.log("Cache Result");
//                         cache.put(evt.request.url, fetchRes.clone());
//                         limitCacheSize(dynamicCacheName, 15);
//                         return fetchRes;
//                     }).catch((e) => console.log(e)); //catch cache() error
//                 }).catch((e) => console.log(e)); //catch fetch() error
//             }).catch((e) => console.log(e)) //catch match() error
//         );
//     }
// });