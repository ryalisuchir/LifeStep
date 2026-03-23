#include <WiFi.h>
#include <WebSocketsServer.h> // Ensure you have the Markus Sattler version
#include <Wire.h>
#include <MPU6050_light.h>

const char* ssid = "LifeStep";
const char* password = "password";

MPU6050 mpu(Wire);
WebSocketsServer webSocket = WebSocketsServer(81);
unsigned long timer = 0;

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  // Logic for incoming messages can be added here
}

void setup() {
  Serial.begin(115200);
  Wire.begin();

  // 1. Setup WiFi AP
  WiFi.softAP(ssid, password);
  Serial.println("LifeStep AP Started");
  Serial.print("IP: ");
  Serial.println(WiFi.softAPIP());

  // 2. Setup MPU6050
  if(mpu.begin() != 0) {
    Serial.println("MPU6050 missing");
    while(1) delay(10);
  }
  delay(1000);
  mpu.calcOffsets();

  // 3. Start WebSocket on Port 81
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
}

void loop() {
  mpu.update();
  webSocket.loop(); 

  if (millis() - timer > 50) {
    // Only broadcast if at least one client is connected
    if (WiFi.softAPgetStationNum() > 0) {
      
      // Generate random pressure data (0.0 to 10.0)
      float arch = random(0, 101) / 10.0;
      float ball = random(0, 101) / 10.0;
      float h_left = random(0, 101) / 10.0;
      float h_right = random(0, 101) / 10.0;
      float toe = random(0, 101) / 10.0;

      // Build the JSON String to match your Firebase logs
      String json = "{";
      
      // Pressure Object
      json += "\"pressure\":{";
      json += "\"arch\":" + String(arch) + ",";
      json += "\"ball\":" + String(ball) + ",";
      json += "\"heel_left\":" + String(h_left) + ",";
      json += "\"heel_right\":" + String(h_right) + ",";
      json += "\"toe\":" + String(toe);
      json += "},";

      // IMU Object
      json += "\"imu\":{";
      json += "\"pitch\":" + String(mpu.getAngleY()) + ",";
      json += "\"roll\":" + String(mpu.getAngleX()) + ",";
      json += "\"yaw\":" + String(mpu.getAngleZ());
      json += "}";

      json += "}";
      
      webSocket.broadcastTXT(json);
      
      // Keep Serial print for debugging
      Serial.println(json);
    }
    timer = millis();
  }
}