import { keystoneContext } from "@/features/keystone/context";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const defaultRegion = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

export default async function RootPage() {
  await connection();

  const users = await keystoneContext.sudo().query.User.findMany({
    take: 1,
    query: "id",
  });

  if (users.length === 0) {
    redirect("/dashboard/init");
  }

  redirect(`/${defaultRegion}`);
}
