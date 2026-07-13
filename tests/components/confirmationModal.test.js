import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmationModal from "@/app/components/confirmationModal";

describe("ConfirmationModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Delete review?",
    message: "This cannot be undone.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and message when open", () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(screen.getByText("Delete review?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(<ConfirmationModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText("Delete review?")).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    render(<ConfirmationModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });

  it("calls both onConfirm and onClose when Confirm is clicked", () => {
    render(<ConfirmationModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });
});
