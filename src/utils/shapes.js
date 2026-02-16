/**
 * Shape generators — component-based approach for clear animal silhouettes.
 * Each returns [x, y] points normalized to ~[-1, 1].
 */

// ─── Helpers ───

function pointsInCircle(cx, cy, r, count) {
    const pts = []
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const d = Math.sqrt(Math.random()) * r
        pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d])
    }
    return pts
}

function pointsInEllipse(cx, cy, rx, ry, count) {
    const pts = []
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const d = Math.sqrt(Math.random())
        pts.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d])
    }
    return pts
}

function pointsAlongLine(x1, y1, x2, y2, width, count) {
    const pts = []
    const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2
    for (let i = 0; i < count; i++) {
        const t = Math.random()
        const off = (Math.random() - 0.5) * width
        pts.push([
            x1 + (x2 - x1) * t + Math.cos(angle) * off,
            y1 + (y2 - y1) * t + Math.sin(angle) * off,
        ])
    }
    return pts
}

function pointsAlongCurve(cp, width, count) {
    const pts = []
    const n = cp.length - 1
    for (let i = 0; i < count; i++) {
        const sf = Math.random() * n
        const s = Math.min(Math.floor(sf), n - 1)
        const t = sf - s
        const a = cp[s], b = cp[s + 1]
        const dx = b[0] - a[0], dy = b[1] - a[1]
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = -dy / len, ny = dx / len
        const off = (Math.random() - 0.5) * width
        pts.push([
            a[0] + dx * t + nx * off,
            a[1] + dy * t + ny * off,
        ])
    }
    return pts
}

// ─── Heart ───
export function generateHeart(count = 150) {
    const pts = []
    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2
        let x = 16 * Math.pow(Math.sin(t), 3)
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
        x /= 17; y /= 17
        x += (Math.random() - 0.5) * 0.04
        y += (Math.random() - 0.5) * 0.04
        pts.push([x, y])
    }
    for (let i = 0; i < count * 0.3; i++) {
        const t = Math.random() * Math.PI * 2
        const r = Math.random() * 0.6
        pts.push([
            16 * Math.pow(Math.sin(t), 3) * r / 17,
            (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r / 17,
        ])
    }
    return pts
}

// ─── Chinese Dragon (rồng) ───
export function generateDragon(count = 220) {
    const pts = []

    // === HEAD (large, distinctive) ===
    pts.push(...pointsInCircle(-0.6, 0.55, 0.16, 25))   // skull
    pts.push(...pointsInEllipse(-0.78, 0.48, 0.08, 0.05, 10)) // snout/mouth

    // Horns (antler-style)
    pts.push(...pointsAlongLine(-0.68, 0.7, -0.78, 0.92, 0.04, 8))
    pts.push(...pointsAlongLine(-0.73, 0.85, -0.82, 0.88, 0.03, 4))
    pts.push(...pointsAlongLine(-0.5, 0.7, -0.42, 0.92, 0.04, 8))
    pts.push(...pointsAlongLine(-0.45, 0.85, -0.36, 0.88, 0.03, 4))

    // Eyes (bright spot)
    pts.push(...pointsInCircle(-0.58, 0.6, 0.03, 4))

    // Whiskers / beard (flowing down from chin)
    pts.push(...pointsAlongCurve([[-0.72, 0.42], [-0.82, 0.28], [-0.88, 0.12]], 0.03, 8))
    pts.push(...pointsAlongCurve([[-0.66, 0.4], [-0.74, 0.22], [-0.78, 0.08]], 0.03, 8))

    // Mouth fire / breath
    pts.push(...pointsInCircle(-0.88, 0.45, 0.05, 5))

    // === BODY (thick S-curve, Chinese dragon style) ===
    const bodyPath = [
        [-0.48, 0.48], [-0.32, 0.35], [-0.15, 0.28], [0.0, 0.28],
        [0.18, 0.35], [0.35, 0.42], [0.5, 0.38],
        [0.6, 0.22], [0.6, 0.05], [0.48, -0.08],
        [0.3, -0.12], [0.12, -0.05], [-0.05, 0.02],
        [-0.22, -0.05], [-0.35, -0.2], [-0.32, -0.38],
        [-0.15, -0.48], [0.05, -0.45], [0.25, -0.4],
        [0.45, -0.45], [0.6, -0.58], [0.72, -0.75],
        [0.8, -0.88],
    ]
    pts.push(...pointsAlongCurve(bodyPath, 0.14, 60))

    // Mane / spines along the back (ridges)
    for (let i = 0; i < bodyPath.length - 1; i += 2) {
        const [x, y] = bodyPath[i]
        const [nx, ny] = bodyPath[i + 1]
        const dx = nx - x, dy = ny - y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const perpX = -dy / len, perpY = dx / len
        pts.push(...pointsAlongLine(x, y, x + perpX * 0.1, y + perpY * 0.1, 0.02, 3))
    }

    // Belly scales (slightly offset from body)
    pts.push(...pointsAlongCurve(bodyPath.map(([x, y]) => [x + 0.02, y - 0.04]), 0.06, 20))

    // === CLAWS (4 short legs) ===
    // Front claws
    pts.push(...pointsAlongLine(0.12, 0.22, 0.18, 0.02, 0.05, 8))
    pts.push(...pointsAlongLine(0.18, 0.02, 0.25, 0.0, 0.03, 4))  // toes
    pts.push(...pointsAlongLine(0.28, 0.28, 0.35, 0.08, 0.05, 8))
    pts.push(...pointsAlongLine(0.35, 0.08, 0.42, 0.06, 0.03, 4))

    // Rear claws
    pts.push(...pointsAlongLine(-0.12, -0.1, -0.06, -0.32, 0.05, 8))
    pts.push(...pointsAlongLine(-0.06, -0.32, 0.02, -0.34, 0.03, 4))
    pts.push(...pointsAlongLine(0.35, -0.42, 0.42, -0.62, 0.05, 8))
    pts.push(...pointsAlongLine(0.42, -0.62, 0.5, -0.64, 0.03, 4))

    // === TAIL TIP (flame) ===
    pts.push(...pointsInCircle(0.82, -0.9, 0.07, 8))
    pts.push(...pointsInCircle(0.78, -0.85, 0.04, 5))

    return pts
}

// ─── Horse (ngựa) ───
export function generateHorse(count = 200) {
    const pts = []

    // === HEAD ===
    pts.push(...pointsInEllipse(-0.52, 0.52, 0.1, 0.14, 18))  // skull
    pts.push(...pointsInEllipse(-0.65, 0.44, 0.06, 0.05, 8))   // muzzle

    // Ears
    pts.push(...pointsAlongLine(-0.55, 0.65, -0.6, 0.82, 0.03, 6))
    pts.push(...pointsAlongLine(-0.46, 0.65, -0.42, 0.82, 0.03, 6))

    // Eye
    pts.push(...pointsInCircle(-0.5, 0.56, 0.02, 3))

    // === NECK (thick, arched) ===
    pts.push(...pointsAlongCurve([
        [-0.42, 0.45], [-0.32, 0.35], [-0.2, 0.28], [-0.08, 0.22],
    ], 0.13, 25))

    // Mane (flowing along top of neck)
    pts.push(...pointsAlongCurve([
        [-0.48, 0.58], [-0.38, 0.48], [-0.28, 0.4], [-0.15, 0.32], [-0.05, 0.28],
    ], 0.07, 18))

    // === BODY (barrel) ===
    pts.push(...pointsInEllipse(0.15, 0.08, 0.32, 0.18, 45))

    // === LEGS (clearly separated) ===
    // Front left
    pts.push(...pointsAlongLine(-0.08, -0.08, -0.12, -0.7, 0.055, 14))
    pts.push(...pointsAlongLine(-0.12, -0.7, -0.16, -0.75, 0.04, 3)) // hoof
    // Front right
    pts.push(...pointsAlongLine(0.06, -0.08, 0.02, -0.7, 0.055, 14))
    pts.push(...pointsAlongLine(0.02, -0.7, -0.02, -0.75, 0.04, 3))
    // Hind left
    pts.push(...pointsAlongLine(0.32, -0.05, 0.28, -0.7, 0.055, 14))
    pts.push(...pointsAlongLine(0.28, -0.7, 0.24, -0.75, 0.04, 3))
    // Hind right
    pts.push(...pointsAlongLine(0.45, -0.05, 0.48, -0.7, 0.055, 14))
    pts.push(...pointsAlongLine(0.48, -0.7, 0.52, -0.75, 0.04, 3))

    // === TAIL (flowing, thick) ===
    pts.push(...pointsAlongCurve([
        [0.48, 0.18], [0.58, 0.28], [0.66, 0.42], [0.72, 0.58], [0.7, 0.7],
    ], 0.07, 18))

    return pts
}

// ─── Star (ngôi sao) ───
export function generateStar(count = 130) {
    const pts = []
    const outerR = 1, innerR = 0.38, n = 5
    const verts = []
    for (let i = 0; i < n * 2; i++) {
        const a = (i * Math.PI) / n - Math.PI / 2
        const r = i % 2 === 0 ? outerR : innerR
        verts.push([Math.cos(a) * r, Math.sin(a) * r])
    }
    for (let i = 0; i < count; i++) {
        const si = Math.floor((i / count) * verts.length)
        const sp = ((i / count) * verts.length) % 1
        const a = verts[si], b = verts[(si + 1) % verts.length]
        pts.push([
            a[0] + (b[0] - a[0]) * sp + (Math.random() - 0.5) * 0.05,
            a[1] + (b[1] - a[1]) * sp + (Math.random() - 0.5) * 0.05,
        ])
    }
    return pts
}

export const SHAPES = ['heart', 'dragon', 'horse', 'star']

export function getShapePoints(name) {
    switch (name) {
        case 'heart': return generateHeart()
        case 'horse': return generateHorse()
        case 'star': return generateStar()
        case 'dragon': return generateDragon()
        default: return null
    }
}
