import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-28">
              <Image src="/images/logo-vertical.png" alt="Virlio" width={84} height={84} />
            </div>
            <div>
              <p className="text-sm text-muted">Virlio — Turn Your Brand Into Viral Content.</p>
              <p className="mt-4 text-xs text-muted">© {new Date().getFullYear()} Teebot</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-heading">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/features">Features</Link>
                </li>
                <li>
                  <Link href="/templates">Templates</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-heading">Company</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-heading">Resources</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/docs">Docs</Link>
                </li>
                <li>
                  <Link href="/support">Support</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-heading">Legal</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
