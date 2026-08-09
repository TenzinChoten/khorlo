export const baseEmailLayout = (content: string, preheader: string = "Update from Khorlo") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Khorlo</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 40px 0;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      overflow: hidden;
    }
    .header {
      padding: 32px 32px 24px;
      text-align: left;
    }
    .header h1 {
      margin: 0;
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content-box {
      padding: 0 32px 32px;
    }
    .content-box p {
      line-height: 1.625;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 16px;
      color: #374151;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0 0 8px;
      font-size: 13px;
      color: #6b7280;
    }
    .footer a {
      color: #4b5563;
      text-decoration: underline;
    }
    .btn {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px 0;
      text-align: center;
    }
    .fallback-link {
      display: block;
      margin-top: 16px;
      font-size: 13px;
      color: #6b7280;
      word-break: break-all;
    }
    .fallback-link a {
      color: #2563eb;
      text-decoration: none;
    }
    .preheader {
      display: none;
      max-height: 0px;
      overflow: hidden;
      mso-hide: all;
    }
    .security-notice {
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      margin-top: 32px;
    }
    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 10px;
      }
      .container {
        width: 100% !important;
        border-radius: 8px;
      }
      .header, .content-box, .footer {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <!-- Text-based logo for now to avoid external asset dependency issues -->
        <h1>Khorlo</h1>
      </div>
      <div class="content-box">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Khorlo. All rights reserved.</p>
        <p>If you have any questions, contact our support team.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
