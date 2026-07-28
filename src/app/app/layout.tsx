export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-dvh min-h-0 overflow-hidden">{children}</div>;
}
