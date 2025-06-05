import Link from "next/link"
import { Moon } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <Moon className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent ml-2">
                Lumos
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              Connecting hearts and minds for better mental health. Find support, friendship, and understanding in our
              community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/how-it-works" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/date-mode" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Date Mode
                  </Link>
                </li>
                <li>
                  <Link href="/connect-mode" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Connect Mode
                  </Link>
                </li>
                <li>
                  <Link href="/community-forums" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Community Forums
                  </Link>
                </li>
                <li>
                  <Link href="/resource-hub" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Resource Hub
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help-center" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/safety-center" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Safety Center
                  </Link>
                </li>
                <li>
                  <Link href="/community-guidelines" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/report-issue" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Report an Issue
                  </Link>
                </li>
                <li>
                  <Link href="/crisis-resources" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Crisis Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about-us" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/our-mission" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="text-slate-600 hover:text-rose-500 dark:text-slate-400">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Lumos. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
