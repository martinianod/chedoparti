/**
 * Tests para las utilidades de visualización de usuarios
 */

import { describe, it, expect } from 'vitest';
import {
  getUserDisplayText,
  getUserNameForAvatar,
  getUserPhone,
  getUserEmail,
} from '../src/utils/userDisplay.js';

describe('User Display Utilities', () => {
  describe('getUserDisplayText', () => {
    it('should return username when available', () => {
      const user = { username: 'juan.perez', name: 'Juan Pérez', phone: '123456789' };
      const result = getUserDisplayText(user);
      expect(result).toBe('juan.perez');
    });

    it('should return name when username not available', () => {
      const user = { name: 'María García', phone: '987654321' };
      const result = getUserDisplayText(user);
      expect(result).toBe('María García');
    });

    it('should return phone when neither username nor name available', () => {
      const user = { phone: '555-1234', email: 'test@example.com' };
      const result = getUserDisplayText(user);
      expect(result).toBe('555-1234');
    });

    it('should return email when username, name, and phone not available', () => {
      const user = { email: 'usuario@example.com' };
      const result = getUserDisplayText(user);
      expect(result).toBe('usuario@example.com');
    });

    it('should return "Usuario" when no identifying information available', () => {
      const user = {};
      const result = getUserDisplayText(user);
      expect(result).toBe('Usuario');
    });

    it('should handle null or undefined user', () => {
      expect(getUserDisplayText(null)).toBe('Usuario');
      expect(getUserDisplayText(undefined)).toBe('Usuario');
    });

    it('should trim whitespace from values', () => {
      const user = { username: '  spaced.user  ', name: '  Spaced Name  ' };
      const result = getUserDisplayText(user);
      expect(result).toBe('spaced.user');
    });

    it('should handle empty strings as if they were not provided', () => {
      const user = { username: '', name: '', phone: '123-456-7890' };
      const result = getUserDisplayText(user);
      expect(result).toBe('123-456-7890');
    });
  });

  describe('getUserNameForAvatar', () => {
    it('should return name when available', () => {
      const user = { name: 'Ana López', username: 'ana.lopez' };
      const result = getUserNameForAvatar(user);
      expect(result).toBe('Ana López');
    });

    it('should return username when name not available', () => {
      const user = { username: 'carlos.ruiz' };
      const result = getUserNameForAvatar(user);
      expect(result).toBe('carlos.ruiz');
    });

    it('should return "Usuario" when neither available', () => {
      const user = { email: 'test@example.com' };
      const result = getUserNameForAvatar(user);
      expect(result).toBe('Usuario');
    });

    it('should handle null user', () => {
      const result = getUserNameForAvatar(null);
      expect(result).toBe('Usuario');
    });

    it('should trim whitespace', () => {
      const user = { name: '  Pedro Martínez  ' };
      const result = getUserNameForAvatar(user);
      expect(result).toBe('Pedro Martínez');
    });
  });

  describe('getUserPhone', () => {
    it('should return phone when available', () => {
      const user = { phone: '555-0123' };
      const result = getUserPhone(user);
      expect(result).toBe('555-0123');
    });

    it('should return empty string when phone not available', () => {
      const user = { name: 'Test User' };
      const result = getUserPhone(user);
      expect(result).toBe('');
    });

    it('should handle null user', () => {
      const result = getUserPhone(null);
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const user = { phone: '  +34 666 777 888  ' };
      const result = getUserPhone(user);
      expect(result).toBe('+34 666 777 888');
    });

    it('should handle empty string phone', () => {
      const user = { phone: '' };
      const result = getUserPhone(user);
      expect(result).toBe('');
    });
  });

  describe('getUserEmail', () => {
    it('should return email when available', () => {
      const user = { email: 'test@example.com' };
      const result = getUserEmail(user);
      expect(result).toBe('test@example.com');
    });

    it('should return empty string when email not available', () => {
      const user = { name: 'Test User' };
      const result = getUserEmail(user);
      expect(result).toBe('');
    });

    it('should handle null user', () => {
      const result = getUserEmail(null);
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const user = { email: '  user@domain.com  ' };
      const result = getUserEmail(user);
      expect(result).toBe('user@domain.com');
    });

    it('should handle empty string email', () => {
      const user = { email: '' };
      const result = getUserEmail(user);
      expect(result).toBe('');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex user objects consistently', () => {
      const user = {
        id: 123,
        username: 'complete.user',
        name: 'Complete User Name',
        email: 'complete@example.com',
        phone: '+34 123 456 789',
        role: 'admin',
      };

      expect(getUserDisplayText(user)).toBe('complete.user');
      expect(getUserNameForAvatar(user)).toBe('Complete User Name');
      expect(getUserPhone(user)).toBe('+34 123 456 789');
      expect(getUserEmail(user)).toBe('complete@example.com');
    });

    it('should handle partial user objects gracefully', () => {
      const user = {
        name: 'Partial User',
        email: 'partial@example.com',
      };

      expect(getUserDisplayText(user)).toBe('Partial User');
      expect(getUserNameForAvatar(user)).toBe('Partial User');
      expect(getUserPhone(user)).toBe('');
      expect(getUserEmail(user)).toBe('partial@example.com');
    });

    it('should handle minimal user objects', () => {
      const user = { phone: '999-888-777' };

      expect(getUserDisplayText(user)).toBe('999-888-777');
      expect(getUserNameForAvatar(user)).toBe('Usuario');
      expect(getUserPhone(user)).toBe('999-888-777');
      expect(getUserEmail(user)).toBe('');
    });
  });
});
