#include <WiFi.h>
#include <WebSocketsServer.h> // Ensure you have the Markus Sattler version
#include <Wire.h>
#include <MPU6050_light.h>

const char* ssid = "LifeStep";
const char* password = "password";

const int pinA1 = A1; 
const int pinA2 = A2;
const int pinA3 = A3;

MPU6050 mpu(Wire);
WebSocketsServer webSocket = WebSocketsServer(81);
unsigned long timer = 0;

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  // Logic for incoming messages can be added here
}

void setup() {
  Serial.begin(115200);
  Wire.begin();

  analogReadResolution(12); // Sets range 0-4095

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

   // Read raw values
  int val1 = analogRead(pinA1);
  int val2 = analogRead(pinA2);
  int val3 = analogRead(pinA3);

  // Map 0-4095 to 0-100%
  // Using float for precision, or long for speed
  float pct1 = (val1 / 4095.0) * 100.0;
  float pct2 = (val2 / 4095.0) * 100.0;
  float pct3 = (val3 / 4095.0) * 100.0 * 4;

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
      json += "\"arch\":" + String(pct2) + ",";
      json += "\"ball\":" + String(pct1) + ",";
      json += "\"heel_left\":" + String(pct3) + ",";
      json += "\"heel_right\":" + String(pct3) + ",";
      json += "\"toe\":" + String(pct1);
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