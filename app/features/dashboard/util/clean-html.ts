import sanitizeHtml from "sanitize-html";

export const cleanHtml = (html: string) => {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["style"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, "*": ["style"] },
  });
};
