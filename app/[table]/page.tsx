import { notFound } from "next/navigation";
import CrudTable from "@/components/CrudTable";
import { TABLES } from "@/lib/schema";

export default async function Page({ params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  if (!TABLES[table]) notFound();
  return <CrudTable table={table} />;
}