interface DeviceHints { width: number; cores: number; saveData: boolean; deviceMemory?: number }

/** Particle count for this device (spec §5.3): never let the helix freeze a weak phone. */
export function particleBudget({ width, cores, saveData, deviceMemory }: DeviceHints): number {
  if (saveData || cores <= 2 || (deviceMemory !== undefined && deviceMemory <= 2)) return 4000;
  return width < 1024 ? 6000 : 20000;
}
