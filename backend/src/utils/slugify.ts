export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

export const generateUniqueSlug = (firstName: string, lastName: string, userId: string): string => {
  const baseSlug = slugify(`${firstName} ${lastName}`);
  const uniquePart = userId.substring(0, 8);
  return `${baseSlug}-${uniquePart}`;
};
