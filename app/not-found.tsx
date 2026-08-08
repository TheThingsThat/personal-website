import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <>
      <h1 className="text-3xl">404</h1>
      <p className="mt-4">
        There&rsquo;s nothing at this address.{" "}
        <Link prefetch={false} href="/">Back to the index.</Link>
      </p>
    </>
  );
}
