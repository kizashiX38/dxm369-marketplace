// src/app/api/email/unsubscribe/route.ts
// Email Unsubscribe API
// Handle newsletter unsubscriptions

import { NextRequest, NextResponse } from "next/server";
import { emailMarketing } from "@/lib/emailMarketing";
import { appConfig } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriberId, email } = body;

    if (!subscriberId && !email) {
      return NextResponse.json({
        success: false,
        error: "Either subscriberId or email is required"
      }, { status: 400 });
    }

    let success = false;

    if (subscriberId) {
      success = await emailMarketing.unsubscribe(subscriberId);
    } else if (email) {
      // Security: Email-only unsubscribe is not supported
      // Users must use the signed unsubscribe link from their email
      // This prevents malicious unsubscription of arbitrary addresses
      console.warn(`[EMAIL_UNSUBSCRIBE] Rejected email-only unsubscribe attempt: ${email.substring(0, 3)}***`);
      return NextResponse.json({
        success: false,
        error: "For security, please use the unsubscribe link from your email. This prevents unauthorized unsubscriptions."
      }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed from DXM369 newsletter"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Subscriber not found or already unsubscribed"
      }, { status: 404 });
    }

  } catch (error) {
    console.error("[EMAIL_UNSUBSCRIBE_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const siteUrl = appConfig.siteUrl;

  try {
    const { searchParams } = new URL(req.url);
    const subscriberId = searchParams.get("id");

    if (!subscriberId) {
      return NextResponse.json({
        success: false,
        error: "Subscriber ID is required"
      }, { status: 400 });
    }

    const success = await emailMarketing.unsubscribe(subscriberId);

    if (success) {
      // Return HTML page for unsubscribe confirmation
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribed - DXM369</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px; 
              margin: 0 auto; 
              padding: 40px 20px;
              background: #f8fafc;
              color: #334155;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 20px;
            }
            .success {
              color: #059669;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: #0ea5e9;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">DXM369</div>
            <div class="success">✓ Successfully Unsubscribed</div>
            <div class="message">
              You have been successfully unsubscribed from DXM369 newsletter.
              <br><br>
              We're sorry to see you go! If you change your mind, you can always 
              subscribe again on our website.
            </div>
            <a href="${siteUrl}" class="button">Visit DXM369</a>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" }
      });
    } else {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe Error - DXM369</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px; 
              margin: 0 auto; 
              padding: 40px 20px;
              background: #f8fafc;
              color: #334155;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 20px;
            }
            .error {
              color: #dc2626;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: #0ea5e9;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">DXM369</div>
            <div class="error">⚠ Unsubscribe Failed</div>
            <div class="message">
              We couldn't find your subscription or you may already be unsubscribed.
              <br><br>
              If you continue to receive emails, please contact our support team.
            </div>
            <a href="${siteUrl}/contact" class="button">Contact Support</a>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        status: 404,
        headers: { "Content-Type": "text/html" }
      });
    }

  } catch (error) {
    console.error("[EMAIL_UNSUBSCRIBE_GET_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
