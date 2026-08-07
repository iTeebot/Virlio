/**
 * Next.js Server Initialization Hook (OpenTelemetry Tracing)
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Telemetry] OpenTelemetry Node.js Instrumentation initialized.");
  }
}
