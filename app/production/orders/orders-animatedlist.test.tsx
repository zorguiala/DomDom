import { render, screen } from "@testing-library/react";
import ProductionOrdersPage from "./page";
import * as React from "react";

// Mock fetch and translations for isolation
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }) as any
);

jest.mock("@/lib/language-context", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

// Basic test for AnimatedList rendering

describe("ProductionOrdersPage (AnimatedList integration)", () => {
  it("renders the animated list and table headers", async () => {
    render(<ProductionOrdersPage />);
    expect(await screen.findByText("ordersListTitle")).toBeInTheDocument();
    expect(screen.getByText("orderNumber")).toBeInTheDocument();
    expect(screen.getByText("product")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();
  });
});