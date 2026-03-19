# LifeStep — Biomechanics Dashboard

**LifeStep** is a real-time biomechanics visualization tool designed by our HOSA team to monitor plantar pressure and foot orientation. By integrating **Firebase Realtime Database** with a **Three.js** 3D environment and a dynamic IDW (Inverse Distance Weighting) heatmap, it provides a comprehensive overview of gait and posture data for clinical or athletic analysis.

![Dashboard Preview](website.png)

---

## 🚀 Features

* **3D Foot Visualization:** A real-time 3D model that mirrors the user's foot orientation (Pitch, Roll, Yaw) using IMU data.
* **Plantar Pressure Heatmap:** A high-fidelity, interpolated heatmap that visualizes pressure distribution across five key sensor points (Heel, Arch, Ball, and Big Toe).
* **Live Vitals Tracking:** Monitors biometric data including Heart Rate, SpO2, Respiratory Rate, and Skin Temperature.
* **Historical Analysis:** A synchronized line graph showing the pressure history for all five sensors simultaneously.
* **Dual Modes:** * **LIVE:** Connects directly to a Firebase backend for hardware integration.
    * **DEMO:** A built-in gait simulation that mimics a standard walking cycle.