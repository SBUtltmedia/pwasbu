// Selected device object cache
let deviceCache = null;
// Characteristic object cache
let characteristicCache = null;

function scanDevices(){
    if("bluetooth" in navigator) {
        console.log("Bluetooth is accessible on this browser");
        return (deviceCache ? Promise.resolve(deviceCache) : requestBluetoothDevice()).
        then(device => connectDeviceAndCacheCharacteristic(device)).
        then(characteristic => startNotifications(characteristic)).
        catch(error => console.log(error));
    } else {
        alert("Bluetooth is not accessible on this browser!");
    }
}

function requestBluetoothDevice() {
    console.log('Requesting bluetooth device...');
    return navigator.bluetooth.requestDevice({
        acceptAllDevices: true // Needs to be changed to be Roflex specific in the future.
    }).
    then(device => {
        console.log('"' + device.name + '" bluetooth device selected');
        deviceCache = device;

        // Added line
        deviceCache.addEventListener('gattserverdisconnected',
            handleDisconnection);
        return deviceCache;
    });
}

function handleDisconnection(event) {
    let device = event.target;
    console.log('"' + device.name +
        '" bluetooth device disconnected, trying to reconnect...');
    connectDeviceAndCacheCharacteristic(device).
    then(characteristic => startNotifications(characteristic)).
    catch(error => log(error));
}

// Connect to the device specified, get service and characteristic
function connectDeviceAndCacheCharacteristic(device) {
    if (device.gatt.connected && characteristicCache) {
        return Promise.resolve(characteristicCache);
    }
    console.log('Connecting to GATT server...');
    return device.gatt.connect().
    then(server => {
        console.log('GATT server connected, getting service...');
        return server.getPrimaryService(0xFFE0);
    }).
    then(service => {
        console.log('Service found, getting characteristic...');
        return service.getCharacteristic(0xFFE1);
    }).
    then(characteristic => {
        console.log('Characteristic found');
        characteristicCache = characteristic;

        return characteristicCache;
    });
}

// Enable the characteristic changes notification
function startNotifications(characteristic) {
    console.log('Starting notifications...');

    return characteristic.startNotifications().
    then(() => {
        console.log('Notifications started');
    });
}
function disconnect() {
    if (deviceCache) {
        console.log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
        deviceCache.removeEventListener('gattserverdisconnected',
            handleDisconnection);
        if (deviceCache.gatt.connected) {
            deviceCache.gatt.disconnect();
            console.log('"' + deviceCache.name + '" bluetooth device disconnected');
        }
        else {
            console.log('"' + deviceCache.name +
                '" bluetooth device is already disconnected');
        }
    }
    characteristicCache = null;
    deviceCache = null;
}