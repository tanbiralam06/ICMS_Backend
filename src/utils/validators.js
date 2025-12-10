const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  return emailRegex.test(email);
};

export default {
  validateEmail,
};
