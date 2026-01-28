export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome 🐾</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #fefaf6; padding: 20px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">
      
      <h1 style="margin: 0; color: #333;">Welcome, ${name}! 🐶</h1>
      <p style="font-size: 16px; color: #555; margin-top: 10px;">
        Your cozy chat space is ready. Just like Snoopy says:<br/>
        <em>“Happiness is a warm conversation.”</em>
      </p>

      <a href="${clientURL}" 
         style="display: inline-block; margin-top: 20px; padding: 12px 28px; background-color: #f5c16c; color: #333; text-decoration: none; border-radius: 999px; font-weight: bold;">
        Enter the Doghouse 💬
      </a>

      <p style="margin-top: 30px; font-size: 14px; color: #888;">
        — Your Snoopy-style Chat Team 🐾
      </p>
    </div>
  </body>
  </html>
  `;
}
