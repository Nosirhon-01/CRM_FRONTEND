import { BACKEND_BASE_URL } from '../config/api';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const trimLeadingSlash = (value) => value.replace(/^\/+/, '');

export const getMediaUrl = (url, fallbackFolder = '') => {
  if (!url) return '';

  const value = String(url).trim();
  if (!value) return '';

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }

  const backendUrl = trimTrailingSlash(BACKEND_BASE_URL);
  const cleanUrl = trimLeadingSlash(value);

  if (cleanUrl.startsWith('uploads/') || cleanUrl.startsWith('files/')) {
    return `${backendUrl}/${cleanUrl}`;
  }

  if (fallbackFolder) {
    const cleanFolder = trimLeadingSlash(fallbackFolder).replace(/\/+$/, '');
    return `${backendUrl}/uploads/${cleanFolder}/${cleanUrl}`;
  }

  return `${backendUrl}/${cleanUrl}`;
};
