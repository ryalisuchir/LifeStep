const SENSORS = [
    { key: 'heel_left', name: 'Heel (Inner)', x: 0.37, y: 0.88, color: '#E63946' },
    { key: 'heel_right', name: 'Heel (Outer)', x: 0.63, y: 0.88, color: '#F97316' },
    { key: 'arch', name: 'Arch', x: 0.18, y: 0.60, color: '#2870CC' },
    { key: 'ball', name: 'Ball', x: 0.58, y: 0.42, color: '#EAB308' },
    { key: 'big_toe', name: 'Big Toe', x: 0.28, y: 0.14, color: '#22C55E' },
];

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
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerHTML = 'CONNECTED TO LIFESTEP';
            statusEl.className = 'status connected';
        }
        console.log('WebSocket Connected');
    };

    socket.onclose = () => {
        liveData = false;
        liveIMU = false;
        setConnected(false);
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerHTML = 'DISCONNECTED - Retrying...';
            statusEl.className = 'status disconnected';
        }
        setTimeout(connect, 2000);
    };

    socket.onmessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            console.error('WebSocket JSON parse error:', e);
            return;
        }

        console.log('LifeStep Raw:', data);

        if (data.imu) {
            liveIMU = true;
            imu.pitch = parseFloat(data.imu.pitch) || 0;
            imu.roll = parseFloat(data.imu.roll) || 0;
            imu.yaw = parseFloat(data.imu.yaw) || 0;

            const imuDataEl = document.getElementById('imu-data');
            if (imuDataEl) {
                imuDataEl.innerHTML = `P: ${imu.pitch.toFixed(2)} | R: ${imu.roll.toFixed(2)} | Y: ${imu.yaw.toFixed(2)}`;
            }
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

        if (gotPressure) {
            liveData = true;
            setConnected(true);

            const pressureDataEl = document.getElementById('pressure-data');
            if (pressureDataEl) {
                pressureDataEl.innerHTML = `Big Toe: ${pressure.big_toe ?? '-'} | Ball: ${pressure.ball ?? '-'} | Heel: ${pressure.heel_left ?? '-'}`;
            }
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };
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

const wrap = document.getElementById('three-wrap');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
wrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
camera.position.set(0, 1.2, 3.8);
camera.lookAt(0, -0.3, 0);

function camUpdate() { }

// Lighting
scene.add(new THREE.AmbientLight(0xC8A882, 0.9));
const kl = new THREE.DirectionalLight(0xffe8cc, 0.6); kl.position.set(2, 3, 2); scene.add(kl);
const kl2 = new THREE.DirectionalLight(0xd4956a, 0.3); kl2.position.set(-2, 1, -1); scene.add(kl2);
const grid = new THREE.GridHelper(7, 22, 0x2E3D52, 0x1a2535); grid.position.y = -1.2; scene.add(grid);

const fg = new THREE.Group();
scene.add(fg);

// Set hardcoded base rotation as quaternion so we can add IMU on top cleanly
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

//Heatmap:
const hm = document.getElementById('heat-canvas');
const hx = hm.getContext('2d');
let HW = 300, HH = 500;

// Heatmap rect: fraction of canvas covered by the foot area
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

// Wire heatmap rect sliders
['hmx', 'hmy', 'hmw', 'hmh'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
        const v = parseFloat(el.value);
        document.getElementById(id + 'v').textContent = v.toFixed(2);
        hmRect[id.slice(2)] = v;
    });
});

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

    // Draw IDW heatmap into the configured rect
    const rx = hmRect.x * HW;
    const ry = hmRect.y * HH;
    const rw = hmRect.w * HW;
    const rh = hmRect.h * HH;

    const SCALE = 4;
    const ow = Math.max(1, Math.ceil(rw / SCALE));
    const oh = Math.max(1, Math.ceil(rh / SCALE));
    if (!_offCanvas) _offCanvas = document.createElement('canvas');
    _offCanvas.width = ow; _offCanvas.height = oh;
    const ox = _offCanvas.getContext('2d');
    const imgData = ox.createImageData(ow, oh);
    const d = imgData.data;

    const pts = SENSORS.map((s, i) => ({
        cx: s.x * ow, cy: s.y * oh, v: sensorVals[i]
    }));

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

    // Draw sensor dots on canvas (above heatmap, below foot PNG)
    SENSORS.forEach((s, i) => {
        const v = sensorVals[i];
        const cx = rx + s.x * rw;
        const cy = ry + s.y * rh;

        // Pulsing ring
        const pulse = 0.5 + 0.5 * Math.sin(simT * 3 + i * 1.2);
        const ringR = 9 + pulse * 5;
        hx.beginPath();
        hx.arc(cx, cy, ringR, 0, Math.PI * 2);
        hx.strokeStyle = s.color + 'aa';
        hx.lineWidth = 1.5;
        hx.stroke();

        // Solid center dot
        hx.beginPath();
        hx.arc(cx, cy, 5, 0, Math.PI * 2);
        hx.fillStyle = s.color;
        hx.fill();
        hx.strokeStyle = '#fff';
        hx.lineWidth = 1.5;
        hx.stroke();

        // Label above dot
        const label = s.name.split(' ')[0];
        hx.font = 'bold 8px DM Mono,monospace';
        hx.textAlign = 'center';
        hx.fillStyle = 'rgba(0,0,0,0.65)';
        hx.fillRect(cx - 16, cy - 22, 32, 11);
        hx.fillStyle = '#fff';
        hx.fillText(label, cx, cy - 13);
    });
}


// Legend
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

//Pressure history:
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
    // Compose base rotation with IMU delta using quaternions
    // This ensures pitch/roll/yaw rotate relative to the foot's own axes
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

//Vitals:
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

//Simulation:
let _baseSensorVals = [0.4, 0.55, 0.45, 0.25, 0.4];
let appMode = 'live'; // 'live' or 'demo'

function setMode(mode) {
    appMode = mode;
    document.getElementById('btn-live').classList.toggle('active', mode === 'live');
    document.getElementById('btn-demo').classList.toggle('active', mode === 'demo');
    const dot = document.getElementById('sdot');
    const lbl = document.getElementById('slbl');
    if (mode === 'demo') {
        dot.classList.remove('live');
        lbl.textContent = 'DEMO MODE';
    } else {
        lbl.textContent = liveData ? 'LIVE · ESP32' : 'CONNECTING…';
        if (liveData) dot.classList.add('live');
    }
}

function stepSim() {
    simT += 0.018;

    if (appMode === 'demo') {
        // Walking cycle: heel strike → midstance → toe-off → swing
        const walkT = simT * 1.4; // walk speed
        const cycle = walkT % (Math.PI * 2);

        // Pitch: heel strike (toe up ~+20°) → midstance (0°) → toe-off (toe down ~-30°) → swing (+15°)
        imu.pitch = 20 * Math.sin(walkT) - 5 * Math.sin(walkT * 2);
        imu.roll = 6 * Math.sin(walkT + 0.8);
        imu.yaw = 3 * Math.sin(walkT * 0.5);

        // Pressure follows gait: heel → arch → ball → toe
        const phase = cycle / (Math.PI * 2); // 0-1
        _baseSensorVals = [
            Math.max(0, Math.sin(phase * Math.PI * 2) * (phase < 0.3 ? 1.2 : 0.3)),           // heel_left
            Math.max(0, Math.sin(phase * Math.PI * 2) * (phase < 0.3 ? 0.9 : 0.2)),           // heel_right
            Math.max(0, Math.sin((phase - 0.25) * Math.PI * 2) * (phase > 0.2 && phase < 0.6 ? 0.8 : 0.1)), // arch
            Math.max(0, Math.sin((phase - 0.4) * Math.PI * 2) * (phase > 0.35 && phase < 0.75 ? 1.1 : 0.1)), // ball
            Math.max(0, Math.sin((phase - 0.6) * Math.PI * 2) * (phase > 0.55 ? 1.3 : 0.1)), // big toe
        ].map(v => Math.min(1, Math.max(0.02, v)));

    } else {
        // Live mode — only simulate when no ESP32 data
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

    // Idle pulse
    sensorVals = _baseSensorVals.map((v, i) => {
        const pulse = 0.04 * Math.sin(simT * 1.2 + i * 1.1);
        return Math.max(0.01, Math.min(1.0, v + pulse));
    });
}

//Main loop:
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

    const avg = sensorVals.reduce((a, b) => a + b, 0) / sensorVals.length;
    document.getElementById('tload').innerHTML = Math.round(avg * 100) + ' <em>kPa</em>';
    sensorVals.forEach((v, i) => {
        sbarEls[i].style.width = (v * 100) + '%';
        svalEls[i].textContent = Math.round(v * 100) + '%';
    });

    drawHeatmap();
    renderer.render(scene, camera);
})();
