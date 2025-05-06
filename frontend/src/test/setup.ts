import "@testing-library/jest-dom";
import React from "react";

// Add TextEncoder/TextDecoder polyfill
// Use dynamic import with type assertion to avoid ESLint rule violations
// eslint-disable-next-line @typescript-eslint/no-var-requires
const util = require("util");
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

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

// Mock Ant Design components
jest.mock("antd", () => {
  return {
    Input: function MockInput(props: any) {
      return React.createElement("input", {
        "aria-label": props.placeholder,
        ...props,
      });
    },
    Button: function MockButton(props: any) {
      return React.createElement(
        "button",
        {
          ...props,
          className: `ant-btn ${props.type ? `ant-btn-${props.type}` : ""}`,
        },
        props.children
      );
    },
    Layout: {
      Content: function MockContent(props: any) {
        return React.createElement("main", props, props.children);
      },
    },
    Typography: {
      Title: function MockTitle(props: any) {
        const Component = `h${props.level || 1}`;
        return React.createElement(Component, props, props.children);
      },
      Text: function MockText(props: any) {
        return React.createElement("span", props, props.children);
      },
    },
    Card: function MockCard(props: any) {
      return React.createElement(
        "div",
        {
          ...props,
          className: "ant-card",
        },
        props.children
      );
    },
    Space: function MockSpace(props: any) {
      return React.createElement(
        "div",
        {
          ...props,
          className: "ant-space",
        },
        props.children
      );
    },
    Form: {
      Item: function MockFormItem(props: any) {
        return React.createElement(
          "div",
          {
            className: "ant-form-item",
          },
          props.children
        );
      },
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
