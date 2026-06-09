export const CONTENT_BUILDERS = {
  text: (c) => c.querySelector('#qr-content').value,
  url: (c) => c.querySelector('#qr-content').value,
  wifi: (c) => {
    const ssid = c.querySelector('#wifi-ssid').value;
    const password = c.querySelector('#wifi-password').value;
    const encryption = c.querySelector('#wifi-encryption').value;
    const hidden = c.querySelector('#wifi-hidden').checked;
    return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
  },
  vcard: (c) => {
    const name = c.querySelector('#vcard-name').value;
    const phone = c.querySelector('#vcard-phone').value;
    const email = c.querySelector('#vcard-email').value;
    const org = c.querySelector('#vcard-org').value;
    const title = c.querySelector('#vcard-title').value;
    const website = c.querySelector('#vcard-website').value;
    const parts = name.trim().split(/\s+/);
    const lastName = parts.length > 1 ? parts.pop() : '';
    const firstName = parts.join(' ');
    return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName};;;\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nTITLE:${title}\nURL:${website}\nEND:VCARD`;
  },
  email: (c) => {
    const address = c.querySelector('#email-address').value;
    const subject = c.querySelector('#email-subject').value;
    const body = c.querySelector('#email-body').value;
    return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },
  phone: (c) => `tel:${c.querySelector('#phone-number').value}`,
  sms: (c) => {
    const number = c.querySelector('#sms-number').value;
    const body = c.querySelector('#sms-body').value;
    return `sms:${number}?body=${encodeURIComponent(body)}`;
  }
};

export const TYPE_FIELDS = {
  text: 'content-inputs',
  url: 'content-inputs',
  wifi: 'wifi-fields',
  vcard: 'vcard-fields',
  email: 'email-fields',
  phone: 'phone-fields',
  sms: 'sms-fields'
};

export function buildVcf(c) {
  const name = c.querySelector('#vcard-name').value || 'Contact';
  const phone = c.querySelector('#vcard-phone').value;
  const email = c.querySelector('#vcard-email').value;
  const org = c.querySelector('#vcard-org').value;
  const title = c.querySelector('#vcard-title').value;
  const website = c.querySelector('#vcard-website').value;
  const parts = name.trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts.pop() : '';
  const firstName = parts.join(' ');
  let vcf = 'BEGIN:VCARD\nVERSION:3.0\n';
  vcf += `N:${lastName};${firstName};;;\nFN:${name}\n`;
  if (phone) vcf += `TEL:${phone}\n`;
  if (email) vcf += `EMAIL:${email}\n`;
  if (org) vcf += `ORG:${org}\n`;
  if (title) vcf += `TITLE:${title}\n`;
  if (website) vcf += `URL:${website}\n`;
  vcf += 'END:VCARD';
  return { vcf, filename: `${name.replace(/\s+/g, '_')}.vcf` };
}
