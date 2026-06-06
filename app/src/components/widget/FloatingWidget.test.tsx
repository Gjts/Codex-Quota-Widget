import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FloatingWidget } from "./FloatingWidget";

const noop = () => {};

describe("FloatingWidget", () => {
  it("renders the fox title and both quota cycle labels", () => {
    render(
      <FloatingWidget onOpenSettings={noop} onClose={noop} onTogglePin={noop} />,
    );
    expect(screen.getByText("灵狐小管家")).toBeInTheDocument();
    expect(screen.getByText("灵力")).toBeInTheDocument();
    expect(screen.getByText("道蕴")).toBeInTheDocument();
    // Mock data: 5-hour 68%, weekly 41%.
    expect(screen.getByText("68%")).toBeInTheDocument();
    expect(screen.getByText("41%")).toBeInTheDocument();
  });

  it("exposes the settings and close controls", () => {
    render(
      <FloatingWidget onOpenSettings={noop} onClose={noop} onTogglePin={noop} />,
    );
    expect(screen.getByTitle("设置")).toBeInTheDocument();
    expect(screen.getByTitle("隐藏到托盘")).toBeInTheDocument();
  });
});
