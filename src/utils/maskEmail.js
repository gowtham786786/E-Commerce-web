/**
 * Masks an email address so only the first letter and last 2 letters of the local part are visible.
 * Example: reddygowtham397@gmail.com -> r************97@gmail.com
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email || '';
  }

  const [username, domain] = email.split('@');
  
  if (username.length <= 3) {
    return `${username[0]}*${username.slice(-1)}@${domain}`;
  }

  const firstLetter = username.charAt(0);
  const lastTwoLetters = username.slice(-2);
  const maskedMiddle = '*'.repeat(username.length - 3);

  return `${firstLetter}${maskedMiddle}${lastTwoLetters}@${domain}`;
};
