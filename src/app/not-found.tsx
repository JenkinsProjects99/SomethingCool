import Link from "next/link";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";

export default function NotFound() {
  return (
    <div className="shell">
      <VisitAkyLogo />
      <h1 className="st-d-title">Not found</h1>
      <p className="st-d-paragraph">That event is not published, or the page does not exist.</p>
      <p className="st-d-paragraph">
        <Link className="st-text-link" href="/">
          Back to the calendar
        </Link>
      </p>
    </div>
  );
}
