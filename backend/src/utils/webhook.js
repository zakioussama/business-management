import 'dotenv/config';

const WEBHOOK_URL = process.env.WEBHOOK_URL;

/**
 * Sends a webhook notification to a specified URL.
 * @param {string} eventName - The name of the event (e.g., 'ticket_created').
 * @param {object} payload - The JSON payload to send with the event.
 */
export const sendWebhook = async (eventName, payload) => {
  if (!WEBHOOK_URL) {
    console.warn('WEBHOOK_URL is not defined. Skipping webhook send.');
    return;
  }

  const body = {
    event: eventName,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Webhook send failed for event '${eventName}' with status: ${response.status}`);
      const responseBody = await response.text();
      console.error('Response body:', responseBody);
    } else {
        console.log(`Webhook for event '${eventName}' sent successfully.`);
    }
  } catch (error) {
    console.error(`Error sending webhook for event '${eventName}':`, error.message);
  }
};
