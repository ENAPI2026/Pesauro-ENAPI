export const metadata = {
  title: "Pesauro ENAPI",
  description: "Gestione petauri ENAPI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
