const INFINITY = 1e5;

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function getSegmentIntercept(l1p1, l1p2, l2p1, l2p2) {
    // lerp & Cramer's rule implementation
    const m = l1p2.x - l1p1.x; // Bx - Ax
    const n = l2p1.x - l2p2.x; // Cx - Dx
    const p = l1p2.y - l1p1.y; // By - Ay
    const q = l2p1.y - l2p2.y; // Cy - Dy

    const bot = m * q - n * p;
    if (bot === 0) return null;

    const r = l2p1.x - l1p1.x; // Cx - Ax
    const s = l2p1.y - l1p1.y; // Cy - Ay

    const tTop = r * q - s * n;
    const uTop = s * m - r * p;

    if (
        (bot > 0 && (tTop < 0 || tTop > bot || uTop < 0 || uTop > bot)) ||
        (bot < 0 && (tTop > 0 || tTop < bot || uTop > 0 || uTop < bot))
    )
        return null;

    const t = tTop / bot;

    return {
        // flip cartesian-y to canvas-y
        x: lerp(l1p1.x, l1p2.x, t),
        y: lerp(l1p1.y, l1p2.y, t),
        offset: t,
    };
}

function isPolygonsCollide(shapeA, shapeB) {
    for (let i = 0; i < shapeA.length; i++) {
        for (let j = 0; j < shapeB.length; j++) {
            const hit = getSegmentIntercept(
                shapeA[i],
                shapeA[(i + 1) % shapeA.length],
                shapeB[j],
                shapeB[(j + 1) % shapeB.length]
            );
            if (hit) return true;
        }
    }
    return false;
}

function isAABBCollide(shapeA, shapeB) {
    for (let i = 0; i < shapeA.length; i++) {
        for (let j = 0; j < shapeB.length; j++) {
            if (
                shapeA[i].x < shapeB[j].x + shapeB[j].width &&
                shapeA[i].x + shapeA[i].width > shapeB[j].x &&
                shapeA[i].y < shapeB[j].y + shapeB[j].height &&
                shapeA[i].y + shapeA[i].height > shapeB[j].y
            ) {
                return true;
            }
        }
    }
    return false;
}
