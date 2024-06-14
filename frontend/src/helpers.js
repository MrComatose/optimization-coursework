export function ticksToMilliseconds(ticks) {
    // 1 tick = 0.0001 milliseconds
    const milliseconds = ticks * 0.0001;
    return milliseconds;
}