export const ellipsifyText = (text?: string, maxLength = 100) => {
  if (!text) return undefined;

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
