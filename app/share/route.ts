import { NextRequest, NextResponse } from "next/server";

/**
 * Web Share Target API route handler
 * Receives POST requests from the share target and redirects to home page with shared data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract shared content from form data
    const title = formData.get("title")?.toString() || "";
    const text = formData.get("text")?.toString() || "";
    const url = formData.get("url")?.toString() || "";

    // Log the shared content to console (server-side)
    console.log("Received share:", {
      title,
      text,
      url,
      timestamp: new Date().toISOString(),
    });

    // Build query parameters for redirect
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (text) params.set("text", text);
    if (url) params.set("url", url);

    // Redirect to home page with shared data as query parameters
    const redirectUrl = `/?${params.toString()}`;
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Error handling share:", error);
    
    // On error, redirect to home page without data
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// Handle GET requests (for testing or direct access)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const url = searchParams.get("url") || "";

  return NextResponse.json({
    message: "Share endpoint - use POST from share target",
    received: {
      title,
      text,
      url,
    },
  });
}
