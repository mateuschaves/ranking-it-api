export function formatPhone(phoneNumber: string): string {
  if (!phoneNumber) return '';

  return phoneNumber
    .replace(/\D/g, '')
    .replace(/^(\d{2})\B/, '($1) ')
    .replace(/(\d{1})?(\d{4})(\d{4})/, '$1$2-$3');
}

export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';

  return cnpj
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatCEP(cep: string): string {
  if (!cep) return '';
  return cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function formatRG(rg: string): string {
  if (!rg) return '';
  return rg
    .replace(/[^\dXx]/g, '')
    .replace(/^(\d{1,2})(\d{3})(\d{3})([\dX])$/, '$1.$2.$3-$4');
}
export function formatDateOfBirth(date: string): string {
  if (!date) return '';
  return date.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{2})/, '$1/$2/$3');
}
