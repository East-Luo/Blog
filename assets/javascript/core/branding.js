// branding.js —— 站点图标与标题：从经典曲线表中随机抽取一个设为 favicon，
// 标题优先显示单位化公式（无空格），文章聚焦时追加「· 文章名」。

import * as wm from './window-manager.js';
import * as data from './data.js';

// ---- 采样辅助：把参数/极坐标曲线采样成 SVG path ----

function sample(fn, start, end, steps) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const t = start + ((end - start) * i) / steps;
        pts.push(fn(t));
    }
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
}

function svgOf(...paths) {
    const body = paths
        .map((d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`)
        .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>`;
}

// 极坐标采样（中心 16,16）
function polar(rFn, start, end, steps) {
    return sample((t) => {
        const r = rFn(t);
        return [16 + r * Math.cos(t), 16 + r * Math.sin(t)];
    }, start, end, steps);
}

const C = 16; // 中心

// ---- 经典曲线表 ----

const FIGURES = [
    {
        name: '双曲线',
        formula: 'x²−y²=1',
        svg: svgOf(
            sample((t) => [C + 7 * Math.cosh(t), C + 7 * Math.sinh(t)], -1.4, 1.4, 60),
            sample((t) => [C - 7 * Math.cosh(t), C + 7 * Math.sinh(t)], -1.4, 1.4, 60)
        ),
    },
    {
        name: '心脏线',
        formula: 'r=1+cosθ',
        svg: svgOf(
            sample((t) => {
                const r = 8 * (1 + Math.cos(t));
                return [8 + r * Math.cos(t), C + r * Math.sin(t)];
            }, 0, 2 * Math.PI, 80)
        ),
    },
    {
        name: '伯努利双纽线',
        formula: 'r²=cos(2θ)',
        svg: svgOf(
            sample((t) => {
                const d = 1 + Math.sin(t) * Math.sin(t);
                return [C + (14.5 * Math.cos(t)) / d, C + (14.5 * Math.sin(t) * Math.cos(t)) / d];
            }, 0, 2 * Math.PI, 120)
        ),
    },
    {
        name: '玫瑰线',
        formula: 'r=cos(3θ)',
        svg: svgOf(
            polar((t) => 13 * Math.cos(3 * t), 0, Math.PI, 120)
        ),
    },
    {
        name: '阿基米德螺线',
        formula: 'r=θ',
        svg: svgOf(
            polar((t) => 1.25 * t, 0, 4 * Math.PI, 160)
        ),
    },
    {
        name: '笛卡尔叶形线',
        formula: 'x³+y³=3xy',
        svg: svgOf(
            // 主叶：前半（原点→最远点）+ 关于 y=x 的镜像（最远点→原点），闭合
            sample((t) => {
                const d = 1 + t * t * t;
                return [9 + (28 * t) / d, 9 + (28 * t * t) / d];
            }, 0, 1, 60),
            sample((t) => {
                const d = 1 + t * t * t;
                return [9 + (28 * t * t) / d, 9 + (28 * t) / d];
            }, 0, 1, 60)
        ),
    },
    {
        name: '星型线',
        formula: 'x²⁄³+y²⁄³=1',
        svg: svgOf(
            sample((t) => [C + 15 * Math.cos(t) ** 3, C + 15 * Math.sin(t) ** 3], 0, 2 * Math.PI, 120)
        ),
    },
    {
        name: '正弦曲线',
        formula: 'y=sinx',
        svg: svgOf(
            sample((t) => [C + (15 / Math.PI) * t, C + 15 * Math.sin(t)], -Math.PI, Math.PI, 120)
        ),
    },
];

function setFavicon(svg) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    document.head.appendChild(link);
}

export function initBranding() {
    const fig = FIGURES[Math.floor(Math.random() * FIGURES.length)];
    const label = fig.formula || fig.name;

    setFavicon(fig.svg);
    document.title = label;

    wm.subscribe((stack) => {
        const top = stack[stack.length - 1];
        if (top && top.type === 'article') {
            const meta = data.getMeta(top.id);
            document.title = meta ? `${label} · ${meta.title}` : label;
        } else {
            document.title = label;
        }
    });
}
