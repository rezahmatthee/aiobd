# OBD2 Protocol Specifications

AIOBD supports the following 6 OBD2 communication protocols:

## 1. SAE J1850 PWM
- **Baud Rate**: 41.6 kbps
- **Used By**: Ford vehicles (pre-2008)
- **Signaling**: Variable pulse width, differential
- **ELM327 Protocol**: 1

## 2. SAE J1850 VPW
- **Baud Rate**: 10.4 kbps
- **Used By**: GM vehicles (pre-2008)
- **Signaling**: Variable pulse width, single-wire
- **ELM327 Protocol**: 2

## 3. ISO 9141-2
- **Baud Rate**: 10.4 kbps
- **Used By**: European/Asian vehicles (pre-2008)
- **Init**: 5-baud initialization at 10.4 kbps
- **ELM327 Protocol**: 3

## 4. ISO 14230 (KWP2000)
- **Baud Rate**: 10.4 kbps
- **Used By**: European vehicles (late 1990s - 2008)
- **Init**: Fast init or 5-baud init
- **ELM327 Protocol**: 4/5

## 5. ISO 15765 (CAN Bus)
- **Baud Rate**: 500 kbps (or 250 kbps)
- **Used By**: All 2008+ US vehicles (mandated)
- **Frame Format**: 11-bit or 29-bit CAN identifiers
- **ELM327 Protocol**: 6/7/8/9

## 6. ISO 27145 (WWH-OBD)
- **Baud Rate**: 500 kbps
- **Used By**: Heavy vehicles, EU regulation
- **Base**: ISO 15765-4 CAN + ISO 14229 UDS
- **ELM327 Protocol**: 6+

## Protocol Selection Guide

| Vehicle Year | Origin | Recommended Protocol |
|-------------|--------|---------------------|
| 2008+ | Any | ISO 15765 (CAN) |
| 1996-2007 | Ford | SAE J1850 PWM |
| 1996-2007 | GM | SAE J1850 VPW |
| 1996-2007 | European/Asian | ISO 14230 or ISO 9141-2 |
| Heavy Duty | Any | ISO 27145 |
