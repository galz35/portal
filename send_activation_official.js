const nodemailer = require('D:\\planificacion\\v2sistema\\v2backend\\node_modules\\nodemailer');

async function sendActivation() {
  const recipient = 'gustavo.lira@claro.com.ni';
  console.log(`📬 Enviando correo de activación a: ${recipient}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'rrrhh1930@gmail.com',
      pass: 'cqvekscikoptijvq'
    }
  });

  const mailOptions = {
    from: '"Portal Central Claro" <rrrhh1930@gmail.com>',
    to: recipient,
    subject: '🎯 Activación de tu nueva cuenta: Portal Central Claro 2026',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 20px;">
          <h1 style="color: #e30613; margin: 0;">Portal Central Claro</h1>
          <p style="font-size: 1.2em; color: #555;">Sistema Unificado de Gestión</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
          <p>Hola <strong>Gustavo Lira</strong>,</p>
          <p>Te damos la bienvenida al nuevo <strong>Portal Central</strong>. Tu cuenta ha sido migrada desde el sistema Planer satisfactoriamente.</p>
          
          <p>Para garantizar la seguridad de tu información, hemos establecido una contraseña temporal. Por favor, realiza la activación de tu cuenta haciendo clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://rhclaroni.com/auth/activate?token=ACT-500708-XYZ" 
               style="background-color: #e30613; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em; display: inline-block;">
               ACTIVAR MI CUENTA AHORA
            </a>
          </div>

          <div style="background-color: #fff; padding: 15px; border-left: 5px solid #e30613; margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Credenciales Temporales:</strong></p>
            <ul style="margin: 10px 0;">
              <li><strong>Usuario:</strong> 500708</li>
              <li><strong>Contraseña Temporal:</strong> 123456</li>
            </ul>
          </div>

          <p style="font-size: 0.9em; color: #666;">Nota: Se te solicitará cambiar tu contraseña inmediatamente después de hacer clic en el botón.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #888;">
          <p>Este es un correo automático generado por el Ecosistema Digital Claro.<br>
          Por favor, no respondas a este mensaje.</p>
          <p>&copy; 2026 Claro Nicaragua - Gerencia de Recursos Humanos</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ ¡Correo enviado con éxito!');
    console.log('📧 MessageID:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar:', error);
  }
}

sendActivation();
