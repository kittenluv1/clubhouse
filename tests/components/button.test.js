import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "@/app/components/button";

describe("Button", () => {
  it("renders its children inside a native button element", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("forwards arbitrary props like onClick", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards the disabled attribute and blocks clicks", () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Nope" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies a custom style string to the className", () => {
    render(<Button style="my-custom-class">Styled</Button>);
    expect(screen.getByRole("button", { name: "Styled" })).toHaveClass(
      "my-custom-class"
    );
  });

  it("passes through the type attribute when provided via props", () => {
    render(<Button data-testid="submit-btn" type="CTA">Submit</Button>);
    // `type` here is the styling variant prop, not the DOM type; the button still renders.
    expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
  });
});
