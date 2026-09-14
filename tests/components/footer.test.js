import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "@/app/components/footer";

describe("Footer", () => {
  it("renders the Contact Us and Connect headings", () => {
    render(<Footer />);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("links to the clubhouse contact email", () => {
    render(<Footer />);
    const emailLink = screen.getByRole("link", {
      name: "clubhouseucla@gmail.com",
    });
    expect(emailLink).toHaveAttribute(
      "href",
      "mailto:clubhouseucla@gmail.com"
    );
  });

  it("renders external social links that open in a new tab", () => {
    render(<Footer />);
    const instagram = screen.getByRole("link", {
      name: /instagram icon/i,
    });
    expect(instagram).toHaveAttribute(
      "href",
      "https://www.instagram.com/clubhouseucla/"
    );
    expect(instagram).toHaveAttribute("target", "_blank");
  });

  it("renders all four social platform links plus the email link", () => {
    render(<Footer />);
    // instagram, linkedin, tiktok, reddit + mailto
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
