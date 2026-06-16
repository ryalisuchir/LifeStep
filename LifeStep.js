const SENSORS = [
    { key: 'heel_left', name: 'Heel (Inner)', x: 0.37, y: 0.88, color: '#E63946' },
    { key: 'heel_right', name: 'Heel (Outer)', x: 0.63, y: 0.88, color: '#F97316' },
    { key: 'arch', name: 'Arch', x: 0.18, y: 0.60, color: '#2870CC' },
    { key: 'ball', name: 'Ball', x: 0.58, y: 0.42, color: '#EAB308' },
    { key: 'toe', name: 'Big Toe', x: 0.28, y: 0.14, color: '#22C55E' },
];

// ─── GAIT PATTERNS ───────────────────────────────────────────────────────────
const GAIT_PATTERNS = {
    no_motion: {
        id: 'no_motion',
        label: 'No Motion',
        icon: '◌',
        color: '#AFC3D6',
        description: 'No significant movement detected. Standing still or sensor inactive.',
        normal: true,
    },
    normal: {
        id: 'normal',
        label: 'Normal Gait',
        icon: '✦',
        color: '#22C55E',
        description: 'Healthy heel-to-toe weight transfer with balanced distribution.',
        normal: true,
    },
    heel_strike: {
        id: 'heel_strike',
        label: 'Heavy Heel Strike',
        icon: '⬇',
        color: '#E63946',
        description: 'Excessive loading at heel contact. May indicate overstriding or poor shock absorption.',
        exercises: [
            {
                name: 'Calf Raises',
                desc: 'Strengthens lower leg to improve push-off and reduce heel impact.',
                youtube: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
                skeleton: 'calf_raise',
            },
            {
                name: 'Tai Chi Walking',
                desc: 'Mindful heel-to-toe transitions to retrain natural gait mechanics.',
                youtube: 'https://www.youtube.com/watch?v=cEOS2zoyQw4',
                skeleton: 'tai_chi',
            },
            {
                name: 'Barefoot Short Strides',
                desc: 'Walk barefoot with shorter steps to shift contact toward midfoot.',
                youtube: 'https://www.youtube.com/watch?v=zSIDRHUWlVo',
                skeleton: 'walk',
            },
        ],
    },
    lateral: {
        id: 'lateral',
        label: 'Outside of Foot',
        icon: '↗',
        color: '#F97316',
        description: 'Supination detected — weight rolling toward outer foot edge. Risk of ankle sprains.',
        exercises: [
            {
                name: 'Ankle Eversion Band',
                desc: 'Resistance band exercise to strengthen peroneal muscles on outer ankle.',
                youtube: 'https://www.youtube.com/watch?v=7DXlkD-CtYo',
                skeleton: 'band',
            },
            {
                name: 'Single-Leg Balance',
                desc: 'Improve proprioception and lateral ankle stability.',
                youtube: 'https://www.youtube.com/watch?v=oMVZLgRBWoA',
                skeleton: 'balance',
            },
            {
                name: 'Towel Toe Scrunches',
                desc: 'Activate intrinsic foot muscles to support the arch and redistribute load.',
                youtube: 'https://www.youtube.com/watch?v=U7TQVIhXC6Q',
                skeleton: 'squat',
            },
        ],
    },
    toe_walking: {
        id: 'toe_walking',
        label: 'Toe Walking',
        icon: '↑',
        color: '#EAB308',
        description: 'High forefoot pressure throughout stance. May indicate tight calves or habitual pattern.',
        exercises: [
            {
                name: 'Seated Calf Stretch',
                desc: 'Lengthen gastrocnemius and soleus to allow heel contact.',
                youtube: 'https://www.youtube.com/watch?v=aG7wnIkOXoY',
                skeleton: 'stretch',
            },
            {
                name: 'Heel Walking Drill',
                desc: 'Walk on heels only — retrains neuromuscular pattern toward heel contact.',
                youtube: 'https://www.youtube.com/watch?v=KPh0lbp6Nvk',
                skeleton: 'walk',
            },
            {
                name: 'Downward Dog Yoga',
                desc: 'Full calf and foot stretch to address tightness driving forefoot loading.',
                youtube: 'https://www.youtube.com/watch?v=EC7RGJ975iM',
                skeleton: 'stretch',
            },
        ],
    },
};

// Demo spacebar cycling state
const DEMO_CYCLE = ['heel_strike', 'normal', 'no_motion'];
let demoCycleIdx = 0;
let demoForcedPattern = 'heel_strike';

// ─── SKELETON SVG DRAWINGS ────────────────────────────────────────────────────
function skeletonSVG(type) {
    const base = `stroke="#E63946" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    const head = `<circle cx="60" cy="22" r="10" ${base}/>`;
    const spine = (y1, y2) => `<line x1="60" y1="${y1}" x2="60" y2="${y2}" ${base}/>`;
    const hip = (y) => `<line x1="40" y1="${y}" x2="80" y2="${y}" ${base}/>`;
    const shoulder = (y) => `<line x1="35" y1="${y}" x2="85" y2="${y}" ${base}/>`;

    if (type === 'calf_raise') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}${spine(32,80)}${shoulder(42)}
            <line x1="35" y1="42" x2="25" y2="70" ${base}/>
            <line x1="85" y1="42" x2="95" y2="70" ${base}/>
            ${hip(80)}
            <line x1="40" y1="80" x2="40" y2="120" ${base}/>
            <line x1="80" y1="80" x2="80" y2="120" ${base}/>
            <line x1="40" y1="120" x2="38" y2="145" ${base}/>
            <line x1="80" y1="120" x2="82" y2="145" ${base}/>
            <line x1="32" y1="140" x2="44" y2="140" ${base}/>
            <line x1="76" y1="140" x2="88" y2="140" ${base}/>
            <line x1="32" y1="140" x2="32" y2="148" ${base}/>
            <line x1="76" y1="140" x2="76" y2="148" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">RAISED</text>
        </svg>`;
    }
    if (type === 'tai_chi') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}${spine(32,75)}${shoulder(42)}
            <line x1="35" y1="42" x2="18" y2="65" ${base}/>
            <line x1="18" y1="65" x2="12" y2="85" ${base}/>
            <line x1="85" y1="42" x2="100" y2="60" ${base}/>
            <line x1="100" y1="60" x2="108" y2="80" ${base}/>
            ${hip(75)}
            <line x1="40" y1="75" x2="35" y2="112" ${base}/>
            <line x1="35" y1="112" x2="30" y2="148" ${base}/>
            <line x1="80" y1="75" x2="88" y2="108" ${base}/>
            <line x1="88" y1="108" x2="92" y2="148" ${base}/>
            <line x1="24" y1="145" x2="36" y2="145" ${base}/>
            <line x1="86" y1="145" x2="98" y2="145" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">TAI CHI</text>
        </svg>`;
    }
    if (type === 'walk') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}${spine(32,78)}${shoulder(44)}
            <line x1="35" y1="44" x2="22" y2="72" ${base}/>
            <line x1="22" y1="72" x2="18" y2="95" ${base}/>
            <line x1="85" y1="44" x2="98" y2="68" ${base}/>
            <line x1="98" y1="68" x2="102" y2="88" ${base}/>
            ${hip(78)}
            <line x1="40" y1="78" x2="30" y2="115" ${base}/>
            <line x1="30" y1="115" x2="24" y2="148" ${base}/>
            <line x1="80" y1="78" x2="90" y2="110" ${base}/>
            <line x1="90" y1="110" x2="96" y2="145" ${base}/>
            <line x1="18" y1="145" x2="30" y2="145" ${base}/>
            <line x1="90" y1="142" x2="102" y2="142" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">WALKING</text>
        </svg>`;
    }
    if (type === 'band') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}${spine(32,80)}${shoulder(44)}
            <line x1="35" y1="44" x2="28" y2="72" ${base}/>
            <line x1="85" y1="44" x2="92" y2="72" ${base}/>
            ${hip(80)}
            <line x1="40" y1="80" x2="40" y2="122" ${base}/>
            <line x1="80" y1="80" x2="80" y2="122" ${base}/>
            <line x1="40" y1="122" x2="36" y2="148" ${base}/>
            <line x1="80" y1="122" x2="98" y2="132" ${base}/>
            <line x1="98" y1="132" x2="108" y2="130" ${base}/>
            <path d="M30,140 Q60,155 108,130" ${base} stroke-dasharray="4,3"/>
            <line x1="30" y1="145" x2="42" y2="145" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">BAND</text>
        </svg>`;
    }
    if (type === 'balance') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}${spine(32,80)}${shoulder(44)}
            <line x1="35" y1="44" x2="18" y2="68" ${base}/>
            <line x1="18" y1="68" x2="10" y2="90" ${base}/>
            <line x1="85" y1="44" x2="102" y2="68" ${base}/>
            <line x1="102" y1="68" x2="110" y2="88" ${base}/>
            ${hip(80)}
            <line x1="40" y1="80" x2="40" y2="122" ${base}/>
            <line x1="80" y1="80" x2="72" y2="110" ${base}/>
            <line x1="72" y1="110" x2="90" y2="130" ${base}/>
            <line x1="40" y1="122" x2="38" y2="148" ${base}/>
            <line x1="32" y1="145" x2="44" y2="145" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">BALANCE</text>
        </svg>`;
    }
    if (type === 'squat') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}
            <line x1="60" y1="32" x2="60" y2="68" ${base}/>
            ${shoulder(40)}
            <line x1="35" y1="40" x2="22" y2="66" ${base}/>
            <line x1="85" y1="40" x2="98" y2="66" ${base}/>
            <line x1="38" y1="68" x2="82" y2="68" ${base}/>
            <line x1="38" y1="68" x2="28" y2="108" ${base}/>
            <line x1="28" y1="108" x2="32" y2="148" ${base}/>
            <line x1="82" y1="68" x2="92" y2="108" ${base}/>
            <line x1="92" y1="108" x2="88" y2="148" ${base}/>
            <line x1="26" y1="145" x2="38" y2="145" ${base}/>
            <line x1="82" y1="145" x2="94" y2="145" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">SQUAT</text>
        </svg>`;
    }
    if (type === 'stretch') {
        return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">
            ${head}
            <line x1="60" y1="32" x2="55" y2="80" ${base}/>
            <line x1="35" y1="44" x2="20" y2="60" ${base}/>
            <line x1="85" y1="44" x2="100" y2="58" ${base}/>
            <line x1="38" y1="80" x2="72" y2="80" ${base}/>
            <line x1="38" y1="80" x2="20" y2="130" ${base}/>
            <line x1="20" y1="130" x2="15" y2="148" ${base}/>
            <line x1="72" y1="80" x2="90" y2="125" ${base}/>
            <line x1="90" y1="125" x2="105" y2="148" ${base}/>
            <line x1="9" y1="145" x2="21" y2="145" ${base}/>
            <line x1="99" y1="145" x2="111" y2="145" ${base}/>
            <text x="60" y="170" text-anchor="middle" fill="#E63946" font-size="9" font-family="monospace" stroke="none">STRETCH</text>
        </svg>`;
    }
    return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" width="90" height="135">${head}${spine(32,80)}${shoulder(44)}${hip(80)}</svg>`;
}

// ─── GAIT DETECTION ───────────────────────────────────────────────────────────
function detectGait(vals, imuData) {
    const [heel_l, heel_r, arch, ball, toe] = vals;
    const totalLoad = vals.reduce((a, b) => a + b, 0);
    if (totalLoad < 0.25) return 'no_motion';

    const heelLoad = (heel_l + heel_r) / 2;
    const foreLoad = (ball + toe) / 2;
    const outerLoad = heel_r;
    const innerLoad = heel_l + arch;

    // Heavy heel strike: heel >60% and dominates
    if (heelLoad > 0.62 && heelLoad > foreLoad * 2.0) return 'heel_strike';
    // Lateral/supination: outer heel >> inner
    if (outerLoad > heel_l * 1.6 && outerLoad > 0.45) return 'lateral';
    // Toe walking: forefoot dominates, heel very low
    if (foreLoad > 0.55 && heelLoad < 0.18) return 'toe_walking';
    return 'normal';
}

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────
let sensorVals = [0.4, 0.55, 0.45, 0.25, 0.4];
let imu = { pitch: 0, roll: 0, yaw: 0 };
let liveData = false;
let simT = 0;

const gateway = 'ws://192.168.4.1:81';
let socket;
let liveIMU = false;

function connect() {
    socket = new WebSocket(gateway);
    socket.onopen = () => {
        setConnected(true);
    };
    socket.onclose = () => {
        liveData = false;
        liveIMU = false;
        setConnected(false);
        setTimeout(connect, 2000);
    };
    socket.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch (e) { return; }
        if (data.imu) {
            liveIMU = true;
            imu.pitch = parseFloat(data.imu.pitch) || 0;
            imu.roll = parseFloat(data.imu.roll) || 0;
            imu.yaw = parseFloat(data.imu.yaw) || 0;
        }
        const pressure = data.pressure || data;
        let gotPressure = false;
        SENSORS.forEach((s, i) => {
            let v = pressure?.[s.key];
            if (v == null) return;
            gotPressure = true;
            v = parseFloat(v);
            if (v > 1) v = v / 1023;
            _baseSensorVals[i] = Math.min(1, Math.max(0, v));
        });
        if (gotPressure) { liveData = true; setConnected(true); }
    };
    socket.onerror = () => {};
}

function setConnected(live) {
    const dot = document.getElementById('sdot');
    const lbl = document.getElementById('slbl');
    dot.classList.toggle('live', live);
    lbl.textContent = live ? 'LIVE · ESP32' : 'DISCONNECTED';
}
connect();

setInterval(() => {
    document.getElementById('htime').textContent =
        new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);

// ─── THREE.JS ─────────────────────────────────────────────────────────────────
const wrap = document.getElementById('three-wrap');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
wrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
camera.position.set(0, 1.2, 3.8);
camera.lookAt(0, -0.3, 0);

scene.add(new THREE.AmbientLight(0xC8A882, 0.9));
const kl = new THREE.DirectionalLight(0xffe8cc, 0.6); kl.position.set(2, 3, 2); scene.add(kl);
const kl2 = new THREE.DirectionalLight(0xd4956a, 0.3); kl2.position.set(-2, 1, -1); scene.add(kl2);
const grid = new THREE.GridHelper(7, 22, 0x2E3D52, 0x1a2535); grid.position.y = -1.2; scene.add(grid);

const fg = new THREE.Group();
scene.add(fg);

const BASE_RX = -132 * Math.PI / 180;
const BASE_RY = -1 * Math.PI / 180;
const BASE_RZ = 33 * Math.PI / 180;
const baseQuat = new THREE.Quaternion();
baseQuat.setFromEuler(new THREE.Euler(BASE_RX, BASE_RY, BASE_RZ, 'XYZ'));

function updateFootPos() {
    fg.position.set(0, -0.60, 0.30);
    camera.position.set(0, 1.2, 4.80);
    camera.lookAt(0, -0.3, 0);
}

const loadDiv = document.createElement('div');
loadDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#AFC3D6;font-family:DM Mono,monospace;font-size:12px;letter-spacing:2px;pointer-events:none;';
loadDiv.textContent = 'LOADING MODEL…';
wrap.appendChild(loadDiv);

const loader = new THREE.GLTFLoader();
loader.load('assets/foot.glb',
    (gltf) => {
        loadDiv.remove();
        const model = gltf.scene;
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xD4956A, roughness: 0.55, metalness: 0.0 });
        model.traverse(child => {
            if (child.isMesh) { child.material = skinMat; child.castShadow = true; child.receiveShadow = true; }
        });
        fg.add(model);
        model.scale.setScalar(0.28);
        updateFootPos();
        window._footModel = model;
    },
    undefined,
    (err) => { loadDiv.textContent = 'MODEL ERROR'; console.error(err); }
);

function resizeR() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resizeR).observe(wrap);
resizeR();

// ─── HEATMAP ─────────────────────────────────────────────────────────────────
const hm = document.getElementById('heat-canvas');
const hx = hm.getContext('2d');
let HW = 300, HH = 500;
let hmRect = { x: 0.20, y: 0.05, w: 0.48, h: 0.60 };

function resizeHeatCanvas() {
    const stack = hm.parentElement;
    hm.width = stack.clientWidth || 300;
    hm.height = stack.clientHeight || 500;
    HW = hm.width; HH = hm.height;
}
new ResizeObserver(resizeHeatCanvas).observe(document.querySelector('.hm-stack'));
resizeHeatCanvas();
function getHWHH() { HW = hm.width; HH = hm.height; }

const _footImg = new Image();
_footImg.src = 'assets/foot.png';
let _offCanvas = null;

function valToHeatRGB(val) {
    let r, g, b;
    const v = Math.max(0, Math.min(1, val));
    if (v < 0.2) { const t = v / 0.2; r = 0; g = Math.round(t * 100); b = Math.round(180 + t * 75); }
    else if (v < 0.4) { const t = (v - 0.2) / 0.2; r = 0; g = Math.round(100 + t * 155); b = Math.round(255 - t * 255); }
    else if (v < 0.6) { const t = (v - 0.4) / 0.2; r = Math.round(t * 255); g = 255; b = 0; }
    else if (v < 0.8) { const t = (v - 0.6) / 0.2; r = 255; g = Math.round(255 - t * 155); b = 0; }
    else { const t = (v - 0.8) / 0.2; r = 255; g = Math.round(100 - t * 100); b = 0; }
    return [r, g, b];
}

function drawHeatmap() {
    getHWHH();
    hx.clearRect(0, 0, HW, HH);
    const rx = hmRect.x * HW, ry = hmRect.y * HH;
    const rw = hmRect.w * HW, rh = hmRect.h * HH;
    const SCALE = 4;
    const ow = Math.max(1, Math.ceil(rw / SCALE));
    const oh = Math.max(1, Math.ceil(rh / SCALE));
    if (!_offCanvas) _offCanvas = document.createElement('canvas');
    _offCanvas.width = ow; _offCanvas.height = oh;
    const ox = _offCanvas.getContext('2d');
    const imgData = ox.createImageData(ow, oh);
    const d = imgData.data;
    const pts = SENSORS.map((s, i) => ({ cx: s.x * ow, cy: s.y * oh, v: sensorVals[i] }));
    const power = 2.0, minD = 4;
    for (let py = 0; py < oh; py++) {
        for (let px = 0; px < ow; px++) {
            let wSum = 0, vSum = 0;
            for (let i = 0; i < pts.length; i++) {
                const dx = px - pts[i].cx, dy = py - pts[i].cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const w = 1 / Math.pow(Math.max(dist, minD), power);
                wSum += w; vSum += w * pts[i].v;
            }
            const val = vSum / wSum;
            const [r, g, b] = valToHeatRGB(val);
            const idx = (py * ow + px) * 4;
            d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
        }
    }
    ox.putImageData(imgData, 0, 0);
    hx.imageSmoothingEnabled = true;
    hx.imageSmoothingQuality = 'high';
    hx.drawImage(_offCanvas, rx, ry, rw, rh);
    SENSORS.forEach((s, i) => {
        const cx = rx + s.x * rw, cy = ry + s.y * rh;
        const pulse = 0.5 + 0.5 * Math.sin(simT * 3 + i * 1.2);
        const ringR = 9 + pulse * 5;
        hx.beginPath(); hx.arc(cx, cy, ringR, 0, Math.PI * 2);
        hx.strokeStyle = s.color + 'aa'; hx.lineWidth = 1.5; hx.stroke();
        hx.beginPath(); hx.arc(cx, cy, 5, 0, Math.PI * 2);
        hx.fillStyle = s.color; hx.fill();
        hx.strokeStyle = '#fff'; hx.lineWidth = 1.5; hx.stroke();
        const label = s.name.split(' ')[0];
        hx.font = 'bold 8px DM Mono,monospace'; hx.textAlign = 'center';
        hx.fillStyle = 'rgba(0,0,0,0.65)'; hx.fillRect(cx - 16, cy - 22, 32, 11);
        hx.fillStyle = '#fff'; hx.fillText(label, cx, cy - 13);
    });
}

// ─── LEGEND ───────────────────────────────────────────────────────────────────
const legEl = document.getElementById('slegend');
const sbarEls = [], svalEls = [];
SENSORS.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'srow';
    row.innerHTML = `<div class="sdot" style="background:${s.color}"></div>
<div class="sname">${s.name}</div>
<div class="sbar-wrap"><div class="sbar" id="sb${i}" style="background:${s.color}"></div></div>
<div class="sval" id="sv${i}">0%</div>`;
    legEl.appendChild(row);
    sbarEls.push(document.getElementById('sb' + i));
    svalEls.push(document.getElementById('sv' + i));
});

// ─── PRESSURE HISTORY ─────────────────────────────────────────────────────────
const phC = document.getElementById('ph-canvas');
const phx = phC.getContext('2d');
const PHL = 140;
const phD = SENSORS.map(() => new Array(PHL).fill(0));

function resizePH() { phC.width = phC.parentElement.clientWidth - 2; phC.height = 68; }
new ResizeObserver(resizePH).observe(phC.parentElement);
resizePH();

function drawPH() {
    const pw = phC.width, ph = phC.height;
    phx.clearRect(0, 0, pw, ph);
    phx.fillStyle = '#111827'; phx.fillRect(0, 0, pw, ph);
    SENSORS.forEach((s, si) => {
        phx.beginPath();
        phD[si].forEach((v, xi) => {
            const x = (xi / (PHL - 1)) * pw, y = ph - v * ph * 0.82 - 4;
            xi === 0 ? phx.moveTo(x, y) : phx.lineTo(x, y);
        });
        phx.strokeStyle = s.color; phx.lineWidth = 1.5; phx.globalAlpha = 0.85; phx.stroke(); phx.globalAlpha = 1;
    });
}

// ─── IMU ─────────────────────────────────────────────────────────────────────
function imuBar(id, val, range) {
    const el = document.getElementById(id); if (!el) return;
    const frac = Math.abs(val) / range * 50;
    el.style.left = (val < 0 ? 50 - frac : 50) + '%';
    el.style.width = frac + '%';
    el.style.background = val < 0 ? '#E63946' : '#2870CC';
}
function updateIMU() {
    document.getElementById('ipitch').innerHTML = imu.pitch.toFixed(1) + ' <em>°</em>';
    document.getElementById('iroll').innerHTML = imu.roll.toFixed(1) + ' <em>°</em>';
    document.getElementById('iyaw').innerHTML = imu.yaw.toFixed(1) + ' <em>°</em>';
    imuBar('bpitch', imu.pitch, 45);
    imuBar('broll', imu.roll, 30);
    imuBar('byaw', imu.yaw, 90);
    const imuQuat = new THREE.Quaternion();
    imuQuat.setFromEuler(new THREE.Euler(
        THREE.Math.degToRad(-imu.pitch),
        THREE.Math.degToRad(imu.yaw),
        THREE.Math.degToRad(imu.roll),
        'XYZ'
    ));
    fg.quaternion.multiplyQuaternions(baseQuat, imuQuat);
    updateFootPos();
}

// ─── VITALS ───────────────────────────────────────────────────────────────────
const VH = {
    hr: Array.from({ length: 50 }, () => 70 + Math.random() * 8),
    sp: Array.from({ length: 50 }, () => 97 + Math.random() * 2),
    rr: Array.from({ length: 50 }, () => 14 + Math.random() * 3),
    tp: Array.from({ length: 50 }, () => 36.4 + Math.random() * 0.4),
};
let vt = 0;
function stepVitals() {
    vt += 0.06;
    const hr = 72 + 7 * Math.sin(vt * .4) + (Math.random() - .5) * 2;
    const spo2 = 98 + .9 * Math.sin(vt * .18) + (Math.random() - .5) * .3;
    const rr = 15 + 2 * Math.sin(vt * .3) + (Math.random() - .5) * .6;
    const temp = 36.6 + .2 * Math.sin(vt * .1) + (Math.random() - .5) * .04;
    VH.hr.push(hr); VH.hr.shift();
    VH.sp.push(spo2); VH.sp.shift();
    VH.rr.push(rr); VH.rr.shift();
    VH.tp.push(temp); VH.tp.shift();
    document.getElementById('vhr').textContent = Math.round(hr);
    document.getElementById('vspo2').textContent = spo2.toFixed(1);
    document.getElementById('vrr').textContent = Math.round(rr);
    document.getElementById('vtemp').textContent = temp.toFixed(1);
    spark('sphr', VH.hr, '#E63946');
    spark('spspo2', VH.sp, '#2870CC');
    spark('sprr', VH.rr, '#22C55E');
    spark('sptemp', VH.tp, '#F59E0B');
}
function spark(id, data, color) {
    const c = document.getElementById(id); if (!c) return;
    const ctx = c.getContext('2d'), w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
    ctx.beginPath();
    data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * w, y = h - ((v - mn) / rng) * (h * .78) - h * .11;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.globalAlpha = 0.1; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
}
function resizeSparks() {
    ['sphr', 'spspo2', 'sprr', 'sptemp'].forEach(id => {
        const c = document.getElementById(id);
        if (c) { c.width = c.parentElement.clientWidth - 32; c.height = 30; }
    });
}
new ResizeObserver(resizeSparks).observe(document.querySelector('.vitals-grid'));
resizeSparks();
setInterval(stepVitals, 750);
stepVitals();

// ─── SIMULATION ───────────────────────────────────────────────────────────────
let _baseSensorVals = [0.4, 0.55, 0.45, 0.25, 0.4];
let appMode = 'live';

function setMode(mode) {
    appMode = mode;
    document.getElementById('btn-live').classList.toggle('active', mode === 'live');
    document.getElementById('btn-demo').classList.toggle('active', mode === 'demo');
    const dot = document.getElementById('sdot');
    const lbl = document.getElementById('slbl');
    if (mode === 'demo') {
        dot.classList.remove('live');
        lbl.textContent = 'DEMO MODE';
        demoForcedPattern = 'heel_strike';
        demoCycleIdx = 0;
    } else {
        lbl.textContent = liveData ? 'LIVE · ESP32' : 'CONNECTING…';
        if (liveData) dot.classList.add('live');
    }
}

function updateSpacebarHint(show) {
    const hint = document.getElementById('spacebar-hint');
    if (hint) hint.style.display = show ? 'flex' : 'none';
}

// Spacebar cycles demo patterns
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && appMode === 'demo') {
        e.preventDefault();
        demoCycleIdx = (demoCycleIdx + 1) % DEMO_CYCLE.length;
        demoForcedPattern = DEMO_CYCLE[demoCycleIdx];
        gaitSmoothBuf = [];
        lastGaitId = null;
        const gp = document.getElementById('gait-panel');
        if (gp) { gp.style.transition = 'none'; gp.style.opacity = '0'; setTimeout(() => { gp.style.transition = 'opacity 0.3s'; gp.style.opacity = '1'; }, 50); }
    }
});

function stepSim() {
    simT += 0.018;

    if (appMode === 'demo') {
        const walkT = simT * 1.4;
        const cycle = walkT % (Math.PI * 2);
        const phase = cycle / (Math.PI * 2);

        if (demoForcedPattern === 'heel_strike') {
            imu.pitch = 10 * Math.sin(walkT);
            imu.roll = 0;
            imu.yaw = 0;
            _baseSensorVals = [
                Math.min(1, 0.85 + 0.15 * Math.abs(Math.sin(walkT))),
                Math.min(1, 0.75 + 0.15 * Math.abs(Math.sin(walkT))),
                0.12 + 0.08 * Math.abs(Math.sin(walkT * 1.2)),
                0.08 + 0.06 * Math.abs(Math.sin(walkT * 1.5)),
                0.05 + 0.04 * Math.abs(Math.sin(walkT * 0.8)),
            ];
        } else if (demoForcedPattern === 'lateral') {
            imu.pitch = 12 * Math.sin(walkT);
            imu.roll = 14 * Math.sin(walkT + 0.8);
            imu.yaw = 5 * Math.sin(walkT * 0.5);
            _baseSensorVals = [
                0.15 + 0.1 * Math.abs(Math.sin(walkT)),
                Math.min(1, 0.72 + 0.18 * Math.abs(Math.sin(walkT))),
                0.18 + 0.1 * Math.abs(Math.sin(walkT * 1.1)),
                0.38 + 0.18 * Math.abs(Math.sin(walkT * 1.3)),
                0.22 + 0.12 * Math.abs(Math.sin(walkT * 0.9)),
            ];
        } else if (demoForcedPattern === 'toe_walking') {
            imu.pitch = -22 * Math.abs(Math.sin(walkT));
            imu.roll = 4 * Math.sin(walkT + 0.8);
            imu.yaw = 2 * Math.sin(walkT * 0.5);
            _baseSensorVals = [
                0.06 + 0.04 * Math.abs(Math.sin(walkT)),
                0.08 + 0.04 * Math.abs(Math.sin(walkT)),
                0.18 + 0.1 * Math.abs(Math.sin(walkT * 1.2)),
                Math.min(1, 0.72 + 0.18 * Math.abs(Math.sin(walkT))),
                Math.min(1, 0.82 + 0.15 * Math.abs(Math.sin(walkT * 1.1))),
            ];
        } else if (demoForcedPattern === 'no_motion') {
            imu.pitch = 0.5 * Math.sin(simT * 0.2);
            imu.roll = 0.3 * Math.sin(simT * 0.15);
            imu.yaw = 0.2 * Math.sin(simT * 0.1);
            _baseSensorVals = [0.04, 0.04, 0.04, 0.04, 0.04];
        } else {
            // normal walking
            imu.pitch = -7 + 8 * Math.sin(walkT);
            imu.roll = 0;
            imu.yaw = 0;
            _baseSensorVals = [
                Math.max(0, Math.sin(phase * Math.PI * 2) * (phase < 0.3 ? 1.2 : 0.3)),
                Math.max(0, Math.sin(phase * Math.PI * 2) * (phase < 0.3 ? 0.9 : 0.2)),
                Math.max(0, Math.sin((phase - 0.25) * Math.PI * 2) * (phase > 0.2 && phase < 0.6 ? 0.8 : 0.1)),
                Math.max(0, Math.sin((phase - 0.4) * Math.PI * 2) * (phase > 0.35 && phase < 0.75 ? 1.1 : 0.1)),
                Math.max(0, Math.sin((phase - 0.6) * Math.PI * 2) * (phase > 0.55 ? 1.3 : 0.1)),
            ].map(v => Math.min(1, Math.max(0.02, v)));
        }

    } else {
        if (!liveData) {
            _baseSensorVals = [
                .30 + .28 * Math.abs(Math.sin(simT * .7)),
                .45 + .32 * Math.abs(Math.sin(simT * 1.1 + 1)),
                .38 + .30 * Math.abs(Math.sin(simT * .9 + 2)),
                .18 + .22 * Math.abs(Math.sin(simT * 1.3 + .5)),
                .40 + .22 * Math.abs(Math.sin(simT * .6 + 1.5)),
            ];
        }
        if (!liveIMU) {
            imu.pitch = 8 * Math.sin(simT * .4);
            imu.roll = 4 * Math.sin(simT * .3 + 1);
            imu.yaw = 5 * Math.sin(simT * .2 + 2);
        }
    }

    sensorVals = _baseSensorVals.map((v, i) => {
        const pulse = 0.04 * Math.sin(simT * 1.2 + i * 1.1);
        return Math.max(0.01, Math.min(1.0, v + pulse));
    });
}

// ─── GAIT PANEL ───────────────────────────────────────────────────────────────
let lastGaitId = null;
let gaitSmoothBuf = [];
const GAIT_SMOOTH = 18;

function updateGaitPanel(vals) {
    let gaitId;
    if (appMode === 'demo') {
        gaitId = demoForcedPattern;
    } else {
        const raw = detectGait(vals, imu);
        gaitSmoothBuf.push(raw);
        if (gaitSmoothBuf.length > GAIT_SMOOTH) gaitSmoothBuf.shift();
        const counts = {};
        gaitSmoothBuf.forEach(g => counts[g] = (counts[g] || 0) + 1);
        gaitId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    if (gaitId === lastGaitId) return;
    lastGaitId = gaitId;
    const pattern = GAIT_PATTERNS[gaitId] || GAIT_PATTERNS.normal;

    const panel = document.getElementById('gait-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div class="gait-status-row">
            <div class="gait-icon" style="color:${pattern.color}">${pattern.icon}</div>
            <div class="gait-info">
                <div class="gait-label" style="color:${pattern.color}">${pattern.label}</div>
                <div class="gait-desc">${pattern.description}</div>
            </div>
            <div class="gait-badge" style="background:${pattern.color}22;border-color:${pattern.color}55;color:${pattern.color}">
                ${pattern.normal ? 'OK' : 'FLAG'}
            </div>
        </div>
    `;

    panel.style.borderColor = pattern.color + '88';
    setTimeout(() => { panel.style.borderColor = ''; }, 800);

    // Show/hide the exercises header button
    const exBtn = document.getElementById('header-ex-btn');
    if (exBtn) {
        if (!pattern.normal && pattern.exercises) {
            exBtn.style.display = 'flex';
            exBtn.style.borderColor = pattern.color + '88';
            exBtn.style.color = pattern.color;
            exBtn.dataset.gaitId = gaitId;
        } else {
            exBtn.style.display = 'none';
            // Close drawer if open and pattern is now normal
            closeExerciseDrawer();
        }
    }
}

// ─── EXERCISE DRAWER ─────────────────────────────────────────────────────────
function openExerciseDrawer(gaitId, exIdx) {
    gaitId = gaitId || document.getElementById('header-ex-btn')?.dataset.gaitId;
    if (!gaitId) return;
    exIdx = exIdx ?? 0;
    const pattern = GAIT_PATTERNS[gaitId];
    const ex = pattern.exercises[exIdx];
    const drawer = document.getElementById('ex-drawer');
    const content = document.getElementById('ex-drawer-content');
    if (!drawer || !content) return;

    content.innerHTML = `
        <div class="exd-header">
            <div>
                <div class="exd-flag" style="color:${pattern.color}">${pattern.icon} ${pattern.label}</div>
                <div class="exd-title">${ex.name}</div>
            </div>
            <button class="exd-close" onclick="closeExerciseDrawer()">✕</button>
        </div>
        <div class="exd-body">
            <div class="exd-skeleton">${skeletonSVG(ex.skeleton)}</div>
            <div class="exd-desc">${ex.desc}</div>
            <a class="exd-yt" href="${ex.youtube}" target="_blank" rel="noopener">▶ WATCH ON YOUTUBE</a>
        </div>
        <div class="exd-list-label">ALL EXERCISES</div>
        <div class="exd-list">
            ${pattern.exercises.map((e, i) => `
            <div class="exd-item ${i === exIdx ? 'active' : ''}" onclick="openExerciseDrawer('${gaitId}', ${i})">
                <span>${e.name}</span><span class="exd-arrow">›</span>
            </div>`).join('')}
        </div>
    `;

    drawer.classList.add('open');
}

function closeExerciseDrawer() {
    const drawer = document.getElementById('ex-drawer');
    if (drawer) drawer.classList.remove('open');
}

// Keep old name working for any stray references
function openExerciseModal(gaitId, exIdx) { openExerciseDrawer(gaitId, exIdx); }
function closeExerciseModal() { closeExerciseDrawer(); }

// ─── MAIN LOOP ────────────────────────────────────────────────────────────────
let frame = 0;
(function loop() {
    requestAnimationFrame(loop);
    frame++;
    stepSim();
    updateIMU();

    if (frame % 5 === 0) {
        sensorVals.forEach((v, i) => { phD[i].push(v); phD[i].shift(); });
        drawPH();
    }

    if (frame % 8 === 0) updateGaitPanel(sensorVals);

    const avg = sensorVals.reduce((a, b) => a + b, 0) / sensorVals.length;
    document.getElementById('tload').innerHTML = Math.round(avg * 100) + ' <em>kPa</em>';
    sensorVals.forEach((v, i) => {
        sbarEls[i].style.width = (v * 100) + '%';
        svalEls[i].textContent = Math.round(v * 100) + '%';
    });

    drawHeatmap();
    renderer.render(scene, camera);
})();
