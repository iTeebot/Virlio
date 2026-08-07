/**
 * Microsecond Server Timing helper for HTTP response headers
 */
export class ServerTiming {
  private metrics: Map<string, number> = new Map();

  start(name: string) {
    this.metrics.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;
    const duration = performance.now() - startTime;
    this.metrics.set(`${name}_dur`, duration);
    return duration;
  }

  getHeaderString(): string {
    const headers: string[] = [];
    this.metrics.forEach((value, key) => {
      if (key.endsWith("_dur")) {
        const metricName = key.replace("_dur", "");
        headers.push(`${metricName};dur=${value.toFixed(2)}`);
      }
    });
    return headers.join(", ");
  }
}
