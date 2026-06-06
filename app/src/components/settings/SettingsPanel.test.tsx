import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsPanel } from "./SettingsPanel";
import { useAppStore } from "@/store/useAppStore";

describe("SettingsPanel", () => {
  it("renders the quota form and setting sections", () => {
    render(<SettingsPanel onClose={() => {}} />);
    expect(screen.getByText("额度 · 手动录入")).toBeInTheDocument();
    expect(screen.getByText("提醒阈值")).toBeInTheDocument();
    expect(screen.getByText("窗口与显示")).toBeInTheDocument();
    expect(screen.getByText("保存额度")).toBeInTheDocument();
  });

  it("saves manually entered quota into the store", () => {
    render(<SettingsPanel onClose={() => {}} />);
    const percents = screen.getAllByPlaceholderText(/0–100/);
    fireEvent.change(percents[0], { target: { value: "25" } }); // 灵力
    fireEvent.change(percents[1], { target: { value: "55" } }); // 道蕴
    fireEvent.click(screen.getByText("保存额度"));

    const q = useAppStore.getState().quota;
    expect(q.fiveHour.remainingPercent).toBe(25);
    expect(q.fiveHour.status).toBe("warning"); // 25 <= 30
    expect(q.weekly.remainingPercent).toBe(55);
    expect(q.source).toBe("manual");
  });

  it("rejects an out-of-range percentage", () => {
    render(<SettingsPanel onClose={() => {}} />);
    const percents = screen.getAllByPlaceholderText(/0–100/);
    fireEvent.change(percents[0], { target: { value: "150" } });
    fireEvent.click(screen.getByText("保存额度"));
    expect(screen.getByText(/百分比需在/)).toBeInTheDocument();
  });
});
