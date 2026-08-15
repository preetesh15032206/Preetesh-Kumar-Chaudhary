#include <Wire.h>
#include <DHT.h>
#include <SFE_BMP180.h>

// Arduino UNO wiring: DHT11 DATA=D4, rain AO=A0, analog UV OUT=A1,
// BMP180 SDA=A4 and SCL=A5 (the UNO hardware I2C pins).
#define DHTPIN 4
#define DHTTYPE DHT11
#define RAIN_SENSOR_PIN A0
#define UV_SENSOR_PIN A1

DHT dht(DHTPIN, DHTTYPE);
SFE_BMP180 bmp180;
bool bmp180Ready = false;

bool readPressureHpa(float temperatureC, float &pressureHpa) {
  char status = bmp180.startPressure(3);
  if (status == 0) return false;
  delay(status);

  double pressureMb;
  status = bmp180.getPressure(pressureMb, temperatureC);
  if (status == 0) return false;

  // SFE_BMP180 returns millibars, which are numerically equal to hPa.
  pressureHpa = (float)pressureMb;
  return true;
}

void setup() {
  Serial.begin(9600);
  dht.begin();
  bmp180Ready = bmp180.begin();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (!bmp180Ready || isnan(temperature) || isnan(humidity)) {
    delay(2000);
    return;
  }

  // BMP180 compensation requires a temperature measurement from the BMP180.
  char status = bmp180.startTemperature();
  if (status == 0) {
    delay(2000);
    return;
  }
  delay(status);
  double bmpTemperature;
  if (bmp180.getTemperature(bmpTemperature) == 0) {
    delay(2000);
    return;
  }

  float pressure;
  if (!readPressureHpa((float)bmpTemperature, pressure)) {
    delay(2000);
    return;
  }

  int rainAnalog = analogRead(RAIN_SENSOR_PIN);
  float precipitation = map(rainAnalog, 0, 1023, 100, 0);
  int uvAnalog = analogRead(UV_SENSOR_PIN);
  float uvIndex = map(uvAnalog, 0, 1023, 0, 16);

  // Exactly five CSV fields.  No startup or debug text is sent to serial.
  Serial.print(temperature, 2);
  Serial.print(',');
  Serial.print(humidity, 2);
  Serial.print(',');
  Serial.print(precipitation, 2);
  Serial.print(',');
  Serial.print(uvIndex, 2);
  Serial.print(',');
  Serial.println(pressure, 2);

  delay(2000);
}
