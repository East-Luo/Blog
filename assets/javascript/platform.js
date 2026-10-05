// platform.js —— 平台检测：以「操作逻辑」为准（触摸能力），而非屏幕宽度。

export function detectPlatform() {
    if (window.matchMedia('(pointer: coarse)').matches) return 'mobile';
    if (/mobile|android|iphone|ipad/i.test(navigator.userAgent)) return 'mobile';
    return 'desktop';
}
