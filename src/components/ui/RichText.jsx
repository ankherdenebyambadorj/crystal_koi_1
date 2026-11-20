export function RichText({ parts }) {
  if (!Array.isArray(parts)) {
    return parts ?? null;
  }

  return parts.map((part, idx) => {
    if (typeof part === 'string') {
      return <span key={idx}>{part}</span>;
    }
    if (part && part.br) {
      return <br key={idx} />;
    }
    if (part && typeof part.accent === 'string') {
      return (
        <span key={idx} className="ck-accent">
          {part.accent}
        </span>
      );
    }
    if (part && typeof part.serif === 'string') {
      return (
        <span key={idx} className="ck-serif">
          {part.serif}
        </span>
      );
    }
    return null;
  });
}
