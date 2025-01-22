module.exports = function override(config) {
    config.resolve.fallback = {
        net: false, // 브라우저에서 'net' 모듈 무시
    };
    return config;
};
