import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMemberSearch } from '../src/hooks/useMemberSearch';

// Mock de la API
vi.mock('../src/services/api', () => ({
  usersApi: {
    searchMembers: vi.fn(),
  },
}));

// Mock de notifications
vi.mock('../src/hooks/useAppNotifications', () => ({
  useAppNotifications: () => ({
    reservation: {
      error: vi.fn(),
    },
  }),
}));

import { usersApi } from '../src/services/api';

describe('useMemberSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa con valores por defecto', () => {
    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.selectedMember).toBeNull();
    expect(result.current.isSearching).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  });

  it('no busca si enabled es false', async () => {
    const { result } = renderHook(() => useMemberSearch({ enabled: false }));

    act(() => {
      result.current.setSearchTerm('test');
    });

    await waitFor(() => {
      expect(usersApi.searchMembers).not.toHaveBeenCalled();
    });
  });

  it('no busca si el término tiene menos de 2 caracteres', async () => {
    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    act(() => {
      result.current.setSearchTerm('a');
    });

    await waitFor(() => {
      expect(usersApi.searchMembers).not.toHaveBeenCalled();
    });
  });

  it('busca miembros cuando el término es válido', async () => {
    const mockMembers = [
      { id: 1, name: 'Juan Pérez', email: 'juan@test.com', role: 'SOCIO' },
      { id: 2, name: 'María García', email: 'maria@test.com', role: 'SOCIO' },
    ];

    usersApi.searchMembers.mockResolvedValue({ data: mockMembers });

    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    act(() => {
      result.current.setSearchTerm('juan');
    });

    await waitFor(() => {
      expect(usersApi.searchMembers).toHaveBeenCalledWith('juan');
      expect(result.current.results).toEqual(mockMembers);
      expect(result.current.showDropdown).toBe(true);
    });
  });

  it('filtra por rol cuando se especifica', async () => {
    const mockMembers = [
      { id: 1, name: 'Coach 1', email: 'coach1@test.com', role: 'COACH' },
      { id: 2, name: 'Socio 1', email: 'socio1@test.com', role: 'SOCIO' },
    ];

    usersApi.searchMembers.mockResolvedValue({ data: mockMembers });

    const { result } = renderHook(() =>
      useMemberSearch({ enabled: true, filterByRole: 'COACH' })
    );

    act(() => {
      result.current.setSearchTerm('test');
    });

    await waitFor(() => {
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].role).toBe('COACH');
    });
  });

  it('maneja la selección de un miembro', () => {
    const mockMember = { id: 1, name: 'Juan Pérez', email: 'juan@test.com' };
    const onSelect = vi.fn();

    const { result } = renderHook(() => useMemberSearch({ enabled: true, onSelect }));

    act(() => {
      result.current.handleSelect(mockMember);
    });

    expect(result.current.selectedMember).toEqual(mockMember);
    expect(result.current.searchTerm).toBe('Juan Pérez');
    expect(result.current.showDropdown).toBe(false);
    expect(onSelect).toHaveBeenCalledWith(mockMember);
    expect(result.current.hasSelection).toBe(true);
  });

  it('limpia la búsqueda correctamente', () => {
    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    // Primero establecer algunos valores
    act(() => {
      result.current.setSearchTerm('test');
      result.current.handleSelect({ id: 1, name: 'Test' });
    });

    // Luego limpiar
    act(() => {
      result.current.clear();
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.selectedMember).toBeNull();
  });

  it('limpia la selección cuando se borra el término de búsqueda', () => {
    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    act(() => {
      result.current.handleSelect({ id: 1, name: 'Test' });
    });

    expect(result.current.selectedMember).not.toBeNull();

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.selectedMember).toBeNull();
    expect(result.current.results).toEqual([]);
  });

  it('maneja errores de búsqueda sin romper', async () => {
    usersApi.searchMembers.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    act(() => {
      result.current.setSearchTerm('test');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
      expect(result.current.showDropdown).toBe(false);
      expect(result.current.isSearching).toBe(false);
    });
  });

  it('implementa debouncing correctamente', async () => {
    const { result } = renderHook(() => useMemberSearch({ enabled: true }));

    // Simular escritura rápida
    act(() => {
      result.current.setSearchTerm('j');
    });
    act(() => {
      result.current.setSearchTerm('ju');
    });
    act(() => {
      result.current.setSearchTerm('jua');
    });

    // Esperar el debounce (300ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Solo debe haber llamado una vez con el último valor
    await waitFor(() => {
      expect(usersApi.searchMembers).toHaveBeenCalledTimes(1);
      expect(usersApi.searchMembers).toHaveBeenCalledWith('jua');
    });
  });
});
