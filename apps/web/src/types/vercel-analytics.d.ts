declare module "@vercel/analytics/react" {
  import React from "react";
  export function Analytics(props?: any): React.JSX.Element | null;
}

declare module "@opentelemetry/api" {
  export const trace: any;
  export const metrics: any;
}

declare module "@opentelemetry/sdk-node" {
  export class NodeSDK {
    constructor(config?: any);
    start(): void;
  }
}
