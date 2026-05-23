import { Customer, HydraResource } from './types';

export type ApiResourceRef = string | number | HydraResource | null | undefined;

export function resolveResourceIri(ref: ApiResourceRef, resourceType?: string): string | null {
  if (ref == null) return null;

  if (typeof ref === 'number') {
    return resourceType ? `/api/${resourceType}/${ref}` : null;
  }

  if (typeof ref === 'string') {
    if (ref.startsWith('/api/')) return ref;
    if (resourceType) return `/api/${resourceType}/${ref}`;
    return ref;
  }

  if (typeof ref === 'object') {
    if (ref['@id']) return ref['@id'];
    if (ref.id != null && resourceType) return `/api/${resourceType}/${ref.id}`;
  }

  return null;
}

export function resolveResourceId(ref: ApiResourceRef): number | null {
  if (ref == null) return null;

  if (typeof ref === 'number') return ref;

  if (typeof ref === 'string') {
    const match = ref.match(/\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }

  if (typeof ref === 'object') {
    if (ref.id != null) return Number(ref.id);
    if (ref['@id']) return resolveResourceId(ref['@id']);
  }

  return null;
}

export function resolveCustomerEndpoint(ref: string | Customer | number): string {
  const iri = resolveResourceIri(ref, 'customers');
  if (iri) return iri;

  const id = resolveResourceId(ref);
  if (id != null) return `/customers/${id}`;

  throw new Error('Invalid customer reference');
}

export function getEmbeddedCustomer(ref: string | Customer | undefined): Customer | null {
  if (ref && typeof ref === 'object' && 'firstName' in ref) {
    return ref;
  }
  return null;
}
