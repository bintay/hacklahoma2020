#include <Wire.h>
#include "MMA7660.h"
MMA7660 accelemeter;
const int AccelPin = 13;
const int TouchPin = 2;
const int ButtonPin = 3;

int buttonState = 0;
int counter = 0;

void setup() {
    accelemeter.init();
    pinMode(AccelPin, OUTPUT);
    pinMode(TouchPin, INPUT);
    pinMode(ButtonPin, INPUT);
    Serial.begin(9600);
}
void loop() {
    int8_t x;
    int8_t y;
    int8_t z;
    float ax, ay, az;
    char input;
    accelemeter.getXYZ(&x, &y, &z);

    accelemeter.getAcceleration(&ax, &ay, &az);
    Serial.print("A ");
    Serial.print(ax);
    Serial.print(" ");
    Serial.print(ay);
    Serial.print(" ");
    Serial.print(az);
    Serial.print("\n");
    delay(100);

    int sensorValue = digitalRead(TouchPin);
    Serial.print("T ");
    Serial.print(sensorValue);
    Serial.print("\n");

    buttonState = digitalRead(ButtonPin);
    Serial.print("B ");
    Serial.print(buttonState);
    Serial.print("\n");
    
    if(Serial.available())
    {
        input = Serial.read();
    }
    while(input == 'e')
    {
        loopFlashLight();
        buttonState = digitalRead(ButtonPin);
        Serial.print("B ");
        Serial.print(buttonState);
        Serial.print("\n");
        if(Serial.available())
        {
            input = Serial.read();
        }
    }
    digitalWrite(13, LOW);
}

void loopFlashLight()
{
    if(counter == 0)
        digitalWrite(13, HIGH);
    delay(100);
    if(counter == 5)
        digitalWrite(13, LOW);
    delay(100);
    counter++;
    if(counter == 10)
        counter = 0;
};