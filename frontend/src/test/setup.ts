import "@testing-library/jest-dom";
import React from "react";

// Add TextEncoder/TextDecoder polyfill
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Material-UI components
jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    TextField: function MockTextField(props: any) {
      return React.createElement("input", {
        "aria-label": props.label,
        ...props,
      });
    },
    Button: function MockButton(props: any) {
      return React.createElement("button", props, props.children);
    },
    Container: function MockContainer(props: any) {
      return React.createElement("div", props, props.children);
    },
    Box: function MockBox(props: any) {
      return React.createElement("div", props, props.children);
    },
    Paper: function MockPaper(props: any) {
      return React.createElement("div", props, props.children);
    },
    Typography: function MockTypography(props: any) {
      return React.createElement("div", props, props.children);
    },
    createTheme: jest.fn().mockReturnValue({}),
    ThemeProvider: function MockThemeProvider(props: any) {
      return React.createElement(React.Fragment, null, props.children);
    },
  };
});

// Mock react-query
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest
    .fn()
    .mockReturnValue({ data: null, isLoading: false, error: null }),
  useMutation: jest
    .fn()
    .mockReturnValue({ mutate: jest.fn(), isLoading: false }),
  QueryClient: jest.fn().mockImplementation(() => ({
    setDefaultOptions: jest.fn(),
  })),
}));
