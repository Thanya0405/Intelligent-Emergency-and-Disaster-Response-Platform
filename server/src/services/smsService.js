let twilioClient = null;
let twilioFrom = null;

const initTwilio = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    console.warn('⚠️  Twilio not configured — SMS will be mocked');
    return false;
  }
  try {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    twilioFrom = TWILIO_PHONE_NUMBER;
    console.log('✅ Twilio SMS initialized');
    return true;
  } catch (e) {
    console.warn('⚠️  Twilio init failed:', e.message);
    return false;
  }
};

const twilioAvailable = initTwilio();

const sendSMS = async (to, message) => {
  if (!twilioAvailable) {
    console.log(`📱 [MOCK SMS] To: ${to} | Message: ${message.substring(0, 50)}...`);
    return { success: true, mock: true, sid: 'MOCK_' + Date.now() };
  }
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioFrom,
      to
    });
    return { success: true, sid: result.sid };
  } catch (e) {
    console.error('SMS send failed:', e.message);
    return { success: false, error: e.message };
  }
};

const sendEmergencyAlert = async (contacts, emergencyData) => {
  const message = `🚨 SafeGuard AI EMERGENCY ALERT
Type: ${emergencyData.type.toUpperCase()}
User: ${emergencyData.userName}
Severity: ${emergencyData.severity}
Location: https://maps.google.com/?q=${emergencyData.lat},${emergencyData.lng}
Time: ${new Date().toLocaleString()}
Please respond immediately or contact emergency services (108/112).`;

  const results = await Promise.allSettled(
    contacts.map(contact => sendSMS(contact.phone, message))
  );
  return results;
};

module.exports = { sendSMS, sendEmergencyAlert };
