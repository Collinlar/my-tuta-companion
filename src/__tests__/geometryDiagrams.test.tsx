import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import GeometryDiagram from "../mytuta/student/GeometryDiagram";
describe("interactive geometry models", () => {
  it("updates rectangle area and perimeter independently", () => {
    const onInteract = vi.fn();
    render(<GeometryDiagram kind="area_perimeter" onInteract={onInteract} />);
    expect(screen.getByRole("status")).toHaveTextContent("Area: 24 square units. Perimeter: 20 units.");
    fireEvent.change(screen.getByRole("slider", { name: "Rectangle length" }), { target: { value: "8" } });
    expect(screen.getByRole("status")).toHaveTextContent("Area: 32 square units. Perimeter: 24 units.");
    expect(onInteract).toHaveBeenCalledOnce();
  });
  it("distinguishes reflex angles and a full turn", () => {
    render(<GeometryDiagram kind="angle_turn" />);
    const slider = screen.getByRole("slider", { name: "Turn angle" });
    fireEvent.change(slider, { target: { value: "270" } });
    expect(screen.getByRole("status")).toHaveTextContent("270° · reflex");
    fireEvent.change(slider, { target: { value: "360" } });
    expect(screen.getByRole("status")).toHaveTextContent("360° · full turn");
  });
});
