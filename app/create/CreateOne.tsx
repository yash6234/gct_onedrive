"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function CreateAccountPage() {
  const router = useRouter();
  const DOMAIN = (process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "").toLowerCase();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setSubmitting(false);
      setError("Enter your email address with a domain (e.g., name@example.com).");
      return;
    }
    if (DOMAIN) {
      const [, dom] = normalizedEmail.split("@");
      if (dom.toLowerCase() !== DOMAIN) {
        setSubmitting(false);
        setError(`Use your ${DOMAIN} email address.`);
        return;
      }
    }
    const phoneDigits = phone.replace(/\D+/g, "").slice(0, 10);
    if (phoneDigits.length !== 10) {
      setSubmitting(false);
      setError("Phone must be exactly 10 digits.");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phoneDigits,
          password: password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        // Return to sign-in after successful registration.
        toast.success("Account created successfully.");
        router.push(`/?login=${encodeURIComponent(normalizedEmail)}`);
      } else {
        const msg = String(data?.error || `Couldn't create account (status ${res.status}).`);
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError("Couldn't reach the server.");
      toast.error("Couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="night-wrap min-h-dvh grid place-items-center p-6">
      <section className="dark-card w-[680px] rounded-xl p-8 text-center">
        <header className="flex items-center justify-center gap-3 mb-6">
          <Image src="/exp_logo.png" alt="GCT" width={35} height={35} />
          <span className="text-neutral-300 text-[16px] leading-none">Global Cad Technology</span>
        </header>

        <h1 className="text-white text-2xl font-semibold mb-2">Create your account</h1>
        <p className="text-neutral-300 text-sm leading-6 mb-6">Fill your details to create an account.</p>

        <form onSubmit={onSubmit} className="text-left max-w-sm mx-auto">
          <label className="block mb-4">
            <span className="sr-only">First name</span>
            <input className="ms-input ms-input-dark" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="block mb-4">
            <span className="sr-only">Last name</span>
            <input className="ms-input ms-input-dark" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label className="block mb-4">
            <span className="sr-only">Email</span>
            <input className="ms-input ms-input-dark" placeholder={`Email (e.g. name@example.com)`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block mb-4">
            <span className="sr-only">Phone</span>
            <input
              className="ms-input ms-input-dark"
              placeholder="Phone"
              value={phone}
              inputMode="tel"
              pattern="\d*"
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D+/g, "").slice(0, 10))}
            />
          </label>
          <label className="block mb-6">
            <span className="sr-only">Password</span>
            <input className="ms-input ms-input-dark" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error ? <p className="text-[#ff8c8c] text-sm mb-3">{error}</p> : null}
          <div className="flex justify-end">
            <button className="primary-btn-dark" type="submit" style={{ width: 160 }} disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        <p className="text-neutral-300 text-sm mt-6">
          Already have an account? <Link className="link-dark" href="/">Sign in</Link>
        </p>
      </section>

      <footer className="night-footer text-[13px] text-neutral-300/80">
        <nav className="flex gap-6 justify-center">
          <a className="link-dark" href="#">Help and feedback</a>
          <a className="link-dark" href="#">Terms of use</a>
          <a className="link-dark" href="#">Privacy and cookies</a>
        </nav>
      </footer>
    </main>
  );
}
