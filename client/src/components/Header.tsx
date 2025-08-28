import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">SmartFlowAI</h1>
      <nav className="space-x-4">
        <Link href="/"><a className="hover:underline">Home</a></Link>
        <Link href="/dashboard"><a className="hover:underline">Dashboard</a></Link>
        <Link href="/feed"><a className="hover:underline">Feed</a></Link>
        <Link href="/scheduler"><a className="hover:underline">Scheduler</a></Link>
        <Link href="/analytics"><a className="hover:underline">Analytics</a></Link>
        <Link href="/demo"><a className="hover:underline">Demo</a></Link>
        <Link href="/login"><a className="hover:underline">Login</a></Link>
      </nav>
    </header>
  );
}
