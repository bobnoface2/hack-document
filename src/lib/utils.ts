export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [...content.matchAll(regex)];
  // Return unique variables, clean up any HTML tags or &nbsp; inside the variable name
  const vars = matches.map((m) => {
    return m[1].replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();
  });
  return [...new Set(vars)].filter(Boolean);
}

export function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  // Replace each variable individually by going through all {{...}} blocks
  // This approach is safe against formatting like {{ <span...>var</span> }} inside a rich text editor.
  const regex = /\{\{([^}]+)\}\}/g;
  result = result.replace(regex, (match, captured) => {
    const cleanedCaptured = captured.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();
    if (variables[cleanedCaptured] !== undefined) {
      return variables[cleanedCaptured];
    }
    return match;
  });
  return result;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
