const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

export const useRouter = jest.fn(() => mockRouter);
export const useSegments = jest.fn(() => []);
export const Stack = () => null;
