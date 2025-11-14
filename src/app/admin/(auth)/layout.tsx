export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //  No header, no sidebar, no footer
  return <>{children}</>;
}
