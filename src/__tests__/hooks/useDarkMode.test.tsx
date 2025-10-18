import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '@/hooks/useDarkMode';

// Create a more robust mock setup
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const matchMediaMock = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Setup mocks before tests
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });
});

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.className = '';
  });

  test('should initialize with system theme by default', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.theme).toBe('system');
    expect(result.current.isDark).toBe(false);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  test('should initialize with saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.theme).toBe('dark');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  test('should apply dark class when theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    renderHook(() => useDarkMode());

    expect(document.documentElement).toHaveClass('dark');
  });

  test('should remove dark class when theme is light', () => {
    localStorageMock.getItem.mockReturnValue('light');
    document.documentElement.classList.add('dark');

    renderHook(() => useDarkMode());

    expect(document.documentElement).not.toHaveClass('dark');
  });

  test('should follow system preference when theme is system', () => {
    localStorageMock.getItem.mockReturnValue('system');
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    renderHook(() => useDarkMode());

    expect(document.documentElement).toHaveClass('dark');
  });

  test('should call localStorage.setItem when setTheme is called', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('should dispatch theme-change event when setTheme is called', () => {
    const { result } = renderHook(() => useDarkMode());
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'theme-change',
      })
    );
  });

  test('should have toggleTheme function available', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(typeof result.current.toggleTheme).toBe('function');
  });

  test('should return correct hook interface', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.theme).toBeDefined();
    expect(result.current.isDark).toBeDefined();
    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.toggleTheme).toBe('function');
  });
});