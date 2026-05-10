export interface PartInput {
  title: string;
  description?: string;
  price?: number;
  condition?: 'new' | 'like_new' | 'excellent' | 'good' | 'fair';
  brand_id?: string;
  category_id?: string;
  model_id?: string;
  images?: string[];
  specifications?: Record<string, unknown>;
}

export interface UpdatePartInput extends Partial<PartInput> {
  status?: 'draft' | 'active' | 'sold' | 'ended' | 'cancelled';
  featured?: boolean;
}

export function validatePartInput(input: PartInput): string[] {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length < 3) {
    errors.push('Título deve ter pelo menos 3 caracteres');
  }

  if (input.title && input.title.length > 200) {
    errors.push('Título deve ter no máximo 200 caracteres');
  }

  if (input.price !== undefined && input.price < 0) {
    errors.push('Preço não pode ser negativo');
  }

  if (input.price && input.price > 10000000) {
    errors.push('Preço máximo é ¥10.000.000');
  }

  const validConditions = ['new', 'like_new', 'excellent', 'good', 'fair'];
  if (input.condition && !validConditions.includes(input.condition)) {
    errors.push('Condição inválida');
  }

  if (input.images && input.images.length > 10) {
    errors.push('Máximo de 10 imagens');
  }

  return errors;
}

export function validateUpdatePartInput(input: UpdatePartInput): string[] {
  const errors: string[] = [];

  if (input.title !== undefined) {
    if (input.title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres');
    }
    if (input.title.length > 200) {
      errors.push('Título deve ter no máximo 200 caracteres');
    }
  }

  if (input.price !== undefined && input.price < 0) {
    errors.push('Preço não pode ser negativo');
  }

  if (input.price && input.price > 10000000) {
    errors.push('Preço máximo é ¥10.000.000');
  }

  const validConditions = ['new', 'like_new', 'excellent', 'good', 'fair'];
  if (input.condition && !validConditions.includes(input.condition)) {
    errors.push('Condição inválida');
  }

  const validStatuses = ['draft', 'active', 'sold', 'ended', 'cancelled'];
  if (input.status && !validStatuses.includes(input.status)) {
    errors.push('Status inválido');
  }

  return errors;
}