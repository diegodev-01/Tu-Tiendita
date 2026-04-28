import HomeScreen from '@/app/(tabs)/home';
import { render } from '@testing-library/react-native';
import React, { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

jest.mock('expo-router', () => {
  const MockComponent = ({ children }: Props) => children || null;

  return {
    Link: Object.assign(MockComponent, {
      Trigger: MockComponent,
      Preview: () => null,
      Menu: MockComponent,
      MenuAction: () => null,
    }),
  };
});

jest.mock('expo-image', () => ({
  Image: () => null,
}));

describe('<HomeScreen />', () => {
  it('se renderiza correctamente', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Welcome!')).toBeDefined();
  });
});
