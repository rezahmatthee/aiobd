# OEM PID Packs

Community-contributed manufacturer-specific PID definitions.

## Available Packs

Built-in packs (in `backend/src/pids/manufacturer/`):
- **Ford** - Boost pressure, injector duty cycle, transmission temp
- **GM** - Idle speed, battery voltage, fuel trim learn
- **Toyota** - Injector correction, hybrid battery temp, SOC
- **VW/Audi** - Boost pressure, lambda value
- **BMW** - VANOS positions, Valvetronic lift

## Adding a New Pack

Use the template in the `template/` directory. See [OEM_PACKS.md](../../docs/OEM_PACKS.md) for guidelines.
