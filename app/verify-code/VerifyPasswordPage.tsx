import Image from "next/image";
import PasswordForm from "./PasswordForm";

export const metadata = { title: "Enter password" };

export default async function VerifyPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = sp?.login;
  const login = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <main className="relative min-h-dvh grid place-items-center p-6">
      <section className="signin-card rounded-sm p-8 text-center relative">
        <div className="absolute left-4 top-4">
          <a className="back-btn" href={`/`} aria-label="Back">
            ←
          </a>
        </div>

        <header className="flex items-center justify-center gap-3 mb-6">
          <Image src="/exp_logo.png" alt="GCT" width={35} height={35} />
          <span className="text-neutral-600 text-[16px] leading-none">
            Global Cad Technology
          </span>
        </header>

        <div className="inline-flex items-center gap-2 email-pill text-sm mb-4">
          <span className="opacity-90">{login}</span>
        </div>

        <h1 className="text-2xl font-semibold mb-2">Enter your password</h1>
        <p className="text-neutral-700 text-sm leading-6 mb-6">
          Enter the password for <span className="font-semibold">{login}</span>.
        </p>

        <div className="mb-6 flex justify-center">
          <PasswordForm login={login} />
        </div>

        <a
          className="link-dark"
          href={`/verify-code/other-methods?login=${encodeURIComponent(login)}`}
        >
          Didn&#39;t get a code? Verify with a code
        </a>
      </section>

      {/* <footer className="night-footer text-[13px] text-neutral-300/80">
        <nav className="flex gap-6 justify-center">
          <a className="link-dark" href="#">
            Help and feedback
          </a>
          <a className="link-dark" href="#">
            Terms of use
          </a>
          <a className="link-dark" href="#">
            Privacy and cookies
          </a>
        </nav>
        <p className="text-neutral-300/70 mt-3">
          Use private browsing if this is not your device.{" "}
          <a className="link-dark" href="#">
            Learn more
          </a>
        </p>
      </footer> */}
    </main>
  );
}
