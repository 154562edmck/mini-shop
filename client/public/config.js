window.APP_CONFIG = {
    API_URL: window.location.origin + '/v1',
    ASSET_PREFIX: window.location.origin,
    WECHAT_APP_ID: 'wx24cf9fafe860e29d'
}; (function () {
    const config = window.APP_CONFIG;
    console.log('APP_CONFIG', config);
})();
/**
 * 手势缩放-禁止缩放
 */
document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
    document.body.style.zoom = 0.99;
});

document.addEventListener("gesturechange", function (e) {
    e.preventDefault();

    document.body.style.zoom = 0.99;
});
document.addEventListener("gestureend", function (e) {
    e.preventDefault();
    document.body.style.zoom = 1;
});