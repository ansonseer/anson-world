import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Room from "@/components/world/Room";
import { getAllRoomPaths, getRoom } from "@/lib/worlds";

export function generateStaticParams() {
  return getAllRoomPaths().map((p) => ({ path: p.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const room = getRoom(path);
  if (!room) return {};
  return {
    title: `${room.title} · ANSON WORLD`,
    description: room.subtitle ?? room.intro,
    // rooms re-present content; the flat pages stay the indexable copy
    robots: { index: false, follow: true },
    alternates: room.canonical ? { canonical: room.canonical } : undefined,
  };
}

export default async function WorldRoomPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const room = getRoom(path);
  if (!room) notFound();
  return <Room room={room} />;
}
