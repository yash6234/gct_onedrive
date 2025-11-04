import Image from "next/image";
import SendCodeButton from "./SendCodeButton";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = sp?.login;
  const login = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <main className="night-wrap min-h-dvh grid place-items-center p-6">
      <section className="dark-card w-[520px] rounded-xl p-8 text-center">
        <header className="flex items-center justify-center gap-3 mb-6">
          <Image src="/gctlogo.png" alt="GCT" width={26} height={26} />
          <span className="text-neutral-300 text-[16px] leading-none">GCT</span>
        </header>

        <div className="inline-flex items-center gap-2 email-pill text-sm mb-4">
          <span className="opacity-90">{login}</span>
        </div>

        <h1 className="text-white text-2xl font-semibold mb-3">Get a code to sign in</h1>
        <p className="text-neutral-300 text-sm leading-6 mb-6">
          We'll send a code to <span className="font-semibold">{login}</span> to sign
          you in.
        </p>

        <div className="mb-4">
          <SendCodeButton login={login} />
        </div>
        <div>
          <button className="link-dark">Other ways to sign in</button>
        </div>
      </section>

      <footer className="night-footer text-[13px] text-neutral-300/80">
        <nav className="flex gap-6 justify-center">
          <a className="link-dark" href="#">Help and feedback</a>
          <a className="link-dark" href="#">Terms of use</a>
          <a className="link-dark" href="#">Privacy and cookies</a>
        </nav>
        <p className="text-neutral-300/70 mt-3">
          Use private browsing if this is not your device. <a className="link-dark" href="#">Learn more</a>
        </p>
      </footer>
    </main>
  );
}
