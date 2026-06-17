export function safeColor(color: string): string {
  if (!color) return "#ff0080";
  
  // Define custom regex-based color validator
  const isValidColor = (c: string): boolean => {
    const trimmed = c.trim().toLowerCase();
    
    // Transparent & basic inheritances
    if (["transparent", "inherit", "initial", "currentcolor"].includes(trimmed)) {
      return true;
    }
    
    // Hex colors
    if (trimmed.startsWith("#")) {
      const hex = trimmed.substring(1);
      return (hex.length === 3 || hex.length === 4 || hex.length === 6 || hex.length === 8) && /^[0-9a-f]+$/.test(hex);
    }
    
    // rgb/rgba colors
    if (trimmed.startsWith("rgba(") || trimmed.startsWith("rgb(")) {
      const startIdx = trimmed.indexOf("(");
      const endIdx = trimmed.lastIndexOf(")");
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return false;
      const contents = trimmed.substring(startIdx + 1, endIdx).trim();
      return /^[0-9\s,./%]+$/.test(contents);
    }
    
    // hsl/hsla colors
    if (trimmed.startsWith("hsla(") || trimmed.startsWith("hsl(")) {
      const startIdx = trimmed.indexOf("(");
      const endIdx = trimmed.lastIndexOf(")");
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return false;
      const contents = trimmed.substring(startIdx + 1, endIdx).trim();
      return /^[0-9\s,./%a-z]+$/.test(contents);
    }
    
    // Named colors: single alphabetical word
    return /^[a-z]+$/.test(trimmed);
  };

  // 1. SSR / Hydration Safety Check
  if (typeof window === "undefined" || typeof document === "undefined") {
    return isValidColor(color) ? color : "#ff0080";
  }

  // 2. Client-side DOM parsing safety check
  try {
    const test = document.createElement("div");
    test.style.color = color;
    // If JSDOM/browser sets it, verify it isn't returning a malformed raw string
    if (test.style.color && isValidColor(test.style.color)) {
      return color;
    }
    return "#ff0080";
  } catch {
    return "#ff0080";
  }
}

