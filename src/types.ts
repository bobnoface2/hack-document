export type TemplateType = 'documento' | 'nota' | 'recibo';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  format?: 'text' | 'html';
  content: string; // The text/HTML containing {{vars}}
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  type: TemplateType;
  format?: 'text' | 'html';
  variables: Record<string, string>;
  finalContent: string;
  createdAt: string;
}
