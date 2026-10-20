/** Public contact channels. Override with VITE_CONTACT_* env vars per deployment. */
const env = import.meta.env;

export const CONTACT = {
  phone: env.VITE_CONTACT_PHONE || '+8801700000000',
  phoneLabel: env.VITE_CONTACT_PHONE_LABEL || '+880 1700-000000',
  whatsapp: env.VITE_CONTACT_WHATSAPP || '8801700000000', // digits only, with country code
  messenger: env.VITE_CONTACT_MESSENGER || 'edurock', // facebook page username
  email: env.VITE_CONTACT_EMAIL || 'hello@edurock.app',
};

export const contactLinks = {
  whatsapp: (text = 'Hi Edurock! I have a question about tuition.') => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`,
  messenger: () => `https://m.me/${CONTACT.messenger}`,
  call: () => `tel:${CONTACT.phone}`,
  email: () => `mailto:${CONTACT.email}?subject=${encodeURIComponent('Question about Edurock')}`,
};
