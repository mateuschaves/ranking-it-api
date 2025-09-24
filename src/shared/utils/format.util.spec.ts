import { formatPhone, formatCPF, formatCNPJ, formatCEP, formatRG, formatDateOfBirth } from './format.util';

describe('FormatUtil', () => {
  describe('formatPhone', () => {
    it('should format phone with 11 digits', () => {
      const phone = '11987654321';
      const result = formatPhone(phone);
      
      expect(result).toBe('(11) 98765-4321');
    });

    it('should format phone with 10 digits', () => {
      const phone = '1134567890';
      const result = formatPhone(phone);
      
      expect(result).toBe('(11) 3456-7890');
    });

    it('should return empty string for empty input', () => {
      const phone = '';
      const result = formatPhone(phone);
      
      expect(result).toBe('');
    });
  });

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      const cpf = '12345678901';
      const result = formatCPF(cpf);
      
      expect(result).toBe('123.456.789-01');
    });

    it('should return empty string for empty input', () => {
      const cpf = '';
      const result = formatCPF(cpf);
      
      expect(result).toBe('');
    });
  });

  describe('formatCNPJ', () => {
    it('should format CNPJ correctly', () => {
      const cnpj = '12345678000195';
      const result = formatCNPJ(cnpj);
      
      expect(result).toBe('12.345.678/0001-95');
    });

    it('should return empty string for empty input', () => {
      const cnpj = '';
      const result = formatCNPJ(cnpj);
      
      expect(result).toBe('');
    });
  });

  describe('formatCEP', () => {
    it('should format CEP correctly', () => {
      const cep = '12345678';
      const result = formatCEP(cep);
      
      expect(result).toBe('12345-678');
    });

    it('should return empty string for empty input', () => {
      const cep = '';
      const result = formatCEP(cep);
      
      expect(result).toBe('');
    });
  });

  describe('formatRG', () => {
    it('should format RG correctly', () => {
      const rg = '123456789';
      const result = formatRG(rg);
      
      expect(result).toBe('12.345.678-9');
    });

    it('should return empty string for empty input', () => {
      const rg = '';
      const result = formatRG(rg);
      
      expect(result).toBe('');
    });
  });

  describe('formatDateOfBirth', () => {
    it('should format date of birth correctly', () => {
      const date = '15012000';
      const result = formatDateOfBirth(date);
      
      expect(result).toBe('15/01/2000');
    });

    it('should return empty string for empty input', () => {
      const date = '';
      const result = formatDateOfBirth(date);
      
      expect(result).toBe('');
    });
  });
});
