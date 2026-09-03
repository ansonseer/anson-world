import HeroShell from "@/components/ui/HeroShell";

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      <HeroShell />
      {/* crawlable landing text — the canvas above is presentation, this is the content */}
      <div className="sr-only">
        <h1>Anson World — an explorable digital self</h1>
        <p>
          Two versions of one person: a human and a synthetic double, standing in the same
          laboratory. Enter the Observer to meet the face they share, split between UTILITY and
          MEANING. Or skip straight to the 30-second profile.
        </p>
        <a href="/profile">Quick profile</a> <a href="/face">The face</a>
      </div>
    </main>
  );
}
