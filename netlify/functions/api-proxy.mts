import type { Context, Config } from "@netlify/functions";

const API_BASE_URL = Netlify.env.get("EXTERNAL_API_URL") || "http://158.160.203.172:8080";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);

  // Extract the path after /api/
  const apiPath = url.pathname.replace(/^\/api/, "");

  // Build the target URL with query parameters
  const targetUrl = new URL(apiPath, API_BASE_URL);
  targetUrl.search = url.search;

  // Forward the request to the external API
  const headers = new Headers();
  headers.set("Content-Type", req.headers.get("Content-Type") || "application/json");

  // Forward authorization header if present
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  try {
    let body: BodyInit | null = null;

    // Handle request body for POST, PUT, DELETE methods
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("Content-Type") || "";

      if (contentType.includes("multipart/form-data")) {
        // For file uploads, forward the formData
        body = await req.formData();
      } else if (contentType.includes("application/json")) {
        body = await req.text();
      } else {
        body = await req.text();
      }
    }

    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    // Get response headers
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", response.headers.get("Content-Type") || "application/json");

    // Return the response from the external API
    const responseBody = await response.arrayBuffer();

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to connect to external API",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

export const config: Config = {
  path: "/api/*",
};
